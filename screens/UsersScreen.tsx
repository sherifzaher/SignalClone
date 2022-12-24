import {StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";

import chatRoomsData from '../SignalAssets/dummy-data/ChatRooms';
import { View } from "../components/Themed";
import UserItem from "../components/UserItem";

export default function UsersScreen() {

  return (
      <View style={styles.page}>
          <FlashList
              data={chatRoomsData && chatRoomsData}
              renderItem={({item})=>(
                  <UserItem user={item} />
              )}
              estimatedItemSize={6}
              showsVerticalScrollIndicator={false}
          />
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