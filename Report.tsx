import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import Inquiry from './ReportTabs/Inquiry';
import Second from './ReportTabs/Second';
import Thrid from './ReportTabs/Third';


const Tab = createMaterialTopTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1 }}>
          <Tab.Navigator>
            <Tab.Screen name="A" component={Inquiry} />
            <Tab.Screen name="B" component={Second} />
            <Tab.Screen name="C" component={Thrid} />
          </Tab.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
