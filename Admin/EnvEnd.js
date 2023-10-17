import React, { useState, useEffect, useRef } from 'react';
import {
    View, FlatList, StyleSheet, Button, Modal, Dimensions,
    Image, TouchableWithoutFeedback, SafeAreaView, ScrollView,
    TextInput, TouchableOpacity
} from 'react-native';
import { Card, Text } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { darkModeState } from "../dataState.js";
import { useRecoilState } from "recoil";

export default function AppMain() {
  const [posts, setPosts] = useState([]);
  const [answer, setAnswer] = useState('');
  const [pageno, setPageno] = useState(1);
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [lastPage, setLastPage] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [currentFullImageUrl, setCurrentFullImageUrl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [stateMode, setStateMode] = useRecoilState(darkModeState);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: stateMode ? "#000000" : "#ffffff",
  },
  cardContainer: {
    borderRadius: 10,
    backgroundColor: stateMode ? "#000000" : "#ffffff",
  },
  cardContent: {
    flex: 1,
    flexDirection: 'column',
  },
  cardText: {
    marginBottom: 10,
    color: stateMode ? "#ffffff" : "#000000",
  },
  cardDate: {
    textAlign: 'right',
    fontStyle: 'italic',
    color: stateMode ? "#ffffff" : "#000000",
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    margin: 20,
    backgroundColor: stateMode ? "#000000" : "#ffffff", 
    borderRadius: 10, 
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 20,  // padding 추가
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
    color: stateMode ? "#ffffff" : "#000000",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: stateMode ? "#ffffff" : "#000000",
  },
  modalDate: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 20,
    color: stateMode ? "#ffffff" : "#000000",
  },
  IosModalDetail: {
    marginTop: 500,
  },
  TextInput: {
    borderWidth: 0,  // borderWidth를 0으로 설정하여 테두리 제거
    height: 80,  // 높이 조절
    padding: 10,  // padding 추가
    backgroundColor: '#e0e0e0',  // 배경색을 약간의 회색으로 설정하여 입력 영역을 강조
    borderRadius: 5,  // 모서리를 둥글게
    marginBottom: 20,
    marginTop: 20,
    color: 'black',
  },
  answerImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    right: -10,
    top: -10,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  imageButton: {
    height: 30,
    justifyContent: 'center',
    backgroundColor: "gray",
    marginBottom: 10,
  },
  AnswerButton: {
    height: 30,
    justifyContent: 'center',
    backgroundColor: "red",
    marginBottom: 10,
  },
  closeButton: {
    height: 30,
    justifyContent: 'center',
    backgroundColor: "blue",
    marginTop: 50,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: 'gray', // 비활성화 상태일 때 배경색을 회색으로 설정
  },
  disabledButtonText: {
    color: 'white', // 비활성화 상태일 때 텍스트 색상을 흰색으로 설정
  },
});

const InquiryContent = ({ item, openModal }) => (
    <TouchableWithoutFeedback onPress={() => openModal(item, item)}>
        <Card containerStyle={styles.cardContainer}>
        <Card.Title style={{ color: stateMode ? "#ffffff" : "#000000" }}>{item.Category}</Card.Title>
            <Card.Divider />
            <View style={styles.cardContent}>
                <Text style={styles.cardText}>{item.Contents}</Text>
                <Text style={styles.cardDate}>{item.WriteDate}</Text>
            </View>
        </Card>
    </TouchableWithoutFeedback>
);

const AnswerContent = ({ answer }) => (
    <View>
        <Text style={styles.modalText}>{answer}</Text>
    </View>
);

