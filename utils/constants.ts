export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
};

export const SIZES = {
  padding: 16,
  margin: 16,
  borderRadius: 12,
  iconSize: 24,
  headerHeight: 60,
  tabBarHeight: 80,
};

export const STORAGE_KEYS = {
  PLAYLISTS: '@music_player_playlists',
  CURRENT_SONG: '@music_player_current_song',
  PLAYER_STATE: '@music_player_state',
  SETTINGS: '@music_player_settings',
};

export const AUDIO_MODES = {
  SHUFFLE: 'shuffle',
  REPEAT_OFF: 'off',
  REPEAT_ONE: 'one',
  REPEAT_ALL: 'all',
} as const;