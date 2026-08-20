import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
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
    <SafeAreaProvider>
      {/*
       * StatusBar at root level applies to every screen in the app.
       * backgroundColor sets the bar color on Android.
       * style="light" makes the icons/text on the bar white (like WhatsApp).
       * translucent={false} ensures the bar occupies real space and content
       * starts below it — no overlap.
       */}
      <StatusBar
        backgroundColor="#FFFFFF"
        style="dark"
        translucent={false}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
