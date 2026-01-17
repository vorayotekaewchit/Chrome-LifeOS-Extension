import { create } from 'zustand';
import type { Tab } from '../components/BottomTabBar';

// Declare chrome for TypeScript
declare const chrome: any;

interface LifeOState {
  currentPage: Tab;
  momentumBar: { show: boolean };
  weeklyBox: { show: boolean };
  focusWindow: number;
  
  // Actions
  setPage: (page: Tab) => void;
  toggleMomentum: () => void;
  toggleWeeklyBox: () => void;
  setFocusWindow: (index: number) => void;
}

const STORAGE_KEY = 'lifeOUIState';

// Helper function to save to chrome.storage.sync
const saveToStorage = (state: Omit<LifeOState, 'setPage' | 'toggleMomentum' | 'toggleWeeklyBox' | 'setFocusWindow'>) => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ [STORAGE_KEY]: state });
    }
    // Also save to localStorage as fallback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save UI state:', error);
  }
};

const defaultState = {
  currentPage: 'dashboard' as Tab,
  momentumBar: { show: true },
  weeklyBox: { show: true },
  focusWindow: 0,
};

export const useLifeOStore = create<LifeOState>((set, get) => ({
  ...defaultState,
  
  setPage: (page: Tab) => {
    const newState = {
      currentPage: page,
      momentumBar: get().momentumBar,
      weeklyBox: get().weeklyBox,
      focusWindow: get().focusWindow,
    };
    set({ currentPage: page });
    saveToStorage(newState);
  },
  
  toggleMomentum: () => {
    const newMomentumBar = { show: !get().momentumBar.show };
    const newState = {
      currentPage: get().currentPage,
      momentumBar: newMomentumBar,
      weeklyBox: get().weeklyBox,
      focusWindow: get().focusWindow,
    };
    set({ momentumBar: newMomentumBar });
    saveToStorage(newState);
  },
  
  toggleWeeklyBox: () => {
    const newWeeklyBox = { show: !get().weeklyBox.show };
    const newState = {
      currentPage: get().currentPage,
      momentumBar: get().momentumBar,
      weeklyBox: newWeeklyBox,
      focusWindow: get().focusWindow,
    };
    set({ weeklyBox: newWeeklyBox });
    saveToStorage(newState);
  },
  
  setFocusWindow: (index: number) => {
    const newState = {
      currentPage: get().currentPage,
      momentumBar: get().momentumBar,
      weeklyBox: get().weeklyBox,
      focusWindow: index,
    };
    set({ focusWindow: index });
    saveToStorage(newState);
  },
}));

// Async hydrate function for use in components
export const hydrateLifeOState = async () => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      return new Promise<void>((resolve) => {
        chrome.storage.sync.get([STORAGE_KEY], (result: any) => {
          if (result[STORAGE_KEY]) {
            useLifeOStore.setState(result[STORAGE_KEY]);
          } else {
            // Fallback to localStorage
            const item = localStorage.getItem(STORAGE_KEY);
            if (item) {
              try {
                const parsed = JSON.parse(item);
                useLifeOStore.setState(parsed);
              } catch (e) {
                // Use default state
              }
            }
          }
          resolve();
        });
      });
    } else {
      // Fallback to localStorage
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        try {
          const parsed = JSON.parse(item);
          useLifeOStore.setState(parsed);
        } catch (e) {
          // Use default state
        }
      }
    }
  } catch (error) {
    console.warn('Failed to hydrate UI state:', error);
  }
};
