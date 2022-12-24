import {Image, Pressable} from "react-native";
import {Text,View} from "../Themed";
import styles from './styles';
import {useNavigation} from "@react-navigation/native";
import {Auth, DataStore} from "aws-amplify";
import {ChatRoom,User,ChatRoomUser} from "../../src/models";

export default function UserItem({user}:any) {
    const navigation = useNavigation();

    const onPress =async ()=>{
        // Create A Chat Room
        const newChatRoom = await DataStore.save(new ChatRoom({newMessages:0}));

        // Connect Authenticated User with the chat room

        const authUser = await Auth.currentAuthenticatedUser();
        const dbUser : any = await DataStore.query(User,authUser.attributes.sub);
        await DataStore.save(new ChatRoomUser({
            user:dbUser,
            chatRoom:newChatRoom
        }));

        // Connect Clicked User with the chat room

        await DataStore.save(new ChatRoomUser({
            user,
            chatRoom:newChatRoom
        }));

        navigation.navigate("ChatRoom",{id:newChatRoom.id});
    };

    return (
        <Pressable onPress={onPress} style={styles.container}>
            <Image source={{uri: user.imageUri}} style={styles.image}/>

            <View style={styles.right}>
                <View style={styles.row}>
                    <Text style={styles.name}>{user.name}</Text>
                </View>
            </View>

        </Pressable>
    );
};