import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Send } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

export function MessageInput({ value, onChangeText, onSend }: MessageInputProps) {
  const trimmed = value.trim();

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.messageInput}
        placeholder="Type a message..."
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={500}
        placeholderTextColor="#8E8E93"
      />
      <TouchableOpacity
        style={[styles.sendButton, trimmed ? styles.sendButtonActive : null]}
        onPress={onSend}
        disabled={!trimmed}
      >
        <Send size={20} color={trimmed ? '#ffffff' : '#8E8E93'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
    minHeight: 70,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: Math.min(16, SCREEN_WIDTH * 0.04),
    maxHeight: Math.min(100, SCREEN_HEIGHT * 0.15),
    minHeight: 40,
    color: '#1c1c1e',
  },
  sendButton: {
    width: Math.min(40, SCREEN_WIDTH * 0.1),
    height: Math.min(40, SCREEN_WIDTH * 0.1),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
});
