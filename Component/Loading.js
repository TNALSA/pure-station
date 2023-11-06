import { useState, useEffect, useContext } from 'react';
import { 
    View, Image, Text, StyleSheet, 
    Button, Dimensions, LogBox, 
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; //navigation 오류로 인해 네이티브 훅 라이브러리를 사용
import AppContext from '../Appcontext';
import BleFunction from '../BleFunction';

LogBox.ignoreLogs(["'new NativeEventEmitter() ...", "Non-serializable ..."]);
LogBox.ignoreAllLogs();

 const Loading = ({navigation}) => {
    const myContext = useContext(AppContext);

    console.log("[Loading.js]Access")
    
    console.log("[Loading.js]isConnected: " + myContext.isConnected) ;
    useEffect(() => {
        BleFunction();
    },[]);

    return (
    <>        
        {
            myContext.isConnected ? 
            navigation.navigate('FunctionList')
            :
            (
                <View 
                style={styles.container}
                >
                    <Image
                        style={{ width: 100, height: 100, resizeMode: 'contain', }}
                        source={require('../assets/loading_do.gif')}
                    />
                    <Text>Station을 탐색 중입니다...</Text>
                </View>
            )
        }

    </>
    );
    
};
export default Loading;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    explainView: {
        width: Dimensions.get('window').width * 0.9,
        height: Dimensions.get('window').height * 0.1,
        padding:10,
    },
    pictureView:{
        width: Dimensions.get('window').width * 0.9,
        height: Dimensions.get('window').height * 0.5,
        justifyContent:'center',
        alignItems:'center',
        padding:10,
        backgroundColor:'gray',
    },
    text:{
        fontSize:30,
        fontWeight:'bold',
        color:'black',
        textAlign:'center',
    },
    buttonView: {
        width: Dimensions.get('window').width * 0.9,
        height: Dimensions.get('window').height * 0.1,
        marginBottom: 40,
        padding:10,
    },
    buttonstyle: {
        width: '100%',
        height: Dimensions.get('window').height * 0.10,
        backgroundColor: '#6699FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    }

});