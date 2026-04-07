export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(iso: string): string {
  const date = new Date(iso + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const MOOD_EMOJI: Record<number, string> = {
  1: '😔',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

export const MOOD_LABEL: Record<number, string> = {
  1: 'Rough',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};
