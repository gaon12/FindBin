import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Modal,
} from "react-native";
import { DataTable, Button } from "react-native-paper";
import MapView, { Marker, UrlTile, Callout } from "react-native-maps";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRecoilState } from "recoil";
import { darkModeState, osmstate } from "../dataState.js";

const darkMapStyle = require("../dark.json");

export default function App() {
  const seoulCityHall = {
    latitude: 37.5665,
    longitude: 126.978,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showTable, setShowTable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pageno, setPageno] = useState(1);
  const [location, setLocation] = useState(seoulCityHall);
  const [markers, setMarkers] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(seoulCityHall);
  const [mapRef, setMapRef] = useState(null);
  const [useOpenStreetMap, setUseOpenStreetMap] = useRecoilState(osmstate);
  const [canAddMarker, setCanAddMarker] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [lastPage, setLastPage] = useState(false);
  const [stateMode, setStateMode] = useRecoilState(darkModeState);

  const [sidoName, setSidoName] = useState("");
  const [guName, setGuName] = useState("");
  const [roadName, setRoadName] = useState("");
  const [detailLocation, setDetailLocation] = useState("");
  const [roadAddress, setRoadAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [placeType, setPlaceType] = useState("");
  const [trashType, setTrashType] = useState("");
  const [form, setForm] = useState("");
  const [installYear, setInstallYear] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");

  const markerRefs = useRef([]);

  const osmTileUrl = stateMode
    ? // ? "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
      "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png" // 다크모드
    : "https://tile.openstreetmap.org/{z}/{x}/{y}.png"; // 라이트 모드

  const fetchData = async (action, searchValue, checkNextPage = false) => {
    setLoading(true);
    let nextPage = checkNextPage ? pageno + 1 : pageno;
    try {
      const response = await axios.post(
        "https://findbin.uiharu.dev/app/api/admin/api.php",
        {
          Actions: action,
          pageno: nextPage,
          ...(searchValue && { SearchValue: searchValue }),
        }
      );
      if (response.data.StatusCode === 200) {
        if (response.data.data.length === 0) {
          setLastPage(true);
        } else {
          setLastPage(false);
          if (!checkNextPage) {
            setResults(response.data.data);
          }
        }
      } else {
        console.error("Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("AllList");
  }, [pageno]);

  const handleSearch = () => {
    fetchData("search", query);
  };
  const onMapReady = () => {
    setMapInitialized(true);
  };
  const addMarker = async (event) => {
    if (!canAddMarker) {
      Toast.show({
        text1: "2초 후에 다시 시도해주세요.",
      });
      return;
    }

    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newMarker = { latitude, longitude };
    setMarkers([newMarker]);

    // 역지오코딩 API 요청을 보내서 주소 정보 가져오기
    const address = await getAddressFromCoordinates(latitude, longitude);

    if (address !== null) {
      const addressArray = address.split(" ");
      setSidoName(addressArray[0]);
      addressArray.forEach((segment) => {
        if (
          segment.endsWith("시") ||
          segment.endsWith("군") ||
          segment.endsWith("구")
        ) {
          setGuName(segment);
        } else if (segment.endsWith("로") || segment.endsWith("길")) {
          setRoadName(segment);
        }
      });

      setLatitude(latitude.toFixed(6));
      setLongitude(longitude.toFixed(6));
      setRoadAddress(address);
    } else {
      Toast.show({
        text1: "주소 정보를 가져올 수 없습니다.",
      });
    }

    setCanAddMarker(false);
    setTimeout(() => {
      setCanAddMarker(true);
    }, 2000);
  };

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
      var Address = `${data.address.province || ""} ${
        data.address.city || ""
      } ${data.address.county || ""} ${data.address.city_district || ""} ${
        data.address.village || ""
      }${data.address.borough || ""} ${data.address.suburb || ""} ${
        data.address.road || ""
      } ${data.address.amenity || ""}`
        .replace(/ +/g, " ")
        .trim();

      if (data.address.city == null) {
        var Address = "\n[E404] 현재 좌표 정보 부족.\n다른 좌표를 입력하세요.";
        return null;
      }

      return Address;
    } catch (error) {
      return null; // 오류 시 null을 반환하거나 다른 처리를 수행할 수 있습니다.
    }
  };

  const openModal = () => {
    const today = new Date();
    const year = today.getFullYear().toString();
    setInstallYear(year);
    setModalVisible(true);
  };

  const handleInputChange = (input) => {
    const onlyNums = input.replace(/\D/g, ""); // 숫자가 아닌 모든 문자를 제거합니다.
    let formattedInput;
    if (onlyNums.startsWith("02")) {
      // 서울 지역번호인 경우
      if (onlyNums.length === 9) {
        // 2-3-4 형식
        formattedInput = onlyNums.replace(
          /^(\d{2})(\d{3})(\d{4}).*/,
          "$1-$2-$3"
        );
      } else if (onlyNums.length === 10) {
        // 2-4-4 형식
        formattedInput = onlyNums.replace(
          /^(\d{2})(\d{4})(\d{4}).*/,
          "$1-$2-$3"
        );
      }
    } else {
      // 그 외의 지역번호인 경우
      if (onlyNums.length === 10) {
        // 3-3-4 형식
        formattedInput = onlyNums.replace(
          /^(\d{3})(\d{3})(\d{4}).*/,
          "$1-$2-$3"
        );
      } else if (onlyNums.length === 11) {
        // 3-4-4 형식
        formattedInput = onlyNums.replace(
          /^(\d{3})(\d{4})(\d{4}).*/,
          "$1-$2-$3"
        );
      }
    }
    setAdminPhone(formattedInput || onlyNums); // 형식이 지정되지 않은 경우 원래 숫자 문자열을 사용합니다.
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const AddBin = async () => {
    setIsAdding(true);

    try {
      const formData = {
        sidoName: sidoName,
        guName: guName,
        roadName: roadName,
        detailLocation: detailLocation,
        roadAddress: roadAddress,
        latitude: latitude,
        longitude: longitude,
        placeType: placeType,
        trashType: trashType,
        form: form,
        installYear: installYear,
        adminName: adminName,
        adminPhone: adminPhone,
        Actions: "add",
      };

      const jsonString = JSON.stringify(formData);

      // 서버 엔드포인트 URL 설정
      const apiUrl2 = "https://findbin.uiharu.dev/app/api/admin/api.php";

      // Axios를 사용하여 POST 요청 보내기
      const respone = await axios.post(apiUrl2, jsonString, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // 오류 처리
      console.error("AppMain: ", error);
      if (isNetworkError(error.message)) {
        // 네트워크 오류가 발생한 경우 토스트 메시지를 표시
        handleNetworkError();
      }
      setIsAdding(false);
      return null;
    }
    fetchData("AllList");

    setSidoName("");
    setGuName("");
    setRoadName("");
    setDetailLocation("");
    setRoadAddress("");
    setLatitude("");
    setLongitude("");
    setPlaceType("");
    setTrashType("");
    setFormseState("");
    setInstallYear("");
    setAdminName("");
    setAdminPhone("");
    setIsAdding(false);
    setModalVisible(false);
  };

  const handleDelete = async (id, road_address) => {
    setIsAdding(true);

    try {
      const formData = {
        Actions: "remove",
        id: id.toString(),
        road_address: road_address,
      };

      const jsonString = JSON.stringify(formData);

      // 서버 엔드포인트 URL 설정
      const apiUrl2 = "https://findbin.uiharu.dev/app/api/admin/api.php";

      // Axios를 사용하여 POST 요청 보내기
      const respone = await axios.post(apiUrl2, jsonString, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // 오류 처리
      console.error("AppMain: ", error);
      if (isNetworkError(error.message)) {
        // 네트워크 오류가 발생한 경우 토스트 메시지를 표시
        handleNetworkError();
      }
      setIsAdding(false);
      return null;
    }
    fetchData("AllList");

    setIsAdding(false);
  };

  const MapMove = async (latitude, longitude) => {
    const newLocation = {
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: currentRegion.latitudeDelta,
      longitudeDelta: currentRegion.longitudeDelta,
    };
    setShowTable(!showTable);
    // 현재 위치 정보를 설정합니다.
    setLocation(newLocation);
    setCurrentRegion(newLocation);

    mapRef.animateToRegion(newLocation, 1000);
  };

  const dynamicStyles = {
    toast: {
      color: stateMode ? "#000000" : "#ffffff",
    },
    // 지도 + - > 표시 버튼
    iconColor: {
      color: stateMode ? "#ffffff" : "#000000",
    },
    safeArea: {
      flex: 1,
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    // 모달의 스타일을 동적으로 설정
    modalStyle: {
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    modalText: {
      color: stateMode ? "#ffffff" : "#000000",
    },
    container: {
      backgroundColor: stateMode ? "#000000" : "#ffffff",
      flex: 1,
      padding: 16,
      height: "auto",
    },
    categoryButton: {
      marginBottom: 12,
    },
    categoryInput: {
      borderWidth: 1, // 경계선을 추가합니다.
      borderColor: stateMode ? "#fff" : "#000000", // 경계선 색상을 설정합니다.
      borderRadius: 4, // 경계선의 반경을 설정합니다.
      paddingHorizontal: 8, // 좌우 패딩을 추가합니다.
      paddingVertical: 4, // 상하 패딩을 추가합니다.
      height: 50,
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    input: {
      marginBottom: 12,
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    button: {
      marginBottom: 12,
      backgroundColor: "#6200ea",
    },
    imagesContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    modal: {
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    imageContainer: {
      position: "relative",
      marginRight: 8,
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    icon: {
      position: "absolute",
      top: -10,
      right: -10,
      backgroundColor: "transparent",
    },
    footer: {
      flex: 1,
      justifyContent: "flex-end",
      marginBottom: 16,
    },
    submitButton: {
      backgroundColor: "#6200ea",
    },
    IosText: {
      fontSize: 17,
    },
    AndroidText: {
      fontSize: 15,
    },
    //지도 + - > 표시 배경 화면 버튼
    buttonContainer: {
      position: "absolute",
      top: "5%",
      right: "2%",
      backgroundColor: stateMode ? "#5d5d5d" : "#ffffff",
      borderRadius: 8,
      padding: 8,
    },
    mapbutton: {
      marginVertical: 4,
      padding: 10,
      alignItems: "center",
    },
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
    },
    searchBar: {
      flexDirection: "row",
      marginBottom: 10,
      alignItems: "center",
      backgroundColor: stateMode ? "#000" : "#fff",
    },
    input: {
      flex: 1,
      borderWidth: 1,
      marginRight: 10,
      paddingLeft: 10,
      borderRadius: 5,
      marginVertical: 10,
      color: stateMode ? "#ffffff" : "#000000",
      borderColor: stateMode ? "#ffffff" : "#808080",
    },
    ModalInput: {
      height: 40,
      borderColor: "gray",
      borderWidth: 1,
      marginBottom: 10,
      paddingLeft: 10,
      color: stateMode ? "#ffffff" : "#000000",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    textContainer: {
      flexDirection: "row",
      marginBottom: 10,
    },
    textLabel: {
      fontWeight: "bold",
    },
    markerText: {
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      padding: 2,
      borderRadius: 5,
      width: 100,
      height: 30,
      textAlign: "center",
      verticalAlign: "middle",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 10,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="검색어를 입력하세요"
          editable={!loading}
          placeholderTextColor={stateMode ? "#ffffff" : "#000000"}
        />
        <Button
          mode="contained"
          buttonColor="#00BCD4"
          textColor="blue"
          onPress={handleSearch}
          disabled={loading}
        >
          검색
        </Button>
      </View>
      <Button
        mode="contained"
        buttonColor="#00BCD4"
        textColor="blue"
        onPress={() => setShowTable(!showTable)}
      >
        {showTable ? "표 접기" : "표 펼치기"}
      </Button>
      <ScrollView>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>로딩 중...</Text>
          </View>
        ) : (
          showTable && (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title style={{ flex: 5 }}>
                  <Text style={{ color: stateMode ? "#ffffff" : "#000000" }}>
                    주소
                  </Text>
                </DataTable.Title>
                <DataTable.Title numeric style={{ flex: 3 }}>
                  <Text style={{ color: stateMode ? "#ffffff" : "#000000" }}>
                    관리자 번호
                  </Text>
                </DataTable.Title>
                <DataTable.Title numeric style={{ flex: 2 }}>
                  <Text style={{ color: stateMode ? "#ffffff" : "#000000" }}>
                    삭제
                  </Text>
                </DataTable.Title>
              </DataTable.Header>
              {results.map((result, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell
                    style={{
                      flex: 6,
                      color: stateMode ? "#ffffff" : "#000000",
                    }}
                  >
                    <ScrollView horizontal>
                      <TouchableOpacity
                        onPress={() =>
                          MapMove(result.latitude, result.longitude)
                        }
                      >
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            maxWidth: 200,
                            color: stateMode ? "#ffffff" : "#000000",
                          }}
                        >
                          {result.road_address.length > 17
                            ? `${result.road_address.substring(0, 14)}...`
                            : result.road_address}
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </DataTable.Cell>
                  <DataTable.Cell
                    numeric
                    style={{
                      flex: 3,
                      marginRight: 5,
                    }}
                  >
                    <Text style={{ color: stateMode ? "#ffffff" : "#000000" }}>
                      {result.admin_phone}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1 }}>
                    <TouchableOpacity
                      onPress={() =>
                        handleDelete(result.id, result.road_address)
                      }
                    >
                      <Text style={{ color: stateMode ? "#ffffff" : "red" }}>
                        {" "}
                        삭제
                      </Text>
                    </TouchableOpacity>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  buttonColor="#00BCD4"
                  textColor="blue"
                  onPress={() => setPageno((prev) => Math.max(prev - 1, 1))}
                  disabled={pageno === 1}
                >
                  이전
                </Button>
                <Button
                  mode="contained"
                  buttonColor="#00BCD4"
                  textColor="blue"
                  onPress={() => setPageno((prev) => prev + 1)}
                  disabled={lastPage}
                >
                  다음
                </Button>
              </View>
            </DataTable>
          )
        )}
        <View
          style={{ height: 350, marginTop: 10, alignItems: "center" }}
          onLayout={onMapReady}
        >
          <MapView
            ref={(ref) => setMapRef(ref)}
            style={{ width: "100%", height: "100%" }}
            userInterfaceStyle={stateMode ? "dark" : "light"}
            customMapStyle={stateMode ? darkMapStyle : []}
            mapType={
              Platform.OS === "android"
                ? "standard"
                : useOpenStreetMap
                ? "none"
                : "standard"
            }
            initialRegion={{
              latitude: 37.541,
              longitude: 126.986,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onMapReady={onMapReady}
            onPress={addMarker}
          >
            {useOpenStreetMap && (
              <UrlTile urlTemplate={osmTileUrl} maximumZ={19} />
            )}
            {markers.map((marker, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                ref={markerRefs.current[index]}
                onPress={openModal}
              >
                <TouchableOpacity style={{ alignItems: "center" }}>
                  <Text style={styles.markerText}>쓰레기통 추가</Text>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: "red",
                      borderRadius: 5,
                    }}
                  />
                </TouchableOpacity>
              </Marker>
            ))}
          </MapView>
          <View style={{ ...dynamicStyles.buttonContainer }}>
            <TouchableOpacity
              style={dynamicStyles.mapButton}
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
              style={dynamicStyles.mapButton}
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
              <Ionicons
                name="remove"
                size={24}
                style={dynamicStyles.iconColor}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.mapButton}
              onPress={async () => {
                const { status } =
                  await Location.requestForegroundPermissionsAsync();
                const useGPS = await AsyncStorage.getItem("useGPS");
                if (status !== "granted") {
                  Toast.show({
                    text1: "위치 권한이 없어 현재 위치로 이동할 수 없습니다.",
                  });
                } else {
                  if (useGPS === "true") {
                    const { coords } = await Location.getCurrentPositionAsync({
                      accuracy: Location.Accuracy.Lowest,
                    });

                    const newLocation = {
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                      latitudeDelta: currentRegion.latitudeDelta,
                      longitudeDelta: currentRegion.longitudeDelta,
                    };

                    // 현재 위치 정보를 설정합니다.
                    setLocation(newLocation);
                    setCurrentRegion(newLocation);

                    mapRef.animateToRegion(newLocation, 1000);
                  } else if (status === "granted" && useGPS === "false") {
                    Toast.show({
                      text1:
                        "위치 정보를 사용할 수 없습니다. 설정을 확인하세요.",
                    });
                  }
                }
              }}
            >
              <Ionicons
                name="navigate"
                size={24}
                style={dynamicStyles.iconColor}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Modal visible={isModalVisible}>
          <ScrollView style={{ margin: 20 }}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.ModalInput}
                placeholder="sido_name"
                value={sidoName}
                onChangeText={setSidoName}
              />
              <TextInput
                style={styles.ModalInput}
                placeholder="gu_name"
                value={guName}
                onChangeText={setGuName}
              />
              <TextInput
                style={styles.ModalInput}
                placeholder="road_name"
                value={roadName}
                onChangeText={setRoadName}
              />
              <TextInput
                style={styles.ModalInput}
                placeholder="detail_location(선택사항)"
                value={detailLocation}
                onChangeText={setDetailLocation}
              />
              <TextInput
                style={styles.ModalInput}
                placeholder="road_address"
                value={roadAddress}
                onChangeText={setRoadAddress}
              />
              <View style={styles.textContainer}>
                <Text style={styles.textLabel}>Latitude: </Text>
                <Text style={styles.textValue}>{latitude}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.textLabel}>Longitude: </Text>
                <Text style={styles.textValue}>{longitude}</Text>
              </View>
              <TextInput
                style={styles.ModalInput}
                placeholder="place_type"
                value={placeType}
                onChangeText={setPlaceType}
              />
              <TextInput
                style={styles.ModalInput}
                placeholder="trash_type"
                value={trashType}
                onChangeText={setTrashType}
              />
              <TextInput
                style={styles.ModalInput}
                placeholder="form"
                value={form}
                onChangeText={setForm}
              />
              <TextInput
                style={styles.ModalInput}
                placeholder="install_year"
                value={installYear}
                onChangeText={setInstallYear}
              />
              <TextInput
                style={styles.ModalInput}
                placeholder="admin_name"
                value={adminName}
                onChangeText={setAdminName}
              />
              <TextInput
                style={styles.ModalInput}
                placeholder="admin_phone"
                value={adminPhone}
                onChangeText={handleInputChange}
                keyboardType="numeric"
                maxLength={13}
              />
              <Button onPress={AddBin} disabled={isAdding}>
                추가
              </Button>
              <Button onPress={closeModal} disabled={isAdding}>
                닫기
              </Button>
            </View>
          </ScrollView>
        </Modal>
        <Toast
          style={dynamicStyles.toast}
          textStyle={{ color: dynamicStyles.toast.color }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
