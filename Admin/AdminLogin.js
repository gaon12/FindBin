import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, Image, Text, ScrollView, Alert } from 'react-native';
import { Input, Button } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import provincesAndDistricts from './data/provincesAndDistricts.json';
import SecureStorage from 'react-native-secure-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function App() {
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [logoUrl, setLogoUrl] = useState('https://findbin.uiharu.dev/app/src/img/logo/icon.png');
  const navigation = useNavigation();

  const provinces = Object.keys(provincesAndDistricts);
  const districts = useMemo(() => {
    if (province && provincesAndDistricts[province]) {
      return provincesAndDistricts[province].districts.map((district) => district.name);
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

    const checkStoredData = async () => {
      try {
        const storedAffiliation1 = await SecureStorage.getItem('Affiliation1');
        const storedAffiliation2 = await SecureStorage.getItem('Affiliation2');
        const storedUserId = await SecureStorage.getItem('UserId');
        const storedPersonName = await SecureStorage.getItem('PersonName');

        if (storedAffiliation1 && storedAffiliation2 && storedUserId && storedPersonName) {
          navigation.navigate('BottomNavigations');
        }
      } catch (error) {
        console.error('Error fetching stored data', error);
      }
    };

    checkStoredData();

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://test.com/user/login.php', {
        Affiliation1: province,
        Affiliation2: district,
        UserId: userId,
        password: password,
      });

      const result = response.data;

      if (result.StatsCode === 200) {
        await SecureStorage.setItem('Affiliation1', result.Affiliation1);
        await SecureStorage.setItem('Affiliation2', result.Affiliation2);
        await SecureStorage.setItem('UserId', result.UserId);
        await SecureStorage.setItem('PersonName', result.PersonName);

        navigation.navigate('BottomNavigations');
      } else {
        Alert.alert('오류', result.message);
      }
    } catch (error) {
      Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
      <ScrollView>
        <Image
          source={{ uri: logoUrl }}
          style={[styles.logo, { transition: 'all 0.5s' }]}
          resizeMode="contain"
        />
        <Text style={styles.labelStyle}>시도 / 시군구 선택</Text>
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
              label: district, // 문자열을 사용합니다.
              value: district, // 문자열을 사용합니다.
            }))}
            placeholder={{ label: '시군구', value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        <Input
      label="아이디"
      placeholder="아이디를 입력하세요"
      value={userId}
      onChangeText={(text) => setUserId(text)}
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
      onPress={handleLogin}
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
