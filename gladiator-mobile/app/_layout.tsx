import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider as AppThemeProvider } from '@/context/ThemeContext';

import { ProtocolReminder } from '@/components/ProtocolReminder';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(drawer)',
};


export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootLayoutNav />
    </AppThemeProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const rootNavigationState = useRootNavigationState();

  // Simple initial redirect to login
  useEffect(() => {
    // Wait for the navigation to be fully ready
    if (!rootNavigationState?.key) return;

    // Add a small delay to ensure the layout is fully mounted
    const timer = setTimeout(() => {
      // In a real app, check auth state here
      const isAuthenticated = false;
      if (!isAuthenticated) {
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [rootNavigationState?.key]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <StackScreen />
          <ProtocolReminder />
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function StackScreen() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}
