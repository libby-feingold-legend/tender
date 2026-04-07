import { create } from 'zustand';
import { Entry, EntryDraft, HabitTag, MoodScore, EnergyScore } from '@/types';
import { upsertEntry, getEntryByDate, getAllEntries, deleteEntry } from '@/lib/db';
import { todayISO } from '@/lib/utils';

interface EntryState {
  entries: Entry[];
  todayEntry: Entry | null;
  draft: EntryDraft;
  isLoading: boolean;
  loadEntries: () => void;
  loadToday: () => void;
  setMood: (score: MoodScore) => void;
  setEnergy: (score: EnergyScore) => void;
  setGratitude: (text: string) => void;
  setNote: (text: string) => void;
  toggleHabit: (habit: HabitTag) => void;
  saveEntry: () => Entry | null;
  deleteEntry: (id: string) => void;
  resetDraft: () => void;
}

function emptyDraft(): EntryDraft {
  return {
    logged_date: todayISO(),
    mood_score: null,
    energy_score: null,
    gratitude_text: '',
    free_note: '',
    habits: [],
  };
}

export const useEntryStore = create<EntryState>((set, get) => ({
  entries: [],
  todayEntry: null,
  draft: emptyDraft(),
  isLoading: false,

  loadEntries: () => {
    const entries = getAllEntries();
    set({ entries });
  },

  loadToday: () => {
    const today = todayISO();
    const todayEntry = getEntryByDate(today);
    if (todayEntry) {
      set({
        todayEntry,
        draft: {
          logged_date: todayEntry.logged_date,
          mood_score: todayEntry.mood_score,
          energy_score: todayEntry.energy_score,
          gratitude_text: todayEntry.gratitude_text,
          free_note: todayEntry.free_note,
          habits: todayEntry.habits,
        },
      });
    } else {
      set({ todayEntry: null, draft: emptyDraft() });
    }
  },

  setMood: (score) => set((s) => ({ draft: { ...s.draft, mood_score: score } })),
  setEnergy: (score) => set((s) => ({ draft: { ...s.draft, energy_score: score } })),
  setGratitude: (text) => set((s) => ({ draft: { ...s.draft, gratitude_text: text } })),
  setNote: (text) => set((s) => ({ draft: { ...s.draft, free_note: text } })),

  toggleHabit: (habit) =>
    set((s) => {
      const habits = s.draft.habits.includes(habit)
        ? s.draft.habits.filter((h) => h !== habit)
        : [...s.draft.habits, habit];
      return { draft: { ...s.draft, habits } };
    }),

  saveEntry: () => {
    const { draft } = get();
    if (!draft.mood_score || !draft.energy_score) return null;
    const entry = upsertEntry(draft);
    set((s) => ({
      todayEntry: entry,
      entries: [entry, ...s.entries.filter((e) => e.logged_date !== entry.logged_date)],
    }));
    return entry;
  },

  deleteEntry: (id) => {
    deleteEntry(id);
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
  },

  resetDraft: () => set({ draft: emptyDraft() }),
}));
