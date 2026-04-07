import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useEntryStore } from '@/store/entryStore';
import { colors } from '@/constants/colors';
import { Entry } from '@/types';
import { formatDate, MOOD_EMOJI } from '@/lib/utils';
import { HABIT_OPTIONS } from '@/constants/habits';

function EntryCard({ entry, onDelete }: { entry: Entry; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  const habitLabels = entry.habits
    .map((h) => HABIT_OPTIONS.find((o) => o.value === h)?.label)
    .filter(Boolean)
    .join(', ');

  function confirmDelete() {
    Alert.alert('Delete entry', 'Are you sure you want to delete this entry? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry.id) },
    ]);
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded((v) => !v)}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardMood}>{MOOD_EMOJI[entry.mood_score]}</Text>
          <View>
            <Text style={styles.cardDate}>{formatDate(entry.logged_date)}</Text>
            <Text style={styles.cardScores}>
              Mood {entry.mood_score}/5 · Energy {entry.energy_score}/5
            </Text>
          </View>
        </View>
        <Text style={styles.chevron}>{expanded ? '−' : '+'}</Text>
      </View>

      {habitLabels ? (
        <View style={styles.habitRow}>
          {entry.habits.map((h) => {
            const label = HABIT_OPTIONS.find((o) => o.value === h)?.label;
            return label ? (
              <View key={h} style={styles.habitPill}>
                <Text style={styles.habitPillText}>{label}</Text>
              </View>
            ) : null;
          })}
        </View>
      ) : null}

      {expanded && (
        <View style={styles.expanded}>
          {entry.gratitude_text ? (
            <View style={styles.expandedSection}>
              <Text style={styles.expandedLabel}>Grateful for</Text>
              <Text style={styles.expandedText}>"{entry.gratitude_text}"</Text>
            </View>
          ) : null}
          {entry.free_note ? (
            <View style={styles.expandedSection}>
              <Text style={styles.expandedLabel}>Note</Text>
              <Text style={styles.expandedText}>{entry.free_note}</Text>
            </View>
          ) : null}
          <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
            <Text style={styles.deleteBtnText}>Delete entry</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function JournalScreen() {
  const { entries, loadEntries, removeEntry } = useEntryStore();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Journal</Text>
        {entries.length > 0 && (
          <Text style={styles.count}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </Text>
        )}
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📓</Text>
          <Text style={styles.emptyText}>No entries yet.</Text>
          <Text style={styles.emptySubtext}>Start logging from the Today tab.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EntryCard entry={item} onDelete={removeEntry} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  heading: { fontSize: 28, fontWeight: '300', color: colors.primary, letterSpacing: 0.5 },
  count: { fontSize: 13, color: colors.textMuted },
  list: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardMood: { fontSize: 28 },
  cardDate: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  cardScores: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 18, color: colors.textMuted, fontWeight: '300' },
  habitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  habitPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.lavender + '55',
  },
  habitPillText: { fontSize: 12, color: colors.deepMauve },
  expanded: { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
  expandedSection: { marginBottom: 12 },
  expandedLabel: { fontSize: 11, fontWeight: '600', color: colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  expandedText: { fontSize: 14, color: colors.textPrimary, lineHeight: 21, fontStyle: 'italic' },
  deleteBtn: { marginTop: 8, alignSelf: 'flex-start' },
  deleteBtnText: { fontSize: 13, color: colors.error },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 16 },
  emptyText: { fontSize: 18, color: colors.textSecondary, fontWeight: '300' },
  emptySubtext: { fontSize: 14, color: colors.textMuted, marginTop: 8 },
});
