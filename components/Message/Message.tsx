import moment from "moment";
import { Image, StyleSheet, useWindowDimensions } from "react-native";
// @ts-ignore
import { S3Image } from "aws-amplify-react-native";

import { View, Text } from "../Themed";
const blue = "#3777F0";
const grey = "lightgrey";

const Message = ({ message, me, other }: any) => {
  const isMe = message.userID === me.id;
  const { width } = useWindowDimensions();

  return (
    <View
      style={[
        styles.container,
        isMe
          ? { ...styles.rightContainer, marginTop: 5 }
          : styles.leftContainer,
      ]}
    >
      {message?.image && (
        <S3Image
          imgKey={message.image}
          style={{ width: width * 0.7, aspectRatio: 4 / 3 }}
          resizeMode="contain"
        />
      )}

      {message.content && (
        <Text style={{ color: isMe ? "black" : "white", fontSize: 16 }}>
          {message.content}
        </Text>
      )}

      <Text
        style={{
          color: isMe ? "black" : "white",
          paddingTop: 4,
          fontSize: 12,
          opacity: 0.5,
          marginLeft: isMe ? "auto" : 0,
          marginRight: !isMe ? "auto" : 0,
        }}
      >
        {moment(message?.createdAt).fromNow()}
      </Text>
      {!isMe ? (
        <Image
          source={{
            uri: other.imageUri ?? "https://i.stack.imgur.com/34AD2.jpg",
          }}
          style={styles.profilePic}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    maxWidth: "75%",
    marginTop: 20,
  },
  text: {
    color: "white",
  },
  other: {
    marginLeft: "auto",
  },
  leftContainer: {
    backgroundColor: blue,
    marginLeft: 20,
    marginTop: 14,
    marginRight: "auto",
    borderBottomLeftRadius: 0,
  },
  rightContainer: {
    backgroundColor: grey,
    marginLeft: "auto",
    marginRight: 10,
    borderBottomRightRadius: 0,
  },
  profilePic: {
    height: 26,
    width: 26,
    borderRadius: 13,
    position: "absolute",
    left: -13,
    top: -18,
  },
});

export default Message;
