import { useEffect, useState, useContext } from 'react';
import base64 from 'react-native-base64';
import { BleManager,Device } from 'react-native-ble-plx';
import { db } from './firebaseConfig';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import AppContext from './Appcontext';


function BleFunction() {
    const [manager] = useState(new BleManager()); //블루투스 객체
    const myContext = useContext(AppContext);
    const [connectedDevice,setConnectedDevice] = useState();
    const [send_state, setSendState] = useState(false);
    
    useEffect(() => { 
        console.log("[BleFunction.js] Access")
        manager.onStateChange(state => {
            if (state === 'PoweredOn') {
                console.log("연결 중입니다....")
                connectToDevice(myContext.connectedStation.st_mac);
            }
        }, true);
    }, [manager]);

    const connectToDevice = async device => {
        try {
            const conDevice =  await manager.connectToDevice(device);
            await conDevice.discoverAllServicesAndCharacteristics();
            console.log('Connected to', conDevice.name);
            manager.stopDeviceScan();
            setConnectedDevice(conDevice);
            myContext.setIsConnect(true);
        } catch (error) {
            console.log('Connection/Read error:', error);
        }
    }

    const startStreamingData = async device =>{
        if(device){
            device.monitorCharacteristicForService(
                '0000ffe0-0000-1000-8000-00805f9b34fb', //serviceUUID
                '0000ffe1-0000-1000-8000-00805f9b34fb', //characterUUID
                (error, Characteristic) => {
                    console.log('[BleFunction.js]monitorCharacteristicForService: ' + base64.decode(`${Characteristic?.value}`));
                    const read_data = base64.decode(`${Characteristic?.value}`);
                    if(myContext.readData == read_data){ 
                        console.log("[BleFunction.js]중복 read");
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
        }
    }

    //아두이노로 문자열(각도) 전송
    const send = async num => {
        try {
            console.log("[BleFunction.js]SelectNumber: " + num); //선택한 우산 번호
            const docRef = doc(db, "Station", `${myContext.connectedStation.st_id}`);
            const docSnap = await getDoc(docRef);
            //const angle = docSnap.get(`um_count_state.${num}.angle`);
            const array = docSnap.get(`um_count_state`);
            
            console.log("[BleFunction.js]angle: " + array[num].angle);
            if( send_state == true ){
                console.log("[BleFunction.js]중복 Send 발생");
                console.log("[BleFunction.js]Send: " + myContext.sendData );
            }
            else{
                console.log("[BleFunction.js]Send Start");
                if (String(array[num].angle).length == 1) {
                    await manager.writeCharacteristicWithResponseForDevice(
                        `${myContext.connectedStation.st_mac}`,
                        '0000ffe0-0000-1000-8000-00805f9b34fb', //serviceUUID
                        '0000ffe1-0000-1000-8000-00805f9b34fb', //characterUUID
                        base64.encode('0000001')
                    )
                    console.log('[BleFunction.js]전송 값: 0000001')
                    myContext.setSend('0000001');
                    myContext.setState(false); 
                }
                else if (String(array[num].angle).length == 2) { //각도가 2자리 수이면 0000각도
                    console.log("[BleFunction.js]angle.length:2")
                    await manager.writeCharacteristicWithResponseForDevice(
                        `${myContext.connectedStation.st_mac}`,
                        '0000ffe0-0000-1000-8000-00805f9b34fb', //serviceUUID
                        '0000ffe1-0000-1000-8000-00805f9b34fb', //characterUUID
                        base64.encode(`0000${array[num].angle}1`)
                    )
                    console.log(`[BleFunction.js]전송 값: 0000${array[num].angle}1`)
                    myContext.setSend(`0000${array[num].angle}1`);
                    myContext.setState(false); 
                }
                else if (String(array[num].angle).length == 3) { //각도가 3자리 수이면 000각도
                    await manager.writeCharacteristicWithResponseForDevice(
                        `${myContext.connectedStation.st_mac}`,
                        '0000ffe0-0000-1000-8000-00805f9b34fb', //serviceUUID
                        '0000ffe1-0000-1000-8000-00805f9b34fb', //characterUUID
                        base64.encode(`000${array[num].angle}1`)
                    )
                    console.log(`[BleFunction.js]전송 값: 000${array[num].angle}1`)
                    myContext.setSend(`000${array[num].angle}1`);
                    myContext.setState(false); 
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    return {
        connectToDevice,
        startStreamingData,
        send,
        connectedDevice
    };
}
export default BleFunction;

