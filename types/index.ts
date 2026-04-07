export type MoodScore = 1 | 2 | 3 | 4 | 5;
export type EnergyScore = 1 | 2 | 3 | 4 | 5;

export type HabitTag =
  | 'exercise'
  | 'outside'
  | 'creative'
  | 'social'
  | 'rest'
  | 'reading'
  | 'cooking'
  | 'meditation'
  | 'work_focus'
  | 'poor_sleep';

export interface Entry {
  id: string;
  logged_date: string; // YYYY-MM-DD
  mood_score: MoodScore;
  energy_score: EnergyScore;
  gratitude_text: string;
  free_note: string;
  habits: HabitTag[];
  created_at: string;
  updated_at: string;
}

export interface EntryDraft {
  logged_date: string;
  mood_score: MoodScore | null;
  energy_score: EnergyScore | null;
  gratitude_text: string;
  free_note: string;
  habits: HabitTag[];
}
