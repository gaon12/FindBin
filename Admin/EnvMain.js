import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Button, Modal, Dimensions, Image, TouchableWithoutFeedback, SafeAreaView, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function EnvMain() {
    const [posts, setPosts] = useState([]);
    const [pageno, setPageno] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [lastPage, setLastPage] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [currentFullImageUrl, setCurrentFullImageUrl] = useState(null);

    const toggleImageSize = (url) => {
        setCurrentFullImageUrl(url);
        setShowFullImage(true);
    };

    const shortenRegionNameSplit = (regionName) => {
        const suffixes = ['특별', '광역시', '도', '시'];

        for (const suffix of suffixes) {
            const parts = regionName.split(suffix);
            if (parts.length > 1) {
                return parts[0];
            }
        }

        return regionName;
    }

    const fetchData = async (checkNextPage = false) => {
        const Affiliation1 = shortenRegionNameSplit(await AsyncStorage.getItem('Affiliation1'));
        var Affiliation2 = await AsyncStorage.getItem('Affiliation2');
        if (Affiliation2 && Affiliation2.endsWith('청')) {
            Affiliation2 = '';
        }
        const UserName = await AsyncStorage.getItem('UserName');
        const AccountID = await AsyncStorage.getItem('AccountID');
        const requestData = {
            Affiliation1,
            Affiliation2,
            UserName,
            AccountID,
            pageno: checkNextPage ? pageno + 1 : pageno,
        };
    
        let response;
        try {
            response = await axios.post('https://findbin.uiharu.dev/app/api/inquiry/inquiry.php', requestData);
            if (response.data.StatusCode === 200) {
                if (checkNextPage) {
                    setLastPage(response.data.inquiries.length === 0);
                } else {
                    setPosts(response.data.inquiries);
                }
            }
        } catch (error) {
            console.error('API 요청 오류:', error);
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
        setShowFullImage(false);  // 모달을 닫을 때 이미지 확대 상태도 초기화
    };

    const openModalWithImage = (post, url) => {
        setSelectedPost(post);
        setModalVisible(true);
        toggleImageSize(url);
    };
    
    const renderItem = ({ item }) => (
        <SafeAreaView>
        <ScrollView>
        <TouchableWithoutFeedback onPress={() => openModal(item)}>
            <Card containerStyle={styles.cardContainer}>
                <Card.Title>{item.Category}</Card.Title>
                <Card.Divider />
                <View style={styles.cardContent}>
                    <Text style={styles.cardText}>{item.Contents}</Text>
                    <Text style={styles.cardDate}>{item.WriteDate}</Text>
                    <View style={styles.imagePreviewContainer}>
                        {item.Filepath?.split(',').filter(url => url.trim() !== '').map((url, index) => (
                            <TouchableWithoutFeedback key={index} onPress={() => openModalWithImage(item, url)}>
                                <Image
                                    style={styles.thumbnailImage}
                                    source={{ uri: url }}
                                />
                            </TouchableWithoutFeedback>
                        ))}
                    </View>
                </View>
            </Card>
        </TouchableWithoutFeedback>
        </ScrollView>
        </SafeAreaView>
    );    

    const { width, height } = Dimensions.get('window');

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
                    {showFullImage ? (
                        <TouchableWithoutFeedback onPress={() => setShowFullImage(false)}>
                            <Image
                                style={{ width: width * 0.8, height: height * 0.8 }}
                                source={{ uri: currentFullImageUrl }}
                            />
                        </TouchableWithoutFeedback>
                    ) : (
                        <SafeAreaView>
                        <ScrollView>
                            <Text style={styles.modalTitle}>{selectedPost?.Category}</Text>
                            <Text style={styles.modalText}>{selectedPost?.Contents}</Text>
                            <Text style={styles.modalDate}>{selectedPost?.WriteDate}</Text>
                            {selectedPost?.Filepath && (
                                <View style={styles.imagePreviewContainer}>
                                    {selectedPost?.Filepath.split(',').filter(url => url.trim() !== '').map((url, index) => (
                                        <TouchableWithoutFeedback key={index} onPress={() => toggleImageSize(url)}>
                                            <Image
                                                style={styles.thumbnailImage}
                                                source={{ uri: url }}
                                            />
                                        </TouchableWithoutFeedback>
                                    ))}
                                </View>
                            )}
                        </ScrollView>
                        </SafeAreaView>
                    )}
                    <Button title="닫기" onPress={closeModal} />
                </View>
            </Modal>
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
        flex: 1,
        margin: 20,
    },
    imagePreviewContainer: {
        flexDirection: 'column',  // 세로로 배열
    },
    imageRow: {
        flexDirection: 'row',  // 가로로 이미지를 정렬
        alignItems: 'center',  // 센터 정렬
    },
    imagePreviewText: {
        marginBottom: 10,  // 텍스트와 이미지 사이의 간격
    },
    thumbnailImage: {
        width: 70,
        height: 70,
        marginRight: 10,  // 이미지와 이미지 사이의 간격
    },
    fullImageView: {
        flex: 1,
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
    IosModalDetail: {
        marginTop: 500,
    }
});