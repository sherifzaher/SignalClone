import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Amplify, Auth, DataStore, Hub } from "aws-amplify";
import {
  withAuthenticator,
  useAuthenticator,
} from "@aws-amplify/ui-react-native";

// import {withA}
import config from "./src/aws-exports";

Amplify.configure(config);

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import { useEffect } from "react";

const App = () => {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  // useEffect(()=>{
  //   Hub.listen('auth', async function newFun(data) {
  //     if (data.payload.event === 'signOut') {
  //       console.log(data.payload.event);
  //       await DataStore.clear();
  //       console.log("Removed");
  //     }else{
  //       DataStore.start();
  //     }
  //   });
  // },[]);

  // useEffect(()=>{
  //   DataStore.start();
  // },[])

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
};

export default withAuthenticator(App);
