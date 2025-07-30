import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAudio } from '@/context/AudioContext';
import PlayerControls from '@/components/PlayerControls';
import { COLORS, SIZES } from '@/utils/constants';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
  const { state } = useAudio();
  const router = useRouter();

  if (!state.currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noSongContainer}>
          <Ionicons name="musical-notes-outline" size={80} color={COLORS.textSecondary} />
          <Text style={styles.noSongTitle}>No song selected</Text>
          <Text style={styles.noSongSubtitle}>
            Choose a song from your library to start playing
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/library')}
          >
            <Text style={styles.browseButtonText}>Browse Library</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View style={styles.albumArtContainer}>
        <View style={styles.albumArt}>
          <Ionicons 
            name={state.isPlaying ? "musical-notes" : "musical-note"} 
            size={120} 
            color={COLORS.primary} 
          />
        </View>
      </View>

      {/* Song Info */}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={2}>
          {state.currentSong.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {state.currentSong.artist}
        </Text>
        <Text style={styles.songAlbum} numberOfLines={1}>
          {state.currentSong.album}
        </Text>
      </View>

      {/* Player Controls */}
      <View style={styles.controlsContainer}>
        <PlayerControls isFullScreen={true} />
      </View>

      {/* Additional Controls */}
      <View style={styles.additionalControls}>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="heart-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="share-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="list-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  albumArtContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  albumArt: {
    width: width - 80,
    height: width - 80,
    maxWidth: 320,
    maxHeight: 320,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  songInfo: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 32,
    alignItems: 'center',
  },
  songTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  songArtist: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  songAlbum: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  controlsContainer: {
    paddingHorizontal: SIZES.padding,
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 24,
    gap: 40,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSongContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noSongTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  noSongSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});