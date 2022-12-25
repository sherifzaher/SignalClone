import {useEffect, useState} from "react";
import {Auth, DataStore, SortDirection} from "aws-amplify";
import {FlashList} from "@shopify/flash-list";
import {useNavigation, useRoute} from "@react-navigation/native";
import {StyleSheet, SafeAreaView, ActivityIndicator} from 'react-native';

import {Message as MessageModel, ChatRoom, User} from '../src/models';
import Message from "../components/Message";
import MessageInput from "../components/MessageInput";

export default function ChatRoomScreen() {
    const [messages,setMessages]=useState<MessageModel[]>([]);
    const [updatedChatRoom,setUpdatedChatRoom]=useState<ChatRoom | null>(null);
    const [me,setMe] = useState<User | null>(null);
    const [other,setOther] = useState<User | null>(null);
    const {params} = useRoute();
    const chatRoom : any = params;
    const navigation = useNavigation();


    // Get Room Users
    useEffect(()=>{
        fetchUsers();
    },[]);
    //
    // useEffect(()=>{
    //    fetchChatRooms();
    // },[]);

    useEffect(()=>{
        fetchMessages();
    },[updatedChatRoom]);

    const fetchUsers =async ()=>{
        if(chatRoom){
            const myData = await Auth.currentAuthenticatedUser();
            const meId = myData.attributes.sub;
            const fetchedUsers = await DataStore.query(User,user=> user.chatrooms.chatRoomId.eq(chatRoom.chatRoom.id));
            // fetchedChat && setUpdatedChatRoom(fetchedChat);
            fetchedUsers.forEach((user:User)=> {
                if(user.id === meId) {
                    setMe(user)
                } else{
                    setOther(user);
                    navigation.setParams({user});
                }
            });
            // other && navigation.setOptions({title:other.name});
        }
    }

    // Realtime Subscribe
    useEffect(()=>{
        const subscription = DataStore.observe(ChatRoom, chatRoom.chatRoom.id).subscribe(msg => {
            // console.warn(msg.model, msg.opType, msg.element);
            setUpdatedChatRoom(msg.element);
        });
        return ()=> subscription.unsubscribe();
    },[chatRoom]);


    const fetchMessages = async ()=>{

        if(!chatRoom){
            return;
        };

        const fetchedMessages = await DataStore.query(MessageModel,msg => msg.chatroomID.eq(chatRoom.chatRoom.id),{
            sort:message => message.createdAt(SortDirection.DESCENDING)
        });

        // console.warn(fetchedMessages);
        setMessages(fetchedMessages);

        // console.warn("Hed");
        // console.warn("Messages: ",fetchedMessages);
        // const myID = await Auth.currentAuthenticatedUser();
        // let otherID = "";
        // fetchedMessages.forEach(msg=> {
        //     msg.userID !== myID ? otherID = msg.userID : ''
        //     return;
        // } );
        // // Set MyID in Variable to send in all Messages to diff my messages from other messages
        // DataStore.query(User,myID.attributes.sub).then(res=> res&& setMe(res));
        // DataStore.query(User,otherID).then(res=> res&& setOther(res));
    }

    // const fetchChatRooms = async ()=>{
    //   if(!data.chatRoom.id){
    //       console.warn('No Chatroom id Provided');
    //       navigation.goBack();
    //       return;
    //   };
    //     const chatRoom = await DataStore.query(ChatRoom,data.id).then((res)=> res && setChatRoom(res));
    //
    //
    //     if(!chatRoom){
    //       return;
    //   }else {
    //       setChatRoom(chatRoom);
    //   }
    //
    // };


    if(!me || !other){
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
            <MessageInput chatRoom={chatRoom.chatRoom} />
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    page:{
        flex:1,
    }
})