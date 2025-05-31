import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function Hakkinda() {
  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.label}>📱 Uygulama Adı:</Text>
      <Text style={styles.text}>Optik Okuyucu</Text>

      <Text style={styles.label}>🎯 Amaç:</Text>
      <Text style={styles.text}>
        Bu uygulama, öğretmenlerin optik formlarını hızlı ve pratik bir şekilde dijital ortamda değerlendirmek için geliştirilmiştir.
      </Text>

      <Text style={styles.label}>❓ Nasıl Kullanılır?</Text>
      <Text style={styles.text}>
        1. Optiğin fotoğrafını yükleyiniz.{"\n"}
        2. Cevap anahtarını giriniz.{"\n"}
        3. Gönderip sounçlara anında erişebilirsiniz.
      </Text>

      <Text style={styles.label}>👨‍💻 Geliştirici:</Text>
      <Text style={styles.text}>
        Deniz Erol{"\n"}
        Muhammed Köle{"\n"}
        Davut Balasar
      </Text>

      <Text style={styles.label}>🛠️ Sürüm:</Text>
      <Text style={styles.text}>v1.0.0</Text>

      <Text style={styles.label}>📬 İletişim:</Text>
      <Text style={styles.text}>
        denizxerol@gmail.com{"\n"}
        muhammedkole18@gmail.com{"\n"}
        davut.balasar@hotmail.com
      </Text>  
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e0e0e0',
    flexGrow: 1,
  },
  label: {
    fontSize: 19,
    fontWeight: '600',
    marginTop: 15,
    color: 'black',
  },
  text: {
    fontSize: 17,
    fontWeight:'500',
    color: '#555',
    lineHeight: 22,
  },
});