import React from 'react';
import { View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from '@react-navigation/native';
import Inquiry from './ReportTabs/Inquiry';
import AppInquiry from './ReportTabs/AppInquiry';

const Tab = createMaterialTopTabNavigator();

export default function Report() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tab.Navigator
        initialRouteName="쓰레기통 문의"
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text,
          tabBarStyle: { backgroundColor: theme.colors.background },
          tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
        }}
      >
        <Tab.Screen name="쓰레기통 문의" component={Inquiry} />
        <Tab.Screen name="앱 문의" component={AppInquiry} />
      </Tab.Navigator>
    </View>
  );
}
