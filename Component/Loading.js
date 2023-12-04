import { useState, useEffect, Component, useContext } from 'react';
import { 
    View, Image, Text, StyleSheet, 
    Button, Dimensions, LogBox, 
} from 'react-native';
import AppContext from '../Appcontext';
import base64 from 'react-native-base64';
import { BleManager } from 'react-native-ble-plx';

LogBox.ignoreLogs(["'new NativeEventEmitter() ...", "Non-serializable ..."]);
LogBox.ignoreAllLogs();

const Loading = ({route, navigation}) => {
    const [stationData, setStationData] = useState();
    const [manager] = useState(new BleManager()); 
    const [connect, setConnect] = useState(false) 
    const myContext = useContext(AppContext);

    useEffect(() => {
        console.log("------Loading------");
        manager.onStateChange(state => {
            if (state === 'PoweredOn') {
                connectToDevice(myContext.connectedStation.st_mac);
            }
        }, true);
        if(connect === true) {
            //console.log("if connect is true, access here and setBleManger to useContext")
            myContext.setBlemanager(manager);
            setStationData(myContext.connectedStation); //without this, can't connect
        }
    }, [myContext, connect]);

    const connectToDevice = async device => { //TESTBT: 4C:24:98:70:B0:B9, FINAL:F0:B5:D1:AA:0C:24
        try {
            const connectedDevice = await manager.connectToDevice(device);   //device: Mac Address
            await connectedDevice.discoverAllServicesAndCharacteristics(); 
            console.log('Connected to', connectedDevice.name);
            setConnect(true);
            //Read Massage from Connected Device
            connectedDevice.monitorCharacteristicForService(
                '0000ffe0-0000-1000-8000-00805f9b34fb', //serviceUUID
                '0000ffe1-0000-1000-8000-00805f9b34fb', //characterUUID
                (error, Characteristic) => {
                    console.log('monitorCharacteristicForService: ' + base64.decode(`${Characteristic?.value}`));
                    const read_data = base64.decode(`${Characteristic?.value}`);
                    if(myContext.readData == read_data){ 
                        console.log("Read Duplicated!");
                    }else{
                        switch(read_data){
                            case "11":
                            case "12":
                            case "13":
                                myContext.setData(base64.decode(`${Characteristic?.value}`));
                                myContext.setState(true);
                                navigation.navigate("RentalPage");
                                break;
                            case "24":
                            case "25":
                            case "26":
                                myContext.setData(base64.decode(`${Characteristic?.value}`));
                                myContext.setState(true);
                                navigation.navigate("Return");
                                break;
                            case "37":
                            case "38":   
                                myContext.setData(base64.decode(`${Characteristic?.value}`));
                                myContext.setState(true);
                                navigation.navigate("DonationPage"); 
                                break;
                        }
                    }
                }
            )
           
           
        } catch (error) { 
            console.log('connectToDevice error:', error);
        }
    };

    // const startReadData =  (connectedDevice) =>{
    //      //Read Massage from Connected Device
    //      connectedDevice.monitorCharacteristicForService(
    //         '0000ffe0-0000-1000-8000-00805f9b34fb', //serviceUUID
    //         '0000ffe1-0000-1000-8000-00805f9b34fb', //characterUUID
    //         (error, Characteristic) => {
    //             console.log('monitorCharacteristicForService: ' + base64.decode(`${Characteristic?.value}`));
    //             const read_data = base64.decode(`${Characteristic?.value}`);
    //             if(myContext.readData == read_data){ 
    //                 console.log("Read Duplicated!");
    //             }else{
    //                 switch(read_data){
    //                     case "11":
    //                     case "12":
    //                     case "13":
    //                         myContext.setData(base64.decode(`${Characteristic?.value}`));
    //                         myContext.setState(true);
    //                         navigation.navigate("RentalPage");
    //                         break;
    //                     case "24":
    //                     case "25":
    //                     case "26":
    //                         myContext.setData(base64.decode(`${Characteristic?.value}`));
    //                         myContext.setState(true);
    //                         navigation.navigate("Return");
    //                         break;
    //                     case "37":
    //                     case "38":   
    //                         myContext.setData(base64.decode(`${Characteristic?.value}`));
    //                         myContext.setState(true);
    //                         navigation.navigate("DonationPage"); 
    //                         break;
    //                 }
    //             }
    //         }
    //     )
    // }

    return (
        <>
        { 
            connect ? 
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