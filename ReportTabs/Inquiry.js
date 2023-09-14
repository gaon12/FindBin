import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, SafeAreaView, Animated, TouchableWithoutFeedback, Keyboard, Text, ScrollView } from 'react-native';
import { TextInput, Button, Portal, Dialog, RadioButton, Provider, Paragraph } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import Collapsible from 'react-native-collapsible';
import MapView, { Marker } from 'react-native-maps';
import Toast from "react-native-toast-message";

// 분류명/시도/시군구/위도/경도/내용/이메일/이미지(선택3개까지)
/*
{
    Affiliation1:
    Affiliation2:
    Latitude:
    Longitude:
    Category:
    Contests:
    Email:
    file:
}
*/

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

export default function App() {
    const [category, setCategory] = useState('');
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

    const mapRef = useRef(null);
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
            const Address = `${data.address.city || ''} ${data.address.borough || ''} ${data.address.suburb || ''} ${data.address.road || ''}`;


            return Address;
        } catch (error) {
            console.error('API 요청 중 오류 발생:', error);
            return null; // 오류 시 null을 반환하거나 다른 처리를 수행할 수 있습니다.
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
    };

    return (
        <Provider>
            <SafeAreaView style={styles.safeArea}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView>
                        <View style={styles.container}>
                            <TouchableOpacity onPress={showDialog} style={styles.categoryButton}>
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
                                <Button mode="contained" onPress={submitForm} style={styles.submitButton}>
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

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
        height: 'auto',
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
        alignItems: 'center',
        justifyContent: 'center',
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
        top: -110,
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
    IosText: {
        fontSize: 17,
    },
    AndroidText: {
        fontSize: 15,
    },
});