import {useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import {Auth, DataStore} from "aws-amplify";

import {
    SimpleLineIcons,
    Feather,
    MaterialCommunityIcons,
    AntDesign,
    Ionicons
} from '@expo/vector-icons';

import EmojiPicker from 'react-native-emoji-selector'

import {ChatRoom, Message} from "../../src/models";

interface Props{
    chatRoom:ChatRoom
}

const MessageInput = ({chatRoom}:Props) => {

  const [message,setMessage] = useState<string>("");
  const [isEmojiPickerOpen,setIsEmojiPickerOpen] = useState<boolean>(false);

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
        // updatedChatRoom.newMessages = updatedChatRoom.newMessages + 1 || 1
    }));

  };

  const onPlusClicked = ()=>{
      console.warn('on Plus Clicked');
  }

  const onPress = ()=>{
      if(message){
          sendMessage();
      }else {
          onPlusClicked();
      }
  }

  return (
      <KeyboardAvoidingView
          style={[styles.root,{height: isEmojiPickerOpen ? '50%' : 'auto'}]}
          behavior={Platform.OS === "ios" ? 'padding' : 'height'}
          keyboardVerticalOffset={95}
      >
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
                  <Feather name="camera" size={24} color="#595959" style={styles.icon} />
                  <MaterialCommunityIcons name="microphone-outline" size={24} color="#595959" style={styles.icon} />
              </View>

              <Pressable onPress={onPress} style={styles.buttonContainer}>
                  {
                      message
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