import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useEntryStore } from '@/store/entryStore';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { HABIT_OPTIONS } from '@/constants/habits';
import { MoodScore, EnergyScore, HabitTag } from '@/types';
import { formatDate, todayISO, MOOD_EMOJI, MOOD_LABEL } from '@/lib/utils';

const GRATITUDE_LIMIT = 300;
const NOTE_LIMIT = 1000;

export default function TodayScreen() {
  const {
    draft, todayEntry, loadToday,
    setMood, setEnergy, setGratitude, setNote, toggleHabit, saveEntry,
  } = useEntryStore();
  const { logout } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadToday();
    }, [])
  );

  function handleSave() {
    if (!draft.mood_score) {
      setSaveError('Please select how you're feeling.');
      return;
    }
    if (!draft.energy_score) {
      setSaveError('Please select your energy level.');
      return;
    }
    setSaveError('');
    const entry = saveEntry();
    if (entry) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  function handleLogout() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  }

  const isComplete = !!draft.mood_score && !!draft.energy_score;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.heading}>Today</Text>
              <Text style={styles.date}>{formatDate(todayISO())}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.logoutText}>Sign out</Text>
            </TouchableOpacity>
          </View>

          {todayEntry && (
            <View style={styles.savedBadge}>
              <Text style={styles.savedBadgeText}>✓ Entry saved for today</Text>
            </View>
          )}

          {/* Mood */}
          <Text style={styles.label}>How are you feeling?</Text>
          <View style={styles.moodRow}>
            {([1, 2, 3, 4, 5] as MoodScore[]).map((score) => (
              <TouchableOpacity
                key={score}
                style={[styles.moodBtn, draft.mood_score === score && styles.moodBtnActive]}
                onPress={() => setMood(score)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{MOOD_EMOJI[score]}</Text>
                <Text style={[styles.moodLabel, draft.mood_score === score && styles.moodLabelActive]}>
                  {MOOD_LABEL[score]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Energy */}
          <Text style={styles.label}>Energy level</Text>
          <View style={styles.energyRow}>
            {([1, 2, 3, 4, 5] as EnergyScore[]).map((score) => (
              <TouchableOpacity
                key={score}
                style={[
                  styles.energyBtn,
                  draft.energy_score === score && styles.energyBtnActive,
                ]}
                onPress={() => setEnergy(score)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.energyText,
                  draft.energy_score === score && styles.energyTextActive,
                ]}>
                  {score}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.energyLabels}>
            <Text style={styles.energyHint}>Low</Text>
            <Text style={styles.energyHint}>High</Text>
          </View>

          {/* Gratitude */}
          <Text style={styles.label}>One thing you're grateful for</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Something small counts..."
            placeholderTextColor={colors.textMuted}
            value={draft.gratitude_text}
            onChangeText={(t) => setGratitude(t.slice(0, GRATITUDE_LIMIT))}
            multiline
            maxLength={GRATITUDE_LIMIT}
          />
          <Text style={styles.charCount}>{draft.gratitude_text.length}/{GRATITUDE_LIMIT}</Text>

          {/* Habits */}
          <Text style={styles.label}>What did you do today?</Text>
          <View style={styles.habitGrid}>
            {HABIT_OPTIONS.map(({ label, value }) => {
              const active = draft.habits.includes(value as HabitTag);
              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.habitChip, active && styles.habitChipActive]}
                  onPress={() => toggleHabit(value as HabitTag)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.habitText, active && styles.habitTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Note */}
          <Text style={styles.label}>Anything else on your mind? <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={[styles.textInput, styles.noteInput]}
            placeholder="Write freely..."
            placeholderTextColor={colors.textMuted}
            value={draft.free_note}
            onChangeText={(t) => setNote(t.slice(0, NOTE_LIMIT))}
            multiline
            maxLength={NOTE_LIMIT}
          />
          <Text style={styles.charCount}>{draft.free_note.length}/{NOTE_LIMIT}</Text>

          {/* Error */}
          {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, !isComplete && styles.saveBtnDim]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>
              {saved ? '✓ Saved!' : todayEntry ? 'Update entry' : 'Save entry'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingBottom: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  heading: { fontSize: 28, fontWeight: '300', color: colors.primary, letterSpacing: 0.5 },
  date: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  logoutText: { fontSize: 13, color: colors.textMuted, paddingTop: 6 },
  savedBadge: {
    backgroundColor: '#EBF5EF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  savedBadgeText: { fontSize: 13, color: '#4A8C63', fontWeight: '500' },
  label: { fontSize: 15, color: colors.textPrimary, fontWeight: '500', marginBottom: 12, marginTop: 24 },
  optional: { fontSize: 13, fontWeight: '400', color: colors.textMuted },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  moodBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    flex: 1,
    backgroundColor: colors.surface,
  },
  moodBtnActive: { borderColor: colors.primary, backgroundColor: colors.oat },
  moodEmoji: { fontSize: 22 },
  moodLabel: { fontSize: 10, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  moodLabelActive: { color: colors.primary, fontWeight: '600' },
  energyRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  energyBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  energyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  energyTextActive: { color: colors.cream },
  energyLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  energyHint: { fontSize: 11, color: colors.textMuted },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  noteInput: { minHeight: 110 },
  charCount: { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  habitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  habitChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  habitChipActive: { backgroundColor: colors.lavender, borderColor: colors.accent },
  habitText: { fontSize: 14, color: colors.textSecondary },
  habitTextActive: { color: colors.deepMauve, fontWeight: '600' },
  saveError: { color: colors.error, fontSize: 13, textAlign: 'center', marginTop: 16 },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  saveBtnDim: { opacity: 0.6 },
  saveBtnText: { color: colors.cream, fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
});
