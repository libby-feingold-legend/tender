import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEntryStore } from '@/store/entryStore';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { HABIT_OPTIONS } from '@/constants/habits';
import { MoodScore, EnergyScore, HabitTag } from '@/types';
import { formatDate, todayISO, MOOD_EMOJI, MOOD_LABEL } from '@/lib/utils';

export default function TodayScreen() {
  const {
    draft, todayEntry, loadToday,
    setMood, setEnergy, setGratitude, setNote, toggleHabit, saveEntry,
  } = useEntryStore();
  const { logout } = useAuthStore();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadToday();
  }, []);

  function handleSave() {
    const entry = saveEntry();
    if (!entry) {
      Alert.alert('Almost there', 'Please select your mood and energy before saving.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>Today</Text>
            <Text style={styles.date}>{formatDate(todayISO())}</Text>
          </View>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Mood */}
        <Text style={styles.label}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {([1, 2, 3, 4, 5] as MoodScore[]).map((score) => (
            <TouchableOpacity
              key={score}
              style={[styles.moodBtn, draft.mood_score === score && styles.moodBtnActive]}
              onPress={() => setMood(score)}
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
                draft.energy_score === score && { backgroundColor: colors.primary },
              ]}
              onPress={() => setEnergy(score)}
            >
              <Text style={[styles.energyText, draft.energy_score === score && { color: colors.cream }]}>
                {score}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gratitude */}
        <Text style={styles.label}>One thing you're grateful for</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Something small counts..."
          placeholderTextColor={colors.textMuted}
          value={draft.gratitude_text}
          onChangeText={setGratitude}
          multiline
        />

        {/* Habits */}
        <Text style={styles.label}>What did you do today?</Text>
        <View style={styles.habitGrid}>
          {HABIT_OPTIONS.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.habitChip,
                draft.habits.includes(value as HabitTag) && styles.habitChipActive,
              ]}
              onPress={() => toggleHabit(value as HabitTag)}
            >
              <Text style={[
                styles.habitText,
                draft.habits.includes(value as HabitTag) && styles.habitTextActive,
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <Text style={styles.label}>Anything else on your mind?</Text>
        <TextInput
          style={[styles.textInput, styles.noteInput]}
          placeholder="Write freely..."
          placeholderTextColor={colors.textMuted}
          value={draft.free_note}
          onChangeText={setNote}
          multiline
        />

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{saved ? 'Saved ✓' : todayEntry ? 'Update entry' : 'Save entry'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  heading: { fontSize: 28, fontWeight: '300', color: colors.primary, letterSpacing: 0.5 },
  date: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  logoutText: { fontSize: 13, color: colors.textMuted, paddingTop: 6 },
  label: { fontSize: 15, color: colors.textPrimary, fontWeight: '500', marginBottom: 12, marginTop: 24 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: colors.surface,
  },
  moodBtnActive: { borderColor: colors.primary, backgroundColor: colors.oat },
  moodEmoji: { fontSize: 22 },
  moodLabel: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
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
  energyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 60,
  },
  noteInput: { minHeight: 100 },
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
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnText: { color: colors.cream, fontSize: 16, fontWeight: '600' },
});
