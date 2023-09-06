import React, { useState } from 'react';
import { Alert, View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { TextInput, Button, Menu, Divider, Provider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [category, setCategory] = useState(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    console.log(result);

    if (!result.canceled && result.assets && result.assets[0]) {
      if(images.length < 3) {
        setImages([...images, result.assets[0].uri]);
      } else {
        Alert.alert(
            '오류', // 제목
            '최대 3장의 이미지만 추가할 수 있습니다.', //내용
            [
              { text: '확인', onPress: () => console.log('확인 버튼이 눌렸습니다.') },
            ],
          );
      }
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const submit = () => {
    // 서버에 데이터 전송 로직 추가
  };

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.menuContainer}>
        <TextInput
                  label="분류 선택"
                  value={category}
                  style={styles.menuInput}
                  pointerEvents="none"
                />
        </View>
        <TextInput
          label="내용"
          value={content}
          onChangeText={text => setContent(text)}
          style={styles.textInput}
          mode='outlined'
        />
        <Button icon="camera" mode="contained" onPress={pickImage} style={styles.imageButton}>
          이미지 선택
        </Button>
        <View style={styles.imagesContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity style={styles.closeButton} onPress={() => removeImage(index)}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <Button mode="contained" onPress={submit} style={styles.submitButton}>
            제출
          </Button>
        </View>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  menuContainer: {
    marginBottom: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  menuButton: {
    backgroundColor: '#ffffff',
  },
  menuInput: {
    paddingHorizontal: 12,
    height: 56,
  },
  textInput: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  imageButton: {
    backgroundColor: '#4caf50',
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#ff0000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  submitButton: {
    backgroundColor: '#1976d2',
  },
});
