import {Image, Pressable} from "react-native";
import {Text,View} from "../Themed";
import styles from './styles';
import {useNavigation} from "@react-navigation/native";

export default function UserItem({user}:any) {
    const navigation = useNavigation();
    const onPress = ()=>{
        // navigation.navigate('ChatRoom',{id:chatRoom.id});
        // Create A Chat Room
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