import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Text,
  Button,
  Linking,
  Platform,
} from "react-native";
import MapView, { Marker, Callout, UrlTile } from "react-native-maps";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkModeState,osmstate } from "./dataState";
// 스타일 임포트
import styles from "./HomeStyle";
import { useRecoilState } from "recoil";

// 구글 지도 다크모드 스타일
const darkMapStyle = require("./dark.json");

export default function Home() {
  const seoulCityHall = {
    latitude: 37.5665,
    longitude: 126.978,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  const [useOpenStreetMap, setUseOpenStreetMap] = useRecoilState(osmstate);
  const [location, setLocation] = useState(seoulCityHall);
  const [currentRegion, setCurrentRegion] = useState(seoulCityHall);
  const mapRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [bins, setBins] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);
  // const [theme, setTheme] = useRecoilState(darkModeState) // 라이트 모드가 기본값
  const [isOsm, setIsOsm] = useState(false); // 오픈스트리트 맵 사용 상태
  const [stateMode, setStateMode] =useRecoilState(darkModeState);


// useEffect(() => {
//     const initializeSettings = async () => {
//       try {
//         const useGPS = await AsyncStorage.getItem("useGPS");
//         if (useGPS === "false") {
//           Toast.show({
//             text1: "GPS 사용이 비활성화되어 있습니다. 설정을 확인하세요.",
//           });
//         }
//       } catch (error) {
//         console.error("Home.js Error", error);
//       }
//     };

//     initializeSettings();
    
//     // Cleanup function to clear the interval on component unmount
//     // return () => {
//     //   clearInterval(intervalId);
//     // };
// }, []);


const getCurrentLocation = async () => {
   const useGPS = await AsyncStorage.getItem("useGPS") || "false";
  console.log(useGPS)
  // GPS를 사용하지 않도록 설정되어 있을 때, 현재 위치로 이동하지 않도록 합니다.
  if (useGPS === "false") {
    Toast.show({
      text1: "GPS 사용이 비활성화되어 있습니다. 설정을 확인하세요.",
    });
    return;
  }

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
  if (mapRef.current) {
    mapRef.current.animateToRegion(initialRegion, 1000);
  }
};

  // useEffect(() => {
  // }, [mapRef]);
  
  // CurrentRegion을 호출하여 최신의 현재 위치를 얻습니다.
  const CurrentRegion = () => {
    getCurrentLocation();
    return currentRegion;
  };

  // 라이트모드 다크모드

  useEffect(() => {
    const fetchData = async () => {
      // 현재 저장된 주제를 불러옵니다.
      // const newTheme = await AsyncStorage.getItem("lightdark");
      
      // // newTheme이 null이 아니고 현재 설정된 theme과 다를 때만 상태를 업데이트합니다.
      // if (newTheme !== null && newTheme !== theme) {
      //   setTheme(newTheme);
      // }
      // 맵 유형 (OpenStreetMap 사용 여부)을 설정합니다.\
      setStateMode(false)
      setUseOpenStreetMap(false)
      // const newMapType = await AsyncStorage.getItem("useOpenStreetMap");
      // if (newMapType == null) {
      //   setIsOsm(newMapType === "true");
      // }
    };
  
    fetchData();
  }, []); // dependency 배열을 비움
  

  // 스타일을 동적으로 적용할 수 있는 객체
  const dynamicStyles = {
    map: {
      ...styles.map,
      backgroundColor: stateMode ? "#ffffff" : "#000000",
    },
    toast: {
      backgroundColor: stateMode ? "#333333" : "#ffffff",
      color: stateMode ? "#ffffff" : "#000000",
    },
    button: {
      backgroundColor: stateMode ? "#444444" : "#007AFF",
      color: stateMode ? "#ffffff" : "#000000",
    },
    callout: {
      backgroundColor: stateMode ? "#333333" : "#ffffff",
      color: stateMode ? "#ffffff" : "#000000",
    },
    buttonContainer: {
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    iconColor: {
      color: stateMode ? "#ffffff" : "#000000",
    },
  };

  // 오픈스트리트맵 다크모드
  const osmTileUrl =
  stateMode
      ? // ? "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png" // 다크모드
      : "https://tile.openstreetmap.org/{z}/{x}/{y}.png"; // 라이트 모드

  const getAddressFromCoordinates = async (latitude, longitude) => {
    const apiUrl = "https://nominatim.openstreetmap.org/reverse";
    const format = "json";

    try {
        const response = await fetch(
            `${apiUrl}?lat=${latitude}&lon=${longitude}&format=${format}`
        );

        if (!response.ok) {
            throw new Error("API 요청 실패");
        }

        const data = await response.json();
        var Address = `${data.address.province || ""} ${data.address.city || ""
        } ${data.address.county || ""} ${data.address.city_district || ""} ${data.address.village || ""
        }${data.address.borough || ""} ${data.address.suburb || ""} ${data.address.road || ""
        } ${data.address.amenity || ""}`
            .replace(/ +/g, " ")
            .trim();

        return Address;
    } catch (error) {
        console.error('Failed to get address:', error);
        return null;
    }
};

  const calculateDistance = (latitudeDelta) => {
    // 선형 변환 상수
    const LINEAR_FACTOR = 111000; // 대략적으로 1도의 위도는 111km

    let distance = Math.round(latitudeDelta * LINEAR_FACTOR);

    // 거리가 5000m를 초과하지 않도록 함
    distance = Math.min(2000, distance);

    // 거리가 최소 500m 이상이 되도록 함
    distance = Math.max(50, distance);

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
      console.error("Home.js Error fetching bins:", error);
    }
  };

  const handleRegionChange = (region) => {
    setCurrentRegion(region);
    fetchBins(region.latitude, region.longitude, region.latitudeDelta);
  };

  const openMap = async (appName, latitude, longitude) => {
    const sourceAddress = await getAddressFromCoordinates(location.latitude, location.longitude);
    const destName = selectedBin?.road_address || '목적지';  // 만약 selectedBin?.road_address가 없다면 '목적지'를 기본값으로 사용합니다.

    const url =
        appName === "naver"
            ? `nmap://route/walk?slat=${location.latitude}&slng=${location.longitude}&sname=${encodeURIComponent(sourceAddress)}&dlat=${latitude}&dlng=${longitude}&dname=${encodeURIComponent(destName)}&appname=com.example.myapp`
            : `kakaomap://route?sp=&ep=${latitude},${longitude}&by=FOOT`;

    Linking.openURL(url).catch((err) => {
        Toast.show({
            text1: `${
                appName === "naver" ? "네이버 지도" : "카카오맵"
            } 앱을 열 수 없습니다.`,
        });
        console.error("Home.js 앱을 여는데 실패했어요: ", err);
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
        ref={mapRef}
        onMapReady={() => {
          setIsMapReady(true);
        }}
        style={styles.map}
        userInterfaceStyle={stateMode ? "dark" : "light"}
        initialRegion={location}
        onRegionChangeComplete={handleRegionChange}
        customMapStyle={stateMode ? darkMapStyle : []}
        mapType={
          Platform.OS === "android" ? "standard" : useOpenStreetMap ? "none" : "standard"
        } // 오픈스트리트맵을 사용하려면 mapType을 'none'으로 설정. 단, 안드로이드는 오픈스트리트맵 로드가 되지 않아 구글 지도로만 출력
      >
        {useOpenStreetMap && <UrlTile urlTemplate={osmTileUrl} maximumZ={19} />}
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
                    selectedBin?.longitude,
                    selectedBin?.road_address
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
            if (isMapReady) {
              mapRef.current?.animateToRegion(
                {
                  ...currentRegion,
                  latitudeDelta: currentRegion.latitudeDelta / 2,
                  longitudeDelta: currentRegion.longitudeDelta / 2,
                },
                1000
              );
            }
          }}
        >
          <Ionicons name="add" size={24} style={dynamicStyles.iconColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (isMapReady) {
              mapRef.current?.animateToRegion(
                {
                  ...currentRegion,
                  latitudeDelta: currentRegion.latitudeDelta * 2,
                  longitudeDelta: currentRegion.longitudeDelta * 2,
                },
                1000
              );
            }
          }}
        >
          <Ionicons name="remove" size={24} style={dynamicStyles.iconColor} />
        </TouchableOpacity>
        <TouchableOpacity
  style={styles.button}
  // onPress={async () => {
  //   const useGPS = await AsyncStorage.getItem("useGPS") || "false";
  //   if (useGPS === "true") {
  //     getCurrentLocation();
  //   } else {
  //     Toast.show({
  //       text1: "위치 정보를 사용할 수 없습니다. 설정을 확인하세요.",
  //     });
  //   }
  // }}
  onPress={getCurrentLocation}
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