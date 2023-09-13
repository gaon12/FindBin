import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, SafeAreaView, Animated, TouchableWithoutFeedback, Keyboard, Text } from 'react-native';
import { TextInput, Button, Portal, Dialog, RadioButton, Provider, Paragraph } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

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

export default function App() {
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [email, setEmail] = useState('');
    const [images, setImages] = useState([]);
    const [visible, setVisible] = useState(false);

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

    return (
        <Provider>
            <SafeAreaView style={styles.safeArea}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
});