const ImagePreview = ({ images, toggleImageSize }) => (
    <View style={styles.imagePreviewContainer}>
        {images?.split(',').filter(url => url.trim() !== '').map((url, index) => (
            <TouchableWithoutFeedback key={index} onPress={() => toggleImageSize(url)}>
                <Image
                    style={styles.thumbnailImage}
                    source={{ uri: url }}
                />
            </TouchableWithoutFeedback>
        ))}
    </View>
);



  

  const toastRef = useRef(null); 

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
    let nextPage = checkNextPage ? pageno + 1 : pageno;

    const requestData = {
      Affiliation1,
      Affiliation2,
      UserName,
      AccountID,
      pageno: nextPage,
      IsAnswered: "True"
    };

    let response;
    try {
      response = await axios.post('https://findbin.uiharu.dev/app/api/inquiry/inquiry.php', requestData);
      if (response.data.StatusCode === 200) {
        if (response.data.inquiries.length === 0) {
          setLastPage(true);
        } else {
          setLastPage(false);
          if (!checkNextPage) {
            setPosts(response.data.inquiries);
          }
        }
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageno]);

  const openModal = (post, item) => {
    setSelectedPost(post);
    setSelectedItem({
      Email: item.Email,
      Category: item.Category,
      Contents: item.Contents,
      ID: item.id
    });
    if (item.AnswerContents) {
      // selectedPost에 AnswerFilePath가 존재하면 이미지를 images 상태에 추가
      setAnswer(item.AnswerContents);
    } else {
      setAnswer(''); // 이미지가 없을 경우 초기화
    }
    if (item.AnswerFilePath) {
      // selectedPost에 AnswerFilePath가 존재하면 이미지를 images 상태에 추가
      setImages(item.AnswerFilePath.split(',').filter(url => url.trim() !== ''));
    } else {
      setImages([]); // 이미지가 없을 경우 초기화
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setShowFullImage(false);  // 모달을 닫을 때 이미지 확대 상태도 초기화
    setAnswer('');
    setImages([]);
    setModalVisible(false);
  };

  const openModalWithImage = (post, url, item) => {
    setSelectedPost(post);
    setSelectedItem({
      Email: item.Email,
      Category: item.Category,
      Contents: item.Contents,
      ID: item.ID
    });
    setModalVisible(true);
    toggleImageSize(url);
  };

  const ForwardedToast = React.forwardRef((props, ref) => {
    return <Toast {...props} />;
});

const renderItem = ({ item }) => (
    <SafeAreaView>
        <ScrollView>
            <InquiryContent item={item} openModal={openModal} />
            <Modal
                transparent={false}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <AnswerContent answer={answer} />
                    {selectedPost?.Filepath && (
                        <ImagePreview images={selectedPost?.Filepath} toggleImageSize={toggleImageSize} />
                    )}
                    <TextInput
                        style={styles.TextInput}
                        placeholder="답변 내용"
                        value={answer}
                        editable={false}
                    />
                    <View style={styles.imageRow}>
                        {images.map((uri, index) => (
                            <View key={index} style={{ position: 'relative', margin: 5 }}>
                                <Image source={{ uri }} style={styles.answerImage} />
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={[styles.closeButton, isAnswering && styles.disabledButton]}
                        onPress={closeModal}
                        disabled={isAnswering}
                    >
                        <Text style={[styles.buttonText, isAnswering && styles.disabledButtonText]}>닫기</Text>
                    </TouchableOpacity>
                </View>
                <ForwardedToast ref={toastRef} />
            </Modal>
        </ScrollView>
    </SafeAreaView>
);



  const { width, height } = Dimensions.get('window');

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
  data={posts}
  renderItem={renderItem}
  // style={{ backgroundColor: stateMode ? "#000000" : "#ffffff" }}
  keyExtractor={item => item.id}
/>
      <View style={styles.buttonContainer}>
        <Button title="이전" onPress={() => setPageno(prev => Math.max(prev - 1, 1))} disabled={pageno === 1} />
        <Button title="다음" onPress={() => setPageno(prev => prev + 1)} disabled={lastPage} />
      </View>
      <Modal
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
          <TextInput
            style={styles.TextInput}
            placeholder="답변 내용"
            value={answer}
            editable={false}
          />
          <View style={styles.imageRow}>
            {images.map((uri, index) => (
              <View key={index} style={{ position: 'relative', margin: 5 }}>
                <Image source={{ uri }} style={styles.answerImage} />
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.closeButton, isAnswering && styles.disabledButton]}
            onPress={closeModal}
            disabled={isAnswering}
          >
            <Text style={[styles.buttonText, isAnswering && styles.disabledButtonText]}>닫기</Text>
          </TouchableOpacity>
        </View>
        <ForwardedToast ref={toastRef} />
      </Modal>
    </SafeAreaView>
  );
}

