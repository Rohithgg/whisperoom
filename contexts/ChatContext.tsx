import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  createRoom as createRoomHelper,
  joinRoom as joinRoomHelper,
  sendMessage as sendMessageHelper,
  endSession as endSessionHelper,
  subscribeToMessages,
  subscribeToRoomStatus
} from '../utils/supabaseHelpers';

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  room_id: string;
}

export interface Room {
  id: string;
  code: string;
  creator: string;
  isActive: boolean;
  members: string[];
  messages: Message[];
}

interface ChatContextType {
  currentRoom: Room | null;
  currentUser: string | null;
  isLoading: boolean;
  createRoom: (nickname: string, password: string) => Promise<{ success: boolean; roomCode?: string; error?: string }>;
  joinRoom: (roomCode: string, password: string, nickname: string) => Promise<{ success: boolean; error?: string }>;
  sendMessage: (text: string) => Promise<{ success: boolean; error?: string }>;
  endSession: () => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);
  const [roomStatusChannel, setRoomStatusChannel] = useState<any>(null);

  // Subscribe to real-time messages and room status when room changes
  useEffect(() => {
    if (currentRoom) {
      // Subscribe to messages
      const messagesChannel = subscribeToMessages(currentRoom.id, (newMessage) => {
        setCurrentRoom(prev => {
          if (!prev) return prev;

          const newMsg: Message = {
            id: newMessage.id,
            sender: newMessage.sender,
            text: newMessage.text,
            timestamp: new Date(newMessage.created_at),
            room_id: newMessage.room_id
          };

          return {
            ...prev,
            messages: [...prev.messages, newMsg]
          };
        });
      });
      setRealtimeChannel(messagesChannel);

      // Subscribe to room status changes
      const statusChannel = subscribeToRoomStatus(currentRoom.id, (updatedRoom) => {
        setCurrentRoom(prev => {
          if (!prev) return prev;

          return {
            ...prev,
            isActive: updatedRoom.is_active
          };
        });
      });
      setRoomStatusChannel(statusChannel);

      return () => {
        if (messagesChannel) {
          messagesChannel.unsubscribe();
        }
        if (statusChannel) {
          statusChannel.unsubscribe();
        }
      };
    }
  }, [currentRoom?.id]);

  const createRoom = async (nickname: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Creating room for:', nickname);
      const result = await createRoomHelper(nickname, password);
      console.log('Create room result:', result);

      if (result.error) {
        console.error('Room creation error:', result.error);
        let errorMsg = 'Failed to create room';
        if (typeof result.error === 'string') {
          errorMsg = result.error;
        } else if (result.error && typeof result.error === 'object' && 'message' in result.error) {
          errorMsg = (result.error as any).message;
        }
        return { success: false, error: errorMsg };
      }

      if (result.data && result.roomCode) {
        console.log('Room created successfully:', result.roomCode);
        const room: Room = {
          id: result.data.id,
          code: result.roomCode,
          creator: nickname,
          isActive: true,
          members: [nickname],
          messages: []
        };
        setCurrentRoom(room);
        setCurrentUser(nickname);
        return { success: true, roomCode: result.roomCode };
      }

      console.error('Invalid room creation result:', result);
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Exception in createRoom:', error);
      return { success: false, error: 'Network error - please check your connection' };
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (roomCode: string, password: string, nickname: string) => {
    setIsLoading(true);
    try {
      const result = await joinRoomHelper(roomCode, password);

      if (result.error) {
        return { success: false, error: result.error };
      }

      if (result.data) {
        const room: Room = {
          id: result.data.id,
          code: result.data.room_code,
          creator: result.data.created_by,
          isActive: result.data.is_active,
          members: [nickname], // In a real app, you'd fetch the actual members
          messages: []
        };
        setCurrentRoom(room);
        setCurrentUser(nickname);
        return { success: true };
      }

      return { success: false, error: 'Failed to join room' };
    } catch (error) {
      return { success: false, error: 'Failed to join room' };
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!currentRoom || !currentUser) {
      return { success: false, error: 'No active room or user' };
    }

    try {
      const result = await sendMessageHelper(currentRoom.id, currentUser, text);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: 'Failed to send message' };
    }
  };

  const endSession = async () => {
    if (!currentRoom) {
      return { success: false, error: 'No active room' };
    }

    try {
      const result = await endSessionHelper(currentRoom.code);

      if (result.success) {
        // Update the room state to inactive
        setCurrentRoom(prev => prev ? { ...prev, isActive: false } : null);

        // Clean up after a short delay to allow users to see the session ended message
        setTimeout(() => {
          setCurrentRoom(null);
          setCurrentUser(null);

          // Unsubscribe from real-time updates
          if (realtimeChannel) {
            realtimeChannel.unsubscribe();
            setRealtimeChannel(null);
          }
        }, 1000);
      }

      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: 'Failed to end session' };
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setCurrentUser(null);

    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      setRealtimeChannel(null);
    }

    if (roomStatusChannel) {
      roomStatusChannel.unsubscribe();
      setRoomStatusChannel(null);
    }
  };

  return (
    <ChatContext.Provider value={{
      currentRoom,
      currentUser,
      isLoading,
      createRoom,
      joinRoom,
      sendMessage,
      endSession,
      leaveRoom,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}