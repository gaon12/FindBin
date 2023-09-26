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

  const fetchData = useCallback(async () => {
    if (loading) return;

    // 비동기 스토리지에서 정보 가져오기
    const Affiliation1 = await AsyncStorage.getItem('Affiliation1');
    const Affiliation2 = await AsyncStorage.getItem('Affiliation2');
    const UserName = await AsyncStorage.getItem('UserName');
    const AccountID = await AsyncStorage.getItem('AccountID');

    setLoading(true);

    try {
      const response = await axios.post(
        'https://findbin.uiharu.dev/app/api/inquiry/inquiry.php',
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
        setPage(page+1)
        setData((prevData) => [...prevData, ...newData]);
        setTotalPages(Math.ceil(response.data.totalValue/10));
      }
    } catch (error) {
      // 오류 처리
      console.error("AppMain: ", error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchData();
    setPage(1)
  }, []);

  const onEndReached = () => {
    // 마지막 페이지에 도달하면 무시
    console.log(page);
    if (page > totalPages || loading) {
      return;
    }
    fetchData();
  };

  const handleRowPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
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
      />
      <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{selectedItem?.Category}</Text>
          <Text>{selectedItem?.Contents}</Text>
          <Button title="닫기" onPress={() => setModalVisible(false)} />
        </View>
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
    padding: 16,
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
});
