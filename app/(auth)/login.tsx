import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';

export default function LoginScreen() {
  const { login, register, hasAccount, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    setMode(hasAccount ? 'login' : 'register');
  }, [hasAccount]);

  useEffect(() => {
    return () => clearError();
  }, []);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    if (mode === 'login') {
      await login(email, password);
    } else {
      await register(email, password);
    }
    setSubmitting(false);
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Soft Days</Text>
        <Text style={styles.subtitle}>
          {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.cream} />
          ) : (
            <Text style={styles.buttonText}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Text>
          )}
        </TouchableOpacity>

        {hasAccount && (
          <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
            <Text style={styles.toggle}>
              {mode === 'login' ? 'No account? Register' : 'Have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 36, fontWeight: '300', color: colors.primary, marginBottom: 8, letterSpacing: 1 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 40 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: colors.cream, fontSize: 16, fontWeight: '600' },
  error: { color: colors.error, fontSize: 14, marginBottom: 8, textAlign: 'center' },
  toggle: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 20 },
});
