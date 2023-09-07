import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Appearance, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from './Home';
import Report from './Report';
import Settings from './Settings';
import { SafeAreaView } from 'react-native';
import { Platform } from 'react-native';
const Tab = createBottomTabNavigator();

const getIcon = (route, focused, color) => {
  if (route.name === '홈') {
    return <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={24} style={{ marginTop: Platform.OS === 'ios' ? 0 : 10 }} />;
  } else if (route.name === '문의') {
    return <MaterialCommunityIcons name={focused ? 'file-document' : 'file-document-outline'} color={color} size={24} style={{ marginTop: Platform.OS === 'ios' ? 0 : 10 }} />;
  } else if (route.name === '설정') {
    return <Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={24} style={{ marginTop: Platform.OS === 'ios' ? 0 : 10 }} />;
  }
};

const App = () => {
  const [splashScreen, setSplashScreen] = useState(true);
  const [splashImageUrl, setSplashImageUrl] = useState(null);
  const [theme, setTheme] = useState(DefaultTheme);

  useEffect(() => {
    const splashTimeOut = setTimeout(() => {
      setSplashScreen(false);
    }, 1000);

    fetch('https://findbin.uiharu.dev/splash/splash.png')
      .then((response) => {
        if (response.ok) {
          setSplashImageUrl('https://findbin.uiharu.dev/splash/splash.png');
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
  ;

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
  
    const themeChangeListener = () => {
      AsyncStorage.getItem('lightdark').then(value => {
        setTheme(value === 'dark' ? DarkTheme : DefaultTheme);
      }).catch(e => {
        console.error('Error reading value:', e);
      });
    };
  
    const subscription = DeviceEventEmitter.addListener(
      'storageModified',
      themeChangeListener,
    );
  
    return () => {
      subscription.remove();
    };
  }, []);  

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
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color }) => {
              return getIcon(route, focused, color);
            },
            tabBarStyle: {
              height: 70,
              ...Platform.select({
                ios: { borderTopWidth: 0, backgroundColor: theme.colors.background },
                android: { elevation: 0, backgroundColor: theme.colors.background },
              }),
            },
            tabBarLabelStyle: {
              marginBottom: 10,
            },
            tabBarActiveTintColor: theme.colors.primary, // 활성 탭의 글자 색상
            tabBarInactiveTintColor: theme.colors.text, // 비활성 탭의 글자 색상
          })}
        >
          <Tab.Screen name="홈" component={Home} />
          <Tab.Screen name="문의" component={Report} />
          <Tab.Screen name="설정" component={Settings} />
        </Tab.Navigator>

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
  },
});

export default App;
