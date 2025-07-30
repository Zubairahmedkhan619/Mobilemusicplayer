import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AudioService from '../services/AudioService';
import { Song, PlayerState, AudioContextType } from '../types';
import { shuffleArray } from '../utils/formatTime';

const initialState: PlayerState = {
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  playlist: [],
  currentIndex: 0,
  shuffle: false,
  repeat: 'off',
  volume: 1.0,
  isLoading: false,
};

type AudioAction = 
  | { type: 'SET_SONG'; payload: Song }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_POSITION'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_PLAYLIST'; payload: Song[] }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean };

function audioReducer(state: PlayerState, action: AudioAction): PlayerState {
  switch (action.type) {
    case 'SET_SONG':
      return { ...state, currentSong: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_POSITION':
      return { ...state, position: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_PLAYLIST':
      return { ...state, playlist: action.payload };
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.payload };
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle };
    case 'TOGGLE_REPEAT':
      const modes = ['off', 'one', 'all'] as const;
      const currentIndex = modes.indexOf(state.repeat);
      const nextIndex = (currentIndex + 1) % modes.length;
      return { ...state, repeat: modes[nextIndex] };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const AudioContext = createContext(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(audioReducer, initialState);

  useEffect(() => {
    AudioService.initialize();
    
    // Set up playback status updates
    AudioService.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        dispatch({ type: 'SET_POSITION', payload: status.positionMillis || 0 });
        dispatch({ type: 'SET_DURATION', payload: status.durationMillis || 0 });
        dispatch({ type: 'SET_PLAYING', payload: status.isPlaying || false });
        
        // Handle song end
        if (status.didJustFinish) {
          handleSongEnd();
        }
      }
    });
  }, []);

  const handleSongEnd = async () => {
    if (state.repeat === 'one') {
      await AudioService.seekTo(0);
      await AudioService.play();
    } else if (state.repeat === 'all' || state.currentIndex < state.playlist.length - 1) {
      await skipNext();
    } else {
      dispatch({ type: 'SET_PLAYING', payload: false });
    }
  };

  const loadSong = async (song: Song, playlist?: Song[]) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (playlist) {
        dispatch({ type: 'SET_PLAYLIST', payload: playlist });
        const index = playlist.findIndex(s => s.id === song.id);
        dispatch({ type: 'SET_CURRENT_INDEX', payload: index });
      }
      
      await AudioService.loadSong(song);
      dispatch({ type: 'SET_SONG', payload: song });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error loading song:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const togglePlayPause = async () => {
    try {
      if (state.isPlaying) {
        await AudioService.pause();
      } else {
        await AudioService.play();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const skipNext = async () => {
    if (state.playlist.length === 0) return;
    
    let nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.playlist.length) {
      nextIndex = 0;
    }
    
    const nextSong = state.playlist[nextIndex];
    await loadSong(nextSong);
    dispatch({ type: 'SET_CURRENT_INDEX', payload: nextIndex });
    
    if (state.isPlaying) {
      await AudioService.play();
    }
  };

  const skipPrevious = async () => {
    if (state.playlist.length === 0) return;
    
    let prevIndex = state.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = state.playlist.length - 1;
    }
    
    const prevSong = state.playlist[prevIndex];
    await loadSong(prevSong);
    dispatch({ type: 'SET_CURRENT_INDEX', payload: prevIndex });
    
    if (state.isPlaying) {
      await AudioService.play();
    }
  };

  const seekTo = async (position: number) => {
    try {
      await AudioService.seekTo(position);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const setVolume = async (volume: number) => {
    try {
      await AudioService.setVolume(volume);
      dispatch({ type: 'SET_VOLUME', payload: volume });
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const toggleShuffle = () => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
    
    if (!state.shuffle) {
      // Enable shuffle - randomize playlist
      const shuffledPlaylist = shuffleArray(state.playlist);
      dispatch({ type: 'SET_PLAYLIST', payload: shuffledPlaylist });
      
      // Update current index to match current song in shuffled playlist
      if (state.currentSong) {
        const newIndex = shuffledPlaylist.findIndex(s => s.id === state.currentSong!.id);
        dispatch({ type: 'SET_CURRENT_INDEX', payload: newIndex });
      }
    }
  };

  const toggleRepeat = () => {
    dispatch({ type: 'TOGGLE_REPEAT' });
  };

  const contextValue: AudioContextType = {
    state,
    loadSong,
    togglePlayPause,
    skipNext,
    skipPrevious,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  };

  return (
    
      {children}
    
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}