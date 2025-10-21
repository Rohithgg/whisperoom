import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Private Chat</Text>
            <Text style={styles.subtitle}>Secure temporary messaging</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/create-room')}
            >
              <Plus size={Math.min(24, SCREEN_WIDTH * 0.06)} color="#ffffff" />
              <Text style={styles.buttonText}>Create Room</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/join-room')}
            >
              <Users size={Math.min(24, SCREEN_WIDTH * 0.06)} color="#007AFF" />
              <Text style={styles.secondaryButtonText}>Join Room</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.features}>
            <Text style={styles.featureText}>✨ End-to-end temporary chats</Text>
            <Text style={styles.featureText}>🔒 Password protected rooms</Text>
            <Text style={styles.featureText}>⚡ Instant message delivery</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    paddingVertical: SCREEN_HEIGHT * 0.03,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.08,
  },
  title: {
    fontSize: Math.min(36, SCREEN_WIDTH * 0.09),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.min(18, SCREEN_WIDTH * 0.045),
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: Math.min(16, SCREEN_HEIGHT * 0.02),
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 56,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: Math.min(16, SCREEN_HEIGHT * 0.02),
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 56,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: Math.min(18, SCREEN_WIDTH * 0.045),
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: Math.min(18, SCREEN_WIDTH * 0.045),
    fontWeight: '600',
  },
  features: {
    alignItems: 'center',
    gap: 8,
    marginBottom: SCREEN_HEIGHT * 0.05,
  },
  featureText: {
    color: '#ffffff',
    fontSize: Math.min(16, SCREEN_WIDTH * 0.04),
    opacity: 0.9,
    textAlign: 'center',
  },
});