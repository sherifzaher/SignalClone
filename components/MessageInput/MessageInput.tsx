import {useState,useEffect} from "react";
import {Auth, DataStore, Storage} from "aws-amplify";
import * as ImagePicker from 'expo-image-picker';
import EmojiPicker from 'react-native-emoji-selector';
// @ts-ignore
import { v4 as uuidv4} from 'uuid';

import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform, Alert, Image
} from 'react-native';


import {
    SimpleLineIcons,
    Feather,
    MaterialCommunityIcons,
    AntDesign,
    Ionicons,
} from '@expo/vector-icons';


import {ChatRoom, Message} from "../../src/models";

interface Props{
    chatRoom:ChatRoom
}

const MessageInput = ({chatRoom}:Props) => {

  const [message,setMessage] = useState<string>("");
  const [isEmojiPickerOpen,setIsEmojiPickerOpen] = useState<boolean>(false);
  const [imageUri,setImageUri] = useState<string | null>(null);

  useEffect(()=>{
      (async ()=>{
          if(Platform.OS !== 'web'){
              const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
              const photoResponse = await ImagePicker.requestCameraPermissionsAsync();

              if(libraryPermission.status !== 'granted' || photoResponse.status !== 'granted'){
                  Alert.alert("Sorry, we need camera permissions");
              }
          }
      })()
  },[]);

  const sendMessage = async ()=>{
      const myID = await Auth.currentAuthenticatedUser();
      const newMessage = await  DataStore.save(new Message({
          content:message,
          userID:myID.attributes.sub,
          chatroomID:chatRoom.id
      }));
      updateLastMessage(newMessage);
      setMessage("");
      setIsEmojiPickerOpen(false);
  };

  const updateLastMessage = async (newMessage:Message)=>{
    await DataStore.save(ChatRoom.copyOf(chatRoom,updatedChatRoom => {
        updatedChatRoom.LastMessage = newMessage
        updatedChatRoom.newMessages = 1
        // updatedChatRoom.newMessages = updatedChatRoom.newMessages ? updatedChatRoom.newMessages + 1 : 1
        // updatedChatRoom.newMessages = updatedChatRoom.newMessages + 1 || 1
    }));
  };

  const onPlusClicked = ()=>{
      console.warn('on Plus Clicked');
  }

  const onPress = ()=>{
      if(imageUri){
          sendImage();
      }else if(message){
          sendMessage();
      }else {
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

    const takePhoto = async ()=>{
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes:ImagePicker.MediaTypeOptions.Images,
            aspect:[4,3],
            quality:1
        });

        if(!result.canceled && result.assets[0].uri){
            setImageUri(result.assets[0].uri);
        }
    };

    const sendImage = async ()=>{
        if(!imageUri) return null;
        const blob = await getImageBlob();
        await Storage.put(`${uuidv4()}.png`,blob);
        console.warn("Uploaded");


    };

    const getImageBlob = async ()=>{
        if(!imageUri) return null ;

        const response = await fetch(imageUri);
        const blob = await response.blob();
        return blob;
    }


    return (
      <KeyboardAvoidingView
          style={[styles.root,{height: isEmojiPickerOpen ? '50%' : 'auto'}]}
          behavior={Platform.OS === "ios" ? 'padding' : 'height'}
          keyboardVerticalOffset={95}
      >
          {
              imageUri && (
                  <View style={styles.sendImageContainer}>
                      <Image source={{uri:imageUri}} style={{height:100,width:100,borderRadius:10}} />

                      <Pressable onPress={()=>setImageUri(null)}>
                          <AntDesign name="close" size={24} color="white" style={{margin:5}} />
                      </Pressable>
                  </View>
              )
          }
          <View style={styles.row}>
              <View style={styles.inputContainer}>
                  <Pressable onPress={()=>setIsEmojiPickerOpen(prev=>!prev)}>
                      <SimpleLineIcons name="emotsmile" size={24} color="#595959" style={styles.icon} />
                  </Pressable>
                  <TextInput
                      style={styles.input}
                      value={message}
                      placeholder={"Signal message..."}
                      onChangeText={setMessage}
                  />
                  <Pressable onPress={pickImage}>
                      <Feather name="image" size={24} color="#595959" style={styles.icon} />
                  </Pressable>

                  <Pressable onPress={takePhoto}>
                      <Feather name="camera" size={24} color="#595959" style={styles.icon} />
                  </Pressable>

                  <MaterialCommunityIcons name="microphone-outline" size={24} color="#595959" style={styles.icon} />
              </View>

              <Pressable onPress={onPress} style={styles.buttonContainer}>
                  {
                      message || imageUri
                          ? <Ionicons name="send" size={18} color="white" />
                          : <AntDesign name="plus" size={18} color="white" />
                  }
              </Pressable>
          </View>
          {isEmojiPickerOpen ? (
              <EmojiPicker
                  onEmojiSelected={(emoji)=> setMessage(prev => prev + emoji)}
                  columns={8}
                  showSearchBar={false}
              />
          ) : null}
      </KeyboardAvoidingView>
  )
  
};

const styles = StyleSheet.create({
    root:{
        padding:10,
        height:"50%"
    },
    row:{
        flexDirection:'row',
    },
    inputContainer:{
        backgroundColor:'#f2f2f2',
        flex:1,
        marginRight:10,
        borderRadius:25,
        borderWidth:1,
        borderColor:'#dedede',
        alignItems:'center',
        flexDirection:'row',
        padding:5
    },
    input:{
        flex:1,
        marginHorizontal:5
    },
    sendImageContainer:{
        flexDirection:'row',
        margin:10,
        alignSelf:'stretch',
        justifyContent:'space-between',
        borderWidth:1,
        borderColor:'lightgray',
        borderRadius:10,
    },
    icon:{
        marginHorizontal:5
    },
    buttonContainer:{
        width:40,
        height:40,
        backgroundColor:'#3777F0',
        borderRadius:25,
        alignItems:'center',
        justifyContent:'center'
    },
    buttonText:{
        color:'white',
        fontSize:35
    }
});

export default MessageInput