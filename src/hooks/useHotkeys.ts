import { useEffect } from 'react';
import type { HotkeyAction } from '../types';

interface HotkeyConfig {
  [key: string]: HotkeyAction;
}

const DEFAULT_HOTKEYS: HotkeyConfig = {
  ' ': 'spin',
  'x': 'closeAlert',
  's': 'hideSelected',
  'r': 'reset',
  'e': 'edit',
  'f': 'fullscreen',
};

interface UseHotkeysProps {
  onAction: (action: HotkeyAction) => void;
  disabled?: boolean;
}

export function useHotkeys({ onAction, disabled = false }: UseHotkeysProps) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const action = DEFAULT_HOTKEYS[key];

      if (action) {
        e.preventDefault();
        onAction(action);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAction, disabled]);
}
