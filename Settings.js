import React, { useState, useEffect } from "react";
import { Modal, View, StyleSheet, Platform, StatusBar, TouchableOpacity } from "react-native";
import { Switch, Text, Title, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Icons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { Linking } from 'react-native';

function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [useOpenStreetMap, setUseOpenStreetMap] = useState(false);
  const [useGPS, setUseGPS] = useState(false);
  const [sendAnonymousData, setSendAnonymousData] = useState(false);
  const [clickCounter, setClickCounter] = useState(0);
  const [RandomComponent, setRandomComponent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fileArray = [require("./WITP/WhatIsThisPage1.js").default];

  useEffect(() => {
    if (clickCounter === 4) {
      const randomFileIndex = Math.floor(Math.random() * fileArray.length);
      setRandomComponent(() => fileArray[randomFileIndex]);
      setIsModalVisible(true);
      setClickCounter(0);
    } else if (clickCounter > 0) {
      showToastMessage(`${4 - clickCounter}번 더 눌러 보세요!`, null);
    }
  }, [clickCounter]);  

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const showToastMessage = (message, isCustomMessage) => {
    let text1;
    if (isCustomMessage === null) {
      text1 = message;
    } else {
      text1 = isCustomMessage 
        ? `${message} 설정을 켜짐으로 변경했습니다!` 
        : `${message} 설정을 꺼짐으로 변경했습니다!`;
    }
  
    Toast.show({
      type: "success",
      position: "top",
      text1,
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
      style: { backgroundColor: "#fff" },
      textStyle: { color: "#000" },
    });
  };  

  const handleVersionClick = () => {
    setClickCounter((prev) => prev + 1);
  };

  const handleAnnouncementClick = () => {
    // 원하는 URL로 이동하는 코드 추가
    // 예: 공지사항 페이지로 이동
    const noticeURL = 'https://naver.com';
    // 웹뷰를 열려면 해당 컴포넌트를 렌더링합니다.
    Linking.openURL(noticeURL)
    .catch((err) => console.error('Error opening URL: ', err));
  };

  useEffect(() => {
    const applyDarkMode = async () => {
      const mode = await AsyncStorage.getItem("lightdark");
      setDarkMode(mode === "dark");
    };
    applyDarkMode();
  }, []);

  const toggleDarkMode = async () => {
    await AsyncStorage.setItem("lightdark", !darkMode ? "dark" : "light");
    setDarkMode(!darkMode);
    showToastMessage("다크 모드", !darkMode);
  };

  const toggleOpenStreetMap = async () => {
    setUseOpenStreetMap((prevValue) => !prevValue);
    await AsyncStorage.setItem(
      "useOpenStreetMap",
      JSON.stringify(!useOpenStreetMap)
    );
    showToastMessage("오픈스트리트맵 사용", !useOpenStreetMap);
  };

  const toggleGPS = async () => {
    setUseGPS((prevValue) => !prevValue);
    await AsyncStorage.setItem("useGPS", JSON.stringify(!useGPS));
    showToastMessage("GPS 사용", !useGPS);
  };

  const toggleSendAnonymousData = async () => {
    setSendAnonymousData((prevValue) => !prevValue);
    await AsyncStorage.setItem(
      "sendAnonymousData",
      JSON.stringify(!sendAnonymousData)
    );
    showToastMessage("익명 정보 수집 동의", !sendAnonymousData);
  };

  return (
    <>
      <StatusBar
        backgroundColor={darkMode ? "#000" : "#fff"}
        barStyle={darkMode ? "light-content" : "dark-content"}
      />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: darkMode ? "#000" : "#fff" }}
      >
        <Title style={[styles.title, { color: darkMode ? "#fff" : "#000" }]}>
          설정
        </Title>

        <Text style={[styles.header, { color: darkMode ? "#fff" : "#000" }]}>
          테마 설정
        </Text>
        <View style={styles.settingRow}>
          <View style={styles.settingItem}>
            <Icon
              name="theme-light-dark"
              size={20}
              color={darkMode ? "#fff" : "#000"}
            />
            <Text
              style={[
                styles.settingText,
                { color: darkMode ? "#fff" : "#000" },
              ]}
            >
              다크 모드
            </Text>
          </View>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>
        <Divider style={{ backgroundColor: darkMode ? "#fff" : "#000" }} />
        
        {Platform.OS === "ios" && (
  <>
    <Text style={[styles.header, { color: darkMode ? "#fff" : "#000" }]}>
      지도 설정
    </Text>

    <View style={styles.settingRow}>
      <View style={styles.settingItem}>
        <Icon name="map" size={20} color={darkMode ? "#fff" : "#000"} />
        <Text
          style={[
            styles.settingText,
            { color: darkMode ? "#fff" : "#000" },
          ]}
        >
          오픈스트리트맵 사용
        </Text>
      </View>
      <Switch value={useOpenStreetMap} onValueChange={toggleOpenStreetMap} />
    </View>
  </>
)}

<Text style={[styles.header, { color: darkMode ? "#fff" : "#000" }]}>
  위치 정보 설정
</Text>
<View style={styles.settingRow}>
  <View style={styles.settingItem}>
    <Icon
      name="map-marker"
      size={20}
      color={darkMode ? "#fff" : "#000"}
    />
    <Text
      style={[
        styles.settingText,
        { color: darkMode ? "#fff" : "#000" },
      ]}
    >
      GPS 사용
    </Text>
  </View>
  <Switch value={useGPS} onValueChange={toggleGPS} />
</View>
<Text style={[styles.description, { color: darkMode ? "#fff" : "#000" }]}>
  GPS를 사용하면 현재 위치 정보를 더 정확하게 얻을 수 있습니다.
</Text>

        <Divider style={{ backgroundColor: darkMode ? "#fff" : "#000" }} />

        <Text style={[styles.header, { color: darkMode ? "#fff" : "#000" }]}>
          앱 정보
        </Text>
        <View style={[styles.settingRow, styles.anonymous]}>
          <View style={styles.settingItem}>
            <Icon
              name="database-lock"
              size={20}
              color={darkMode ? "#fff" : "#000"}
            />
            <Text
              style={[
                styles.settingText,
                { color: darkMode ? "#fff" : "#000" },
              ]}
            >
              익명 정보 수집 동의
            </Text>
          </View>
          <Switch
            value={sendAnonymousData}
            onValueChange={toggleSendAnonymousData}
          />
        </View>
        <TouchableOpacity onPress={handleAnnouncementClick}>
          <View style={styles.settingRow}>
            <View style={styles.settingItem}>
              <Icons
                name="megaphone"
                size={20}
                color={darkMode ? "#fff" : "#000"}
              />
              <Text
                style={[
                  styles.settingText,
                  { color: darkMode ? "#fff" : "#000" },
                ]}
              >
                공지사항
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleVersionClick}>
          <View style={styles.settingRow}>
            <View style={styles.settingItem}>
              <Icon
                name="information"
                size={20}
                color={darkMode ? "#fff" : "#000"}
              />
              <Text
                style={[
                  styles.settingText,
                  { color: darkMode ? "#fff" : "#000" },
                ]}
              >
                버전
              </Text>
            </View>
            <Text style={{ color: darkMode ? "#fff" : "#000" }}>
              1.0.0-alpha
            </Text>
          </View>
        </TouchableOpacity>
        <Toast
          style={{ backgroundColor: darkMode ? "#333" : "#fff" }}
          textStyle={{ color: darkMode ? "#fff" : "#000" }}
        />
      </SafeAreaView>
      {RandomComponent && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={isModalVisible}
          onRequestClose={closeModal}
        >
          <RandomComponent />
          <TouchableOpacity
            onPress={closeModal}
            style={{ position: "absolute", top: 40, right: 20 }}
          >
            <Text style={{ fontSize: 20, color: "#000" }}>닫기</Text>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 30,
    marginBottom: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginLeft: 16,
  },
  header: {
    fontSize: 18,
    marginVertical: 8,
    marginLeft: 8,
    fontWeight: "500",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  anonymous: {
    marginBottom: -5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    marginLeft: 8,
  },
});

export default Settings;
