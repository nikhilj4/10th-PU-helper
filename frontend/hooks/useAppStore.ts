import { create } from "zustand";

type ClassLevel = "10th" | "PUC" | "";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AppState {
  step: "landing" | "auth" | "profile" | "subjects" | "chat";
  classLevel: ClassLevel;
  selectedSubjects: string[];
  currentSubject: string;
  tokens: number;
  messages: ChatMessage[];
  setStep: (s: AppState["step"]) => void;
  setClassLevel: (c: ClassLevel) => void;
  setSelectedSubjects: (s: string[]) => void;
  setCurrentSubject: (s: string) => void;
  setTokens: (t: number) => void;
  addMessage: (m: ChatMessage) => void;
}

export const useAppStore = create<AppState>((set) => ({
  step: "landing",
  classLevel: "",
  selectedSubjects: [],
  currentSubject: "",
  tokens: 1000,
  messages: [],
  setStep: (step) => set({ step }),
  setClassLevel: (classLevel) => set({ classLevel }),
  setSelectedSubjects: (selectedSubjects) => set({ selectedSubjects }),
  setCurrentSubject: (currentSubject) => set({ currentSubject }),
  setTokens: (tokens) => set({ tokens }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));
