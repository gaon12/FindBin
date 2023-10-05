import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';

export default function App() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [is24Hour, setIs24Hour] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleHourFormat = () => {
    setIs24Hour(!is24Hour);
  };

  const formattedTime = () => {
    const year = currentDateTime.getFullYear();
    const month = currentDateTime.getMonth() + 1;
    const date = currentDateTime.getDate();
    let hour = currentDateTime.getHours();
    const minute = currentDateTime.getMinutes();
    const second = currentDateTime.getSeconds();
    const ampm = hour < 12 ? '오전' : '오후';

    if (!is24Hour) {
      hour = hour % 12;
      hour = hour ? hour : 12;
    }

    return `${year}년 ${month}월 ${date}일 ${is24Hour ? '' : ampm} ${String(hour).padStart(2, '0')}시 ${String(minute).padStart(2, '0')}분 ${String(second).padStart(2, '0')}초`;
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkMode]}>
      <Button title={isDarkMode ? '라이트 모드' : '다크 모드'} onPress={toggleDarkMode} />
      <Button title={is24Hour ? '12시간제' : '24시간제'} onPress={toggleHourFormat} />
      <Text style={isDarkMode ? styles.darkText : styles.lightText}>현재 시간은</Text>
      <Text style={[styles.timeText, isDarkMode ? styles.darkText : styles.lightText]}>{formattedTime()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  darkMode: {
    backgroundColor: 'black',
  },
  lightText: {
    color: 'black',
  },
  darkText: {
    color: 'white',
  },
  timeText: {
    fontSize: 24,
  }
});
