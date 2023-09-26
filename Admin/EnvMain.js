import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Button, Modal, Dimensions, Image, TouchableWithoutFeedback, SafeAreaView } from 'react-native';
import { Card, Text } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function EnvMain() {
    const [posts, setPosts] = useState([]);
    const [pageno, setPageno] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [fullImage, setFullImage] = useState(false);
    const [lastPage, setLastPage] = useState(false);

    const toggleImageSize = () => {
        setFullImage(!fullImage);
    };

    const fetchData = async () => {
        const Affiliation1 = await AsyncStorage.getItem('Affiliation1');
        const Affiliation2 = await AsyncStorage.getItem('Affiliation2');
        const UserName = await AsyncStorage.getItem('UserName');
        const AccountID = await AsyncStorage.getItem('AccountID');

        const requestData = {
            Affiliation1,
            Affiliation2,
            UserName,
            AccountID,
            pageno,
        };

        let response;
        try {
            response = await axios.post('https://findbin.uiharu.dev/app/api/inquiry/inquiry.php', requestData);
            if (response.data.StatusCode === 200) {
                setPosts(response.data.inquiries);
            }
        } catch (error) {
            console.error('API 요청 오류:', error);
        }

        if (response?.data?.inquiries?.length === 0) {
            setLastPage(true);
        } else {
            setLastPage(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pageno]);

    const openModal = (post) => {
        setSelectedPost(post);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const renderItem = ({ item }) => (
        <TouchableWithoutFeedback onPress={() => openModal(item)}>
            <Card containerStyle={styles.cardContainer}>
                <Card.Title>{item.Category}</Card.Title>
                <Card.Divider />
                <View style={styles.cardContent}>
                    <Text style={styles.cardText}>{item.Contents}</Text>
                    <Text style={styles.cardDate}>{item.WriteDate}</Text>
                    <View style={styles.imagePreviewContainer}>
                        {item.Filepath?.split(',').filter(url => url.trim() !== '').map((url, index) => (
                            <TouchableWithoutFeedback key={index} onPress={() => toggleImageSize(url)}>
                                <Image
                                    style={{ width: 50, height: 50, marginRight: 10 }}
                                    source={{ uri: url }}
                                />
                            </TouchableWithoutFeedback>
                        ))}
                    </View>
                </View>
            </Card>
        </TouchableWithoutFeedback>
    );


    const { width, height } = Dimensions.get('window');
    const imageWidth = fullImage ? width * 0.8 : width - 40;
    const imageHeight = fullImage ? height * 0.8 : (width - 40) * 0.75;

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
            <View style={styles.buttonContainer}>
                <Button title="이전" onPress={() => setPageno(prev => Math.max(prev - 1, 1))} disabled={pageno === 1} />
                <Button title="다음" onPress={() => setPageno(prev => prev + 1)} disabled={lastPage} />
            </View>
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{selectedPost?.Category}</Text>
                    <Text style={styles.modalText}>{selectedPost?.Contents}</Text>
                    <Text style={styles.modalDate}>{selectedPost?.WriteDate}</Text>
                    {selectedPost?.Filepath && (
                        <View style={styles.imagePreviewContainer}>
                            {selectedPost?.Filepath.split(',').filter(url => url.trim() !== '').map((url, index) => (
                                <TouchableWithoutFeedback key={index} onPress={() => toggleImageSize(url)}>
                                    <Image
                                        style={[
                                            { width: imageWidth, height: imageHeight },
                                            fullImage ? styles.fullImage : null
                                        ]}
                                        source={{ uri: url }}
                                    />
                                </TouchableWithoutFeedback>
                            ))}
                        </View>
                    )}
                    <Button title="닫기" onPress={closeModal} />
                </View>
            </Modal>
            {fullImage && (
                <View style={styles.fullImageView}>
                    <TouchableWithoutFeedback onPress={toggleImageSize}>
                        <Image
                            style={{ width: width * 0.8, height: height * 0.8 }}
                            source={{ uri: selectedPost?.Filepath }}
                        />
                    </TouchableWithoutFeedback>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    cardContainer: {
        borderRadius: 10,
    },
    cardContent: {
        flex: 1,
        flexDirection: 'column',
    },
    cardText: {
        marginBottom: 10,
    },
    cardDate: {
        textAlign: 'right',
        fontStyle: 'italic',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    modalContainer: {
        margin: 20,
        marginTop: 50,
    },
    fullImageView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        zIndex: 3,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
    },
    modalDate: {
        fontSize: 16,
        fontStyle: 'italic',
        marginBottom: 20,
    },
    imagePreviewContainer: {
        flexDirection: 'row',  // 가로로 이미지를 정렬
    },
});