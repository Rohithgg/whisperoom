import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ChatProvider } from '@/contexts/ChatContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ChatProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="create-room" />
        <Stack.Screen name="join-room" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="session-ended" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ChatProvider>
  );
}