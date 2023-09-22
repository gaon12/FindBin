import React, { useState } from 'react';
import { View, ScrollView, Image, Alert, TouchableOpacity, Platform, DevSettings } from 'react-native';
import { Button, Text, Card } from 'react-native-elements';
import Collapsible from 'react-native-collapsible';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppMain() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [collapsedMap, setCollapsedMap] = useState({});
  const [posts, setPosts] = useState([]);

  const categories = ['전체', '앱 버그 보고', '서비스 개선사항 건의'];

   // useEffect(() => {
  //   // 서버에서 게시물 데이터를 가져오는 함수를 호출하고 데이터를 설정합니다.
  //   // 아래 코드는 Axios를 사용하여 서버에서 데이터를 가져오는 코드입니다.
  //   AxiosPostsFromServer();
  // }, []);

  const AxiosPostsFromServer = async () => {
    try {
      // Axios를 사용하여 서버 API 요청을 보냅니다.
      const response = await axios.post('');

      setPosts(response.data.map((item) => ({
        index: item.id,
        title: item.Contents.length > 10 ? item.content.slice(0, 10) + '...' : item.content,
        content: item.Contents,
        category: item.Category,
        image: item.Filepath,
      })));

    } catch (error) {
      console.error('데이터를 가져오는 중 오류 발생:', error);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // 로그아웃 처리를 위한 함수 <-- 추가된 부분
  const logout = async () => {
    try {
      const keys = ['Affiliation1', 'Affiliation2', 'AccountID', 'UserName', 'IsAdmin'];
      const result = await AsyncStorage.multiGet(keys);
  
      const isLoggedIn = result.some(([key, value]) => value !== null);
  
      if (isLoggedIn) {
        await AsyncStorage.multiRemove(keys);
        Alert.alert(
          '로그아웃 완료!',
          '',
          [
            //{ text: '닫기', onPress: () => DevSettings.reload() } // 로그아웃시 앱 리로드
            { text: '닫기' } // 로그아웃시 앱 리로드 없음
          ]
        );
      } else {
        Alert.alert(
          '로그인 상태가 아닙니다.',
          '',
          [
            { text: '닫기', onPress: () => {} }
          ]
        );
      }
  
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  const filteredPosts = selectedCategory === '전체' ? posts : posts.filter(post => post.category === selectedCategory);

  const toggleCollapsible = (index) => {
    setCollapsedMap(prevCollapsedMap => ({
      ...prevCollapsedMap,
      [index]: !prevCollapsedMap[index],
    }));
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ScrollView horizontal>
          {categories.map((category) => (
            <Button
              key={category}
              onPress={() => handleCategoryChange(category)}
              title={category}
              buttonStyle={{
                backgroundColor: selectedCategory === category ? '#00BCD4' : 'lightgray',
                padding: 8,
                margin: 4,
                marginTop: Platform.OS === 'ios' ? 50 : 35,
                borderRadius: 8,
              }}
            />
          ))}
        </ScrollView>
        <Button
          title="로그아웃"
          onPress={logout}
          buttonStyle={{
            backgroundColor: '#FF4500',
            padding: 8,
            margin: 4,
            marginTop: Platform.OS === 'ios' ? 50 : 35,
            borderRadius: 8,
          }}
        />
      </View>
      <ScrollView>
        {filteredPosts.map((post) => (
          <Card key={post.index}>
            <Card.Title>{post.title}</Card.Title>
            <TouchableOpacity
              onPress={() => toggleCollapsible(post.index)}
            >
              <Text style={{ marginBottom: 10 }}>{post.title}</Text>
            </TouchableOpacity>
            <Collapsible collapsed={collapsedMap[post.index]}>
              <Text style={{ marginBottom: 10 }}>{post.content}</Text>
              {post.image && <Image source={{ uri: post.image }} style={{ width: 200, height: 200 }} />}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {/* 답변 버튼 */}
                <TouchableOpacity onPress={() => handleReply(post.index)}>
                  <Text>답변</Text>
                </TouchableOpacity>
                {/* 삭제 버튼 */}
                <TouchableOpacity onPress={() => handleDelete(post.index)}>
                  <Text>삭제</Text>
                </TouchableOpacity>
              </View>
            </Collapsible>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};
