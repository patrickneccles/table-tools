import { LucideIcon } from "lucide-react";

export type Sound = {
  id: string;
  name: string;
  audioSrc: string;
  icon?: LucideIcon;
};

export type MoodTheme = {
  primary: string;           // Main color (e.g., active button background)
  secondary: string;         // Highlight/accent color (e.g., rings, borders)
  tertiary?: string;         // Subtle accent (e.g., section headers, inactive hints)
  primaryForeground?: string;  // Text/icon color on primary
};

export type Mood = {
  id: string;
  name: string;
  description?: string;
  theme?: MoodTheme;
  ambience: Sound[];
  effects: Sound[];
};
