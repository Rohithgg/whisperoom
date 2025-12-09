import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ChatProvider } from '@/contexts/ChatContext';
import { ToastProvider } from '@/contexts/ToastContext';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  
  useFrameworkReady();

  useEffect(() => {
    // Ensure the layout is ready before rendering
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null; // or a loading screen
  }

  return (
    <ToastProvider>
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
    </ToastProvider>
  );
}