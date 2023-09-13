import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text, Platform, SafeAreaView, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import Home from './Home';
import Report from './Report';
import Settings from './Settings';

const Tab = createBottomTabNavigator();

const getIcon = (route, focused, color) => {
    let IconComponent = Ionicons;
    let iconName;

    if (route.name === '홈') {
        iconName = focused ? 'home' : 'home-outline';
    } else if (route.name === '문의') {
        IconComponent = MaterialCommunityIcons;
        iconName = focused ? 'file-document' : 'file-document-outline';
    } else if (route.name === '설정') {
        iconName = focused ? 'settings' : 'settings-outline';
    }

    return (
        <View style={{ alignItems: 'center' }}>
            <IconComponent name={iconName} color={color} size={24} style={{ marginTop: Platform.OS === 'ios' ? 0 : 10 }} />
            <Text style={{ color }}>{route.name}</Text>
        </View>
    );
};

const App = () => {
    const [splashScreen, setSplashScreen] = useState(true);
    const [splashImageUrl, setSplashImageUrl] = useState(null);
    const [theme, setTheme] = useState(DefaultTheme);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const setInitialSettings = async () => {
            try {
                await AsyncStorage.multiSet([
                    ['lightdark', 'dark'],
                    ['useOpenStreetMap', 'false'],
                    ['useGPS', 'false'],
                    ['sendAnonymousData', 'false'],
                ]);
            } catch (e) {
                console.error('Error setting initial values:', e);
            }
        };

        setInitialSettings();
    }, []);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    useEffect(() => {
        const splashTimeOut = setTimeout(() => {
            setSplashScreen(false);
        }, 1000);

        fetch('https://findbin.uiharu.dev/splash/splashs.png?timestamp=${new Date().getTime()}')
            .then((response) => {
                if (response.ok) {
                    setSplashImageUrl('https://findbin.uiharu.dev/splash/splashs.png?timestamp=${new Date().getTime()}');
                    clearTimeout(splashTimeOut);
                    setTimeout(() => {
                        setSplashScreen(false);
                    }, 1500);
                } else {
                    setTimeout(() => {
                        setSplashScreen(false);
                    }, 1000);
                }
            })
            .catch((error) => {
                console.error('Error fetching splash image:', error);
                setTimeout(() => {
                    setSplashScreen(false);
                }, 1000);
            });

        return () => {
            clearTimeout(splashTimeOut);
        };
    }, []);

    useEffect(() => {
        const setInitialTheme = async () => {
            try {
                const value = await AsyncStorage.getItem('lightdark');
                if (value !== null) {
                    setTheme(value === 'dark' ? DarkTheme : DefaultTheme);
                }
            } catch (e) {
                console.error('Error reading value:', e);
            }
        };

        setInitialTheme();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                const value = await AsyncStorage.getItem('lightdark');
                if (value !== null && theme !== (value === 'dark' ? DarkTheme : DefaultTheme)) {
                    setTheme(value === 'dark' ? DarkTheme : DefaultTheme);
                }
            } catch (err) {
                console.error(err);
            }
        }, 500);

        return () => {
            clearInterval(intervalId);
        };
    }, [theme]);

    if (splashScreen) {
        return (
            <View style={styles.splashScreen}>
                <Image source={splashImageUrl ? { uri: splashImageUrl } : require('./assets/icon.png')} style={styles.splashImage} />
            </View>
        );
    }

    return (
        <SafeAreaProvider style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <NavigationContainer theme={theme}>
                <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }} keyboardShouldPersistTaps='handled' resetScrollToCoords={{ x: 0, y: 0 }}>
                    <Tab.Navigator
                        screenOptions={({ route }) => ({
                            tabBarIcon: ({ focused, color }) => {
                                return getIcon(route, focused, color);
                            },
                            tabBarLabel: () => undefined,
                            tabBarStyle: {
                                height: isKeyboardVisible ? 0 : 90,
                                ...Platform.select({
                                    ios: { borderTopWidth: 0, backgroundColor: theme.colors.background },
                                    android: { elevation: 0, backgroundColor: theme.colors.background },
                                }),
                            },
                            tabBarLabelStyle: {
                                marginBottom: 10,
                            },
                            tabBarActiveTintColor: theme.colors.primary,
                            tabBarInactiveTintColor: theme.colors.text,
                            tabBarIconStyle: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            },
                        })}
                    >
                        <Tab.Screen
                            name="홈"
                            component={Home}
                            options={{
                                headerTitleAlign: 'left',
                                headerTitleStyle: {
                                    fontSize: Platform.OS === 'ios' ? RFValue(20) : RFValue(20),
                                },
                                headerStyle: {
                                    backgroundColor: theme.dark ? '#333333' : '#F5F5F5', // 이 부분을 수정합니다.
                                },
                            }}
                        />
                        <Tab.Screen
                            name="문의"
                            component={Report}
                            options={{
                                headerTitleAlign: 'left',
                                headerTitleStyle: {
                                    fontSize: Platform.OS === 'ios' ? RFValue(20) : RFValue(20),
                                },
                                headerStyle: {
                                    backgroundColor: theme.dark ? '#333333' : '#F5F5F5', // 이 부분을 수정합니다.
                                },
                            }}
                        />
                        <Tab.Screen
                            name="설정"
                            component={Settings}
                            options={{
                                headerTitleAlign: 'left',
                                headerTitleStyle: {
                                    fontSize: Platform.OS === 'ios' ? RFValue(20) : RFValue(20),
                                },
                                headerStyle: {
                                    backgroundColor: theme.dark ? '#333333' : '#F5F5F5', // 이 부분을 수정합니다.
                                },
                            }}
                        />
                    </Tab.Navigator>
                </KeyboardAwareScrollView>
            </NavigationContainer>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    splashScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    splashImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'center',
        backgroundColor: '#fbe5d6',
    }
});

export default App;
