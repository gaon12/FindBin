import React from 'react';
import { View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from '@react-navigation/native';
import { darkModeState } from "./dataState.js";
import { useRecoilState } from "recoil";
import Inquiry from './ReportTabs/Inquiry';
import AppInquiry from './ReportTabs/AppInquiry';

const Tab = createMaterialTopTabNavigator();

export default function Report() {
  const theme = useTheme();
  const [stateMode, setStateMode] = useRecoilState(darkModeState);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tab.Navigator
        initialRouteName="쓰레기통 문의"
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: stateMode? '#fff': theme.colors.text,
          tabBarStyle: { backgroundColor: stateMode? '#000': theme.colors.background },
          tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
        }}
      >
        <Tab.Screen name="쓰레기통 문의" component={Inquiry} />
        <Tab.Screen name="앱 문의" component={AppInquiry} />
      </Tab.Navigator>
    </View>
  );
}
