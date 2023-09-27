import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <View style={styles.numberContainer}>
        <Text style={styles.number}>{count}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="증가"
          onPress={() => setCount(count + 1)}
          buttonStyle={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  number: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
});
