import React, { useState, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppMain from './AppMain';
import EnvMain from './EnvMain';
import EnvAdmin from './EnvAdmin';
import AppEnd from './AppEnd';
import EnvEnd from './EnvEnd';

const Tab = createMaterialTopTabNavigator();

export default function Report() {
    const [showAdminTab, setShowAdminTab] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                const adminValue = await AsyncStorage.getItem('IsAdmin');

                if (adminValue === "0") {
                    setShowAdminTab(false);
                } else if(adminValue === "1") {
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
                initialRouteName="관리자"
                screenOptions={{
                    tabBarActiveTintColor: theme.colors.primary,
                    tabBarInactiveTintColor: theme.colors.text,
                    tabBarStyle: { backgroundColor: theme.colors.background },
                    tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
                }}
            >
                <Tab.Screen name="쓰레기통 관리" component={EnvAdmin} />
                <Tab.Screen name="쓰레기통 민원" component={EnvMain} />
                {showAdminTab && (  // 조건부 렌더링
                    <Tab.Screen name="앱 버그" component={AppMain} />
                )}
                <Tab.Screen name="쓰레기통 민원 완료" component={EnvEnd} />
                {showAdminTab && (  // 조건부 렌더링
                    <Tab.Screen name="앱 버그 완료" component={AppEnd} />
                )}
            </Tab.Navigator>
        </View>
    );
}
