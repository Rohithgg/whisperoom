import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, UserX, LogOut } from 'lucide-react-native';
import { useChat } from '@/contexts/ChatContext';

export default function ChatScreen() {
  const [messageText, setMessageText] = useState('');
  const { currentRoom, currentUser, sendMessage, endSession, leaveRoom } = useChat();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!currentRoom || !currentUser) {
      router.replace('/');
      return;
    }

    // Check if room became inactive (session ended)
    if (!currentRoom.isActive) {
      Alert.alert(
        'Session Ended',
        'The room creator has ended this session.',
        [
          {
            text: 'OK',
            onPress: () => {
              leaveRoom();
              router.push('/session-ended');
            }
          }
        ]
      );
      return;
    }
  }, [currentRoom, currentUser]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [currentRoom?.messages]);

  const handleSendMessage = async () => {
    if (messageText.trim()) {
      const result = await sendMessage(messageText.trim());
      if (result.success) {
        setMessageText('');
      } else {
        Alert.alert('Error', result.error || 'Failed to send message');
      }
    }
  };

  const handleEndSession = async () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this session? This will disconnect all users.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            const result = await endSession();
            if (result.success) {
              router.push('/session-ended');
            } else {
              Alert.alert('Error', result.error || 'Failed to end session');
            }
          },
        },
      ]
    );
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave this room?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveRoom();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!currentRoom || !currentUser) {
    return null;
  }

  const isCreator = currentUser === currentRoom.creator;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeaveRoom} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Room {currentRoom.code}</Text>
          <Text style={styles.headerSubtitle}>{currentRoom.members.length} member{currentRoom.members.length !== 1 ? 's' : ''}</Text>
        </View>
        {isCreator ? (
          <TouchableOpacity onPress={handleEndSession} style={styles.actionButton}>
            <UserX size={20} color="#FF3B30" />
            <Text style={styles.endButtonText}>End</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleLeaveRoom} style={styles.actionButton}>
            <LogOut size={20} color="#FF9500" />
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {currentRoom.messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No messages yet</Text>
              <Text style={styles.emptyStateSubtext}>Start the conversation!</Text>
            </View>
          ) : (
            currentRoom.messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageItem,
                  message.sender === currentUser ? styles.myMessage : styles.otherMessage,
                ]}
              >
                <View style={styles.messageHeader}>
                  <Text style={[
                    styles.senderName,
                    message.sender === currentUser ? styles.mySenderName : styles.otherSenderName,
                  ]}>
                    {message.sender === currentUser ? 'You' : message.sender}
                  </Text>
                  <Text style={[
                    styles.timestamp,
                    message.sender === currentUser ? styles.myTimestamp : styles.otherTimestamp,
                  ]}>
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
                <Text style={[
                  styles.messageText,
                  message.sender === currentUser ? styles.myMessageText : styles.otherMessageText,
                ]}>
                  {message.text}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
            placeholderTextColor="#8E8E93"
          />
          <TouchableOpacity
            style={[styles.sendButton, messageText.trim() ? styles.sendButtonActive : null]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Send size={20} color={messageText.trim() ? "#ffffff" : "#8E8E93"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
  },
  endButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
  },
  exitButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  messageItem: {
    maxWidth: '80%',
    marginVertical: 2,
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
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
  },
  mySenderName: {
    color: '#007AFF',
  },
  otherSenderName: {
    color: '#34C759',
  },
  timestamp: {
    fontSize: 11,
  },
  myTimestamp: {
    color: '#007AFF',
    opacity: 0.7,
  },
  otherTimestamp: {
    color: '#8E8E93',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: '#1c1c1e',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
});