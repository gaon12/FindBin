import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, Image, Text, ScrollView, Platform } from 'react-native';
import { Input, Button } from 'react-native-elements';
import AsyncStorage from "@react-native-async-storage/async-storage";
import 'react-native-get-random-values';
import axios from "axios";
import { darkModeState } from "../dataState.js";
import { useRecoilState } from "recoil";
let Picker;
let RNPickerSelect;

const SECRET_KEY = 'your_secret_key_here';

//암호화 함수
// const encrypt = (text) => {
//     return CryptoJS.AES.encrypt(text, SECRET_KEY, {iv: '1234567890'}).toString();
// }
// const encrypt = (key, data) => {
//     const cipher = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
//         iv: CryptoJS.enc.Utf8.parse("1234567890"),
//         padding: CryptoJS.pad.Pkcs7,
//         mode: CryptoJS.mode.CBC
//     });
//     return cipher.toString();
// }
// 복호화 함수
// const decrypt = (cipherText) => {
//     try {
//         const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY, { iv: '1234567890' });
//         const originalText = bytes.toString(CryptoJS.enc.Utf8);
//         console.log(originalText);
//         return originalText;
//     } catch (error) {
//         console.error('복호화 오류:', error);
//         return null; // 복호화 실패 시 null 또는 다른 오류 처리를 수행할 수 있습니다.
//     }
// }

// const decrypt = (key, data) => {
//     const ciphers = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(key), {
//         iv: CryptoJS.enc.Utf8.parse("1234567890"),
//         padding: CryptoJS.pad.Pkcs7,
//         mode: CryptoJS.mode.CBC
//     });
//     return ciphers.toString(CryptoJS.enc.Utf8);
// };

if (Platform.OS === 'ios') {
    RNPickerSelect = require('react-native-picker-select').default;
} else {
    Picker = require('@react-native-picker/picker').Picker;
}

import provincesAndDistricts from './data/provincesAndDistricts.json';

