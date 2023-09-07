import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, SafeAreaView, Animated, TouchableWithoutFeedback, Keyboard, Text } from 'react-native';
import { TextInput, Button, Portal, Dialog, RadioButton, Provider, Paragraph } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';

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
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [email, setEmail] = useState('');
    const [images, setImages] = useState([]);
    const [visible, setVisible] = useState(false);
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [markers, setMarkers] = useState([]);
    const [canAddMarker, setCanAddMarker] = useState(true);
    const [theme, setTheme] = useState("light");
    const [koreanAddress, setkoreanAddress] = useState("");

    const hideDialog = () => setVisible(false);

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

    const submitForm = () => {
        // 여기에 제출 로직 추가
    };

    const [labelAnim] = useState(new Animated.Value(1)); // 애니메이션 값 상태를 추가합니다.

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


    const dynamicStyles = {
        toast: {
            backgroundColor: theme === "dark" ? "#333333" : "#ffffff",
            color: theme === "dark" ? "#ffffff" : "#000000",
        }
    };

    // 지도 모달 열기
    const showMapModal = async () => {
        setMapModalVisible(true);
    };

    const showToastMessage = (message) => {
        Toast.show({
            type: 'info',
            position: 'bottom',
            text1: message,
            visibilityTime: 2000, // 2초 동안 보이게 설정
        });
    };

    const addMarker = async (event) => {
        if (!canAddMarker) {
            showToastMessage('2초 후에 다시 시도해주세요.');
            return;
        }

        const { latitude, longitude } = event.nativeEvent.coordinate;
        const newMarker = { latitude, longitude };
        setMarkers([newMarker]);

        // 역지오코딩 API 요청을 보내서 주소 정보 가져오기
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
            const Address = `${data.address.country} ${data.address.city} ${data.address.borough} ${data.address.suburb} ${data.address.road}`;


            setkoreanAddress(Address); // 주소 정보를 설정합니다.

        } catch (error) {
            console.error('API 요청 중 오류 발생:', error);
            showToastMessage('주소 정보를 가져올 수 없습니다.');
        }

        setCanAddMarker(false);
        setTimeout(() => {
            setCanAddMarker(true);
        }, 2000);
    };


    // 모달 닫기
    const hideMapModal = () => {
        // 지도 모달을 닫기 위해 상태 변경
        setMapModalVisible(false);
    };
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('위치 권한을 허용해주세요.');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const userLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            setMarkers([userLocation]);
        })();
    }, []);

    // 서울시청의 좌표를 설정
    const seoulCityHallLocation = {
        latitude: 37.5665,
        longitude: 126.9780,
    };

    useEffect(() => {
        // 시청 좌표를 markers에 추가하여 시청을 먼저 표시
        setMarkers([seoulCityHallLocation]);

        // 사용자의 현재 위치를 가져오고, 가져온 위치를 setUserLocation으로 설정
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('위치 권한을 허용해주세요.');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const userLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        })();
    }, []);

    return (
        <Provider>
            <SafeAreaView style={styles.safeArea}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        <TouchableOpacity onPress={showDialog} style={styles.categoryButton}>
                            <View style={styles.categoryInput}>
                                <Animated.Text style={labelStyle}>
                                    {"분류"}
                                </Animated.Text>
                                {category &&
                                    <Text style={{ fontSize: 16, color: '#000', position: 'absolute', top: 22, left: 10 }}>
                                        {getCategoryLabel(category)}
                                    </Text>
                                }
                            </View>
                        </TouchableOpacity>

                        <Portal>
                            <Dialog visible={visible} onDismiss={hideDialog}>
                                <Dialog.Title>분류 선택</Dialog.Title>
                                <Dialog.Content>
                                    <RadioButton.Group onValueChange={setCategory} value={category}>
                                        {CATEGORIES.map(cat => (
                                            <RadioButton.Item key={cat.value} label={cat.label} value={cat.value} />
                                        ))}
                                    </RadioButton.Group>
                                </Dialog.Content>
                                <Dialog.Actions>
                                    <Button onPress={hideDialog}>완료</Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>

                        <Button icon="map" mode="contained" onPress={showMapModal} style={styles.button}>
                            지도로 주소 찾기
                        </Button>

                        <Portal>
                            <Dialog visible={mapModalVisible} onDismiss={hideMapModal} style={styles.dialog}>
                                <Dialog.Title>지도로 주소 찾기</Dialog.Title>
                                <Dialog.Content style={styles.dialogContent}>
                                    <MapView
                                        style={{ width: '100%', height: 300 }}
                                        initialRegion={{
                                            latitude: markers.length > 0 ? markers[0].latitude : seoulCityHallLocation.latitude,
                                            longitude: markers.length > 0 ? markers[0].longitude : seoulCityHallLocation.longitude,
                                            latitudeDelta: 0.01,
                                            longitudeDelta: 0.01,
                                        }}
                                        onPress={(event) => addMarker(event)}
                                    >
                                        {markers.map((marker, index) => (
                                            <Marker
                                                key={index}
                                                coordinate={marker}
                                            >
                                                <Callout>
                                                    <Text>뭐넣지</Text>
                                                </Callout>
                                            </Marker>
                                        ))}
                                    </MapView>
                                </Dialog.Content>
                                <Text>{koreanAddress}</Text>
                                <Dialog.Actions>
                                    <Text>{markers[0] && `위도: ${markers[0].latitude}, 경도: ${markers[0].longitude}`}</Text>
                                    <Button onPress={hideMapModal}>저장</Button>
                                </Dialog.Actions>
                                <Toast
                                    style={dynamicStyles.toast}
                                    textStyle={{ color: dynamicStyles.toast.color }}
                                    text1="Hello, World!"
                                />
                            </Dialog>
                        </Portal>

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
                            <Button mode="contained" onPress={submitForm} style={styles.submitButton}>
                                제출
                            </Button>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </Provider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    categoryButton: {
        marginBottom: 12,
    },

    categoryInput: {
        backgroundColor: '#fff',
        borderWidth: 1, // 경계선을 추가합니다.
        borderColor: '#6200ea', // 경계선 색상을 설정합니다.
        borderRadius: 4, // 경계선의 반경을 설정합니다.
        paddingHorizontal: 8, // 좌우 패딩을 추가합니다.
        paddingVertical: 4, // 상하 패딩을 추가합니다.
        height: 50,
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 150,
    },
    button: {
        marginBottom: 12,
        backgroundColor: '#6200ea',
    },
    imagesContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    imageContainer: {
        position: 'relative',
        marginRight: 8,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    icon: {
        position: 'absolute',
        top: -10,
        right: -10,
    },
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 16,
    },
    submitButton: {
        backgroundColor: '#6200ea',
    },
    dialog: {
        width: '85%',
        height: 550,
    },
    dialogContent: {
        width: '100%',
        height: 400,
    },
});
