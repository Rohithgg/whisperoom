import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Chrome as Home, MessageCircleOff } from 'lucide-react-native';
import { useChat } from '@/contexts/ChatContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SessionEndedScreen() {
  const { leaveRoom } = useChat();
  const router = useRouter();

  const handleReturnHome = () => {
    leaveRoom();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MessageCircleOff size={80} color="#FF3B30" />
        </View>

        <Text style={styles.title}>Session Ended</Text>
        <Text style={styles.subtitle}>
          The chat session has been terminated by the room creator.
        </Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            • All messages have been cleared
          </Text>
          <Text style={styles.infoText}>
            • The room is no longer accessible
          </Text>
          <Text style={styles.infoText}>
            • Create a new room to start chatting again
          </Text>
        </View>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleReturnHome}
        >
          <Home size={24} color="#ffffff" />
          <Text style={styles.homeButtonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    paddingVertical: SCREEN_HEIGHT * 0.03,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SCREEN_HEIGHT * 0.04,
    opacity: 0.8,
  },
  title: {
    fontSize: Math.min(28, SCREEN_WIDTH * 0.07),
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.min(16, SCREEN_WIDTH * 0.04),
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.04,
    lineHeight: Math.min(24, SCREEN_WIDTH * 0.06),
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: SCREEN_WIDTH * 0.06,
    marginBottom: SCREEN_HEIGHT * 0.05,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoText: {
    fontSize: Math.min(16, SCREEN_WIDTH * 0.04),
    color: '#1c1c1e',
    marginBottom: 8,
    lineHeight: Math.min(24, SCREEN_WIDTH * 0.06),
  },
  homeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: Math.min(16, SCREEN_HEIGHT * 0.02),
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 500,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: Math.min(18, SCREEN_WIDTH * 0.045),
    fontWeight: '600',
  },
});