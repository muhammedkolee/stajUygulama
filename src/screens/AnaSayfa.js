import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  FlatList,
  TouchableHighlight,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { getAllAnswerKeys, getAnswerKeyById, initDatabase } from '../../databases/database'; // database.js dosyanızın yolunu güncelleyin

const AnaSayfa = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [questionNumber, setQuestionNumber] = useState('20');
  const [selectedAnswerKey, setSelectedAnswerKey] = useState(null);
  const [answerKeys, setAnswerKeys] = useState([]);
  const [currentAnswerKeyData, setCurrentAnswerKeyData] = useState(null);
  const [result, setResult] = useState(null);

  // Component mount olduğunda cevap anahtarlarını yükle
  useEffect(() => {
    initDatabase();
    loadAnswerKeys();
  }, []);

  // Cevap anahtarları değiştiğinde ekranı yenile (AnswerKey ekranından dönüldüğünde)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAnswerKeys();
    });

    return unsubscribe;
  }, [navigation]);

  // Seçilen cevap anahtarı değiştiğinde detaylarını yükle
  useEffect(() => {
    if (selectedAnswerKey) {
      loadAnswerKeyDetails(selectedAnswerKey);
    }
  }, [selectedAnswerKey]);

  const loadAnswerKeys = async () => {
    try {
      const keys = await getAllAnswerKeys();
      setAnswerKeys(keys);
      
      // Eğer daha önce seçili bir cevap anahtarı varsa ve artık mevcut değilse, seçimi temizle
      if (selectedAnswerKey && !keys.find(key => key.id === selectedAnswerKey)) {
        setSelectedAnswerKey(null);
        setCurrentAnswerKeyData(null);
      }
    } catch (error) {
      console.error('Cevap anahtarları yüklenirken hata:', error);
      Alert.alert('Hata', 'Cevap anahtarları yüklenirken bir sorun oluştu.');
    }
  };

  const loadAnswerKeyDetails = async (keyId) => {
    try {
      const keyData = await getAnswerKeyById(keyId);
      if (keyData) {
        // Cevap string'ini objeye çevir
        const answersObject = {};
        const answersString = keyData.answers;
        for (let i = 0; i < answersString.length; i++) {
          answersObject[(i + 1).toString()] = answersString[i];
        }
        setCurrentAnswerKeyData(answersObject);
      }
    } catch (error) {
      console.error('Cevap anahtarı detayları yüklenirken hata:', error);
    }
  };

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

  if (!selectedAnswerKey) {
    Alert.alert("Uyarı", "Lütfen bir cevap anahtarı seçin.");
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

  formData.append('question_number', questionNumber);

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

    // console.log("Sunucu Yanıtı:", response.data);
    
    // Orijinal görselleri öğrenci isimleriyle eşleştir
    const studentsWithImages = {};
    const studentNames = Object.keys(response.data);
    
    studentNames.forEach((studentName, index) => {
      studentsWithImages[studentName] = {
        answers: response.data[studentName],
        originalImageUri: images[index] || null // Orijinal yüklenen görsel URI'si
      };
    });
    
    // console.log("İşlenmiş Veri:", studentsWithImages);
    
    // Result sayfasına yönlendir
    navigation.navigate('Result', {
      resultData: studentsWithImages,
      selectedAnswerKeyId: selectedAnswerKey,
      questionCount: questionNumber
    });
    
  } catch (error) {
    console.error("Gönderme hatası:", error);
    Alert.alert("Hata", "Gönderme sırasında bir sorun oluştu.");
  }
};

  const clearImages = () => {
    setImages([]);
    setResult(null);
  };

  const renderHeader = () => (
    <View>
      <Text style={styles.title}>Optik Form Yükle</Text>
      <TouchableHighlight style={{marginBottom: 8}} onPress={pickImage}>
        <View style={styles.buttonView}>
          <Text style={styles.buttonText}>Fotoğraf Seç</Text>
        </View>
      </TouchableHighlight>

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

          <Text>Seçilen Soru Sayısı: {questionNumber}</Text>
          <Picker
            selectedValue={questionNumber}
            onValueChange={(itemValue) => setQuestionNumber(itemValue)}
          >
            <Picker.Item label="10 soru" value="10" />
            <Picker.Item label="15 soru" value="15" />
            <Picker.Item label="20 soru" value="20" />
            <Picker.Item label="25 soru" value="25" />
            <Picker.Item label="30 soru" value="30" />
          </Picker>

          <TouchableHighlight style={{marginBottom: 8}} onPress={uploadImages}>
            <View style={styles.buttonView}>
              <Text style={styles.buttonText}>Gönder ve Oku</Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight style={{marginBottom: 8}} onPress={clearImages}>
            <View style={styles.buttonView}>
              <Text style={styles.buttonText}>Tümünü Temizle</Text>
            </View>
          </TouchableHighlight>
        </>
      )}

      <TouchableHighlight style={{marginBottom: 8}} onPress={() => navigation.navigate('AnswerKeys')}>
        <View style={styles.buttonView}>
          <Text style={styles.buttonText}>Cevap Anahtarlarını Göster</Text>
        </View>
      </TouchableHighlight>

      <TouchableHighlight style={{marginBottom: 8}} onPress={() => navigation.navigate('AnswerKey')}>
        <View style={styles.buttonView}>
          <Text style={styles.buttonText}>Cevap Anahtarı Ekle</Text>
        </View>
      </TouchableHighlight>

      <Text style={styles.pickerLabel}>Cevap Anahtarı Seçin:</Text>
      <Picker
        selectedValue={selectedAnswerKey}
        onValueChange={(itemValue) => setSelectedAnswerKey(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Cevap anahtarı seçin..." value={null} />
        {answerKeys.map((key) => (
          <Picker.Item 
            key={key.id} 
            label={key.name} 
            value={key.id} 
          />
        ))}
      </Picker>

      {selectedAnswerKey && currentAnswerKeyData && (
        <View style={styles.selectedAnswerKeyInfo}>
          <Text style={styles.selectedAnswerKeyTitle}>
            Seçilen Cevap Anahtarı: {answerKeys.find(k => k.id === selectedAnswerKey)?.name}
          </Text>
          <Text style={styles.selectedAnswerKeyPreview}>
            Cevaplar: {Object.values(currentAnswerKeyData).join('')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderResult = () => {
    if (!result) return null;

    // Mevcut cevap anahtarını kullan, yoksa eski sabit cevap anahtarını kullan
    const activeAnswerKey = currentAnswerKeyData || cevapAnahtari;

    return Object.entries(result).map(([studentName, answers]) => (
      <View key={studentName} style={{ marginTop: 20 }}>
        <Text style={styles.resultHeader}>Sınav Sonucu:</Text>
        <Text style={styles.studentName}>{studentName}</Text>
        {Object.entries(answers).map(([question, answer]) => {
          const correctAnswer = activeAnswerKey[question];
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
  buttonView: {
    backgroundColor: "#0066ff",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    color: "white",
    marginTop: 10,
    marginBottom: 10
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  picker: {
    marginBottom: 15,
  },
  selectedAnswerKeyInfo: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  selectedAnswerKeyTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  selectedAnswerKeyPreview: {
    fontSize: 14,
    color: '#666',
  },
});