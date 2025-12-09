import { supabase } from '../supabaseClient';
import * as Crypto from 'expo-crypto';

// Generate a random 6-character room code
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  try {
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure we always return a valid code
    return result.length === 6 ? result : 'ABC123';
  } catch (error) {
    console.error('Error generating room code:', error);
    // Fallback room code
    return 'ABC123';
  }
};

// Hash password using SHA-256
export const hash = async (password: string): Promise<string> => {
  try {
    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
    console.log('Password hashed successfully');
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

// Create Room API - matches your specification
export const createRoom = async (nickname: string, password: string) => {
  try {
    const roomCode = generateRoomCode(); // e.g., 'abc123'
    console.log('Generated room code:', roomCode);
    
    const passwordHash = await hash(password);
    console.log('Password hashed successfully');
    
    const { data, error } = await supabase
      .from('rooms')
      .insert([{
        room_code: roomCode,
        password_hash: passwordHash,
        created_by: nickname
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return { data: null, roomCode: null, error };
    }

    console.log('Room created successfully:', { data, roomCode });
    return { data, roomCode, error: null };
  } catch (error) {
    console.error('Error in createRoom:', error);
    return { data: null, roomCode: null, error: error || 'Failed to create room' };
  }
};

// Join Room API - matches your specification
export const joinRoom = async (roomCode: string, password: string) => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', roomCode)
    .eq('is_active', true)
    .single();

  if (error) {
    return { error: error.message };
  }

  if (!data || await hash(password) !== data.password_hash) {
    return { error: 'Invalid code or password' };
  }

  return { data };
};

// Send a message to a room
export const sendMessage = async (roomId: string, sender: string, text: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        room_id: roomId,
        sender,
        text
      }])
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Failed to send message' };
  }
};

// End a session (mark room as inactive)
export const endSession = async (roomCode: string) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .update({ is_active: false })
      .eq('room_code', roomCode)
      .select();

    if (error) {
      console.error('Error ending session:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error ending session:', error);
    return { success: false, error: 'Failed to end session' };
  }
};

// Subscribe to real-time messages for a room
export const subscribeToMessages = (roomId: string, onMessage: (message: any) => void) => {
  return supabase
    .channel('chat-' + roomId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      const newMessage = payload.new;
      onMessage(newMessage);
    })
    .subscribe();
};

// Subscribe to room status changes (for detecting when session ends)
export const subscribeToRoomStatus = (roomId: string, onRoomUpdate: (room: any) => void) => {
  return supabase
    .channel('room-' + roomId)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'rooms',
      filter: `id=eq.${roomId}`
    }, (payload) => {
      const updatedRoom = payload.new;
      onRoomUpdate(updatedRoom);
    })
    .subscribe();
};

// Delete a message from the database
export const deleteMessage = async (messageId: string, sender: string) => {
  try {
    console.log('supabaseHelpers: Attempting to delete message', messageId, 'by', sender);
    
    // First, verify that the message belongs to the sender
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('sender, room_id')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      console.error('supabaseHelpers: Message not found', fetchError);
      return { success: false, error: 'Message not found' };
    }

    console.log('supabaseHelpers: Message found, sender:', message.sender, 'room_id:', message.room_id);

    if (message.sender !== sender) {
      console.error('supabaseHelpers: User not authorized to delete this message');
      return { success: false, error: 'You can only delete your own messages' };
    }

    // Delete the message
    console.log('supabaseHelpers: Deleting message from database');
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('supabaseHelpers: Error deleting message from database:', error);
      return { success: false, error: error.message };
    }

    console.log('supabaseHelpers: Message deleted successfully from database');
    return { success: true };
  } catch (error) {
    console.error('supabaseHelpers: Exception during message deletion:', error);
    return { success: false, error: 'Failed to delete message' };
  }
};

// Subscribe to message deletions for a room
export const subscribeToMessageDeletions = (roomId: string, onMessageDeleted: (messageId: string) => void) => {
  console.log('supabaseHelpers: Setting up deletion subscription for room:', roomId);
  return supabase
    .channel('chat-deletions-' + roomId)
    .on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'messages',
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      console.log('supabaseHelpers: Deletion event received:', payload);
      const deletedMessage = payload.old;
      console.log('supabaseHelpers: Deleted message ID:', deletedMessage.id);
      onMessageDeleted(deletedMessage.id);
    })
    .subscribe((status) => {
      console.log('supabaseHelpers: Deletion subscription status:', status);
    });
};
