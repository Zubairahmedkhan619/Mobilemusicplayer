

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAudio } from '@/context/AudioContext';
import MediaLibraryService from '@/services/MediaLibraryService';
import SongItem from '@/components/SongItem';
import { Song } from '@/types';
import { COLORS, SIZES } from '@/utils/constants';
import { formatDuration } from '@/utils/formatTime';

export default function HomeScreen() {
  const { state, loadSong } = useAudio();
  const router = useRouter();
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [stats, setStats] = useState({ totalSongs: 0, totalArtists: 0, totalAlbums: 0 });

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const hasPermission = await MediaLibraryService.initialize();
      if (hasPermission) {
        const allSongs = MediaLibraryService.getAllSongs();
        // Get random recent songs for demo
        const shuffled = [...allSongs].sort(() => 0.5 - Math.random());
        setRecentSongs(shuffled.slice(0, 5));
        setStats(MediaLibraryService.getLibraryStats());
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const handleQuickPlay = async () => {
    if (recentSongs.length > 0) {
      const randomSong = recentSongs[Math.floor(Math.random() * recentSongs.length)];
      await loadSong(randomSong, recentSongs);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good {getTimeOfDay()}!</Text>
          <Text style={styles.subtitle}>What would you like to listen to?</Text>
        </View>

        {/* Now Playing Card */}
        {state.currentSong ? (
          <TouchableOpacity 
            style={styles.nowPlayingCard}
            onPress={() => router.push('/player')}
          >
            <View style={styles.nowPlayingContent}>
              <View style={styles.albumArtLarge}>
                <Ionicons 
                  name={state.isPlaying ? "musical-notes" : "musical-note"} 
                  size={40} 
                  color={COLORS.primary} 
                />
              </View>
              <View style={styles.nowPlayingInfo}>
                <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                  {state.currentSong.title}
                </Text>
                <Text style={styles.nowPlayingArtist} numberOfLines={1}>
                  {state.currentSong.artist}
                </Text>
                <Text style={styles.nowPlayingStatus}>
                  {state.isPlaying ? 'Now Playing' : 'Paused'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.noMusicCard}>
            <Ionicons name="musical-notes-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.noMusicTitle}>No music playing</Text>
            <Text style={styles.noMusicSubtitle}>Browse your library to start listening</Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/library')}
            >
              <Text style={styles.browseButtonText}>Browse Library</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleQuickPlay}>
            <Ionicons name="shuffle" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Quick Play</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/library')}
          >
            <Ionicons name="library" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Library</Text>
          </TouchableOpacity>
        </View>

        {/* Library Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Library</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalSongs}</Text>
              <Text style={styles.statLabel}>Songs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalArtists}</Text>
              <Text style={styles.statLabel}>Artists</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalAlbums}</Text>
              <Text style={styles.statLabel}>Albums</Text>
            </View>
          </View>
        </View>

        {/* Recent Songs */}
        {recentSongs.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recently Added</Text>
            {recentSongs.map((song) => (
              <SongItem
                key={song.id}
                song={song}
                playlist={recentSongs}
                showAlbum={false}
              />
            ))}
          </View>
        )}

        {/* Bottom spacing for mini player */}
        <View style={{ height: state.currentSong ? 80 : 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  nowPlayingCard: {
    marginHorizontal: SIZES.padding,
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nowPlayingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumArtLarge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  nowPlayingArtist: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  nowPlayingStatus: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  noMusicCard: {
    marginHorizontal: SIZES.padding,
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: 32,
    alignItems: 'center',
  },
  noMusicTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noMusicSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  browseButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 32,
    gap: 16,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  statsContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recentSection: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 32,
  },
});