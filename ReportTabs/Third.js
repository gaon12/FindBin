import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Provider, TextInput as PaperInput, Button as PaperButton } from 'react-native-paper';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [content, setContent] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      }
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      const pic = await cameraRef.takePictureAsync();
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.cancelled) {
        setPhoto(result.uri);
      }
      setShowCamera(false);
    }
  };

  const handleDeletePicture = () => {
    setPhoto(null);
  };

  const handleSubmit = () => {
    // TODO: 서버에 사진, 위치 및 내용을 전송하는 코드를 여기에 추가하세요.
    console.log('사진 URI:', photo);
    console.log('위치 좌표:', location);
    console.log('내용:', content);
  };

  return (
    <Provider>
      <ScrollView style={{ flex: 1, padding: 20 }}>
        {hasPermission === null ? (
          <View />
        ) : hasPermission === false ? (
          <Text>카메라 접근 권한이 없습니다.</Text>
        ) : (
          <View>
            {showCamera && (
              <Camera style={{ height: 200, aspectRatio: 16 / 9 }} ref={(ref) => setCameraRef(ref)} />
            )}

            {showCamera && (
              <PaperButton icon="camera" mode="contained" onPress={takePicture} style={{ marginVertical: 10 }}>
                사진 찍기
              </PaperButton>
            )}

            {!showCamera && (
              <PaperButton icon="camera" mode="contained" onPress={() => setShowCamera(true)} style={{ marginBottom: 20 }}>
                카메라 열기
              </PaperButton>
            )}
          </View>
        )}

        {photo && (
          <View>
            <TouchableOpacity onPress={handleDeletePicture} style={{ position: 'absolute', right: 10, top: 10, zIndex: 1 }}>
              <Text style={{ fontSize: 24, color: 'red' }}>X</Text>
            </TouchableOpacity>
            <Image source={{ uri: photo }} style={{ width: '100%', height: 200, marginBottom: 20 }} />
          </View>
        )}

        <PaperInput
          label="내용"
          value={content}
          onChangeText={(text) => setContent(text)}
          style={{ backgroundColor: '#fff', marginBottom: 20 }}
        />

        <PaperButton icon="send" mode="contained" onPress={handleSubmit} style={{ backgroundColor: '#6200ea' }}>
          제출
        </PaperButton>
      </ScrollView>
    </Provider>
  );
}
