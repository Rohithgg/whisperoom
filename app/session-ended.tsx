import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Chrome as Home, MessageCircleOff } from 'lucide-react-native';
import { useChat } from '@/contexts/ChatContext';

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
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    opacity: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#1c1c1e',
    marginBottom: 8,
    lineHeight: 24,
  },
  homeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});