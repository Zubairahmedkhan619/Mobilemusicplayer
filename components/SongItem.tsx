import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../types';
import { useAudio } from '../context/AudioContext';
import { formatDuration } from '../utils/formatTime';
import { COLORS, SIZES } from '../utils/constants';

interface SongItemProps {
  song: Song;
  playlist?: Song[];
  onPress?: (song: Song) => void;
  showAlbum?: boolean;
  showArtist?: boolean;
}

export default function SongItem({
  song,
  playlist = [],
  onPress,
  showAlbum = true,
  showArtist = true,
}: SongItemProps) {
  const { state, loadSong } = useAudio();
  
  const isCurrentSong = state.currentSong?.id === song.id;
  const isPlaying = isCurrentSong && state.isPlaying;

  const handlePress = async () => {
    if (onPress) {
      onPress(song);
    } else {
      // Default behavior: load and play the song
      const songsToPlay = playlist.length > 0 ? playlist : [song];
      await loadSong(song, songsToPlay);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        isCurrentSong && styles.currentSongContainer
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Album Art Placeholder */}
      <View style={[
        styles.albumArt,
        isCurrentSong && styles.currentAlbumArt
      ]}>
        {isPlaying ? (
          <Ionicons 
            name="musical-notes" 
            size={20} 
            color={COLORS.primary} 
          />
        ) : (
          <Ionicons 
            name="musical-note" 
            size={20} 
            color={isCurrentSong ? COLORS.primary : COLORS.textSecondary} 
          />
        )}
      </View>

      {/* Song Info */}
      <View style={styles.songInfo}>
        <Text 
          style={[
            styles.title,
            isCurrentSong && styles.currentTitle
          ]} 
          numberOfLines={1}
        >
          {song.title}
        </Text>
        
        {showArtist && (
          <Text 
            style={[
              styles.artist,
              isCurrentSong && styles.currentArtist
            ]} 
            numberOfLines={1}
          >
            {song.artist}
          </Text>
        )}
        
        {showAlbum && (
          <Text style={styles.album} numberOfLines={1}>
            {song.album}
          </Text>
        )}
      </View>

      {/* Duration and Status */}
      <View style={styles.rightSection}>
        <Text style={styles.duration}>
          {formatDuration(Math.floor(song.duration / 1000))}
        </Text>
        
        {isCurrentSong && (
          <View style={styles.playingIndicator}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={16} 
              color={COLORS.primary} 
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentSongContainer: {
    backgroundColor: '#f8f9ff',
    borderBottomColor: COLORS.primary + '20',
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentAlbumArt: {
    backgroundColor: COLORS.primary + '10',
  },
  songInfo: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  currentTitle: {
    color: COLORS.primary,
  },
  artist: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  currentArtist: {
    color: COLORS.primary + 'CC',
  },
  album: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  duration: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  playingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
});