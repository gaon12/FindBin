import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      setLocation(location);

      // Nominatim 리버스 지오코딩
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.coords.latitude}&lon=${location.coords.longitude}&zoom=18&addressdetails=1&accept-language=ko`);
      const data = await response.json();
      setAddress(data.display_name);

      setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? <Text>로딩 중입니다...</Text> : null}
      {errorMsg ? <Text>Error: {errorMsg}</Text> : null}
      {location ? (
        <Text>
          현재 좌표: {location.coords.latitude}, {location.coords.longitude}
        </Text>
      ) : null}
      {address ? <Text>주소: {address}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
