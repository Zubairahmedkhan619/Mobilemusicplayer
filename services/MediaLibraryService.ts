import * as MediaLibrary from 'expo-media-library';
import { Song, Album, Artist } from '../types';

class MediaLibraryService {
  private hasPermission = false;
  private songs: Song[] = [];
  private albums: Album[] = [];
  private artists: Artist[] = [];

  // Request permissions and initialize
  async initialize(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      this.hasPermission = status === 'granted';
      
      if (this.hasPermission) {
        await this.loadMusicLibrary();
      }
      
      return this.hasPermission;
    } catch (error) {
      console.error('Error initializing media library:', error);
      return false;
    }
  }

  // Load all music from device
  private async loadMusicLibrary(): Promise<void> {
    try {
      // Get all audio assets
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 1000, // Adjust based on your needs
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      // Convert to our Song format
      this.songs = await Promise.all(
        media.assets.map(async (asset) => {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
          
          return {
            id: asset.id,
            title: this.extractTitle(asset.filename),
            artist: 'Unknown Artist', // MediaLibrary doesn't provide metadata
            album: 'Unknown Album',
            duration: asset.duration * 1000, // Convert to milliseconds
            uri: assetInfo.localUri || asset.uri,
            albumId: 'unknown',
            artistId: 'unknown',
            trackNumber: 1,
            year: new Date(asset.creationTime).getFullYear(),
          } as Song;
        })
      );

      // Group into albums and artists
      this.organizeLibrary();
      
      console.log(`Loaded ${this.songs.length} songs from device`);
    } catch (error) {
      console.error('Error loading music library:', error);
    }
  }

  // Extract clean title from filename
  private extractTitle(filename: string): string {
    // Remove file extension and clean up
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/^\d+\s*-?\s*/, '') // Remove track numbers
      .trim();
  }

  // Organize songs into albums and artists
  private organizeLibrary(): void {
    const albumMap = new Map<string, Album>();
    const artistMap = new Map<string, Artist>();

    this.songs.forEach(song => {
      // Create or update album
      if (!albumMap.has(song.album)) {
        albumMap.set(song.album, {
          id: song.albumId || song.album,
          title: song.album,
          artist: song.artist,
          songCount: 0,
          year: song.year,
        });
      }
      const album = albumMap.get(song.album)!;
      album.songCount++;

      // Create or update artist
      if (!artistMap.has(song.artist)) {
        artistMap.set(song.artist, {
          id: song.artistId || song.artist,
          name: song.artist,
          songCount: 0,
          albumCount: 0,
        });
      }
      const artist = artistMap.get(song.artist)!;
      artist.songCount++;
    });

    // Update album counts for artists
    albumMap.forEach(album => {
      const artist = artistMap.get(album.artist);
      if (artist) {
        artist.albumCount++;
      }
    });

    this.albums = Array.from(albumMap.values());
    this.artists = Array.from(artistMap.values());
  }

  // Public getters
  getAllSongs(): Song[] {
    return [...this.songs];
  }

  getAllAlbums(): Album[] {
    return [...this.albums];
  }

  getAllArtists(): Artist[] {
    return [...this.artists];
  }

  getSongsByAlbum(albumId: string): Song[] {
    return this.songs.filter(song => song.albumId === albumId);
  }

  getSongsByArtist(artistId: string): Song[] {
    return this.songs.filter(song => song.artistId === artistId);
  }

  searchSongs(query: string): Song[] {
    const lowercaseQuery = query.toLowerCase();
    return this.songs.filter(song =>
      song.title.toLowerCase().includes(lowercaseQuery) ||
      song.artist.toLowerCase().includes(lowercaseQuery) ||
      song.album.toLowerCase().includes(lowercaseQuery)
    );
  }

  getSongById(id: string): Song | undefined {
    return this.songs.find(song => song.id === id);
  }

  hasPermissions(): boolean {
    return this.hasPermission;
  }

  getLibraryStats() {
    return {
      totalSongs: this.songs.length,
      totalAlbums: this.albums.length,
      totalArtists: this.artists.length,
    };
  }
}

export default new MediaLibraryService();