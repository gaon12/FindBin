import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Modal,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Image,
  TextInput
} from 'react-native';
import { Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function AppMain() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [Filepath, setFilepath] = useState(null);
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [currentFullImageUrl, setCurrentFullImageUrl] = useState(null);
  const [content, setContent] = useState('');

  const fetchData = useCallback(async () => {
    if (loading) return;
    // 비동기 스토리지에서 정보 가져오기
    const Affiliation1 = await AsyncStorage.getItem('Affiliation1');
    if (Affiliation1 != "관리자") {
      Affiliation1 = '';
    }
    const Affiliation2 = await AsyncStorage.getItem('Affiliation2');
    const UserName = await AsyncStorage.getItem('UserName');
    const AccountID = await AsyncStorage.getItem('AccountID');

    setLoading(true);
    try {
      const response = await axios.post(
        'https://findbin.uiharu.dev/app/api/AppInquiry/AppInquiry.php',
        {
          Affiliation1,
          Affiliation2,
          UserName,
          AccountID,
          pageno: page,
        }
      );

      if (response.data.StatusCode === 200) {
        // 이전 데이터와 새로운 데이터를 합칩니다.
        const newData = response.data.inquiries;
        setPage(page + 1)
        setData((prevData) => [...prevData, ...newData]);
        setTotalPages(Math.ceil(response.data.totalValue / 10));
      }
    } catch (error) {
      // 오류 처리
      console.error("AppMain: ", error);
    } finally {
      setLoading(false);
    }
  }, [loading, page]);

  useEffect(() => {
    fetchData();
  }, []);

  const onEndReached = () => {
    // 마지막 페이지에 도달하면 무시
    if (page <= totalPages && !loading) {
      fetchData();
    }
  };

  const handleRowPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const toggleImageSize = (url) => {
    setFullImageModalVisible(true);
    setCurrentFullImageUrl(url);
  };

  const  submitModal = async (selectedItem) => {
    try {
      const response = await axios.post(
        'emailAPI',
        {
          Affiliation1,
          Affiliation2,
          UserName,
          AccountID,
          pageno: page,
        }
      );

      if (response.data.StatusCode === 200) {
        // 이전 데이터와 새로운 데이터를 합칩니다.
        const newData = response.data.inquiries;
        setPage(page + 1)
        setData((prevData) => [...prevData, ...newData]);
        setTotalPages(Math.ceil(response.data.totalValue / 10));
      }
    } catch (error) {
      // 오류 처리
      console.error("AppMain: ", error);
    }

    setContent('')
    setModalVisible(false);
  };

  const closeModal = () => {
    setContent('')
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleRowPress(item)}>
            <View style={styles.row}>
              <Text style={styles.cell}>{item.Contents.substring(0, 10)}...</Text>
              <Text style={styles.cell}>{item.WriteDate}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onEndReached={onEndReached} // 스크롤의 마지막에 도달하면 호출됨
        onEndReachedThreshold={0.1}
        ListFooterComponent={loading && <ActivityIndicator />}
        initialScrollIndex={null}
        contentContainerStyle={{ paddingBottom: 10 }}
      />
      <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.safeAreaContainer}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{selectedItem?.Category}</Text>
            <Text>{selectedItem?.Contents}</Text>
            {selectedItem?.Filepath && (
              <View style={styles.imagePreviewContainer}>
                {selectedItem?.Filepath.split(',').filter(url => url.trim() !== '').map((url, index) => (
                  <TouchableWithoutFeedback key={index} onPress={() => toggleImageSize(url)}>
                    <Image
                      style={styles.thumbnailImage}
                      source={{ uri: url }}
                    />
                  </TouchableWithoutFeedback>
                ))}
              </View>
            )}
            <Text>{selectedItem?.Email}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              label="내용"
              mode="outlined"
              multiline={true}
              numberOfLines={10}
              value={content}
              onChangeText={setContent}
              theme={{ colors: { primary: '#6200ea' } }}
            />
            <Button title="답변" buttonStyle={styles.answer} onPress={() => submitModal(selectedItem)}/>
            <Button title="취소" onPress={(closeModal)} />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    marginTop: 24, // 상단바와 겹치지 않도록 marginTop 추가
  },
  row: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    flex: 1,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
  },
  customButton: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    marginHorizontal: 5,
  },
  customButtonText: {
    color: '#333',
  },
  thumbnailImage: {
    width: 70,
    height: 70,
    marginRight: 10,  // 이미지와 이미지 사이의 간격
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#6200ea',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginBottom: 10,
    height: 'auto',
  },
  answer:{
    backgroundColor: '#FF0000'
  }
});
