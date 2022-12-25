import {useEffect, useState} from "react";
import {Image, Pressable,ActivityIndicator} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {Auth,DataStore} from "aws-amplify";

import {Text,View} from "../Themed";
import styles from './styles';
import {User,Message} from '../../src/models'

export default function ChatRoomItem({chatRoom}:any) {
    const [user,setUser] = useState<User | null>(null);
    const [lastMessage,setLastMessage] = useState<Message| null>(null);
    const navigation = useNavigation();
    const onPress = ()=>{
        navigation.navigate('ChatRoom',{id:chatRoom.id});
    };

    useEffect(()=>{
        const fetchData  = async ()=>{
            const users = await chatRoom.Users.toArray();
            const meID = await Auth.currentAuthenticatedUser();

            let otherId = "";
            users.forEach((user:any)=> user.userId === meID.attributes.sub ? null : otherId = user.userId);

            // Get Chat room last message LazyLoad Item from the parent chatroom amplify doc's
            chatRoom.LastMessage.then((res:any)=>res&& setLastMessage(res));
            const userData : any = await DataStore.query(User,otherId);
            setUser(userData);
        };

        fetchData();
    },[]);

    if(!user || !lastMessage){
        return  <ActivityIndicator />
    }


    return (
        <Pressable onPress={onPress} style={styles.container}>
            <Image source={{uri: user?.imageUri || "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/elon.png"}} style={styles.image}/>
            {
                chatRoom.newMessages > 0 && (
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{chatRoom.newMessages}</Text>
                    </View>
                )
            }
            <View style={styles.right}>
                <View style={styles.row}>
                    <Text style={styles.name}>{user?.name || "as"}</Text>
                    <Text style={styles.text}>{lastMessage.createdAt ?? "Now"}</Text>
                </View>
                <Text numberOfLines={1} style={styles.text}>{lastMessage.content ?? `Send ${user.name} a message`}</Text>
            </View>

        </Pressable>
    );
};