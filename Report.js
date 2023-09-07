import React from 'react';
import { View, Text } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Inquiry from './ReportTabs/Inquiry';
import AppInquiry from './ReportTabs/AppInquiry';

const Tab = createMaterialTopTabNavigator();

export default function Report() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator>
        <Tab.Screen name="쓰레기통 문의" component={Inquiry} />
        <Tab.Screen name="앱 문의" component={AppInquiry} />
      </Tab.Navigator>
    </View>
  );
}
