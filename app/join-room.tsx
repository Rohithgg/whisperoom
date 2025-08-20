import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Hash, Lock, User } from 'lucide-react-native';
import { useChat } from '@/contexts/ChatContext';

export default function JoinRoomScreen() {
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(`User${Math.floor(Math.random() * 1000)}`);
  const { joinRoom, isLoading } = useChat();
  const router = useRouter();

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !password.trim() || !nickname.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const result = await joinRoom(roomCode.trim().toUpperCase(), password.trim(), nickname.trim());

    if (result.success) {
      router.push('/chat');
    } else {
      Alert.alert('Error', result.error || 'Failed to join room');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join Room</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Join a Chat Room</Text>
          <Text style={styles.cardSubtitle}>Enter the room details shared with you</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Hash size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Room Code (6 characters)"
                value={roomCode}
                onChangeText={(text) => setRoomCode(text.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                maxLength={30}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputWrapper}>
              <User size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your nickname"
                value={nickname}
                onChangeText={setNickname}
                maxLength={20}
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.joinButton, isLoading && styles.disabledButton]}
            onPress={handleJoinRoom}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.joinButtonText}>Join Room</Text>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Make sure you have the correct room code and password from the room creator
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
  joinButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#A8D8B9',
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e1f5fe',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#01579b',
    textAlign: 'center',
  },
});