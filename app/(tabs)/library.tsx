import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '@/types';
import { useAudio } from '@/context/AudioContext';
import MediaLibraryService from '@/services/MediaLibraryService';
import SongItem from '@/components/SongItem';
import { COLORS, SIZES } from '@/utils/constants';

export default function LibraryScreen() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  
  const { loadSong } = useAudio();

  useEffect(() => {
    initializeLibrary();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [searchQuery, songs]);

  const initializeLibrary = async () => {
    try {
      setIsLoading(true);
      const permission = await MediaLibraryService.initialize();
      setHasPermission(permission);
      
      if (permission) {
        const allSongs = MediaLibraryService.getAllSongs();
        setSongs(allSongs);
        setFilteredSongs(allSongs);
      } else {
        showPermissionAlert();
      }
    } catch (error) {
      console.error('Error initializing library:', error);
      Alert.alert('Error', 'Failed to load music library');
    } finally {
      setIsLoading(false);
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      'Permission Required',
      'This app needs access to your music library to play songs. Please grant permission in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: initializeLibrary },
      ]
    );
  };

  const filterSongs = () => {
    if (!searchQuery.trim()) {
      setFilteredSongs(songs);
    } else {
      const filtered = MediaLibraryService.searchSongs(searchQuery);
      setFilteredSongs(filtered);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeLibrary();
    setRefreshing(false);
  };

  const handleSongPress = async (song: Song) => {
    await loadSong(song, filteredSongs);
  };

  const playAllSongs = async () => {
    if (filteredSongs.length > 0) {
      await loadSong(filteredSongs[0], filteredSongs);
    }
  };

  const shuffleAllSongs = async () => {
    if (filteredSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredSongs.length);
      await loadSong(filteredSongs[randomIndex], filteredSongs);
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="musical-notes" size={80} color={COLORS.textSecondary} />
          <Text style={styles.permissionTitle}>Music Library Access</Text>
          <Text style={styles.permissionText}>
            Grant permission to access your music library and start enjoying your favorite songs.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={initializeLibrary}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={40} color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your music library...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Music</Text>
        <Text style={styles.songCount}>
          {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs, artists, albums..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={playAllSongs}>
          <Ionicons name="play" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Play All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={shuffleAllSongs}>
          <Ionicons name="shuffle" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Shuffle</Text>
        </TouchableOpacity>
      </View>

      {/* Songs List */}
      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SongItem 
            song={item} 
            playlist={filteredSongs}
            onPress={handleSongPress}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No songs found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try a different search term' : 'No music files found on your device'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  songCount: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.padding,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  actionButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});