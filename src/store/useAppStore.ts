import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the shape of your User
export interface AppUser {
  role: 'admin' | 'student';
  username: string;
  institutionCode: string;
  // Add any other user fields here
}

// Define your Store's State and Actions
interface AppState {
  user: AppUser | null;
  activeBatch: any | null; // Suggestion: Replace 'any' with a 'Batch' interface later
  login: (userData: AppUser) => void;
  logout: () => void;
  setActiveBatch: (batch: any) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      activeBatch: null,
      
      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null, activeBatch: null }),
      setActiveBatch: (batch) => set({ activeBatch: batch }),
    }),
    { name: 'edu-smart-storage' } // Automatically saves to localStorage
  )
);