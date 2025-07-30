import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAudio } from '../context/AudioContext';
import { COLORS, SIZES } from '../utils/constants';

const { width } = Dimensions.get('window');

export default function MiniPlayer() {
  const { state, togglePlayPause, skipNext } = useAudio();
  const router = useRouter();

  if (!state.currentSong) {
    return null;
  }

  const progressWidth = state.duration > 0 
    ? (state.position / state.duration) * width 
    : 0;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      {/* Mini Player Content */}
      <TouchableOpacity 
        style={styles.content}
        onPress={() => router.push('/player')}
        activeOpacity={0.8}
      >
        {/* Album Art */}
        <View style={styles.albumArt}>
          <Ionicons 
            name={state.isPlaying ? "musical-notes" : "musical-note"} 
            size={20} 
            color={COLORS.primary} 
          />
        </View>

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {state.currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {state.currentSong.artist}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
          >
            <Ionicons 
              name={state.isPlaying ? "pause" : "play"} 
              size={24} 
              color={COLORS.text} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={(e) => {
              e.stopPropagation();
              skipNext();
            }}
          >
            <Ionicons name="play-skip-forward" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // Above tab bar
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  progressContainer: {
    height: 2,
    backgroundColor: '#e0e0e0',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 64,
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});