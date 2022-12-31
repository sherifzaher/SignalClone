import { useEffect, useState } from "react";
import { StyleSheet, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Auth, DataStore } from "aws-amplify";

import { ChatRoom, ChatRoomUser, User } from "../src/models";
import ChatRoomItem from "../components/ChatRoomItem";
// import chatRoomsData from '../SignalAssets/dummy-data/ChatRooms';
import { Text, View } from "../components/Themed";

export default function HomeScreen() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[] | any>([]);
  const [me, setMe] = useState<User | null>(null);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  // Fetch Room Function
  const fetchChatRooms = async () => {
    const userData = await Auth.currentAuthenticatedUser();
    DataStore.query(User, userData.attributes.sub).then(
      (res) => res && setMe(res)
    );
    // const room = await DataStore.query(ChatRoom);
    // for await (const post of room){
    //     const messages = await post.Users.toArray();
    //     console.warn(messages);
    // }
    const fetchedData = await DataStore.query(ChatRoomUser, (chat) =>
      chat.userId.eq(userData.attributes.sub)
    );
    // DataStore.query(ChatRoom,chat=> chat)
    await Promise.all(
      fetchedData.map(async (chatRoom) =>
        chatRoom.chatRoom.then((res) => {
          if (res) {
            setChatRooms((prev: ChatRoom[]) => [...prev, res]);
          }
        })
      )
    );
    // fetchedData.map(item=> item.chatRoom)
    // for await (const user of fetchedData){
    //     await user.chatRoom.then(res=>{
    //         // res.LastMessage.then()
    //         // res.Users.toArray().then(res=> res.map(i=>i.user))
    //         // console.warn(res);
    //         newChats = [...newChats,res]
    //         setChatRooms((prev:ChatRoom[])=>[...prev,res]);
    //     });
    // }
  };

  useEffect(() => {
    const subscription = DataStore.observe(ChatRoom, (chat) =>
      chat.Users.userId.eq(me?.id)
    ).subscribe((msg) => {
      if (msg.element) {
        setChatRooms((prev: ChatRoom[]) =>
          prev.map((chatroom) =>
            chatroom.id === msg.element.id ? msg.element : chatroom
          )
        );
      }
      // msg.model, msg.opType,
    });

    return () => subscription.unsubscribe();
  }, [me]);

  const logOut = () => {
    Auth.signOut();
  };
  return (
    <View style={styles.page}>
      {chatRooms.length > 0 && (
        <FlashList
          data={chatRooms}
          renderItem={({ item }) => <ChatRoomItem chatRoom={item} />}
          estimatedItemSize={6}
          showsVerticalScrollIndicator={false}
        />
      )}
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <Pressable onPress={logOut} style={styles.logout}>
          <Text>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  logout: {
    backgroundColor: "red",
    flexDirection: "row",
    height: 50,
    marginVertical: 20,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },
});
