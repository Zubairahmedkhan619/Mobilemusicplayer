
import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { AudioProvider } from '@/context/AudioContext';
import PlayerControls from '@/components/PlayerControls';
import LibraryScreen from './app/(tabs)/library';
// import LibraryScreen from '';

export default function App() {
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <AudioProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f2f2f7" />
        
        {showPlayer ? (
          <PlayerControls 
            onMinimize={() => setShowPlayer(false)} 
          />
        ) : (
          <View style={styles.content}>
            <LibraryScreen/>
            <PlayerControls 
              isMinimized={true}
              onMinimize={() => setShowPlayer(true)}
            />
          </View>
        )}
      </SafeAreaView>
    </AudioProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  content: {
    flex: 1,
  },
});