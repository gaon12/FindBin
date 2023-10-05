import React, { useState, useEffect } from "react";
import {
  View,
  /*StyleSheet,*/ Image,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
} from "react-native";
import {
  TextInput,
  Button,
  Portal,
  Dialog,
  RadioButton,
  Provider,
  Paragraph,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { Dialog as IOSDialog, CheckBox } from "@rneui/themed";
import Toast from "react-native-toast-message";
import axios from "axios";
import { darkModeState } from "../dataState.js";
import { useRecoilState } from "recoil";

// 스타일 임포트
//import styles from './AppInquiryStyle';

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
  { value: "bug", label: "앱 버그 보고" },
  { value: "improve", label: "서비스 개선사항 건의" },
];

const getCategoryLabel = (value) => {
  const category = CATEGORIES.find((cat) => cat.value === value);
  return category ? category.label : "";
};

// 분류(카테고리)

export default function AppInquiry() {
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [images, setImages] = useState([]);
  const [visible, setVisible] = useState(false);
  //const [theme, setTheme] = useState("light"); // 라이트 모드가 기본값
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visible5, setVisible5] = useState(false);
  const [checked, setChecked] = useState(null);
  const [stateMode, setStateMode] = useRecoilState(darkModeState);

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
    setImages(images.filter((image) => image !== uri));
  };

  const submitForm = async () => {
    setIsSubmitting(true);

    // 여기에 제출 로직 추가${data.address.city || ''} ${data.address.borough || ''}
    if (category == "bug") {
      var RealCategory = "앱 버그 보고";
    } else if (category == "improve") {
      var RealCategory = "서비스 개선사항 건의";
    }
    try {
      // 이미지 업로드 결과를 저장할 배열
      const fileUrls = [];

      // 서버 엔드포인트 URL 설정
      const imageapiUrl =
        "https://findbin.uiharu.dev/app/api/AppInquiry/img.php";
      for (let i = 0; i < images.length; i++) {
        const filePath = images[i].replace("file://", "");
        const fileData = {
          uri: images[i],
          type: "image/jpeg",
          name: `${filePath.split("/").pop()}`,
        };

        const imageData = new FormData();
        imageData.append("image", fileData);

        try {
          const imageresponse = await axios.post(imageapiUrl, imageData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          const fileUrl = imageresponse.data.fileUrl;
          fileUrls.push(fileUrl);
        } catch (error) {
          console.error("AppInquriy:", error);
          return null;
        }
      }

      const formData = {
        Category: RealCategory,
        Contents: content,
        Email: email,
        file1: fileUrls.length > 0 ? fileUrls[0] : "",
        file2: fileUrls.length > 0 ? fileUrls[1] : "",
        file3: fileUrls.length > 0 ? fileUrls[2] : "",
      };

      const jsonString = JSON.stringify(formData);

      // 서버 엔드포인트 URL 설정
      const apiUrl2 = "https://findbin.uiharu.dev/app/api/AppInquiry/api.php";

      // Axios를 사용하여 POST 요청 보내기
      const response = await axios.post(apiUrl2, jsonString, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(fileUrls);

      // 원하는 서버 응답 처리 로직을 추가하세요.
      setCategory(null);
      setContent("");
      setEmail("");
      setImages([]);
      // Toast 메시지 표시 (제출 성공 여부에 따라 다른 메시지 출력 가능)
      Toast.show({
        text1: "제출이 완료되었습니다.",
      });
    } catch (error) {
      console.error("AppInquriy:", error);
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
      outputRange: ["#6200ea", "#6200ea", "#000"],
      backgroundColor: stateMode ? "#333333" : "#ffffff",
    }),
    textAlignVertical: "center",
  };

  // 라이트모드 다크모드

  useEffect(() => {
    const fetchData = async () => {
      setStateMode(false);
    };

    fetchData();
  }, []); // dependency 배열을 비움

  const dynamicStyles = {
    toast: {
      backgroundColor: stateMode ? "#000000" : "#ffffff",
      color: stateMode ? "#000000" : "#ffffff",
    },
    iconColor: {
      color: stateMode ? "#000000" : "#ffffff",
    },
    safeArea: {
      flex: 1,
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    // 모달의 스타일을 동적으로 설정
    modalStyle: {
        backgroundColor: stateMode ? "#000000" : "#ffffff",
      },
      modalText: {
        color: stateMode ? "#ffffff" : "#000000",
      },
    container: {
      flex: 1,
      padding: 16,
    },
    categoryButton: {
      marginBottom: 12,
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    categoryInput: {
      borderWidth: 1, // 경계선을 추가합니다.
      borderColor: stateMode ? "#fff" : "#000000", // 경계선 색상을 설정합니다.
      borderRadius: 4, // 경계선의 반경을 설정합니다.
      paddingHorizontal: 8, // 좌우 패딩을 추가합니다.
      paddingVertical: 4, // 상하 패딩을 추가합니다.
      height: 50,
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    TextInput: {
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    input: {
      marginBottom: 12,
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    textArea: {
      height: 150,
      Color: stateMode ? "#000000" : "#ffffff",
    },
    button: {
      marginBottom: 12,
      backgroundColor: "#6200ea",
    },
    imagesContainer: {
      flexDirection: "row",
      marginBottom: 12,
    },
    imageContainer: {
      position: "relative",
      marginRight: 8,
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    icon: {
      position: "absolute",
      top: -10,
      right: -17,
    },
    footer: {
      flex: 1,
      justifyContent: "flex-end",
      marginBottom: 16,
    },
    submitButton: {
      backgroundColor: "#6200ea",
    },
  };

  return (
    <Provider>
      <SafeAreaView style={dynamicStyles.safeArea}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={dynamicStyles.container}>
            <TouchableOpacity
              onPress={() =>
                Platform.OS === "android" ? showDialog() : toggleDialog5()
              }
              style={dynamicStyles.categoryButton}
            >
              <View style={dynamicStyles.categoryInput}>
                <Animated.Text
                  style={[
                    labelStyle,
                    { color: stateMode ? "#fff" : "#000" }, // label의 색상
                  ]}
                >
                  {"분류"} {/* 여기에서 value 값이 표시됩니다. */}
                </Animated.Text>
                {category && (
                  <Text
                    style={{
                      fontSize: 16,
                      color: stateMode ? "#fff" : "#333", // 여기의 텍스트 색상도 수정
                      position: "absolute",
                      top: 22,
                      left: 10,
                    }}
                  >
                    {getCategoryLabel(category)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {Platform.OS === "android" ? ( // 안드로이드 플랫폼에서만 실행
              <Portal>
                <Dialog visible={visible} onDismiss={hideDialog} style={dynamicStyles.modalStyle}>
                  <Dialog.Title style={{color: stateMode ? "#fff" : "#000"}}>분류 선택</Dialog.Title>
                  <Dialog.Content>
                    <RadioButton.Group
                      onValueChange={(value) => {
                        setCategory(value);
                        hideDialog();
                      }}
                      value={category}
                    >
                      {CATEGORIES.map((cat) => (
                        <RadioButton.Item
                          key={cat.value}
                          label={cat.label}
                          value={cat.value}
                          position="leading"
                          labelStyle={[
                            { textAlign: "left", marginLeft: 10 },
                            { color: stateMode ? "#fff" : "#000" }  // 여기에서 다크모드에 따른 색상 변경을 적용
                        ]}
                        />
                      ))}
                    </RadioButton.Group>
                  </Dialog.Content>
                </Dialog>
              </Portal>
            ) : (
              // iOS 플랫폼에서 실행
              <Portal>
                <IOSDialog isVisible={visible5} onBackdropPress={toggleDialog5}style={dynamicStyles.modalStyle}
                  >
                  <IOSDialog.Title title="분류 선택" style={{color: stateMode ? "#fff" : "#000"}}/>
                  {CATEGORIES.map((cat, i) => (
                    <CheckBox
                      key={i}
                      title={cat.label}
                      containerStyle={{
                        backgroundColor: stateMode ? "#000" : "#fff",
                        borderWidth: 0,
                      }}
                      textStyle={{ color: stateMode ? "#fff" : "#000" }}  
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
              style={[dynamicStyles.input, dynamicStyles.textArea]}
              label="내용"
              mode="outlined"
              multiline
              numberOfLines={10}
              value={content}
              onChangeText={setContent}
              theme={{
                colors: {
                  primary: stateMode ? "#fff" : "#6200ea", // 터치 시의 색상 (다크 모드일 때 흰색, 그렇지 않으면 기존의 보라색)
                  onSurface: stateMode ? "#fff" : "#000", // label 색상 및 기타 텍스트 색상
                  background: stateMode ? "#333" : "#fff", // 배경색
                },
              }}
              outlineColor={stateMode ? "#fff" : "#000"} // 외곽선의 색상
            />

            <TextInput
              style={dynamicStyles.input}
              label="이메일"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              theme={{
                colors: {
                  primary: stateMode ? "#fff" : "#6200ea", // 터치 시의 색상 (다크 모드일 때 흰색, 그렇지 않으면 기존의 보라색)
                  onSurface: stateMode ? "#fff" : "#000", // label 색상 및 기타 텍스트 색상
                  background: stateMode ? "#333" : "#fff", // 배경색
                },
              }}
              outlineColor={stateMode ? "#fff" : "#000"} // 외곽선의 색상
            />

            <Button
              icon="camera"
              mode="contained"
              onPress={pickImage}
              style={dynamicStyles.button}
            >
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

            <View style={dynamicStyles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={dynamicStyles.imageContainer}>
                  <Image source={{ uri: image }} style={dynamicStyles.image} />
                  <TouchableOpacity onPress={() => removeImage(image)}>
                    <MaterialIcons
                      name="cancel"
                      size={24}
                      color="red"
                      style={dynamicStyles.icon}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={dynamicStyles.footer}>
              <Button
                onPress={submitForm}
                disabled={isSubmitting}
                style={dynamicStyles.submitButton}
                mode="contained" // isSubmitting이 true이면 버튼을 비활성화
              >
                제출
              </Button>
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
