import { useState, useEffect } from "react";
import { Auth, DataStore, Storage } from "aws-amplify";
import * as ImagePicker from "expo-image-picker";
import EmojiPicker from "react-native-emoji-selector";
import uuid from "react-native-uuid";
import { Audio } from "expo-av";

import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Vibration,
} from "react-native";

import {
  SimpleLineIcons,
  Feather,
  MaterialCommunityIcons,
  AntDesign,
  Ionicons,
} from "@expo/vector-icons";

import { ChatRoom, Message } from "../../src/models";
import { AVPlaybackStatus } from "expo-av/build/AV.types";
import { Text } from "../Themed";
import AudioPlayer from "../AudioPlayer";

interface Props {
  chatRoom: ChatRoom;
}

const MessageInput = ({ chatRoom }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [soundURI, setSoundURI] = useState<string | null>(null);

  // Request Permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const libraryPermission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        const photoResponse = await ImagePicker.requestCameraPermissionsAsync();
        await Audio.requestPermissionsAsync();

        if (
          libraryPermission.status !== "granted" ||
          photoResponse.status !== "granted"
        ) {
          Alert.alert("Sorry, we need camera permissions");
        }
      }
    })();
  }, []);

  // Sending Message
  const sendMessage = async () => {
    const myID = await Auth.currentAuthenticatedUser();
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        userID: myID.attributes.sub,
        chatroomID: chatRoom.id,
      })
    );
    updateLastMessage(newMessage);

    resetFields();
  };

  const updateLastMessage = async (newMessage: Message) => {
    await DataStore.save(
      ChatRoom.copyOf(chatRoom, (updatedChatRoom) => {
        updatedChatRoom.LastMessage = newMessage;
        updatedChatRoom.newMessages = updatedChatRoom.newMessages
          ? updatedChatRoom.newMessages + 1
          : 1;
        // updatedChatRoom.newMessages = updatedChatRoom.newMessages ? updatedChatRoom.newMessages + 1 : 1
        // updatedChatRoom.newMessages = updatedChatRoom.newMessages + 1 || 1
      })
    );
  };

  const onPlusClicked = () => {
    console.warn("on Plus Clicked");
  };

  const onPress = () => {
    if (imageUri) {
      sendImage();
    } else if (soundURI) {
      sendAudio();
    } else if (message) {
      sendMessage();
    } else {
      onPlusClicked();
    }
  };

  // Image Picker
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const resetFields = () => {
    setMessage("");
    setIsEmojiPickerOpen(false);
    setImageUri(null);
    setProgress(0);
    setSoundURI(null);
  };

  const progressCallback = (progress: any) => {
    // console.warn(progress.loaded / progress.total);
    setProgress(progress.loaded / progress.total);
  };

  const sendImage = async () => {
    if (!imageUri) return null;

    const blob = await getBlob(imageUri);
    const name = uuid.v4();
    const { key } = await Storage.put(`${name}.png`, blob, {
      progressCallback,
    });

    const myID = await Auth.currentAuthenticatedUser();
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        image: key,
        userID: myID.attributes.sub,
        chatroomID: chatRoom.id,
      })
    );
    updateLastMessage(newMessage);

    resetFields();
  };

  const getBlob = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      Vibration.vibrate();
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      return;
    }
    console.log("Stopping recording..");
    setRecording(null);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    // console.warn('Recording stopped and stored at', uri);

    if (!uri) {
      return;
    }

    setSoundURI(uri);

    // setPaused(true);
  };

  const sendAudio = async () => {
    if (!soundURI) return null;

    const uriParts = soundURI.split(".");
    const extension = uriParts[uriParts.length - 1];
    const blob = await getBlob(soundURI);
    const name = uuid.v4();
    const { key } = await Storage.put(`${name}.${extension}`, blob, {
      progressCallback,
    });

    const myID = await Auth.currentAuthenticatedUser();
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        audio: key,
        userID: myID.attributes.sub,
        chatroomID: chatRoom.id,
      })
    );
    updateLastMessage(newMessage);

    resetFields();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { height: isEmojiPickerOpen ? "50%" : "auto" }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={95}
    >
      {imageUri && (
        <View style={styles.sendImageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={{ height: 100, width: 100, borderRadius: 10 }}
          />

          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignSelf: "flex-end",
            }}
          >
            <View
              style={{
                height: 5,
                borderRadius: 5,
                backgroundColor: "#3777F0",
                width: `${progress * 100}%`,
              }}
            ></View>
          </View>

          <Pressable onPress={() => setImageUri(null)}>
            <AntDesign
              name="close"
              size={24}
              color="white"
              style={{ margin: 5 }}
            />
          </Pressable>
        </View>
      )}

      {soundURI && <AudioPlayer soundURI={soundURI} />}

      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Pressable onPress={() => setIsEmojiPickerOpen((prev) => !prev)}>
            <SimpleLineIcons
              name="emotsmile"
              size={24}
              color="#595959"
              style={styles.icon}
            />
          </Pressable>
          <TextInput
            style={styles.input}
            value={message}
            placeholder={"Signal message..."}
            onChangeText={setMessage}
          />
          <Pressable onPress={pickImage}>
            <Feather
              name="image"
              size={24}
              color="#595959"
              style={styles.icon}
            />
          </Pressable>

          <Pressable onPress={takePhoto}>
            <Feather
              name="camera"
              size={24}
              color="#595959"
              style={styles.icon}
            />
          </Pressable>

          <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
            <MaterialCommunityIcons
              name={recording ? "microphone" : "microphone-outline"}
              size={24}
              color={recording ? "red" : "#595959"}
              style={styles.icon}
            />
          </Pressable>
        </View>

        <Pressable onPress={onPress} style={styles.buttonContainer}>
          {message || imageUri || soundURI ? (
            <Ionicons name="send" size={18} color="white" />
          ) : (
            <AntDesign name="plus" size={18} color="white" />
          )}
        </Pressable>
      </View>

      {isEmojiPickerOpen ? (
        <EmojiPicker
          onEmojiSelected={(emoji) => setMessage((prev) => prev + emoji)}
          columns={8}
          showSearchBar={false}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    padding: 10,
    height: "50%",
  },
  row: {
    flexDirection: "row",
  },
  inputContainer: {
    backgroundColor: "#f2f2f2",
    flex: 1,
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#dedede",
    alignItems: "center",
    flexDirection: "row",
    padding: 5,
  },
  input: {
    flex: 1,
    marginHorizontal: 5,
  },
  sendImageContainer: {
    flexDirection: "row",
    margin: 10,
    alignSelf: "stretch",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 10,
  },
  icon: {
    marginHorizontal: 5,
  },
  buttonContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#3777F0",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 35,
  },
});

export default MessageInput;
