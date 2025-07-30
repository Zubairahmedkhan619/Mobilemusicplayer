import { Audio } from 'expo-av';
import { Song } from '../types';

class AudioService {
  private sound: Audio.Sound | null = null;
  private isLoaded = false;

  async initialize() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }

  async loadSong(song: Song): Promise<void> {
    try {
      if (this.sound) {
        await this.unloadSong();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { shouldPlay: false, isLooping: false }
      );

      this.sound = sound;
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading song:', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    if (this.sound && this.isLoaded) {
      await this.sound.playAsync();
    }
  }

  async pause(): Promise<void> {
    if (this.sound && this.isLoaded) {
      await this.sound.pauseAsync();
    }
  }

  async stop(): Promise<void> {
    if (this.sound && this.isLoaded) {
      await this.sound.stopAsync();
    }
  }

  async seekTo(positionMillis: number): Promise<void> {
    if (this.sound && this.isLoaded) {
      await this.sound.setPositionAsync(positionMillis);
    }
  }

  async setVolume(volume: number): Promise<void> {
    if (this.sound && this.isLoaded) {
      await this.sound.setVolumeAsync(volume);
    }
  }

  async getStatus() {
    if (this.sound && this.isLoaded) {
      return await this.sound.getStatusAsync();
    }
    return null;
  }

  setOnPlaybackStatusUpdate(callback: (status: any) => void) {
    if (this.sound) {
      this.sound.setOnPlaybackStatusUpdate(callback);
    }
  }

  async unloadSong(): Promise<void> {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
      this.isLoaded = false;
    }
  }
}

export default new AudioService();