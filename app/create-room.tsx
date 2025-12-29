import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator , Platform } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { ArrowLeft, Copy, User, Lock } from 'lucide-react-native';
import { useChat } from '@/contexts/ChatContext';
import * as Clipboard from 'expo-clipboard';

export default function CreateRoomScreen() {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreated, setIsCreated] = useState(false);
  const { createRoom, isLoading } = useChat();
  const router = useRouter();
  const navigation = useNavigation();

  const handleGoBack = () => {
    if (Platform.OS === 'web') {
      // On web, navigate to home explicitly
      router.replace('/');
    } else {
      // On mobile, use native back
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        router.replace('/');
      }
    }
  };

  const handleCreateRoom = async () => {
    if (!nickname.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (nickname.trim().length < 2) {
      Alert.alert('Error', 'Nickname must be at least 2 characters long');
      return;
    }

    if (password.trim().length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters long');
      return;
    }

    try {
      console.log('Creating room with nickname:', nickname.trim());
      const result = await createRoom(nickname.trim(), password.trim());
      console.log('Room creation result:', result);

      if (result.success && result.roomCode) {
        console.log('Room created successfully with code:', result.roomCode);
        setRoomCode(result.roomCode);
        setIsCreated(true);
      } else {
        console.error('Room creation failed:', result.error);
        Alert.alert('Error', result.error || 'Failed to create room. Please try again.');
      }
    } catch (error) {
      console.error('Exception during room creation:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  const copyToClipboard = async () => {
    if (!roomCode) {
      Alert.alert('Error', 'No room code to copy');
      return;
    }
    
    try {
      await Clipboard.setStringAsync(roomCode);
      if (Platform.OS !== 'web') {
        Alert.alert('Copied!', 'Room code copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      Alert.alert('Error', 'Failed to copy room code');
    }
  };

  const handleJoinChat = () => {
    if (!roomCode) {
      Alert.alert('Error', 'No room code available');
      return;
    }
    
    console.log('Navigating to chat with room code:', roomCode);
    // Use replace instead of push to prevent going back to create room
    router.replace('/chat');
  };

  if (isCreated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Room Created</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>🎉 Room Created Successfully!</Text>
            
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Room Code</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{roomCode || 'Loading...'}</Text>
                <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton} disabled={!roomCode}>
                  <Copy size={20} color={roomCode ? "#007AFF" : "#8E8E93"} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Share with your friend:</Text>
              <Text style={styles.infoText}>Room Code: <Text style={styles.boldText}>{roomCode || 'Loading...'}</Text></Text>
              <Text style={styles.infoText}>Password: <Text style={styles.boldText}>{password}</Text></Text>
            </View>

            <TouchableOpacity
              style={[styles.joinButton, !roomCode && styles.disabledButton]}
              onPress={handleJoinChat}
              disabled={!roomCode}
            >
              <Text style={styles.joinButtonText}>Enter Chat Room</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Room</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create a Private Chat Room</Text>
          <Text style={styles.cardSubtitle}>Set up a secure space for you and your friend</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <User size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your nickname"
                value={nickname}
                onChangeText={setNickname}
                maxLength={20}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Room password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                maxLength={30}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.disabledButton]}
            onPress={handleCreateRoom}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Create Room</Text>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Your friend will need both the room code and password to join
            </Text>
          </View>
        </View>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1c1c1e',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#007AFF80',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 24,
    textAlign: 'center',
  },
  codeContainer: {
    width: '100%',
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    textAlign: 'center',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#e1f5fe',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  boldText: {
    fontWeight: '600',
    color: '#1c1c1e',
  },
  joinButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});