export default function AdminLogin({ closeModal }) {
    const [province, setProvince] = useState('시도');
    const [district, setDistrict] = useState('시군구');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [stateMode, setStateMode] = useRecoilState(darkModeState);

    const [logoUrl, setLogoUrl] = useState(
        'https://findbin.uiharu.dev/app/src/img/logo/icon.png'
    );

    const provinces = Object.keys(provincesAndDistricts);
    const districts = useMemo(() => {
        if (province && provincesAndDistricts[province]) {
            return provincesAndDistricts[province].districts.map(
                (district) => district.name
            );
        } else {
            return [];
        }
    }, [province]);

    useEffect(() => {
        let newLogoUrl = 'https://findbin.uiharu.dev/app/src/img/logo/icon.png?timestamp=${new Date().getTime()}'; // 기본 로고 URL

        if (province) {
            const provinceData = provincesAndDistricts[province];
            if (provinceData) {
                const provinceId = provinceData.id;
                if (district) {
                    const districtObj = provinceData.districts.find((d) => d.name === district);
                    if (districtObj) {
                        const districtId = districtObj.id;

                        // 특정 시도 또는 시군구에 대한 로고 URL 설정
                        if (province === '대한민국 정부' && district === '환경부' || province === '대한민국 정부' && district === '과학기술정보통신부' || province === '관리자' && district === '관리자') {
                            newLogoUrl = `https://findbin.uiharu.dev/app/src/img/logo/${provinceId}/${provinceId}_${districtId}.png?timestamp=${new Date().getTime()}`;
                        }
                    }
                } else {
                    // 특정 시도에 대한 로고 URL 설정
                    if (province === '대한민국 정부' || province === '관리자') {
                        newLogoUrl = `https://findbin.uiharu.dev/app/src/img/logo/${provinceId}/${provinceId}.png?timestamp=${new Date().getTime()}`;
                    }
                }
            }
        }

        setLogoUrl(newLogoUrl);
    }, [province, district]);

    const shortenRegionNameSplit = (regionName) => {
        const suffixes = ['특별', '광역시', '도', '시'];
        
        for (const suffix of suffixes) {
          const parts = regionName.split(suffix);
          if (parts.length > 1) {
            return parts[0];
          }
        }
        
        return regionName;
      }


    const Login = async () => {
        try {
            const formData = {
                Affiliation1: shortenRegionNameSplit(province),
                Affiliation2: district,
                AccountID: username,
                Passwords: password,
            };

            const jsonString = JSON.stringify(formData);

            const LoginUrl = 'https://findbin.uiharu.dev/app/api/user/login.php';
            // Axios를 사용하여 POST 요청 보내기
            const Loginresponse = await axios.post(LoginUrl, jsonString, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            try {
                // var Affiliation1 = JSON.stringify(encrypt(Loginresponse.data.message.Affiliation1.toString()));
                // var Affiliation2 = JSON.stringify(encrypt(Loginresponse.data.message.Affiliation2.toString()));
                // var AccountID = JSON.stringify(encrypt(Loginresponse.data.message.AccountID.toString()));
                // var UserName = JSON.stringify(encrypt(Loginresponse.data.message.UserName.toString()));
                var Affiliation1 = Loginresponse.data.message.Affiliation1.toString();
                var Affiliation2 = Loginresponse.data.message.Affiliation2.toString();
                var AccountID = Loginresponse.data.message.AccountID.toString();
                var UserName = Loginresponse.data.message.UserName.toString();
                var IsAdmin = Loginresponse.data.message.IsAdmin.toString();
                await AsyncStorage.setItem('Affiliation1', Affiliation1);
                await AsyncStorage.setItem('Affiliation2', Affiliation2);
                await AsyncStorage.setItem('AccountID', AccountID);
                await AsyncStorage.setItem('UserName', UserName);
                await AsyncStorage.setItem('IsAdmin', IsAdmin);
            } catch (e) {
                // 오류 처리
                console.error('데이터 저장 오류:', e);
            }

            var Affiliation1 = await AsyncStorage.getItem('Affiliation1');
            var Affiliation2 = await AsyncStorage.getItem('Affiliation2');
            var AccountID = await AsyncStorage.getItem('AccountID');
            var UserName = await AsyncStorage.getItem('UserName');
            var IsAdmin = await AsyncStorage.getItem('IsAdmin');
            
            if (Affiliation1 && AccountID && IsAdmin) {
                // 로그인 성공
                var IsAdmins = await AsyncStorage.getItem('IsAdmin');
                closeModal();
            }

        } catch (error) {
            alert('로그인 실패');
            console.error('로그인 요청 실패:', error);
            // 요청 실패 시 다음 작업을 수행하세요.
        }
    };
    
    const dynamicStyles = StyleSheet.create({
        safeAreaView: {
            flex: 1,
            paddingTop: 20,
        },
        container: {
            flex: 1,
            padding: 20,
            paddingTop: 80,
            justifyContent: 'center',
            backgroundColor: stateMode ? "black": 'white',
            color:  stateMode? '#fff':'#000',
            
        },
        logo: {
            width: '100%',
            height: 100,
            marginBottom: 20,
            alignSelf: 'center',
        },
        pickerContainer: {
            marginBottom: 20,
            padding:Platform.OS === 'ios' ? 20: 0,
            borderWidth: 1,
            borderColor: '#ced4da',
            borderRadius: 4,
            // backgroundColor: stateMode? '#000':'#ffffff',
            paddingHorizontal: 10,
            color : stateMode ? '#fff' : '#000'
        },
        inputContainer: {
            marginBottom: 20,
            backgroundColor: stateMode ?"#000000": '#f8f9fa',
        },
        inputInnerContainer: {
            borderColor: stateMode? '#000':'#ced4da',
        },
        button: {
            backgroundColor: '#343a40',
        },
        labelStyle: {
            marginBottom: 10,
            fontSize: 16,
            fontWeight: 'bold',       
            color: stateMode ? '#fff':'#868e96', // 이 부분은 Input 컴포넌트의 라벨 색상과 일치시킵니다.
        },
    });
    
    const pickerSelectStyles = StyleSheet.create({
        inputIOS: {
            fontSize: 16,
            paddingVertical: 12,
            paddingHorizontal: 10,
            color: stateMode? '#ffffff': '#000000',
            label: stateMode? '#ffffff': '#000000',
        },
        inputAndroid: {
            fontSize: 16,
            paddingVertical: 8,
            paddingHorizontal: 10,
            color: stateMode? '#fff': '#000',
            backgroundColor :stateMode ? '#000' :'#fff'
        },
        placeholder: {
            color: stateMode? '#fff': '#000',
        }
    });
    
    return (
        <SafeAreaView style={dynamicStyles.safeAreaView}>
            <View style={dynamicStyles.container}>
                <ScrollView>
                    <Image
                        source={{ uri: logoUrl }}
                        style={dynamicStyles.logo}
                        resizeMode="contain"
                    />
                    <Text style={dynamicStyles.labelStyle}>시도 / 시군구 선택</Text>
                    {Platform.OS === 'ios' ? (
                        <>
                            <View style={dynamicStyles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => {
                                        setProvince(value);
                                        setDistrict(''); // 시도가 변경되면 시군구를 초기화합니다.
                                    }}
                                    items={provinces.map((province) => ({
                                        label: province,
                                        value: province,
                                    }))}
                                    placeholder={{ label:`${province}`}}
                                    useNativeAndroidPickerStyle={false}
                                    value={province}
                                    style={pickerSelectStyles.inputIOS}
                                    
                                />
                            </View>
                            <View style={dynamicStyles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => setDistrict(value)}
                                    value={district}
                                    items={districts.map((district) => ({
                                        label: district,
                                        value: district,
                                    }))}
                                    placeholder={{label:`${district}` }}
                                    style={pickerSelectStyles.inputIOS}
                                    
                                    useNativeAndroidPickerStyle={false}
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={dynamicStyles.pickerContainer}>
                                <Picker
                                    selectedValue={province}
                                    onValueChange={(itemValue) => {
                                        setProvince(itemValue);
                                        setDistrict('');
                                    }}
                                    >
                                    <Picker.Item label="시도" value=""  style={pickerSelectStyles.inputAndroid}/>
                                    {provinces.map((province, index) => (
                                        <Picker.Item key={index} label={province} value={province} style={pickerSelectStyles.inputAndroid}/>
                                    ))}
                                </Picker>
                            </View>
                            <View style={dynamicStyles.pickerContainer}>
                                <Picker
                                    selectedValue={district}
                                    onValueChange={(itemValue) => setDistrict(itemValue)}
                                    style={pickerSelectStyles.inputAndroid}
                                >
                                    <Picker.Item label="시군구" value="" style={pickerSelectStyles.inputAndroid}/>
                                    {districts.map((district, index) => (
                                        <Picker.Item key={index} label={district} value={district} style={pickerSelectStyles.inputAndroid}/>
                                    ))}
                                </Picker>
                            </View>
                        </>
                    )}
                    <Input
                        label="아이디"
                        placeholder="아이디를 입력하세요"
                        value={null}
                        containerStyle={dynamicStyles.inputContainer}
                        inputContainerStyle={dynamicStyles.inputInnerContainer}
                        onChangeText={(text) => setUsername(text)}
                        inputStyle={{color : stateMode ? '#fff': '#000'}}
                        labelStyle={{color : stateMode ? '#fff': '#000'}}
                    />

                    <Input
                        label="비밀번호"
                        placeholder="비밀번호를 입력하세요"
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        containerStyle={dynamicStyles.inputContainer}
                        inputContainerStyle={dynamicStyles.inputInnerContainer}
                        inputStyle={{color : stateMode ? '#fff': '#000'}}
                        labelStyle={{color : stateMode ? '#fff': '#000'}}
                    />
                    <Button
                        title="로그인"
                        onPress={Login}
                        buttonStyle={dynamicStyles.button}
                    />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

