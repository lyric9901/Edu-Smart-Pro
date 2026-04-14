import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      user: null, // Stores admin or student data
      activeBatch: null, // Remembers what batch they were looking at
      
      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null, activeBatch: null }),
      setActiveBatch: (batch) => set({ activeBatch: batch }),
    }),
    { name: 'edu-smart-storage' } // Automatically saves to localStorage!
  )
);