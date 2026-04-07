import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { initDB } from '@/lib/db';
import { colors } from '@/constants/colors';

export default function RootLayout() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initDB();
    initialize();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace('/(tabs)/today');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
