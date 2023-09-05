import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet, TextInput, TouchableOpacityComponent } from 'react-native';

function Inquiry() {
  const [data, setData] = useState([
    { id: 1, label: '쓰레기통 존재 여부' },
    { id: 2, label: '앱 버그' },
    { id: 3, label: '앱 개선사항' },
  ]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [TitleText, setTitleText] = useState('');
  const [contentText, setcontentText] = useState('');

  function handleDropdownPress() {
    setModalVisible(!modalVisible);
  }

  function handleItemPress(item) {
    setSelectedItem(item);
    setModalVisible(false);
  }

  const modalHeight = data.length * 50 + 100; // 아이템 개수에 따라 높이 계산

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TextInput
        placeholder="제목"
        style={styles.textInput}
        value={TitleText}
        onChangeText={text => setTitleText(text)}
      />

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={handleDropdownPress}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedItem ? selectedItem.label : '선택하세요'}
        </Text>
      </TouchableOpacity>

      <TextInput
        multiline={true}
        numberOfLines={4}
        placeholder="텍스트 입력하기"
        value={contentText}
        onChangeText={text => setcontentText(text)}
        style={styles.textArea}
      />

      <TouchableOpacity>
        <Text>사진 첨부</Text>
      </TouchableOpacity>

      {modalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={[styles.modalContainer, { height: modalHeight }]}>
            <View style={styles.modalContent}>
              <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleItemPress(item)}>
                    <Text>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    borderWidth: 1,
    borderColor: 'black', // 테두리 색상 설정
    padding: 10,
    borderRadius: 5,
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
    width: '80%',
  },
  textArea: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    height: 100, // 높이 조절 가능
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
});

export default Inquiry;
