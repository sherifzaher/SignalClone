import {useEffect, useState} from "react";
import {StyleSheet, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Auth, DataStore } from 'aws-amplify';
import {ChatRoom,ChatRoomUser} from "../src/models";

import ChatRoomItem from "../components/ChatRoomItem";
import chatRoomsData from '../SignalAssets/dummy-data/ChatRooms';
import { Text,View } from "../components/Themed";

export default function HomeScreen() {
    const [chatRooms,setChatRooms] = useState<ChatRoom[] | any>([]);

    useEffect(()=>{
        const fetchChatRooms = async ()=>{
            const userData = await Auth.currentAuthenticatedUser();
            // const room = await DataStore.query(ChatRoom);
            // for await (const post of room){
            //     const messages = await post.Users.toArray();
            //     console.warn(messages);
            // }
            const fetchedData = (await DataStore.query(ChatRoomUser, chat=> chat.userId.eq(userData.attributes.sub)));
            let newChats : ChatRoom[] = [];
            for await (const user of fetchedData){
                await user.chatRoom.then(res=>{
                    // res.Users.toArray().then(res=> res.map(i=>i.user))
                    console.warn(res);
                    newChats = [...newChats,res]
                    setChatRooms((prev:ChatRoom[])=>[...prev,res]);
                });
            }

            // const newData = await Promise.all(fetchedData.map(async data=>await data.chatRoom.then(res=>res)));
            // setChatRooms(fetchedData);
            console.warn(fetchedData);
            // console.warn(newChats);
        };

        fetchChatRooms();
    },[]);

    const logOut = ()=>{
        Auth.signOut();
    }
  return (
      <View style={styles.page}>
          {chatRooms.length > 0 && (
              <FlashList
                  data={chatRooms}
                  renderItem={({item}) => (
                      <ChatRoomItem chatRoom={item}/>
                  )}
                  estimatedItemSize={6}
                  showsVerticalScrollIndicator={false}
              />
          )}
          <View style={{flexDirection:'row',justifyContent:'center'}}>
              <Pressable onPress={logOut} style={styles.logout}>
                  <Text>Logout</Text>
              </Pressable>
          </View>
      </View>
  );
};


const styles = StyleSheet.create({
    page:{
        flex:1,
    },
    logout:{
        backgroundColor:'red',
        flexDirection:'row',
        height:50,
        marginVertical:20,
        borderRadius:50,
        justifyContent:'center',
        alignItems:'center',
        width:100
    }
})