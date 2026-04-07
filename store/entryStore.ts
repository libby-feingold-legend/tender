import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entry, EntryDraft, HabitTag, MoodScore, EnergyScore } from '@/types';
import { upsertEntry, getEntryByDate, getAllEntries, deleteEntry } from '@/lib/db';
import { todayISO } from '@/lib/utils';

const DRAFT_KEY = 'entry_draft';

interface EntryState {
  entries: Entry[];
  todayEntry: Entry | null;
  draft: EntryDraft;
  isLoading: boolean;
  loadEntries: () => void;
  loadToday: () => Promise<void>;
  setMood: (score: MoodScore) => void;
  setEnergy: (score: EnergyScore) => void;
  setGratitude: (text: string) => void;
  setNote: (text: string) => void;
  toggleHabit: (habit: HabitTag) => void;
  saveEntry: () => Entry | null;
  removeEntry: (id: string) => void;
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

async function persistDraft(draft: EntryDraft) {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Non-critical — silently ignore
  }
}

async function loadPersistedDraft(): Promise<EntryDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft: EntryDraft = JSON.parse(raw);
    // Discard draft if it's from a previous day
    if (draft.logged_date !== todayISO()) {
      await AsyncStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
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

  loadToday: async () => {
    const today = todayISO();
    const todayEntry = getEntryByDate(today);

    if (todayEntry) {
      // Existing saved entry takes priority
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
      // Try to restore in-progress draft from AsyncStorage
      const persisted = await loadPersistedDraft();
      set({ todayEntry: null, draft: persisted ?? emptyDraft() });
    }
  },

  setMood: (score) => {
    set((s) => {
      const draft = { ...s.draft, mood_score: score };
      persistDraft(draft);
      return { draft };
    });
  },

  setEnergy: (score) => {
    set((s) => {
      const draft = { ...s.draft, energy_score: score };
      persistDraft(draft);
      return { draft };
    });
  },

  setGratitude: (text) => {
    set((s) => {
      const draft = { ...s.draft, gratitude_text: text };
      persistDraft(draft);
      return { draft };
    });
  },

  setNote: (text) => {
    set((s) => {
      const draft = { ...s.draft, free_note: text };
      persistDraft(draft);
      return { draft };
    });
  },

  toggleHabit: (habit) => {
    set((s) => {
      const habits = s.draft.habits.includes(habit)
        ? s.draft.habits.filter((h) => h !== habit)
        : [...s.draft.habits, habit];
      const draft = { ...s.draft, habits };
      persistDraft(draft);
      return { draft };
    });
  },

  saveEntry: () => {
    const { draft } = get();
    if (!draft.mood_score || !draft.energy_score) return null;
    const entry = upsertEntry(draft);
    AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
    set((s) => ({
      todayEntry: entry,
      entries: [entry, ...s.entries.filter((e) => e.logged_date !== entry.logged_date)],
    }));
    return entry;
  },

  removeEntry: (id) => {
    deleteEntry(id);
    set((s) => ({
      entries: s.entries.filter((e) => e.id !== id),
      todayEntry: s.todayEntry?.id === id ? null : s.todayEntry,
    }));
  },

  resetDraft: () => {
    AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
    set({ draft: emptyDraft() });
  },
}));
