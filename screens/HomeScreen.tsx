import {StyleSheet, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import {Auth} from 'aws-amplify';
import ChatRoomItem from "../components/ChatRoomItem";

import chatRoomsData from '../SignalAssets/dummy-data/ChatRooms';
import {Text,View} from "../components/Themed";

export default function HomeScreen() {

    const logOut = ()=>{
        Auth.signOut();
    }
  return (
      <View style={styles.page}>
          <FlashList
              data={chatRoomsData && chatRoomsData}
              renderItem={({item})=>(
                  <ChatRoomItem chatRoom={item} />
              )}
              estimatedItemSize={6}
              showsVerticalScrollIndicator={false}
          /> 
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