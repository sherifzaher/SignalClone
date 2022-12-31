import { useEffect, useState } from "react";
import { Image, Text, useWindowDimensions, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { User } from "../src/models";
import useColorScheme from "../hooks/useColorScheme";

const ChatRoomHeader = ({ user }: any) => {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const [chatUser, setChatUser] = useState<User | null>(null);

  useEffect(() => {
    setChatUser(user.user);
  }, [user]);
  // console.warn(user);
  return (
    <View
      style={{
        position: "absolute",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        paddingRight: 10,
        width: width - 25,
      }}
    >
      <Image
        style={{
          height: 30,
          width: 30,
          borderRadius: 30,
        }}
        source={{
          uri: chatUser?.imageUri ?? "https://i.stack.imgur.com/34AD2.jpg",
        }}
      />
      <Text
        style={{
          flex: 1,
          marginLeft: 10,
          fontWeight: "bold",
          fontSize: 19,
          color: colorScheme === "dark" ? "white" : "black",
        }}
      >
        {chatUser?.name}
      </Text>
      <Feather
        name="camera"
        size={24}
        color="#595959"
        style={{ marginHorizontal: 10 }}
      />
      <Feather
        name="edit-2"
        size={24}
        color="#595959"
        style={{ marginLeft: 5 }}
      />
    </View>
  );
};

export default ChatRoomHeader;
