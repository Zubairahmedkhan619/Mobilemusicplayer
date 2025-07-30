export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  uri: string;
  artwork?: string;
  albumId?: string;
  artistId?: string;
  trackNumber?: number;
  year?: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artwork?: string;
  songCount: number;
  year?: number;
}

export interface Artist {
  id: string;
  name: string;
  songCount: number;
  albumCount: number;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: Date;
  updatedAt: Date;
  artwork?: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  playlist: Song[];
  currentIndex: number;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  volume: number;
  isLoading: boolean;
}

export interface AudioContextType {
  state: PlayerState;
  loadSong: (song: Song, playlist?: Song[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

export type RootStackParamList = {
  Home: undefined;
  Player: undefined;
  Library: undefined;
  Playlist: { playlistId: string };
};

export type TabParamList = {
  Home: undefined;
  Library: undefined;
  Playlists: undefined;
};