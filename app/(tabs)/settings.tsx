import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '@/context/AudioContext';
import { COLORS, SIZES } from '@/utils/constants';

export default function SettingsScreen() {
  const { state, toggleShuffle, toggleRepeat } = useAudio();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Playback Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={toggleShuffle}>
            <View style={styles.settingLeft}>
              <Ionicons name="shuffle" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>Shuffle</Text>
            </View>
            <Switch
              value={state.shuffle}
              onValueChange={toggleShuffle}
              trackColor={{ false: '#e0e0e0', true: COLORS.primary + '40' }}
              thumbColor={state.shuffle ? COLORS.primary : '#f4f3f4'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={toggleRepeat}>
            <View style={styles.settingLeft}>
              <Ionicons 
                name={state.repeat === 'one' ? 'repeat-outline' : 'repeat'} 
                size={24} 
                color={COLORS.primary} 
              />
              <Text style={styles.settingText}>
                Repeat {state.repeat === 'off' ? 'Off' : state.repeat === 'one' ? 'One' : 'All'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

        {/* Bottom spacing for mini player */}
        <View style={{ height: state.currentSong ? 80 : 20 }} />
      </ScrollView>
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
  },
  section: {
    marginTop: 32,
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 16,
  },
  settingValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});