import React, { useState, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppMain from './AppMain';
import AppEnd from './AppEnd';
import { darkModeState } from "../dataState.js";
import { useRecoilState } from "recoil";

const Tab = createMaterialTopTabNavigator();

export default function AppCon() {
    const [showAdminTab, setShowAdminTab] = useState(false);
    const [stateMode, setStateMode] = useRecoilState(darkModeState);
    const theme = useTheme();

    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                const adminValue = await AsyncStorage.getItem('IsAdmin');

                if (adminValue === "0") {
                    setShowAdminTab(false);
                } else if (adminValue === "1") {
                    setShowAdminTab(true);
                }
            } catch (err) {
                console.error("AdminMain:", err);
                setShowAdminTab(false);
            }
        })

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Tab.Navigator
                initialRouteName="앱"
                screenOptions={{
                    tabBarActiveTintColor: theme.colors.primary,
                    tabBarInactiveTintColor: stateMode? '#fff':theme.colors.text,
                    tabBarStyle: { backgroundColor: stateMode? '#000': theme.colors.background },
                    tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
                }}
            >
                <Tab.Screen name="앱 버그 관련" component={AppMain} />
                <Tab.Screen name="앱 버그 완료" component={AppEnd} />
            </Tab.Navigator>
        </View>
    );
}
