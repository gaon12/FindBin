import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import { ProgressBar, Button, Text, Card } from "react-native-paper";
import axios from "axios";
import { darkModeState } from "../dataState.js";
import { useRecoilState } from "recoil";

const randomCoordinates = () => {
  const lat = (20 + Math.random() * 40).toFixed(6);
  const lng = (-30 + Math.random() * 60).toFixed(6);
  return { lat, lng };
};

// 전세계 랜덤
// const randomCoordinates = () => {
//   const lat = (-90 + Math.random() * 180).toFixed(6);
//   const lng = (-180 + Math.random() * 360).toFixed(6);
//   return { lat, lng };
// };

const fetchCountryName = async (lat, lng) => {
  try {
    const { data } = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          "Accept-Language": "ko",
        },
      }
    );
    return data?.address?.country || "Unknown";
  } catch (error) {
    console.error(error);
    return "Unknown";
  }
};

const randomCountries = (correctCountry, allCountries) => {
  const options = [correctCountry];
  while (options.length < 4) {
    const randomCountry =
      allCountries[Math.floor(Math.random() * allCountries.length)];
    if (!options.includes(randomCountry)) {
      options.push(randomCountry);
    }
  }
  return options.sort(() => Math.random() - 0.5);
};

export default function WhatIsThisPageOne() {
  const [coords, setCoords] = useState(null);
  const [correctCountry, setCorrectCountry] = useState("");
  const [allCountries, setAllCountries] = useState([
    "가나",
    "가봉",
    "가이아나",
    "감비아",
    "과테말라",
    "그레나다",
    "그리스",
    "기니",
    "기니비사우",
    "나미비아",
    "나우루",
    "나이지리아",
    "남수단",
    "남아프리카 공화국",
    "네덜란드",
    "네팔",
    "노르웨이",
    "뉴질랜드",
    "니제르",
    "니카라과",
    "대한민국",
    "덴마크",
    "도미니카 공화국",
    "도미니카 연방",
    "독일",
    "동티모르",
    "라오스",
    "라이베리아",
    "라트비아",
    "러시아",
    "레바논",
    "레소토",
    "루마니아",
    "룩셈부르크",
    "르완다",
    "리비아",
    "리투아니아",
    "리히텐슈타인",
    "마다가스카르",
    "마셜 제도",
    "말라위",
    "말레이시아",
    "말리",
    "멕시코",
    "모나코",
    "모로코",
    "모리셔스",
    "모리타니",
    "모잠비크",
    "몬테네그로",
    "몰도바",
    "몰디브",
    "몰타",
    "몽골",
    "미국",
    "미얀마",
    "미크로네시아 연방",
    "바누아투",
    "바레인",
    "바베이도스",
    "바하마",
    "방글라데시",
    "베냉",
    "베네수엘라",
    "베트남",
    "벨기에",
    "벨라루스",
    "벨리즈",
    "보스니아 헤르체고비나",
    "보츠와나",
    "볼리비아",
    "부룬디",
    "부르키나파소",
    "부탄",
    "북마케도니아",
    "북한",
    "불가리아",
    "브라질",
    "브루나이",
    "사모아",
    "사우디아라비아",
    "산마리노",
    "상투메 프린시페",
    "세네갈",
    "세르비아",
    "세이셸",
    "세인트루시아",
    "세인트빈센트 그레나딘",
    "세인트키츠 네비스",
    "소말리아",
    "솔로몬 제도",
    "수단",
    "수리남",
    "스리랑카",
    "스웨덴",
    "스위스",
    "스페인",
    "슬로바키아",
    "슬로베니아",
    "시리아",
    "시에라리온",
    "싱가포르",
    "아랍에미리트",
    "아르메니아",
    "아르헨티나",
    "아이슬란드",
    "아이티",
    "아일랜드",
    "아제르바이잔",
    "아프가니스탄",
    "안도라",
    "알바니아",
    "알제리",
    "앙골라",
    "앤티가 바부다",
    "에리트레아",
    "에스와티니",
    "에스토니아",
    "에콰도르",
    "에티오피아",
    "엘살바도르",
    "영국",
    "예멘",
    "오만",
    "오스트리아",
    "온두라스",
    "요르단",
    "우간다",
    "우루과이",
    "우즈베키스탄",
    "우크라이나",
    "이라크",
    "이란",
    "이스라엘",
    "이집트",
    "이탈리아",
    "인도",
    "인도네시아",
    "일본",
    "자메이카",
    "잠비아",
    "적도 기니",
    "조지아",
    "중국",
    "중앙아프리카공화국",
    "지부티",
    "짐바브웨",
    "차드",
    "체코",
    "칠레",
    "카메룬",
    "카보베르데",
    "카자흐스탄",
    "카타르",
    "캄보디아",
    "캐나다",
    "케냐",
    "코모로",
    "코스타리카",
    "코트디부아르",
    "콜롬비아",
    "콩고 공화국",
    "콩고민주공화국",
    "쿠바",
    "쿠웨이트",
    "크로아티아",
    "키르기스스탄",
    "키리바시",
    "키프로스",
    "타지키스탄",
    "탄자니아",
    "태국",
    "토고",
    "통가",
    "투르크메니스탄",
    "투발루",
    "튀니지",
    "튀르키예",
    "트리니다드 토바고",
    "파나마",
    "파라과이",
    "파키스탄",
    "파푸아뉴기니",
    "팔라우",
    "페루",
    "포르투갈",
    "폴란드",
    "프랑스",
    "피지",
    "핀란드",
    "필리핀",
    "헝가리",
    "호주",
  ]);
  const [options, setOptions] = useState([]);
  const [time, setTime] = useState(30);
  const [progress, setProgress] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showMain, setShowMain] = useState(true);
  const [stateMode, setStateMode] = useRecoilState(darkModeState);

  const startGame = () => {
    setShowMain(false);
    updateQuestion();
  };

  const endGame = () => {
    setShowMain(true);
  };

  const updateQuestion = async () => {
    setLoading(true);
    setLoadingProgress(0);
    // 3초간 로딩 Progress Bar 증가
    let intervalId = setInterval(() => {
      setLoadingProgress((prev) => Math.min(prev + 1 / 3, 1));
    }, 1000);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    clearInterval(intervalId); // Interval을 제거

    const newCoords = randomCoordinates();
    setCoords(newCoords);
    const country = await fetchCountryName(newCoords.lat, newCoords.lng);
    setCorrectCountry(country);
    setOptions(randomCountries(country, allCountries));
    setLoading(false);
    setTime(30);
    setProgress(1);
    setSelected(null);
  };

  useEffect(() => {
    updateQuestion();
  }, []);

  useEffect(() => {
    const timer =
      !showModal &&
      setInterval(() => {
        if (time > 0 && selected === null) {
          setTime((prevTime) => {
            const newTime = prevTime - 1;
            setProgress(newTime / 30);
            return newTime;
          });
        }
        if (time === 0) {
          setSelected("오답");
          setShowModal(true);
        }
      }, 1000);

    return () => clearInterval(timer);
  }, [selected, time, showModal]);


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 16,
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    controlButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    questionCard: {
      marginBottom: 16,
      alignItems: "center", // 가운데 정렬을 위해 추가
      justifyContent: "space-between", // 위아래 중앙 정렬을 위해 추가
      backgroundColor: stateMode ? "#000000" : "#ffffff",
    },
    cardTitle: {
      marginBottom: 10,
      fontSize: 20,
      textAlign: "center", // 가로 중앙 정렬
      color: stateMode ? "#ffffff" : "#000000",
    },
    cardSubtitle: {
      fontSize: 16,
      color: "#666", // 부제목(위도, 경도)의 글자색 변경
    },
    progressBar: {
      height: 10,
      marginBottom: 16,
    },
    coordinate: {
      textAlign: "center",
      marginTop: 3,
    },
    timer: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      color: stateMode ? "#ffffff" : "#000000",
    },
    buttonContainer: {
      flexDirection: "column",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    button: {
      marginBottom: 10, // 버튼 간의 여백 추가
      width: "100%", // 버튼의 너비를 100%로 설정
    },
    modalBackground: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      backgroundColor: stateMode ? "#000000" : "#ffffff",
      padding: 16,
      borderRadius: 8,
      width: "80%",
      
    },
    modalText: {
      fontSize: 24,
      marginBottom: 8,
      color: stateMode ? "#ffffff" : "#000000",
    },
    modalAnswer: {
      fontSize: 18,
      marginBottom: 16,
      color: stateMode ? "#ffffff" : "#000000",
    },
  });

  return (
    <View style={styles.container}>
      {showMain ? (
        // 메인 화면
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Button mode="contained" onPress={startGame}>
            시작
          </Button>
        </View>
      ) : (
        // 게임 화면
        <>
          {loading ? (
            // 로딩 중일 때의 화면
            <View
              style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
            >
              <Text style={{ fontSize: 24, marginBottom: 20, color: stateMode ? "#ffffff" : "#000000", }}>
                문제 출제 중...
              </Text>
              <ProgressBar
                style={{ width: 200, height: 10 }}
                progress={loadingProgress}
              />
            </View>
          ) : (
            // 문제가 로드된 후의 화면
            <>
              <Card style={styles.questionCard}>
                <Card.Content style={{ justifyContent: "center" }}>
                  <Text style={styles.cardTitle}>
                    {`위도: ${coords ? coords.lat : "로딩 중..."}, 경도: ${
                      coords ? coords.lng : "로딩 중..."
                    }`}
                  </Text>
                </Card.Content>
                <ProgressBar style={styles.progressBar} progress={progress} />
                <Card.Content>
                  <Text style={styles.timer}>{`${time}s`}</Text>
                </Card.Content>
              </Card>
              <View style={styles.buttonContainer}>
                {options.map((option, index) => (
                  <Button
                    key={index}
                    mode="contained"
                    style={styles.button}
                    onPress={() => {
                      setSelected(option);
                      setShowModal(true);
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </View>
              <View style={styles.controlButtons}>
                <Button mode="contained" onPress={updateQuestion}>다음 문제</Button>
                <Button mode="contained" onPress={endGame}>종료</Button>
              </View>
              <Modal visible={showModal} transparent={true}>
                <View style={styles.modalBackground}>
                  <View style={styles.modal}>
                    <Text style={styles.modalText}>
                      {selected === correctCountry ? "정답입니다!" : "틀렸습니다."}
                    </Text>
                    <Text style={styles.modalAnswer}>정답: {correctCountry}</Text>
                    <View style={styles.modalButtons}>
                      <Button onPress={() => { setShowModal(false); updateQuestion(); }}>다음 문제</Button>
                      <Button onPress={() => { setShowModal(false); endGame(); }}>종료</Button>
                    </View>
                  </View>
                </View>
              </Modal>
            </>
          )}
        </>
      )}
    </View>
  );
}


