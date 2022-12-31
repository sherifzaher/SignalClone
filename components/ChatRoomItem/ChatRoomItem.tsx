import { useEffect, useState } from "react";
import { Image, Pressable, ActivityIndicator, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Auth, DataStore } from "aws-amplify";
import moment from "moment";

import { Text, View as ThemedView } from "../Themed";
import styles from "./styles";
import { User, Message, ChatRoom } from "../../src/models";

export default function ChatRoomItem({ chatRoom }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<string>("");
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [iamTheSender, setIamTheSender] = useState<boolean>(false);
  const navigation = useNavigation();

  const onPress = async () => {
    if (!iamTheSender) {
      // To handle chat Room New Messages to null if i am the receiver
      await DataStore.save(
        ChatRoom.copyOf(chatRoom, (updatedChatRoom) => {
          updatedChatRoom.newMessages = null;
          // updatedChatRoom.ChatRoomUsers
          // updatedChatRoom.newMessages = updatedChatRoom.newMessages ? updatedChatRoom.newMessages + 1 : 1
          // updatedChatRoom.newMessages = updatedChatRoom.newMessages + 1 || 1
        })
      );
    }
    navigation.navigate("ChatRoom", { chatRoom });
  };

  useEffect(() => {
    const fetchData = async () => {
      const users = await chatRoom.ChatRoomUsers.toArray();
      const meID = await Auth.currentAuthenticatedUser();
      setMe(meID.attributes.sub);

      let otherId = "";
      users.forEach((user: any) =>
        user.userId === meID.attributes.sub ? null : (otherId = user.userId)
      );

      // Get Chat room last message LazyLoad Item from the parent chatroom amplify doc's
      chatRoom.LastMessage.then((res: any) => {
        if (res) {
          setLastMessage(res);
          if (res?.userID && res.userID === meID.attributes.sub) {
            setIamTheSender(true);
          }
        }
      });

      const userData: any = await DataStore.query(User, otherId);
      setUser(userData);
    };

    fetchData();
  }, []);

  // Get Last message
  useEffect(() => {
    const subs = DataStore.observe(ChatRoom, chatRoom.id).subscribe((chatR) => {
      if (chatR) {
        console.log(chatR.element);
        updateLastMessage(chatR.element.chatRoomLastMessageId || null);
      }
    });
    // chatRoom.LastMessage.then((res: any) => res && setLastMessage(res));
    // console.log("Fine",chatRoom);
    return () => subs.unsubscribe();
  }, [chatRoom.id, lastMessage]);

  const updateLastMessage = async (id: string | null) => {
    if (!id) return;
    await DataStore.query(Message, id).then((res) => {
      if (res) {
        setLastMessage(res);
      }
    });
  };

  useEffect(() => {
    if (lastMessage && lastMessage.userID === me) {
      setIamTheSender(true);
    } else {
      setIamTheSender(false);
    }
  }, [lastMessage, chatRoom]);

  if (!user || !lastMessage) {
    return <ActivityIndicator />;
  }

  // console.log(chatRoom);

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image
        source={{
          uri: user?.imageUri ?? "https://i.stack.imgur.com/34AD2.jpg",
        }}
        style={styles.image}
      />
      {chatRoom.newMessages > 0 && !iamTheSender && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{chatRoom.newMessages}</Text>
        </View>
      )}
      <View style={styles.right}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name.split("@")[0]}</Text>
          <Text style={styles.text}>
            {moment(lastMessage?.createdAt).fromNow()}
          </Text>
        </View>

        {/* If The Message is Text */}
        {lastMessage?.content && (
          <Text numberOfLines={1} style={styles.text}>
            {iamTheSender
              ? "You: " + lastMessage?.content
              : lastMessage?.content}
          </Text>
        )}

        {/* If It's Audio Message */}
        {lastMessage?.audio && (
          <Text numberOfLines={1} style={styles.text}>
            {iamTheSender ? "You: " + "Audio Message" : "Audio Message"}
          </Text>
        )}

        {lastMessage?.image && (
          <Text numberOfLines={1} style={styles.text}>
            {iamTheSender ? "You: " + "Image" : "Image"}
          </Text>
        )}

        {!lastMessage && <Text>Send Your First Message =D</Text>}
      </View>
    </Pressable>
  );
}
