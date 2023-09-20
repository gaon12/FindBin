import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, Image, Text, ScrollView, Platform } from 'react-native';
import { Input, Button } from 'react-native-elements';
let Picker;
let RNPickerSelect;

if (Platform.OS === 'ios') {
  RNPickerSelect = require('react-native-picker-select').default;
} else {
  Picker = require('@react-native-picker/picker').Picker;
}

import provincesAndDistricts from './data/provincesAndDistricts.json';

export default function App() {
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
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
  let newLogoUrl = 'https://findbin.uiharu.dev/app/src/img/logo/icon.png'; // 기본 로고 URL

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

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
      <ScrollView>
        <Image
          source={{ uri: logoUrl }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.labelStyle}>시도 / 시군구 선택</Text>
        {Platform.OS === 'ios' ? (
          <>
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={(value) => {
                  setProvince(value);
                  setDistrict(''); // 시도가 변경되면 시군구를 초기화합니다.
                }}
                items={provinces.map((province) => ({
                  label: province,
                  value: province,
                }))}
                placeholder={{ label: '시도', value: null }}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
              />
            </View>
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={(value) => setDistrict(value)}
                value={district}
                items={districts.map((district) => ({
                  label: district,
                  value: district,
                }))}
                placeholder={{ label: '시군구', value: null }}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={province}
                onValueChange={(itemValue) => {
                  setProvince(itemValue);
                  setDistrict('');
                }}
              >
                <Picker.Item label="시도" value="" />
                {provinces.map((province, index) => (
                  <Picker.Item key={index} label={province} value={province} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={district}
                onValueChange={(itemValue) => setDistrict(itemValue)}
              >
                <Picker.Item label="시군구" value="" />
                {districts.map((district, index) => (
                  <Picker.Item key={index} label={district} value={district} />
                ))}
              </Picker>
            </View>
          </>
        )}
        <Input
          label="아이디"
          placeholder="아이디를 입력하세요"
          value={null}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputInnerContainer}
        />

        <Input
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputInnerContainer}
        />
        <Button
          title="로그인"
          onPress={() => console.log('로그인 시도')}
          buttonStyle={styles.button}
        />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: 100,
    marginBottom: 20,
    alignSelf: 'center',
  },
  pickerContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputInnerContainer: {
    borderColor: '#ced4da',
  },
  button: {
    backgroundColor: '#343a40',
  },
  labelStyle: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#868e96', // 이 부분은 Input 컴포넌트의 라벨 색상과 일치시킵니다.
  },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      color: 'black',
    },
    inputAndroid: {
      fontSize: 16,
      paddingVertical: 8,
      paddingHorizontal: 10,
      color: 'black',
    },
  });