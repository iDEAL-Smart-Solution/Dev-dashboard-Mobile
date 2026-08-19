import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  useEffect(() => {
    const checkAuth = async () => {
      const authStorage = await AsyncStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          if (parsed?.state?.user && parsed?.state?.token) {
            useAuthStore.setState({
              user: parsed.state.user,
              token: parsed.state.token,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error('Failed to parse auth storage:', error);
        }
      }
    };
    checkAuth();
  }, []);

  return (
    // SafeAreaProvider at the root level ensures every screen — including those
    // inside the tab navigator — receives correct safe-area inset values on both
    // Android (status bar) and iOS (notch / Dynamic Island / home indicator).
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
