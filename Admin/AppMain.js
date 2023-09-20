import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Image,
} from 'react-native';
import { Button, Text, Card } from 'react-native-elements';
import Collapsible from 'react-native-collapsible';

const App = () => {
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
      const response = await axios.post('서버의_API_URL'); 
      
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

  const filteredPosts = selectedCategory === '전체' ? posts : posts.filter(post => post.category === selectedCategory);

  const toggleCollapsible = (index) => {
    setCollapsedMap(prevCollapsedMap => ({
      ...prevCollapsedMap,
      [index]: !prevCollapsedMap[index],
    }));
  };

  return (
    <View>
      <View>
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
                marginTop: Platform.OS === "ios" ? 50 : 35,
                borderRadius: 8,
              }}
            />
          ))}
        </ScrollView>
      </View>
      <ScrollView>
        {filteredPosts.map((post) => (
          <Card key={post.index}>
            <Card.Title>{post.title}</Card.Title>
            <TouchableOpacity
              onPress={() => toggleCollapsible(post.index)}
            >
              <Text style={{marginBottom: 10}}>{post.title}</Text>
            </TouchableOpacity>
            <Collapsible collapsed={collapsedMap[post.index]}>
              <Text style={{marginBottom: 10}}>{post.content}</Text>
              {post.image && <Image source={{ uri: post.image }} style={{ width: 200, height: 200 }} />}
              {/* 답변 버튼 및 삭제 버튼을 추가하세요 */}
            </Collapsible>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

export default App;
