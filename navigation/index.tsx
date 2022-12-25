/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {Feather, FontAwesome} from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {NavigationContainer, DefaultTheme, DarkTheme, useNavigation} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import {ColorSchemeName, Image, Pressable, Text, TouchableOpacity, useWindowDimensions, View} from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import HomeScreen from '../screens/HomeScreen';
import UsersScreen from '../screens/UsersScreen';
import ChatRoomScreen from "../screens/ChatRoomScreen";
import TabTwoScreen from '../screens/TabTwoScreen';
import ChatRoomHeader from './ChatRoomHeader';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator>
      {/*<Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />*/}
      <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
              headerTitle:HomeHeader,
          }}
      />
      <Stack.Screen
          name="ChatRoom"
          component={ChatRoomScreen}
          options={({route})=>({
              headerTitle:()=> <ChatRoomHeader user={route.params} />,
              headerBackTitleVisible:false
          })}
      />
        <Stack.Screen
            name="UsersScreen"
            component={UsersScreen}
            options={{
                title:"Users",
            }}
        />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Modal" component={ModalScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const HomeHeader = (props:any)=>{
    const { width } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const navigation = useNavigation();

    return(
        <View
            style={{
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-between',
                width:width-30,
            }}
        >
            <Image
                style={{
                    height:30,
                    width:30,
                    borderRadius:30
                }}
                source={{uri:"https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/vadim.jpg"}}
            />
            <Text style={{flex:1,textAlign:'center',fontWeight:'bold',fontSize:19,color:colorScheme === 'dark' ? 'white' : 'black'}}>Signal</Text>
            <Feather name="camera" size={24} color="#595959" style={{marginHorizontal:10}} />
            <TouchableOpacity onPress={()=>navigation.navigate("UsersScreen")} style={{width:24,height:24}}>
                <Feather name="edit-2" size={24} color="#595959" />
            </TouchableOpacity>
        </View>
    )
};



/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="TabOne"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}>
      <BottomTab.Screen
        name="TabOne"
        component={HomeScreen}
        options={({ navigation }: RootTabScreenProps<'TabOne'>) => ({
          title: 'Tab One',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('Modal')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome
                name="info-circle"
                size={25}
                color={Colors[colorScheme].text}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        })}
      />
      <BottomTab.Screen
        name="TabTwo"
        component={TabTwoScreen}
        options={{
          title: 'Tab Two',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}
