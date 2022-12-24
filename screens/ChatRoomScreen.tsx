import {StyleSheet, View, SafeAreaView} from 'react-native';
import Message from "../components/Message";

import chatRoomData from '../SignalAssets/dummy-data/Chats';
import {FlashList} from "@shopify/flash-list";
import MessageInput from "../components/MessageInput";
import {useNavigation, useRoute} from "@react-navigation/native";

export default function ChatRoomScreen() {
    const {params} = useRoute();
    const data : any = params;
    const navigation = useNavigation();
    navigation.setOptions({title:data.id});

    return (
        <SafeAreaView style={styles.page}>
            <FlashList
                data={chatRoomData.messages}
                renderItem={({item})=>(
                    <Message message={item} />
                )}
                inverted
                estimatedItemSize={200}
            />
            <MessageInput />
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    page:{
        flex:1
    }
})