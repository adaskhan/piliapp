import { useState, useEffect } from 'react';
import type { StoredState } from '../types';

const DEFAULT_STATE: StoredState = {
  items: [
    '🍅 Помидор',
    '🥑 Авокадо',
    '🍆 Баклажан',
    '🥕 Морковь',
    '🥦 Брокколи',
    '🌶️ Перец',
    '🥒 Огурец',
    '🥔 Картофель',
    '🧅 Лук',
    '🧄 Чеснок',
    '🌽 Кукуруза',
    '🥬 Капуста',
    '🍆 Кабачок',
    '🥜 Орехи',
    '🍠 Сладкий картофель',
  ],
  title: 'Какой овощ вы собираетесь съесть?',
  settings: {
    autoHide: false,
    soundEnabled: true,
  },
};

const STORAGE_KEY = 'wheel-fortune-state';

export function useLocalStorage() {
  const [state, setState] = useState<StoredState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_STATE, ...JSON.parse(stored) } : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [state]);

  const updateItems = (items: string[]) => {
    setState(prev => ({ ...prev, items }));
  };

  const updateTitle = (title: string) => {
    setState(prev => ({ ...prev, title }));
  };

  const updateSettings = (settings: Partial<StoredState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  };

  const reset = () => {
    setState(DEFAULT_STATE);
  };

  return {
    state,
    updateItems,
    updateTitle,
    updateSettings,
    reset,
  };
}
