import React, { useRef, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import type { Message } from '@/contexts/ChatContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MessageListProps {
  messages: Message[];
  currentUser: string;
  onLongPressMessage: (messageId: string, sender: string) => void;
}

export function MessageList({ messages, currentUser, onLongPressMessage }: MessageListProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.messagesContainer}
      contentContainerStyle={styles.messagesContent}
      showsVerticalScrollIndicator={false}
    >
      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No messages yet</Text>
          <Text style={styles.emptyStateSubtext}>Start the conversation!</Text>
          <Text style={styles.hintText}>Tip: Hold your own message for 3 seconds to delete it.</Text>
        </View>
      ) : (
        messages.map((message) => (
          <Pressable
            key={message.id}
            style={[
              styles.messageItem,
              message.sender === currentUser ? styles.myMessage : styles.otherMessage,
            ]}
            onLongPress={() => onLongPressMessage(message.id, message.sender)}
            delayLongPress={3000}
          >
            <View style={styles.messageHeader}>
              <Text
                style={[
                  styles.senderName,
                  message.sender === currentUser ? styles.mySenderName : styles.otherSenderName,
                ]}
              >
                {message.sender === currentUser ? 'You' : message.sender}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  message.sender === currentUser ? styles.myTimestamp : styles.otherTimestamp,
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
            <Text
              style={[
                styles.messageText,
                message.sender === currentUser ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              {message.text}
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
  },
  messagesContent: {
    paddingVertical: 16,
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.1,
  },
  emptyStateText: {
    fontSize: Math.min(18, SCREEN_WIDTH * 0.045),
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
    color: '#8E8E93',
    marginBottom: 8,
  },
  hintText: {
    fontSize: Math.min(12, SCREEN_WIDTH * 0.03),
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  messageItem: {
    maxWidth: SCREEN_WIDTH > 600 ? '70%' : '80%',
    marginVertical: 2,
    minWidth: SCREEN_WIDTH * 0.2,
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  senderName: {
    fontSize: Math.min(12, SCREEN_WIDTH * 0.03),
    fontWeight: '600',
  },
  mySenderName: {
    color: '#007AFF',
  },
  otherSenderName: {
    color: '#34C759',
  },
  timestamp: {
    fontSize: Math.min(11, SCREEN_WIDTH * 0.028),
  },
  myTimestamp: {
    color: '#007AFF',
    opacity: 0.7,
  },
  otherTimestamp: {
    color: '#8E8E93',
  },
  messageText: {
    fontSize: Math.min(16, SCREEN_WIDTH * 0.04),
    lineHeight: Math.min(22, SCREEN_WIDTH * 0.055),
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  myMessageText: {
    backgroundColor: '#007AFF',
    color: '#ffffff',
    borderBottomRightRadius: 6,
  },
  otherMessageText: {
    backgroundColor: '#ffffff',
    color: '#1c1c1e',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
