import { supabase } from '../supabaseClient';
import * as Crypto from 'expo-crypto';

// Generate a random 6-character room code
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Hash password using SHA-256
export const hash = async (password: string): Promise<string> => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
};

// Create Room API - matches your specification
export const createRoom = async (nickname: string, password: string) => {
  const roomCode = generateRoomCode(); // e.g., 'abc123'
  const { data, error } = await supabase
    .from('rooms')
    .insert([{
      room_code: roomCode,
      password_hash: await hash(password), // Use SHA256 hash
      created_by: nickname
    }])
    .select()
    .single();

  return { data, roomCode, error };
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
