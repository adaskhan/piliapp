export interface WheelItem {
  id: string;
  label: string;
  color: string;
}

export interface WheelSettings {
  autoHide: boolean;
  soundEnabled: boolean;
}

export interface StoredState {
  items: string[];
  title: string;
  settings: WheelSettings;
}

export interface SpinResult {
  item: string;
  index: number;
}

export type HotkeyAction = 'spin' | 'closeAlert' | 'hideSelected' | 'reset' | 'edit' | 'fullscreen';
