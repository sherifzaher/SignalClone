import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";

const AudioPlayer = ({ soundURI }: { soundURI: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [paused, setPaused] = useState<boolean>(true);
  const [AudioProgress, setAudioProgress] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  const getDuration = () => {
    const minutes = Math.floor(audioDuration / (60 * 1000));
    const seconds = Math.floor((audioDuration % (60 * 1000)) / 1000);

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    loadAsync();

    () => {
      // unloadSound
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [soundURI]);

  const loadAsync = async () => {
    if (soundURI) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: soundURI },
        undefined,
        onPlaybackStatusUpdate
      );
      setSound(sound);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      return;
    }
    setAudioProgress(status.positionMillis / (status.durationMillis ?? 1));
    // console.warn(AudioProgress);
    setPaused(!status.isPlaying);
    setAudioDuration(status.durationMillis || 0);
  };

  const playPauseSound = async () => {
    if (!sound) return;

    if (paused) {
      await sound.playFromPositionAsync(0);
      setPaused(false);
    } else {
      await sound.pauseAsync();
      setPaused(true);
    }
  };

  return (
    <View style={styles.sendAudioContainer}>
      <Pressable onPress={playPauseSound}>
        <Feather
          name={paused ? "play" : "pause"}
          size={24}
          color={paused ? "black" : "red"}
        />
      </Pressable>

      <View style={styles.audiProgressBG}>
        <View
          style={[
            styles.audioProgressFG,
            {
              left: `${AudioProgress * 100 - 1}%`,
            },
          ]}
        ></View>
      </View>
      <Text>{getDuration()}</Text>
    </View>
  );
};

export default AudioPlayer;

const styles = StyleSheet.create({
  sendAudioContainer: {
    marginVertical: 10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: "lightgray",
    backgroundColor: "white",
    borderRadius: 10,
  },
  audiProgressBG: {
    height: 5,
    flex: 1,
    backgroundColor: "lightgray",
    borderRadius: 5,
    margin: 10,
  },
  audioProgressFG: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3777F0",
    position: "absolute",
    top: -3,
  },
});
