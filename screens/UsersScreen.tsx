import {useState,useEffect} from "react";
import {StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { DataStore } from "aws-amplify";

import { User } from '../src/models';
import {Text, View} from "../components/Themed";
import UserItem from "../components/UserItem";

export default function UsersScreen() {
    const [users,setUsers] = useState<User[]>([]);

    useEffect(()=>{
        DataStore.query(User).then(setUsers);
    },[]);


  return (
      <View style={styles.page}>
          <FlashList
              data={users}
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