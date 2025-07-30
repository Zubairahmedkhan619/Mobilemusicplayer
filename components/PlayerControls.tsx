import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  State,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAudio } from "../context/AudioContext";
import { COLORS, SIZES } from "../utils/constants";
import { formatTime } from "../utils/formatTime";

const { width } = Dimensions.get("window");

interface PlayerControlsProps {
  onMinimize?: () => void;
  isMinimized?: boolean;
}

export default function PlayerControls({
  onMinimize,
  isMinimized = false,
}: PlayerControlsProps) {
  const {
    state,
    togglePlayPause,
    skipNext,
    skipPrevious,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = useAudio();

  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const scaleAnim = new Animated.Value(1);
  const volumeAnim = new Animated.Value(0);

  // Animation for play button press
  const animatePlayButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle play/pause with animation
  const handlePlayPause = async () => {
    animatePlayButton();
    await togglePlayPause();
  };

  // Handle progress bar drag
  const handleProgressDrag = (event: any) => {
    const { translationX, state: gestureState } = event.nativeEvent;

    if (gestureState === State.BEGAN) {
      setIsDragging(true);
    } else if (gestureState === State.ACTIVE) {
      const progressWidth = width - 80;
      const newPosition = Math.max(0, Math.min(progressWidth, translationX));
      setDragPosition(newPosition);
    } else if (gestureState === State.END) {
      const progressWidth = width - 80;
      const percentage = dragPosition / progressWidth;
      const newTime = percentage * state.duration;
      seekTo(newTime);
      setIsDragging(false);
    }
  };

  // Toggle volume slider visibility
  const toggleVolumeSlider = () => {
    const toValue = showVolumeSlider ? 0 : 1;
    setShowVolumeSlider(!showVolumeSlider);

    Animated.timing(volumeAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Get repeat icon based on mode
  const getRepeatIcon = () => {
    switch (state.repeat) {
      case "one":
        return "repeat-outline";
      case "all":
        return "repeat";
      default:
        return "repeat-outline";
    }
  };

  // Calculate progress percentage
  const progressPercentage =
    state.duration > 0 ? (state.position / state.duration) * 100 : 0;

  if (!state.currentSong) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No song selected</Text>
        <Text style={styles.emptySubtext}>Choose a song to start playing</Text>
      </View>
    );
  }

  if (isMinimized) {
    return (
      <TouchableOpacity style={styles.minimizedContainer} onPress={onMinimize}>
        <View style={styles.minimizedContent}>
          <View style={styles.minimizedInfo}>
            <Text style={styles.minimizedTitle} numberOfLines={1}>
              {state.currentSong.title}
            </Text>
            <Text style={styles.minimizedArtist} numberOfLines={1}>
              {state.currentSong.artist}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.minimizedPlayButton}
          >
            <Ionicons
              name={state.isPlaying ? "pause" : "play"}
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.minimizedProgress,
            { width: `${progressPercentage}%` },
          ]}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onMinimize} style={styles.minimizeButton}>
            <Ionicons name="chevron-down" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Album Art Placeholder */}
        <View style={styles.albumArtContainer}>
          <View style={styles.albumArt}>
            <Ionicons
              name="musical-notes"
              size={80}
              color="rgba(255,255,255,0.3)"
            />
          </View>
        </View>

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {state.currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {state.currentSong.artist}
          </Text>
          <Text style={styles.album} numberOfLines={1}>
            {state.currentSong.album}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.time}>{formatTime(state.position)}</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progress, { width: `${progressPercentage}%` }]}
              />
              <View
                style={[
                  styles.progressThumb,
                  { left: `${progressPercentage}%` },
                ]}
              />
            </View>
          </View>
          <Text style={styles.time}>{formatTime(state.duration)}</Text>
        </View>

        {/* Main Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={toggleShuffle}
            style={[
              styles.controlButton,
              state.shuffle && styles.activeControlButton,
            ]}
          >
            <Ionicons
              name="shuffle"
              size={24}
              color={state.shuffle ? COLORS.primary : "rgba(255,255,255,0.7)"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={skipPrevious} style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={32} color="white" />
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.playButton}
            >
              {state.isLoading ? (
                <Ionicons name="hourglass" size={40} color="white" />
              ) : (
                <Ionicons
                  name={state.isPlaying ? "pause" : "play"}
                  size={40}
                  color="white"
                />
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={skipNext} style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleRepeat}
            style={[
              styles.controlButton,
              state.repeat !== "off" && styles.activeControlButton,
            ]}
          >
            <Ionicons
              name={getRepeatIcon()}
              size={24}
              color={
                state.repeat !== "off"
                  ? COLORS.primary
                  : "rgba(255,255,255,0.7)"
              }
            />
          </TouchableOpacity>
        </View>

        {/* Secondary Controls */}
        <View style={styles.secondaryControls}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons
              name="heart-outline"
              size={24}
              color="rgba(255,255,255,0.7)"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleVolumeSlider}
            style={styles.secondaryButton}
          >
            <Ionicons
              name={state.volume === 0 ? "volume-mute" : "volume-high"}
              size={24}
              color="rgba(255,255,255,0.7)"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="list" size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Volume Slider */}
        {showVolumeSlider && (
          <Animated.View
            style={[
              styles.volumeContainer,
              {
                opacity: volumeAnim,
                transform: [
                  {
                    translateY: volumeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons
              name="volume-low"
              size={20}
              color="rgba(255,255,255,0.7)"
            />
            <View style={styles.volumeSlider}>
              <View
                style={[
                  styles.volumeProgress,
                  { width: `${state.volume * 100}%` },
                ]}
              />
            </View>
            <Ionicons
              name="volume-high"
              size={20}
              color="rgba(255,255,255,0.7)"
            />
          </Animated.View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  minimizeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  moreButton: {
    padding: 8,
  },
  albumArtContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  albumArt: {
    width: 280,
    height: 280,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  songInfo: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  artist: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 4,
  },
  album: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    position: "relative",
  },
  progress: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginLeft: -8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  time: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    minWidth: 45,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  controlButton: {
    padding: 15,
    borderRadius: 25,
  },
  activeControlButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  playButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 40,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 60,
  },
  secondaryButton: {
    padding: 12,
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 40,
  },
  volumeSlider: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginHorizontal: 15,
  },
  volumeProgress: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  // Minimized player styles
  minimizedContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    position: "relative",
  },
  minimizedContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  minimizedInfo: {
    flex: 1,
    marginRight: 15,
  },
  minimizedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  minimizedArtist: {
    fontSize: 14,
    color: "#666",
  },
  minimizedPlayButton: {
    padding: 8,
  },
  minimizedProgress: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: COLORS.primary,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
