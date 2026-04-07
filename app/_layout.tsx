import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { initDB } from '@/lib/db';
import { colors } from '@/constants/colors';

export default function RootLayout() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initDB().then(() => initialize());
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
