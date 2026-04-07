import { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEntryStore } from '@/store/entryStore';
import { colors } from '@/constants/colors';
import { Entry } from '@/types';
import { formatDate, MOOD_EMOJI } from '@/lib/utils';
import { HABIT_OPTIONS } from '@/constants/habits';

function EntryCard({ entry }: { entry: Entry }) {
  const habitLabels = entry.habits
    .map((h) => HABIT_OPTIONS.find((o) => o.value === h)?.label)
    .filter(Boolean)
    .join(', ');

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{formatDate(entry.logged_date)}</Text>
        <Text style={styles.cardMood}>{MOOD_EMOJI[entry.mood_score]}</Text>
      </View>

      <View style={styles.scores}>
        <Text style={styles.scoreText}>Mood {entry.mood_score}/5</Text>
        <Text style={styles.scoreDot}>·</Text>
        <Text style={styles.scoreText}>Energy {entry.energy_score}/5</Text>
      </View>

      {habitLabels ? <Text style={styles.habits}>{habitLabels}</Text> : null}

      {entry.gratitude_text ? (
        <Text style={styles.gratitude} numberOfLines={2}>
          "{entry.gratitude_text}"
        </Text>
      ) : null}

      {entry.free_note ? (
        <Text style={styles.note} numberOfLines={3}>{entry.free_note}</Text>
      ) : null}
    </View>
  );
}

export default function JournalScreen() {
  const { entries, loadEntries } = useEntryStore();

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Journal</Text>
        <Text style={styles.count}>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</Text>
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No entries yet.</Text>
          <Text style={styles.emptySubtext}>Start logging from the Today tab.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EntryCard entry={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  heading: { fontSize: 28, fontWeight: '300', color: colors.primary, letterSpacing: 0.5 },
  count: { fontSize: 13, color: colors.textMuted },
  list: { padding: 24, paddingTop: 8, gap: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardDate: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  cardMood: { fontSize: 22 },
  scores: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  scoreText: { fontSize: 13, color: colors.textSecondary },
  scoreDot: { color: colors.textMuted },
  habits: { fontSize: 13, color: colors.textMuted, marginBottom: 8 },
  gratitude: { fontSize: 14, color: colors.textSecondary, fontStyle: 'italic', marginBottom: 6 },
  note: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: colors.textSecondary, fontWeight: '300' },
  emptySubtext: { fontSize: 14, color: colors.textMuted, marginTop: 8 },
});
