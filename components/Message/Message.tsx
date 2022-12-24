import {View,Text} from "../Themed";
import { StyleSheet } from 'react-native';

const blue = '#3777F0';
const grey = 'lightgrey';

const myID = "u1";

const Message = ({message}:any) => {

    const isMe = message.user.id === myID;


    return (
        <View style={[
            styles.container,isMe ? styles.rightContainer : styles.leftContainer
        ]}>
            <Text style={{color: isMe ? 'black' : 'white'}}>
                {message?.content}
            </Text>
        </View>
      )

};

const styles = StyleSheet.create({
    container:{
        padding:10,
        margin:10,
        borderRadius:10,
        maxWidth:'75%'
    },
    text:{
        color:'white',
    },
    other:{
        marginLeft:"auto"
    },
    leftContainer:{
        backgroundColor:blue,
        marginLeft:10,
        marginRight:"auto",
    },
    rightContainer:{
        backgroundColor:grey,
        marginLeft:"auto",
        marginRight:10,
    }
});

export default Message;


