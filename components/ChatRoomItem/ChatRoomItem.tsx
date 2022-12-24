import {Image, Pressable} from "react-native";
import {Text,View} from "../Themed";
import styles from './styles';
import {useNavigation} from "@react-navigation/native";

export default function ChatRoomItem({chatRoom}:any) {
    const user = chatRoom.users[1];
    const navigation = useNavigation();
    const onPress = ()=>{
        navigation.navigate('ChatRoom',{id:chatRoom.id});
        // navigation.navigate("UsersScreen");
    };

    return (
        <Pressable onPress={onPress} style={styles.container}>
            <Image source={{uri: user.imageUri}} style={styles.image}/>
            {chatRoom.newMessages && (
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{chatRoom.newMessages}</Text>
                </View>
            )}
            <View style={styles.right}>
                <View style={styles.row}>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.text}>{chatRoom.lastMessage.createdAt}</Text>
                </View>
                <Text numberOfLines={1} style={styles.text}>{chatRoom.lastMessage.content}</Text>
            </View>

        </Pressable>
    );
};