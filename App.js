import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Deniz Askilotam</Text>
      <View>
        <Text style={styles.daut}>
          Dauuuddd
        </Text>
        <Image style = {styles.foto} source={require('./assets/foto.jpg')}/>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  daut: {
    backgroundColor: "blue",
    color: "red"
  },
  foto: {
    height: 400,
    width: 400
  }
});
