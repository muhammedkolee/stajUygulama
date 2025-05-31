import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const UploadScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [answerKey, setAnswerKey] = useState('');

  // Fotoğraf seçme
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Gönderme işlemi
  const handleSubmit = async () => {
    if (!image || answerKey.trim() === '') {
      Alert.alert("Uyarı", "Lütfen hem fotoğrafı hem de cevap anahtarını girin.");
      return;
    }

    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: 'optik.jpg',
      type: 'image/jpeg',
    });
    formData.append('answerKey', answerKey);

    try {
      const response = await axios.post('http://IP_ADRESIN:PORT/oku', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Sonuç:", response.data);
      Alert.alert("Sonuç", JSON.stringify(response.data));

    } catch (error) {
      console.error("Gönderme hatası:", error);
      Alert.alert("Hata", "Gönderme sırasında bir sorun oluştu.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Optik Form Yükle</Text>

      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Fotoğraf Seç" onPress={pickImage} />


      <View style={{ marginVertical: 10 }}>
        <Button title="Cevap Anahtarı Sayfası" onPress={() => navigation.navigate('AnswerKey')} />
      </View>

      <Button title="Gönder ve Oku" onPress={handleSubmit} />
    </View>
  );
};

export default UploadScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'flex-start',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  label: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },
});