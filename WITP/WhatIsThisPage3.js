import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Location from 'expo-location';
import axios from 'axios';
import { darkModeState } from "../dataState.js";
import { useRecoilState } from "recoil";

const WhatIsThisPage3 = () => {
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stateMode, setStateMode] = useRecoilState(darkModeState);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    innerContainer: {
      flex: 1,
      padding: 16,
      paddingTop: 70,
    },
    card: {
      borderRadius: 20,
      backgroundColor: stateMode ? "#000000" : "#ffffff",
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    cardTitle: {
      fontSize: 20,
      color: stateMode ? "#ffffff" : "#000000",
    },
    weatherInfo: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    weatherText: {
      fontSize: 24,
      color: stateMode ? "#ffffff" : "#000000",
      marginBottom: 10,
    },
    dateText: {
      fontSize: 16,
      color: stateMode ? "#ffffff" : "#000000",
    },
    sourceText: {
      fontSize: 16,
      color: stateMode ? "#ffffff" : "#000000",
      textAlign: 'center',
    }
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('위치 권한이 필요합니다.');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });

      try {
        const res = await axios.post('https://apis.uiharu.dev/weather/api.php', {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (res.data.StatusCode === 200) {
          const weatherRes = await axios.get(res.data.url2);
          setWeatherInfo(weatherRes.data);
        } else {
          alert(res.data.message);
        }
      } catch (error) {
        alert('오류 발생: ' + error);
      }
      setLoading(false);
    })();
  }, []);

  const getWeatherIcon = (weather) => {
    switch (weather) {
      case '맑음':
        return 'sun-o';
      case '흐림':
        return 'cloud';
      case '비':
        return 'umbrella';
      case '눈':
        return 'snowflake-o';
      default:
        return 'question';
    }
  };

  const formatDate = (dateString) => {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    return `${year}년 ${month}월 ${day}일 ${hour}시 정각`;
  };

  const renderWeatherInfo = () => {
    if (!weatherInfo) return null;
    const { item } = weatherInfo.channel;
    const { body } = item.description;
    const { data } = body;

    return (
      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>{item.category}</Card.Title>
        <Card.Divider />
        <View style={styles.weatherInfo}>
          <Icon name={getWeatherIcon(data.wfKor)} size={50} color="#4A90E2" marginBottom={20} />
          <Text style={styles.weatherText}>날씨: {data.wfKor}</Text>
          <Text style={styles.weatherText}>온도: {data.temp}°C</Text>
          <Text style={styles.weatherText}>습도: {data.reh}%</Text>
          <Text style={styles.dateText}> {formatDate(item.description.header.tm)} 기준</Text>
          <Text style={styles.sourceText}>데이터: {(item.author)}</Text>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#4A90E2" />
        ) : (
          renderWeatherInfo()
        )}
      </View>
    </SafeAreaView>
  );
};



export default WhatIsThisPage3;
