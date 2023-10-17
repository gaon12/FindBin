import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { Card, Text } from 'react-native-elements';
import * as Location from 'expo-location';
import { darkModeState } from "../dataState.js";
import { useRecoilState } from "recoil";

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [address, setAddress] = useState(null);
  const [plusCode, setPlusCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stateMode, setStateMode] = useRecoilState(darkModeState);

  const formatKoreanAddress = (data) => {
    // 주소 형식을 "서울특별시 강남구 XXX로 XXX(XXX동, 건물명, 12345)"로 변환
    const { address } = data;
    const components = [
      address.state,
      address.province,
      address.city_district || address.city,
      address.road,
      address.house_number,
    ];
    return components.filter(Boolean).join(' ');
  };  

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        setLocation(location);

        const lat = location.coords.latitude.toFixed(6);
        const lon = location.coords.longitude.toFixed(6);

        // Nominatim 리버스 지오코딩
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=ko`);
        const data = await response.json();
        setAddress(formatKoreanAddress(data));

        // 구글 플러스 코드 가져오기
        const plusCodeResponse = await fetch(`https://plus.codes/api?address=${lat},${lon}`);
        const plusCodeData = await plusCodeResponse.json();
        setPlusCode(plusCodeData.plus_code.global_code);

        setLoading(false);
      } catch (error) {
        setErrorMsg('Failed to fetch data. Please check your internet connection.');
        setLoading(false);
      }
    })();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: stateMode ? "#000000" : "#ffffff",
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      borderRadius: 8,
      padding: 20,
      width: '90%',
      elevation: 5,
      backgroundColor: stateMode ? "#000000" : "#ffffff"
    },
    margin: {
      marginBottom: 15,
      color: stateMode ? "#ffffff" : "#000000",
    },
    error: {
      color: 'red',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Card containerStyle={styles.card}>
        {loading ? <ActivityIndicator size="large" color="#6200EA" style={styles.margin} /> : null}
        {errorMsg ? <Text h4 style={[styles.error, styles.margin]}>Error: {errorMsg}</Text> : null}
        {location ? (
          <Text h4 style={styles.margin}>
            현재 좌표: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
          </Text>
        ) : null}
        {address ? <Text h4 style={styles.margin}>주소: {address}</Text> : null}
        {plusCode ? <Text h4 style={styles.margin}>플러스 코드: {plusCode}</Text> : null}
      </Card>
    </SafeAreaView>
  );
}


