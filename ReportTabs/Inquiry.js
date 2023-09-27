import React, { useState, useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, SafeAreaView, Animated, TouchableWithoutFeedback, Keyboard, Text, ScrollView } from 'react-native';
import { TextInput, Button, Portal, Dialog, RadioButton, Provider, Paragraph } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import Collapsible from 'react-native-collapsible';
import MapView, { Marker } from 'react-native-maps';
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { Dialog as IOSDialog, CheckBox } from '@rneui/themed';

// 스타일 임포트
import styles from './InquiryStyle';

// 분류(카테고리)
const CATEGORIES = [
    { value: 'add', label: '공공 쓰레기통 목록 추가' },
    { value: 'nothing', label: '공공 쓰레기통 미존재' },
    { value: 'fullfix', label: '쓰레기통 비워주세요 / 관리가 필요해요' },
];

const getCategoryLabel = (value) => {
    const category = CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : '';
};

// 분류(카테고리)

export default function Inquiry() {
    const seoulCityHall = {
        latitude: 37.5665,
        longitude: 126.978,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };
    const [location, setLocation] = useState(seoulCityHall);
    const [content, setContent] = useState('');
    const [email, setEmail] = useState('');
    const [images, setImages] = useState([]);
    const [visible, setVisible] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [mapInitialized, setMapInitialized] = useState(false);
    const [koreanAddress, setKoreanAddress] = useState('');
    const [markers, setMarkers] = useState([]);
    const [canAddMarker, setCanAddMarker] = useState(true);
    const [theme, setTheme] = useState("light"); // 라이트 모드가 기본값
    const [currentRegion, setCurrentRegion] = useState(seoulCityHall);
    const [mapRef, setMapRef] = useState(null);
    const hideDialog = () => setVisible(false);
    const [Affiliation1, setAffiliation1] = useState('');
    const [Affiliation2, setAffiliation2] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errorDialogVisible, setErrorDialogVisible] = useState(false);

    const showErrorDialog = () => setErrorDialogVisible(true);
    const hideErrorDialog = () => setErrorDialogVisible(false);

    const showDialog = () => {
        Keyboard.dismiss();
        setVisible(true);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
        });

        if (images.length >= 3) {
            showErrorDialog();
            return;
        }

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setImages([...images, uri]);
        }
    };

    const removeImage = (uri) => {
        setImages(images.filter(image => image !== uri));
    };

    const submitForm = async () => {
        setIsSubmitting(true);
        
        // 여기에 제출 로직 추가${data.address.city || ''} ${data.address.borough || ''}
        if (category == "add") {
            var RealCategory = "공공 쓰레기통 목록 추가";
        }
        else if (category == "nothing") {
            var RealCategory = "공공 쓰레기통 미존재";
        }
        else if (category == "fullfix") {
            var RealCategory = "쓰레기통 비워주세요 / 관리가 필요해요";
        }
        try {
            // 이미지 업로드 결과를 저장할 배열
            const fileUrls = [];

            // 서버 엔드포인트 URL 설정
            const imageapiUrl = 'https://findbin.uiharu.dev/app/api/inquiry/img.php';
            for (let i = 0; i < images.length; i++) {
                const filePath = images[i].replace('file://', '');
                const fileData = {
                    uri: images[i],
                    type: 'image/jpeg',
                    name: `${filePath.split('/').pop()}`,
                };

                const imageData = new FormData();
                imageData.append('image', fileData);

                try {
                    const imageresponse = await axios.post(imageapiUrl, imageData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    const fileUrl = imageresponse.data.fileUrl;
                    fileUrls.push(fileUrl);
                } catch (error) {
                    return null
                }
            }


            const formData = {
                Affiliation1: Affiliation1,
                Affiliation2: Affiliation2,
                Latitude: markers[0].latitude.toFixed(6),
                Longitude: markers[0].longitude.toFixed(6),
                Category: RealCategory,
                Contents: content,
                Email: email,
                file1: fileUrls.length > 0 ? fileUrls[0] : '',
                file2: fileUrls.length > 0 ? fileUrls[1] : '',
                file3: fileUrls.length > 0 ? fileUrls[2] : ''
            };

            const jsonString = JSON.stringify(formData);

            // 서버 엔드포인트 URL 설정
            const apiUrl2 = 'https://findbin.uiharu.dev/app/api/inquiry/api.php';

            // Axios를 사용하여 POST 요청 보내기
            await axios.post(apiUrl2, jsonString, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // 원하는 서버 응답 처리 로직을 추가하세요.
            setCategory(null);
            setContent('');
            setEmail('');
            setImages([]);
            setKoreanAddress('');
            setAffiliation1('');
            setAffiliation2('');
            setShowOptions(false);
            // Toast 메시지 표시 (제출 성공 여부에 따라 다른 메시지 출력 가능)
            Toast.show({
                text1: "제출이 완료되었습니다.",
            });
        } catch (error) {

            // Toast 메시지 표시 (제출 실패 메시지)
            Toast.show({
                text1: "제출에 실패하였습니다. 다시 시도해주세요.",
            });
        } finally {
            // 작업이 완료되면 제출 상태를 다시 활성화
            setIsSubmitting(false);
        }
    };

    const [visible5, setVisible5] = useState(false);
    const [checked, setChecked] = useState(null);
    const [category, setCategory] = useState(null);

    const toggleDialog5 = () => {
        setVisible5(!visible5);
    };

    const [labelAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        if (category) {
            Animated.timing(labelAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(labelAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }, [category]);

    const labelStyle = {
        fontSize: labelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [12, 16],
        }),
        top: labelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 14],
        }),
        color: labelAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['#6200ea', '#6200ea', '#000'],
        }),
        textAlignVertical: 'center',
    };

    const onMapReady = () => {
        setMapInitialized(true);
    };

    const getAddressFromCoordinates = async (latitude, longitude) => {
        const apiUrl = 'https://nominatim.openstreetmap.org/reverse';
        const format = 'json';

        try {
            const response = await fetch(
                `${apiUrl}?lat=${latitude}&lon=${longitude}&format=${format}`
            );

            if (!response.ok) {
                throw new Error('API 요청 실패');
            }

            const data = await response.json();
            var Address = `${data.address.province || ''} ${data.address.city || ''} ${data.address.county || ''} ${data.address.city_district || ''} ${data.address.village || ''}${data.address.borough || ''} ${data.address.suburb || ''} ${data.address.road || ''} ${data.address.amenity || ''}`.replace(/ +/g, ' ').trim();
            if (data.address.city == null) {
                var Address = "\n[E404] 현재 좌표 정보 부족.\n다른 좌표를 입력하세요.";
                return null;
            }
            setAffiliation1(`${data.address.province || ''} ${data.address.city || ''}`.replace(/ +/g, ' ').trim());
            setAffiliation2(`${data.address.county || ''} ${data.address.city_district || ''}${data.address.borough || ''}`.replace(/ +/g, ' ').trim());
            return Address;
        } catch (error) {
            return null; // 오류 시 null을 반환하거나 다른 처리를 수행할 수 있습니다.
        }
    };

    useEffect(() => {
        getCurrentLocation();
    }, [mapRef]); // mapRef를 dependency로 추가

    // CurrentRegion을 호출하여 최신의 현재 위치를 얻습니다.
    const CurrentRegion = () => {
        getCurrentLocation();
        return currentRegion;
    };

    const getCurrentLocation = async () => {
        const useGPS = await AsyncStorage.getItem('useGPS');
        if (useGPS === 'false') {
            Toast.show({
                text1: "위치 정보를 사용할 수 없습니다. 설정을 확인하세요.",
            });
        }

        const { coords } = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Lowest,
        });

        const initialRegion = {
            latitude: 37.5665,
            longitude: 126.978,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };

        if (useGPS === 'true') {
            const initialRegion = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            setLocation(initialRegion);
            setCurrentRegion(initialRegion);
        } else {
            Toast.show({ text1: "위치 정보를 사용할 수 없습니다. 설정을 확인하세요." });
        }

        if (mapRef) {
            mapRef.animateToRegion(initialRegion, 1000);
        }
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
            setKoreanAddress(address); // 주소 정보를 설정합니다.
        } else {
            showToastMessage('주소 정보를 가져올 수 없습니다.');
        }

        setCanAddMarker(false);
        setTimeout(() => {
            setCanAddMarker(true);
        }, 2000);
    };

    const dynamicStyles = {
        toast: {
            backgroundColor: theme === "dark" ? "#333333" : "#ffffff",
            color: theme === "dark" ? "#ffffff" : "#000000",
        },
        iconColor: {
            color: theme === "dark" ? "#ffffff" : "#000000",
        },
    };

    return (
        <Provider>
            <SafeAreaView style={styles.safeArea}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView>
                        <View style={styles.container}>
                            <TouchableOpacity onPress={() => Platform.OS === 'android' ? showDialog() : toggleDialog5()} style={styles.categoryButton}>
                                <View style={styles.categoryInput}>
                                    <Animated.Text style={labelStyle}>
                                        {"분류"} {/* 여기에서 value 값이 표시됩니다. */}
                                    </Animated.Text>
                                    {category &&
                                        <Text style={{ fontSize: 16, color: '#000', position: 'absolute', top: 22, left: 10 }}>
                                            {getCategoryLabel(category)}
                                        </Text>
                                    }
                                </View>
                            </TouchableOpacity>

                            {Platform.OS === 'android' ? ( // 안드로이드 플랫폼에서만 실행
                                <Portal>
                                    <Dialog visible={visible} onDismiss={hideDialog}>
                                        <Dialog.Title>분류 선택</Dialog.Title>
                                        <Dialog.Content>
                                            <RadioButton.Group
                                                onValueChange={value => {
                                                    setCategory(value);
                                                    hideDialog();
                                                }}
                                                value={category}
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <RadioButton.Item
                                                        key={cat.value}
                                                        label={cat.label}
                                                        value={cat.value}
                                                        position="leading"
                                                        labelStyle={{ textAlign: 'left', marginLeft: 10 }}
                                                    />
                                                ))}
                                            </RadioButton.Group>
                                        </Dialog.Content>
                                    </Dialog>
                                </Portal>
                            ) : ( // iOS 플랫폼에서 실행
                                <Portal>
                                    <IOSDialog isVisible={visible5} onBackdropPress={toggleDialog5}>
                                        <IOSDialog.Title title="분류 선택" />
                                        {CATEGORIES.map((cat, i) => (
                                            <CheckBox
                                                key={i}
                                                title={cat.label}
                                                containerStyle={{ backgroundColor: 'white', borderWidth: 0 }}
                                                checkedIcon="dot-circle-o"
                                                uncheckedIcon="circle-o"
                                                checked={checked === i}
                                                onPress={() => {
                                                    setChecked(i);
                                                    setCategory(cat.value);
                                                    toggleDialog5();
                                                }}
                                            />
                                        ))}
                                    </IOSDialog>
                                </Portal>
                            )}

                            <Button
                                onPress={() => setShowOptions(!showOptions)}
                                style={styles.button} mode="contained"
                                icon={"map"}
                            >
                                {`지도 ${showOptions ? '접기' : '펼치기'}`}
                            </Button>

                            <Collapsible collapsed={!showOptions}>
                                <View style={{ height: 350, alignItems: 'center' }} onLayout={onMapReady}>
                                    <MapView
                                        ref={(ref) => setMapRef(ref)}
                                        style={{ width: '100%', height: '100%' }}
                                        initialRegion={{
                                            latitude: 37.541,
                                            longitude: 126.986,
                                            latitudeDelta: 0.0922,
                                            longitudeDelta: 0.0421,
                                        }}
                                        onMapReady={onMapReady}
                                        onPress={addMarker}
                                    >
                                        {markers.map((marker, index) => (
                                            <Marker
                                                key={index}
                                                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                                                title={'신고위치'}
                                            />
                                        ))}

                                    </MapView>
                                </View>
                                <View
                                    style={{ ...styles.buttonContainer, ...dynamicStyles.buttonContainer }}
                                >
                                    <TouchableOpacity
                                        style={styles.mapButton}
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
                                        style={styles.mapButton}
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
                                        style={styles.mapButton}
                                        onPress={async () => {
                                            const { status } = await Location.requestForegroundPermissionsAsync();
                                            const useGPS = await AsyncStorage.getItem('useGPS');
                                            if (status !== "granted") {
                                                Toast.show({
                                                    text1: "위치 권한이 없어 현재 위치로 이동할 수 없습니다.",
                                                });
                                            } else {
                                                if (useGPS === 'true') {
                                                    const { coords } = await Location.getCurrentPositionAsync({
                                                        accuracy: Location.Accuracy.Lowest
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
                                                } else if (status === 'granted' && useGPS === 'false') {
                                                    Toast.show({
                                                        text1: "위치 정보를 사용할 수 없습니다. 설정을 확인하세요.",
                                                    });
                                                }
                                            }
                                        }}
                                    >
                                        <Ionicons name="navigate" size={24} style={dynamicStyles.iconColor} />
                                    </TouchableOpacity>
                                </View>
                            </Collapsible>
                            {koreanAddress && (
                                <>
                                    <Text style={Platform.OS === "ios" ? styles.IosText : styles.AndroidText}>• 주소: {koreanAddress}</Text>
                                    <Text style={Platform.OS === "ios" ? styles.IosText : styles.AndroidText}>• 위도: {markers[0].latitude.toFixed(6)}</Text>
                                    <Text style={Platform.OS === "ios" ? styles.IosText : styles.AndroidText}>• 경도: {markers[0].longitude.toFixed(6)}</Text>
                                </>
                            )}
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                label="내용"
                                mode="outlined"
                                multiline
                                numberOfLines={10}
                                value={content}
                                onChangeText={setContent}
                                theme={{ colors: { primary: '#6200ea' } }}
                            />

                            <TextInput
                                style={styles.input}
                                label="이메일"
                                mode="outlined"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                theme={{ colors: { primary: '#6200ea' } }}
                            />

                            <Button icon="camera" mode="contained" onPress={pickImage} style={styles.button}>
                                이미지 선택
                            </Button>

                            <Portal>
                                <Dialog visible={errorDialogVisible} onDismiss={hideErrorDialog}>
                                    <Dialog.Title>오류</Dialog.Title>
                                    <Dialog.Content>
                                        <Paragraph>최대 3장까지만 선택할 수 있습니다.</Paragraph>
                                    </Dialog.Content>
                                    <Dialog.Actions>
                                        <Button onPress={hideErrorDialog}>확인</Button>
                                    </Dialog.Actions>
                                </Dialog>
                            </Portal>

                            <View style={styles.imagesContainer}>
                                {images.map((image, index) => (
                                    <View key={index} style={styles.imageContainer}>
                                        <Image source={{ uri: image }} style={styles.image} />
                                        <TouchableOpacity onPress={() => removeImage(image)}>
                                            <MaterialIcons name="cancel" size={24} color="red" style={styles.icon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.footer}>
                                <Button mode="contained" onPress={submitForm} style={styles.submitButton} disabled={isSubmitting}>
                                    제출
                                </Button>
                            </View>
                            <Toast
                                style={dynamicStyles.toast}
                                textStyle={{ color: dynamicStyles.toast.color }}
                            />
                        </View>

                    </ScrollView>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </Provider>
    );
}
