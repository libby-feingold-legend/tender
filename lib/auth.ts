import * as SecureStore from 'expo-secure-store';
import * as bcrypt from 'bcryptjs';

const EMAIL_KEY = 'auth_email';
const HASH_KEY = 'auth_password_hash';
const SESSION_KEY = 'auth_session';

export async function register(email: string, password: string): Promise<void> {
  const existing = await SecureStore.getItemAsync(EMAIL_KEY);
  if (existing) throw new Error('An account already exists on this device.');

  const hash = await bcrypt.hash(password, 10);
  await SecureStore.setItemAsync(EMAIL_KEY, email.toLowerCase().trim());
  await SecureStore.setItemAsync(HASH_KEY, hash);
}

export async function login(email: string, password: string): Promise<void> {
  const storedEmail = await SecureStore.getItemAsync(EMAIL_KEY);
  const storedHash = await SecureStore.getItemAsync(HASH_KEY);

  if (!storedEmail || !storedHash) throw new Error('No account found on this device.');
  if (storedEmail !== email.toLowerCase().trim()) throw new Error('Invalid email or password.');

  const match = await bcrypt.compare(password, storedHash);
  if (!match) throw new Error('Invalid email or password.');

  await SecureStore.setItemAsync(SESSION_KEY, 'active');
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function getSession(): Promise<boolean> {
  const session = await SecureStore.getItemAsync(SESSION_KEY);
  return session === 'active';
}

export async function hasAccount(): Promise<boolean> {
  const email = await SecureStore.getItemAsync(EMAIL_KEY);
  return !!email;
}
