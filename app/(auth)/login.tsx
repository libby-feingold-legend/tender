import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput as RNTextInput,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePassword } from '@/lib/auth';
import { colors } from '@/constants/colors';

export default function LoginScreen() {
  const { login, register, hasAccount, isLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const passwordRef = useRef<RNTextInput>(null);
  const confirmRef = useRef<RNTextInput>(null);

  useEffect(() => {
    setMode(hasAccount ? 'login' : 'register');
  }, [hasAccount]);

  useEffect(() => {
    return () => clearError();
  }, []);

  useEffect(() => {
    clearError();
    setFieldErrors({});
  }, [mode]);

  function validate(): boolean {
    const errors: Record<string, string> = {};
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const passErr = validatePassword(password);
    if (passErr) errors.password = passErr;
    if (mode === 'register' && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    if (mode === 'login') {
      await login(email.trim(), password);
    } else {
      await register(email.trim(), password);
    }
    setSubmitting(false);
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <Text style={styles.title}>Soft Days</Text>
          <Text style={styles.tagline}>A gentle space to check in with yourself.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
          </Text>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[styles.input, fieldErrors.email ? styles.inputError : null]}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={(t) => { setEmail(t); setFieldErrors((e) => ({ ...e, email: '' })); }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              ref={passwordRef}
              style={[styles.input, fieldErrors.password ? styles.inputError : null]}
              placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={(t) => { setPassword(t); setFieldErrors((e) => ({ ...e, password: '' })); }}
              secureTextEntry
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              returnKeyType={mode === 'register' ? 'next' : 'done'}
              onSubmitEditing={() => mode === 'register' ? confirmRef.current?.focus() : handleSubmit()}
            />
            {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}
          </View>

          {/* Confirm password (register only) */}
          {mode === 'register' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirm password</Text>
              <TextInput
                ref={confirmRef}
                style={[styles.input, fieldErrors.confirmPassword ? styles.inputError : null]}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setFieldErrors((e) => ({ ...e, confirmPassword: '' })); }}
                secureTextEntry
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              {fieldErrors.confirmPassword ? <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text> : null}
            </View>
          )}

          {/* Server error */}
          {error ? <Text style={styles.serverError}>{error}</Text> : null}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color={colors.cream} />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle mode */}
          <TouchableOpacity
            onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setEmail(''); setPassword(''); setConfirmPassword(''); }}
            style={styles.toggleBtn}
          >
            <Text style={styles.toggleText}>
              {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 48 },
  brand: { marginBottom: 48 },
  title: { fontSize: 40, fontWeight: '300', color: colors.primary, letterSpacing: 1.5 },
  tagline: { fontSize: 15, color: colors.textSecondary, marginTop: 6, lineHeight: 22 },
  form: { gap: 4 },
  formTitle: { fontSize: 20, fontWeight: '500', color: colors.textPrimary, marginBottom: 20 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 6, letterSpacing: 0.3 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  inputError: { borderColor: colors.error },
  fieldError: { fontSize: 12, color: colors.error, marginTop: 5 },
  serverError: {
    fontSize: 14,
    color: colors.error,
    backgroundColor: '#F9EDED',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.cream, fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  toggleBtn: { marginTop: 20, alignItems: 'center' },
  toggleText: { color: colors.textSecondary, fontSize: 14 },
});
