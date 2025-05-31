import React, { useState } from 'react';
import { View, Button, Image, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const cevapAnahtari = {
  1 : "E",
  2 : "E",
  3 : "C",
  4 : "D",
  5 : "C",
  6 : "B",
  7 : "B",
  8 : "A",
  9 : "A",
  10 : "E",
  11 : "E",
  12 : "C",
  13 : "C",
  14 : "D",
  15 : "B",
  16 : "B",
  17 : "A",
  18 : "C",
  19 : "D",
  20 : "D"
}

export default function App() {
  const [images, setImages] = useState([]);
  const [result, setResult] = useState(null);
    const [selectedValue, setSelectedValue] = useState('20');

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    // if (!permissionResult.granted) {
    //   alert('Kamera izni gerekli!');
    //   return;
    // }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.Images,
      base64: false,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setImages((prev) => [...prev, selectedUri]); // yeni resmi listeye ekle
    }
  };

  const uploadImages = async () => {
    const formData = new FormData();

    images.forEach((imgUri, index) => {
      formData.append('image', {
        uri: imgUri,
        name: "photo_${index}.jpg",
        type: 'image/jpeg',
      });
    });

    formData.append('question_number', selectedValue.toString());

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
      console.log(response.data);
      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert('Sunucuya gönderilemedi!');
    }
  };

  const clearImages = () => {
    setImages([]);
    setResult(null);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 50 }}>
      <Button title="Resim Ekle" onPress={pickImage} />

      {images.length > 0 && (
        <>
          <ScrollView horizontal style={{ marginVertical: 10 }}>
            {images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={{ width: 100, height: 100, marginRight: 10 }}
              />
            ))}
          </ScrollView>

          <Button title="Tümünü Gönder" onPress={uploadImages} />
                <Text>Seçilen: {selectedValue}</Text>
      <Picker
        selectedValue={selectedValue}
        onValueChange={(itemValue, itemIndex) =>
          setSelectedValue(itemValue)
        }>
        <Picker.Item label="10 soru" value="10" />
        <Picker.Item label="20 soru" value="20" />
        <Picker.Item label="30 soru" value="30" />
      </Picker>
          <TouchableOpacity onPress={clearImages} style={{ marginTop: 10 }}>
            <Text style={{ color: 'red', textAlign: 'center' }}>Tümünü Temizle</Text>
          </TouchableOpacity>
        </>
      )}

{result && (
  <View style={{ marginTop: 20 }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'green' }}>
      Sınav Sonucu:
    </Text>

    {Object.entries(result).map(([studentName, answers]) => (
      <View key={studentName} style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{studentName}</Text>
        {Object.entries(answers).map(([question, answer]) => {
          const correctAnswer = cevapAnahtari[question];
          let color = 'black';

          if (answer === 'None') {
            color = 'gray';
          } else if (answer === correctAnswer) {
            color = 'green';
          } else {
            color = 'red';
          }

          return (
            <Text key={question} style={{ color }}>
              Soru {question}: {answer === 'None' ? 'Boş' : answer}      (Doğru: {correctAnswer})
            </Text>
          );
        })}
      </View>
    ))}
  </View>
)}


    </ScrollView>
  );
}