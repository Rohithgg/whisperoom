import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  createRoom as createRoomHelper,
  joinRoom as joinRoomHelper,
  sendMessage as sendMessageHelper,
  endSession as endSessionHelper,
  deleteMessage as deleteMessageHelper,
  subscribeToMessages,
  subscribeToRoomStatus,
  subscribeToMessageDeletions
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
  deleteMessage: (messageId: string) => Promise<{ success: boolean; error?: string }>;
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
  const [deletionChannel, setDeletionChannel] = useState<any>(null);

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

          // Prevent duplicate messages
          const messageExists = prev.messages.some(msg => msg.id === newMsg.id);
          if (messageExists) {
            return prev;
          }

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

      // Subscribe to message deletions
      const deleteChannel = subscribeToMessageDeletions(currentRoom.id, (messageId) => {
        console.log('ChatContext: Received deletion event for message:', messageId);
        setCurrentRoom(prev => {
          if (!prev) {
            console.log('ChatContext: No current room, skipping deletion');
            return prev;
          }

          console.log('ChatContext: Current messages before deletion:', prev.messages.length);
          const messageExists = prev.messages.some(msg => msg.id === messageId);
          console.log('ChatContext: Message exists in state:', messageExists);
          
          if (messageExists) {
            console.log('ChatContext: Filtering out message:', messageId);
            const filteredMessages = prev.messages.filter(msg => {
              const keep = msg.id !== messageId;
              if (!keep) {
                console.log('ChatContext: Removing message:', msg.id, msg.text);
              }
              return keep;
            });
            console.log('ChatContext: Messages after deletion:', filteredMessages.length);
            
            return {
              ...prev,
              messages: filteredMessages
            };
          } else {
            console.log('ChatContext: Message not found in local state, current IDs:', prev.messages.map(m => m.id));
          }

          return prev;
        });
      });
      setDeletionChannel(deleteChannel);

      return () => {
        if (messagesChannel) {
          messagesChannel.unsubscribe();
        }
        if (statusChannel) {
          statusChannel.unsubscribe();
        }
        if (deleteChannel) {
          deleteChannel.unsubscribe();
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
      
      // If message was sent successfully, add it optimistically to local state
      // This ensures the creator sees their own message immediately
      if (result.success && result.data) {
        const newMsg: Message = {
          id: result.data.id,
          sender: result.data.sender,
          text: result.data.text,
          timestamp: new Date(result.data.created_at),
          room_id: result.data.room_id
        };

        setCurrentRoom(prev => {
          if (!prev) return prev;

          // Check if message already exists (from realtime subscription)
          const messageExists = prev.messages.some(msg => msg.id === newMsg.id);
          if (messageExists) {
            return prev;
          }

          return {
            ...prev,
            messages: [...prev.messages, newMsg]
          };
        });
      }
      
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: 'Failed to send message' };
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentRoom || !currentUser) {
      return { success: false, error: 'No active room or user' };
    }

    try {
      console.log('ChatContext: Deleting message', messageId, 'by user', currentUser);
      
      // Optimistically remove the message immediately for instant UI feedback
      setCurrentRoom(prev => {
        if (!prev) return prev;
        
        console.log('ChatContext: Optimistically removing message from UI');
        return {
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== messageId)
        };
      });
      
      const result = await deleteMessageHelper(messageId, currentUser);
      
      if (result.success) {
        console.log('ChatContext: Message deletion successful in database');
        // The realtime subscription will also trigger, but optimistic deletion ensures immediate UI update
      } else {
        console.error('ChatContext: Message deletion failed:', result.error);
        // TODO: Restore the message if deletion failed
      }
      
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('ChatContext: Exception during message deletion:', error);
      return { success: false, error: 'Failed to delete message' };
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
    console.log('ChatContext: leaveRoom called');
    
    // Unsubscribe from all channels first
    if (realtimeChannel) {
      console.log('Unsubscribing from realtime channel');
      realtimeChannel.unsubscribe();
      setRealtimeChannel(null);
    }

    if (roomStatusChannel) {
      console.log('Unsubscribing from room status channel');
      roomStatusChannel.unsubscribe();
      setRoomStatusChannel(null);
    }

    if (deletionChannel) {
      console.log('Unsubscribing from deletion channel');
      deletionChannel.unsubscribe();
      setDeletionChannel(null);
    }

    // Clear room and user state
    console.log('Clearing room and user state');
    setCurrentRoom(null);
    setCurrentUser(null);
    console.log('ChatContext: leaveRoom completed');
  };

  return (
    <ChatContext.Provider value={{
      currentRoom,
      currentUser,
      isLoading,
      createRoom,
      joinRoom,
      sendMessage,
      deleteMessage,
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