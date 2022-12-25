import {useEffect, useState} from "react";
import {FlashList} from "@shopify/flash-list";
import {useNavigation, useRoute} from "@react-navigation/native";
import {StyleSheet, View, SafeAreaView, ActivityIndicator} from 'react-native';
import {Auth, DataStore, SortDirection} from "aws-amplify";

import {Message as MessageModel, ChatRoom, User} from '../src/models';
import Message from "../components/Message";
// import chatRoomData from '../SignalAssets/dummy-data/Chats';
import MessageInput from "../components/MessageInput";

export default function ChatRoomScreen() {
    const [messages,setMessages]=useState<MessageModel[]>([]);
    const [chatRoom,setChatRoom]=useState<ChatRoom | null>(null);
    const [me,setMe] = useState<User | null>(null);
    const [other,setOther] = useState<User | null>(null);
    const {params} = useRoute();
    const data : any = params;
    const navigation = useNavigation();
    navigation.setOptions({title:other?.name});

    useEffect(()=>{
       fetchChatRooms();
    },[]);

    useEffect(()=>{
        fetchMessages();
    },[chatRoom]);

    // Realtime Subscribe
    useEffect(()=>{
        const subscription = DataStore.observe(ChatRoom, data.id).subscribe(msg => {
            console.warn(msg.model, msg.opType, msg.element);
            setChatRoom(msg.element);
            // if(msg.opType === "INSERT" && msg.element){
            //     let newMsg : MessageModel = msg.element;
            //     setMessages(prev=>[newMsg,...prev]);
            // }
            // console.log(msg.element);
            // let newMsg : MessageModel = msg.element;
            // if(newMsg){
            //     setMessages(prev=>[newMsg,...prev]);
            // }
            // fetchMessages();
        });

        return ()=> subscription.unsubscribe();
    },[data.id])


    const fetchMessages = async ()=>{
        if(!chatRoom){
            return;
        };
        const fetchedMessages = await DataStore.query(MessageModel,msg => msg.chatroomID.eq(chatRoom.id),{
            sort:message => message.createdAt(SortDirection.DESCENDING)
        });
        // console.warn("Messages: ",fetchedMessages);
        const myID = await Auth.currentAuthenticatedUser();
        let otherID = "";
        fetchedMessages.forEach(msg=> {
            msg.userID !== myID ? otherID = msg.userID : ''
            return;
        } );
        // Set MyID in Variable to send in all Messages to diff my messages from other messages
        DataStore.query(User,myID.attributes.sub).then(res=> res&& setMe(res));
        DataStore.query(User,otherID).then(res=> res&& setOther(res));
        setMessages(fetchedMessages);
    }

    const fetchChatRooms = async ()=>{
      if(!data.id){
          console.warn('No Chatroom id Provided');
          navigation.goBack();
          return;
      };
        const chatRoom = await DataStore.query(ChatRoom,data.id).then((res)=> res && setChatRoom(res));


        if(!chatRoom){
          return;
      }else {
          setChatRoom(chatRoom);
      }

    };


    if(!chatRoom || !other || !me){
        return <ActivityIndicator />;
    }

    return (
        <SafeAreaView style={styles.page}>
            <FlashList
                data={messages}
                renderItem={({item})=>(
                    <Message message={item} me={me} other={other} />
                )}
                inverted
                estimatedItemSize={200}
            />
            <MessageInput chatRoom={chatRoom} />
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    page:{
        flex:1
    }
})