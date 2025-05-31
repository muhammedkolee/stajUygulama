import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const cevapAnahtari = {
  "1": "A", "2": "B", "3": "C", "4": "D", "5": "E",
  "6": "A", "7": "B", "8": "C", "9": "D", "10": "E",
  "11": "A", "12": "B", "13": "C", "14": "D", "15": "E",
  "16": "A", "17": "B", "18": "C", "19": "D", "20": "E"
};

const AnaSayfa = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [selectedValue, setSelectedValue] = useState('20');
  const [result, setResult] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const uploadImages = async () => {
    if (images.length === 0) {
      Alert.alert("Uyarı", "Lütfen önce bir veya daha fazla fotoğraf seçin.");
      return;
    }

    const formData = new FormData();
    images.forEach((img, index) => {
      formData.append('image', {
        uri: img,
        name: `photo_${index}.jpg`,
        type: 'image/jpeg',
      });
    });

    formData.append('question_number', selectedValue);

    try {
      const response = await axios.post(
        'https://flaskserver-7w5d.onrender.com/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("Sonuç:", response.data);
      setResult(response.data);
    } catch (error) {
      console.error("Gönderme hatası:", error);
      Alert.alert("Hata", "Gönderme sırasında bir sorun oluştu.");
    }
  };

  const clearImages = () => {
    setImages([]);
    setResult(null);
  };

  // Header content for FlatList
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Optik Form Yükle</Text>
      <Button title="Fotoğraf Seç" onPress={pickImage} />

      {images.length > 0 && (
        <>
          <FlatList
            data={images}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            renderItem={({ item }) => (
              <View style={{ flex: 1, margin: 5 }}>
                <Image source={{ uri: item }} style={styles.imagePreview} />
              </View>
            )}
            scrollEnabled={false} // Yalnızca ana liste scroll edebilir
            contentContainerStyle={{ paddingVertical: 10 }}
          />

          <Text>Seçilen Soru Sayısı: {selectedValue}</Text>
          <Picker
            selectedValue={selectedValue}
            onValueChange={(itemValue) => setSelectedValue(itemValue)}
          >
            <Picker.Item label="10 soru" value="10" />
            <Picker.Item label="20 soru" value="20" />
            <Picker.Item label="30 soru" value="30" />
          </Picker>

          <Button title="Gönder ve Oku" onPress={uploadImages} />
          <Button title="Tümünü Temizle" onPress={clearImages} />
        </>
      )}

      <View style={{ marginVertical: 10 }}>
        <Button
          title="Cevap Anahtarı Sayfası"
          onPress={() => navigation.navigate('AnswerKey')}
        />
      </View>
    </View>
  );

  const renderResult = () => {
    if (!result) return null;

    return Object.entries(result).map(([studentName, answers]) => (
      <View key={studentName} style={{ marginTop: 20 }}>
        <Text style={styles.resultHeader}>Sınav Sonucu:</Text>
        <Text style={styles.studentName}>{studentName}</Text>
        {Object.entries(answers).map(([question, answer]) => {
          const correctAnswer = cevapAnahtari[question];
          let color = 'black';

          if (answer === 'None') color = 'gray';
          else if (answer === correctAnswer) color = 'green';
          else color = 'red';

          return (
            <Text key={question} style={{ color }}>
              Soru {question}: {answer === 'None' ? 'Boş' : answer} (Doğru: {correctAnswer})
            </Text>
          );
        })}
      </View>
    ));
  };

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      data={result ? [1] : []}
      keyExtractor={() => "result"}
      renderItem={renderResult}
      contentContainerStyle={styles.container}
    />
  );
};

export default AnaSayfa;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e0e0e0',
  },
  headerContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 6,
  },
  resultHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  studentName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
