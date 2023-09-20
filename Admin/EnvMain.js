import React from 'react';
import { View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

export default function EnvMain() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tab.Navigator
        initialRouteName="쓰레기통 민원 목록"
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text,
          tabBarStyle: { backgroundColor: theme.colors.background },
          tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
        }}
      >
        <Tab.Screen name="쓰레기통 관리" component={abc} />
        <Tab.Screen name="쓰레기통 민원 목록" component={Inquiry} />
        <Tab.Screen name="게시글 답변" component={AppInquiry} />

      </Tab.Navigator>
    </View>
  );
}
