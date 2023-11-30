//23.06.04 19:14
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Button } from 'react-native';

import { db } from '../../firebaseConfig';
import { addDoc, getDocs, collection, setDoc, doc } from 'firebase/firestore';
import { set } from 'react-native-reanimated';
import AppContext from '../../Appcontext';

const FunctionList = ({ navigation, route }) => {
    const [retalButton, setRentalButton] = useState(true)
    const [returnButton, setReturnButton] = useState(true)
    const [userstate, setUserState] = useState()
    const [stationNum, setStationNum] = useState('') //station data
    const [manager, setManager] = useState(); //ble manager
    const [st_id, setStId]= useState(); //station id
    const [id, setId] = useState(AsyncStorage.getItem('id'))
    const myContext = useContext(AppContext);

    useEffect(() => {
        console.log("--------FunctionList-------");
        if (route.params != undefined) {
            setStationNum(myContext.connectedStation);
            setManager(route.params.manager);
            setStId(route.params.st_id);
            var rentalCount = 0
            var returnCount = 0
            for (var i = 0; i < Object.keys(myContext.connectedStation.um_count_state).length; i++) { // um_count_state의 길이만큼 반복
                // key값이 string이라서 변환 후 state읽기
                if (myContext.connectedStation.um_count_state[String(i+1)].state) { // true이면 대여 가능
                    rentalCount++; // 대여 가능한 우산 개수
                } else {
                    returnCount++; // 반납 가능한 우산 개수 false이면 우산 없음
                }
            }
            if (Object.keys(myContext.connectedStation.um_count_state).length == rentalCount) {
                // 전체 우산 개수와 대여 가능한 우산이 같으면
                // 남은 공간이 없음 -> 반납할 수 없음
                console.log('반납 불가능')
                setRentalButton(!retalButton)
            }
            if (Object.keys(myContext.connectedStation.um_count_state).length == returnCount) { 
                // 전체 우산 넣는 부분과 반납 가능한 우산 개수가 같으면
                // 대여 가능한 우산이 없음 -> 대여할 수 없음
                console.log('대여 불가능')
                setReturnButton(!returnButton)
            }
        }
    }, []);

    useEffect(() => {
        (async () => {
            try {
                // DB에 있는 User 데이터 가져오기
                const data = await getDocs(collection(db, "User"));
                data.docs.map(doc => { 
                    if(doc.data().u_id == myContext.connectedUser.u_id){
                        if(doc.data().u_rent)
                            setUserState(true);
                        else
                            setUserState(false);
                    }
                 console.log("userState: "+userstate);
                })
                } catch (error) {
                console.log('eerror', error.message)
            }
        })();
    
    }, [userstate]);

    return (
        <View style={styles.container}>
            <View style={styles.buttonView}>
                     <TouchableOpacity
                     style={!userstate? styles.buttonstyle:styles.off_buttonstyle}
                     onPress={() => navigation.navigate('Rental', { stationdata: myContext.connectedStation, manager: manager })}
                     disabled={userstate} //u_rent: true
                 >
                     <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>대여하기</Text>
                 </TouchableOpacity>
                  
               
            </View>

            <View style={styles.buttonView}>
                <TouchableOpacity
                    style={userstate? styles.buttonstyle : styles.off_buttonstyle}
                    onPress={() => navigation.navigate('ReturnPage', { stationdata: myContext.connectedStation, manager: manager })}
                    disabled={!userstate} 
                >
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>반납하기</Text>
                </TouchableOpacity>
                
                
            </View>

            <View style={styles.buttonView}>
                <TouchableOpacity
                    style={styles.buttonstyle}
                    onPress={() => navigation.navigate('DonationPage', { stationdata: myContext.connectedStation, manager: manager })}
                >
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>폐우산 기부하기</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default FunctionList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        padding: 20,
        paddingTop: 50,
    },
    buttonView: {
        justifyContent: 'space-between',
        height: Dimensions.get('window').height * 0.1,
        marginBottom: 40,
    },
    buttonstyle: {
        width: '100%',
        height: Dimensions.get('window').height * 0.10,
        backgroundColor: '#6699FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    off_buttonstyle: {
        width: '100%',
        height: Dimensions.get('window').height * 0.10,
        backgroundColor: '#6699FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        opacity: 0.5
    }
});