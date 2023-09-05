import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Text,
  Button,
  Linking,
} from "react-native";
import MapView, { Marker, Callout, UrlTile } from "react-native-maps";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 구글 지도 다크모드 스타일
const darkMapStyle = require("./dark.json");

export default function Home() {
  const seoulCityHall = {
    latitude: 37.5665,
    longitude: 126.978,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [location, setLocation] = useState(seoulCityHall);
  const [currentRegion, setCurrentRegion] = useState(seoulCityHall);
  const [mapRef, setMapRef] = useState(null);
  const [bins, setBins] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);
  const [theme, setTheme] = useState("light"); // 다크 모드가 기본값
  const [isOsm, setIsOsm] = useState(false); // 오픈스트리트 맵 사용 상태

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const newTheme = await AsyncStorage.getItem('lightdark');
        if (newTheme !== null && newTheme !== theme) {
          setTheme(newTheme);
        }
  
        const newMapType = await AsyncStorage.getItem('useOpenStreetMap');
        if (newMapType !== null) {
          setIsOsm(newMapType === 'true');
        }
      } catch (error) {
        console.error(error);
      }
    }, 500); // 여기서 500은 각 체크 사이의 밀리초 단위 시간 간격입니다. 필요에 따라 조정할 수 있습니다.
  
    // Cleanup function to clear the interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [theme]);  

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          text1: "위치 권한이 없어 현재 위치로 이동할 수 없습니다.",
        });
        return;
      }

      Toast.show({ text1: "현재 위치를 찾는 중입니다." });

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Lowest,
      });

      const initialRegion = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setLocation(initialRegion);
      setCurrentRegion(initialRegion);
      Toast.show({ text1: "현재 위치 발견!" });

      // mapRef가 초기화되어 있고 현재 위치가 설정된 경우, 지도를 현재 위치로 이동
      if (mapRef) {
        mapRef.animateToRegion(initialRegion, 1000);
      }
    })();
  }, [mapRef]); // mapRef를 dependency로 추가

  // 라이트모드 다크모드

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("lightdark");
        if (storedTheme) {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error("Failed to fetch theme:", error);
      }
    };

    fetchTheme();
  }, [theme]);

  // 스타일을 동적으로 적용할 수 있는 객체
  const dynamicStyles = {
    map: {
      ...styles.map,
      backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
    },
    toast: {
      backgroundColor: theme === "dark" ? "#333333" : "#ffffff",
      color: theme === "dark" ? "#ffffff" : "#000000",
    },
    button: {
      backgroundColor: theme === "dark" ? "#444444" : "#007AFF",
      color: theme === "dark" ? "#ffffff" : "#000000",
    },
    callout: {
      backgroundColor: theme === "dark" ? "#333333" : "#ffffff",
      color: theme === "dark" ? "#ffffff" : "#000000",
    },
    buttonContainer: {
      backgroundColor: theme === "dark" ? "#333333" : "#ffffff",
    },
    iconColor: {
      color: theme === "dark" ? "#ffffff" : "#000000",
    },
  };

  // 오픈스트리트맵 다크모드
  const osmTileUrl = theme === 'dark'
    // ? "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
    ? "https://tile.openstreetmap.org/{z}/{x}/{y}.png" // 다크모드
    : "https://tile.openstreetmap.org/{z}/{x}/{y}.png"; // 라이트 모드

  // 라이트모드 다크모드

  // 오픈스트리트맵

  useEffect(() => {
    const fetchMapType = async () => {
      try {
        const storedMapType = await AsyncStorage.getItem("useOpenStreetMap");
        if (storedMapType !== null) {
          setIsOsm(storedMapType === "true");
        }
      } catch (error) {
        console.error("Failed to fetch map type:", error);
      }
    };

    fetchMapType();
  }, [isOsm]);

  // 오픈스트리트맵

  const calculateDistance = (latitudeDelta) => {
    // 선형 변환 상수
    const LINEAR_FACTOR = 111000; // 대략적으로 1도의 위도는 111km

    let distance = Math.round(latitudeDelta * LINEAR_FACTOR);

    // 거리가 5000m를 초과하지 않도록 함
    distance = Math.min(5000, distance);

    // 거리가 최소 500m 이상이 되도록 함
    distance = Math.max(500, distance);

    return distance;
  };

  const fetchBins = async (latitude, longitude, latitudeDelta) => {
    const distance = calculateDistance(latitudeDelta);

    if (distance > 5000) {
      Toast.show({ text1: "요청 거리가 너무 큽니다. 지도를 확대해주세요." });
      return;
    }

    try {
      const response = await axios.post(
        "https://apis.uiharu.dev/findbin/api.php",
        {
          latitude,
          longitude,
          distance,
        }
      );
      setBins(response.data);
    } catch (error) {
      console.error("Error fetching bins:", error);
    }
  };

  const handleRegionChange = (region) => {
    setCurrentRegion(region);
    fetchBins(region.latitude, region.longitude, region.latitudeDelta);
  };

  const openMap = (appName, latitude, longitude) => {
    const url =
      appName === "naver"
        ? `nmap://route/walk?dlat=${latitude}&dlng=${longitude}`
        : `kakaomap://route?sp=&ep=${latitude},${longitude}&by=FOOT`;

    Linking.openURL(url).catch((err) => {
      Toast.show({
        text1: `${
          appName === "naver" ? "네이버 지도" : "카카오맵"
        } 앱을 열 수 없습니다.`,
      });
      console.error("앱을 여는데 실패했어요: ", err);
    });
  };

  const calloutStyles = {
    container: {
      width: 200,
      padding: 10,
      margin: -10,
      borderRadius: 10,
      backgroundColor: "white",
      borderColor: "#ccc",
      borderWidth: 0, // 테두리 없앰
      ...styles.calloutContainer,
      backgroundColor: dynamicStyles.callout.backgroundColor,
    },
    address: {
      fontWeight: "bold",
      marginBottom: 5,
    },
    placeType: {
      fontStyle: "italic",
      color: "gray",
    },
    button: {
      marginTop: 10,
      backgroundColor: "#007AFF",
      padding: 5,
      textAlign: "center",
      color: "white",
      borderRadius: 5,
    },
    text: {
      color: dynamicStyles.callout.color,
    },
  };

  const closeModalOnOutsideClick = (e) => {
    if (e.target.id === "modalOutside") {
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={(ref) => setMapRef(ref)}
        style={styles.map}
        userInterfaceStyle={theme === "dark" ? "dark" : "light"}
        initialRegion={location}
        onRegionChangeComplete={handleRegionChange}
        customMapStyle={theme === "dark" ? darkMapStyle : []}
        mapType={isOsm ? 'none' : 'standard'} // 오픈스트리트맵을 사용하려면 mapType을 'none'으로 설정
      >
        {isOsm && (
          <UrlTile
            urlTemplate={osmTileUrl}
            maximumZ={19}
          />
        )}
        {location && <Marker coordinate={location} pinColor="blue" />}
        {bins.map((bin) => (
          <Marker
            key={bin.id}
            coordinate={{
              latitude: parseFloat(bin.latitude),
              longitude: parseFloat(bin.longitude),
            }}
          >
            <Callout
              tooltip={true}
              style={calloutStyles.container}
              onPress={() => {
                setSelectedBin(bin);
                setModalVisible(true);
              }}
            >
              <View style={calloutStyles.container}>
                <Text style={calloutStyles.address}>{bin.road_address}</Text>
                <Text style={calloutStyles.placeType}>{bin.place_type}</Text>
                <Text
                  style={calloutStyles.button}
                  onPress={() => {
                    setSelectedBin(bin);
                    setModalVisible(true);
                  }}
                >
                  더 보기
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View
          id="modalOutside"
          style={styles.modalOutside}
          onTouchStart={closeModalOnOutsideClick}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              주소: {selectedBin?.road_address}
            </Text>
            <Text style={styles.modalText}>
              쓰레기 종류: {selectedBin?.trash_type}
            </Text>
            <Text style={styles.modalText}>
              설치 연도:{" "}
              {selectedBin?.install_year === 1
                ? "No Data"
                : selectedBin?.install_year}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={{ ...styles.customButton, ...dynamicStyles.button }}
                onPress={() =>
                  openMap(
                    "naver",
                    selectedBin?.latitude,
                    selectedBin?.longitude
                  )
                }
              >
                <Text style={styles.buttonText}>네이버 지도</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ ...styles.customButton, ...dynamicStyles.button }}
                onPress={() =>
                  openMap(
                    "kakao",
                    selectedBin?.latitude,
                    selectedBin?.longitude
                  )
                }
              >
                <Text style={styles.buttonText}>카카오맵</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ ...styles.customButton, ...dynamicStyles.button }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View
        style={{ ...styles.buttonContainer, ...dynamicStyles.buttonContainer }}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            mapRef.animateToRegion(
              {
                ...currentRegion,
                latitudeDelta: currentRegion.latitudeDelta / 2,
                longitudeDelta: currentRegion.longitudeDelta / 2,
              },
              1000
            );
          }}
        >
          <Ionicons name="add" size={24} style={dynamicStyles.iconColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            mapRef.animateToRegion(
              {
                ...currentRegion,
                latitudeDelta: currentRegion.latitudeDelta * 2,
                longitudeDelta: currentRegion.longitudeDelta * 2,
              },
              1000
            );
          }}
        >
          <Ionicons name="remove" size={24} style={dynamicStyles.iconColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            mapRef.animateToRegion(
              {
                ...location,
                latitudeDelta: currentRegion.latitudeDelta,
                longitudeDelta: currentRegion.longitudeDelta,
              },
              1000
            );
          }}
        >
          <Ionicons name="navigate" size={24} style={dynamicStyles.iconColor} />
        </TouchableOpacity>
      </View>
      <Toast
        style={dynamicStyles.toast}
        textStyle={{ color: dynamicStyles.toast.color }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOutside: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 반투명 배경
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    top: 40,
    right: 10,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
  },
  button: {
    marginVertical: 4,
    padding: 10,
    alignItems: "center",
  },
  customButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 10,
    margin: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 12,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
