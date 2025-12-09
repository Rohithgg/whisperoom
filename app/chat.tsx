import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, UserX, LogOut } from 'lucide-react-native';
import { useChat } from '@/contexts/ChatContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ChatScreen() {
  const [messageText, setMessageText] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const { currentRoom, currentUser, sendMessage, deleteMessage, endSession, leaveRoom } = useChat();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Set mounted flag after initial render
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLeaving) return; // Don't navigate if intentionally leaving

    if (!currentRoom || !currentUser) {
      // Use setTimeout to ensure navigation happens after mount
      setTimeout(() => {
        router.replace('/');
      }, 0);
      return;
    }

    // Check if room became inactive (session ended)
    if (!currentRoom.isActive) {
      Alert.alert(
        'Thank You! 🙏',
        'The session has ended. Thank you for using WhispeRoom! We hope you had a great conversation.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsLeaving(true);
              leaveRoom();
              setTimeout(() => {
                router.push('/session-ended');
              }, 100);
            }
          }
        ]
      );
      return;
    }
  }, [currentRoom, currentUser, isMounted, isLeaving, router, leaveRoom]);

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
            console.log('Ending session...');
            setIsLeaving(true);
            const result = await endSession();
            if (result.success) {
              setTimeout(() => {
                router.push('/session-ended');
              }, 100);
            } else {
              setIsLeaving(false);
              Alert.alert('Error', result.error || 'Failed to end session');
            }
          },
        },
      ]
    );
  };

  const handleLeaveRoom = () => {
    console.log('handleLeaveRoom called');
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave this room?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Leave cancelled'),
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            console.log('Leaving room...');
            setIsLeaving(true);
            leaveRoom();
            setTimeout(() => {
              router.replace('/');
            }, 100);
          },
        },
      ]
    );
  };

  const handleDeleteMessage = async (messageId: string) => {
    console.log('Chat: Deleting message:', messageId);
    const result = await deleteMessage(messageId);
    if (result.success) {
      console.log('Chat: Message deleted successfully, UI will update via realtime subscription');
      // Don't show alert on success - the message will just disappear
    } else {
      console.error('Chat: Failed to delete message:', result.error);
      Alert.alert('Error', result.error || 'Failed to delete message');
    }
  };

  const handleLongPress = async (messageId: string, messageSender: string) => {
    // Only allow users to delete their own messages
    if (messageSender === currentUser) {
      console.log('Chat: Long press detected for own message:', messageId);
      console.log('Chat: Current user:', currentUser, 'Message sender:', messageSender);
      await handleDeleteMessage(messageId);
    } else {
      console.log('Chat: Long press detected but not own message:', messageId);
      console.log('Chat: Current user:', currentUser, 'Message sender:', messageSender);
    }
  };

  if (!currentRoom || !currentUser) {
    return null;
  }

  const isCreator = currentUser === currentRoom.creator;
  
  console.log('Chat Screen - Current User:', currentUser);
  console.log('Chat Screen - Room Creator:', currentRoom.creator);
  console.log('Chat Screen - Is Creator:', isCreator);

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
          <Text style={styles.headerSubtitle}>{currentRoom.members} member{currentRoom.members.length !== 1 ? 's' : ''}</Text>
        </View>
        {isCreator ? (
          <TouchableOpacity 
            onPress={handleEndSession} 
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <UserX size={20} color="#FF3B30" />
            <Text style={styles.endButtonText}>End</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={handleLeaveRoom} 
            style={styles.actionButton}
            activeOpacity={0.7}
          >
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
              <Pressable
                key={message.id}
                style={[
                  styles.messageItem,
                  message.sender === currentUser ? styles.myMessage : styles.otherMessage,
                ]}
                onLongPress={() => handleLongPress(message.id, message.sender)}
                delayLongPress={3000}
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
              </Pressable>
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
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    minHeight: 60,
  },
  backButton: {
    width: Math.min(40, SCREEN_WIDTH * 0.1),
    height: Math.min(40, SCREEN_WIDTH * 0.1),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: Math.min(18, SCREEN_WIDTH * 0.045),
    fontWeight: '600',
    color: '#1c1c1e',
  },
  headerSubtitle: {
    fontSize: Math.min(12, SCREEN_WIDTH * 0.03),
    color: '#8E8E93',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    minWidth: 50,
  },
  endButtonText: {
    fontSize: Math.min(12, SCREEN_WIDTH * 0.03),
    fontWeight: '600',
    color: '#FF3B30',
  },
  exitButtonText: {
    fontSize: Math.min(12, SCREEN_WIDTH * 0.03),
    fontWeight: '600',
    color: '#FF9500',
  },
  chatContainer: {
    flex: 1,
  },
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