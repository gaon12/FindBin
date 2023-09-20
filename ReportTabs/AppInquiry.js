import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, SafeAreaView, Animated, TouchableWithoutFeedback, Keyboard, Text } from 'react-native';
import { TextInput, Button, Portal, Dialog, RadioButton, Provider, Paragraph } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Dialog as IOSDialog, CheckBox } from '@rneui/themed';
import Toast from "react-native-toast-message";
import axios from 'axios';

// 스타일 임포트
import styles from './AppInquiryStyle';


/*
    {
        Category:
        Contents:
        Email:
        file:
    }
*/

// 분류(카테고리)
const CATEGORIES = [
    { value: 'bug', label: '앱 버그 보고' },
    { value: 'improve', label: '서비스 개선사항 건의' },
];

const getCategoryLabel = (value) => {
    const category = CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : '';
};

// 분류(카테고리)

export default function AppInquiry() {
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [email, setEmail] = useState('');
    const [images, setImages] = useState([]);
    const [visible, setVisible] = useState(false);
    const [theme, setTheme] = useState("light"); // 라이트 모드가 기본값
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [visible5, setVisible5] = useState(false);
    const [checked, setChecked] = useState(null);

    const toggleDialog5 = () => {
        setVisible5(!visible5);
    };

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

    const submitForm = async () => {
        setIsSubmitting(true);

        // 여기에 제출 로직 추가${data.address.city || ''} ${data.address.borough || ''}
        if (category == "bug") {
            var RealCategory = "앱 버그 보고";
        }
        else if (category == "improve") {
            var RealCategory = "서비스 개선사항 건의";
        }
        try {
            // 이미지 업로드 결과를 저장할 배열
            const fileUrls = [];

            // 서버 엔드포인트 URL 설정
            const imageapiUrl = 'https://findbin.uiharu.dev/app/api/AppInquiry/img.php';
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
            console.log(fileUrls);

            const formData = {
                Category: RealCategory,
                Contents: content,
                Email: email,
                file1: fileUrls.length > 0 ? fileUrls[0] : '',
                file2: fileUrls.length > 0 ? fileUrls[1] : '',
                file3: fileUrls.length > 0 ? fileUrls[2] : ''
            };

            const jsonString = JSON.stringify(formData);

            // 서버 엔드포인트 URL 설정
            const apiUrl2 = 'https://findbin.uiharu.dev/app/api/AppInquiry/api.php';

            // Axios를 사용하여 POST 요청 보내기
            const response = await axios.post(apiUrl2, jsonString, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log(fileUrls);

            // 원하는 서버 응답 처리 로직을 추가하세요.
            setCategory(null);
            setContent('');
            setEmail('');
            setImages([]);
            // Toast 메시지 표시 (제출 성공 여부에 따라 다른 메시지 출력 가능)
            Toast.show({
                text1: "제출이 완료되었습니다.",
            });
        } catch (error) {
            console.log(error);
            // Toast 메시지 표시 (제출 실패 메시지)
            Toast.show({
                text1: "제출에 실패하였습니다. 다시 시도해주세요.",
            });
        } finally {
            // 작업이 완료되면 제출 상태를 다시 활성화
            setIsSubmitting(false);
        }
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
        },
        iconColor: {
            color: theme === "dark" ? "#ffffff" : "#000000",
        },
    };

    return (
        <Provider>
            <SafeAreaView style={styles.safeArea}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                            <Button
                                onPress={submitForm}
                                disabled={isSubmitting}
                                style={styles.submitButton}
                                mode="contained" // isSubmitting이 true이면 버튼을 비활성화
                            >제출</Button>
                        </View>
                        <Toast
                            style={dynamicStyles.toast}
                            textStyle={{ color: dynamicStyles.toast.color }}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </Provider>
    );
}
