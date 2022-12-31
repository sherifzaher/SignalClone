import { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Auth, DataStore } from "aws-amplify";

import { User } from "../src/models";
import { View } from "../components/Themed";
import UserItem from "../components/UserItem";

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const meID = await Auth.currentAuthenticatedUser();
      // console.log(meID.)/;
      DataStore.query(User).then((res) => {
        setUsers(res.filter((user) => user.id !== meID.attributes.sub));
        console.log(res.filter((user) => user.id !== meID.attributes.sub));
        console.log(res);
      });
    };

    fetchData();
  }, []);

  useEffect(() => {
    const subs = DataStore.observe(User).subscribe((user) => {
      setUsers((prev: any) => [user, ...prev]);
    });

    return () => subs.unsubscribe();
  }, []);

  if (!users) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginVertical: 30,
        }}
      >
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <FlashList
        data={users}
        renderItem={({ item }) => <UserItem user={item} />}
        estimatedItemSize={6}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  logout: {
    backgroundColor: "red",
    flexDirection: "row",
    height: 50,
    marginVertical: 20,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },
});
