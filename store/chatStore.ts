import { create } from 'zustand';

interface ChatState {
  inputValue: string;
  setInputValue: (value: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  inputValue: 'ㅁㄴㅇㅁㄴㅇ',
  setInputValue: (value) => set({ inputValue: value }),
}));
