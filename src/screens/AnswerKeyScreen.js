import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { initDatabase, insertAnswerKey } from '../../databases/database'; // database.js dosyanızın yolunu güncelleyin

 // Şık harfleri
  const choices = ['A', 'B', 'C', 'D', 'E'];

const AnswerKeyScreen = () => {
  const navigation = useNavigation();

  const [examName, setExamName] = useState('');
  const [questionCount, setQuestionCount] = useState('');
  const [answers, setAnswers] = useState([]);

  // Component mount olduğunda database'i başlat
  useEffect(() => {
    initDatabase();
  }, []);

  // Soru sayısı değişince answers dizisini baştan oluştur
  const handleQuestionCountChange = (text) => {
    // sadece rakamlara izin ver
    if (/^\d*$/.test(text)) {
      setQuestionCount(text);
      const count = parseInt(text);
      if (!isNaN(count) && count > 0) {
        // Mevcut answers dizisini count kadar olacak şekilde ayarla
        setAnswers(Array(count).fill(null));
      } else {
        setAnswers([]);
      }
    }
  };

  // Bir sorunun cevabını seçince answers dizisini güncelle
  const selectAnswer = (index, choice) => {
    const updated = [...answers];
    updated[index] = choice;
    setAnswers(updated);
  };

  // Gönder butonu için kısa kontrol
  const handleSubmit = async () => {
    if (!examName.trim()) {
      Alert.alert('Hata', 'Lütfen sınav ismini girin.');
      return;
    }
    
    if (answers.length === 0) {
      Alert.alert('Hata', 'Lütfen soru sayısını girin.');
      return;
    }
    
    if (answers.includes(null)) {
      Alert.alert('Hata', 'Tüm sorular için cevap seçin.');
      return;
    }

    try {
      // Cevapları string olarak birleştir (örn: "ABCDE")
      const answersString = answers.join('');
      
      // Veritabanına kaydet
      await insertAnswerKey(examName.trim(), answersString);
      
      // Başarılı kayıt sonrası formu temizle
      setExamName('');
      setQuestionCount('');
      setAnswers([]);
      
      Alert.alert(
        'Başarılı', 
        `Cevap anahtarı kaydedildi!\nSınav: ${examName}\nCevaplar: ${answersString}`,
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Hata', 'Kayıt sırasında bir hata oluştu: ' + error.message);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      {/* Back button top-left */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Cevap Anahtarı Oluştur</Text>

      <Text>Sınav İsmini Giriniz:</Text>
      <TextInput 
        style={styles.input}
        placeholder='Matematik'
        value={examName}
        onChangeText={setExamName}
      />

      <Text style={{marginTop: 10}}>Soru Sayısı Giriniz:</Text>
      <TextInput
        keyboardType="numeric"
        style={styles.input}
        placeholder="Örn: 10"
        value={questionCount}
        onChangeText={handleQuestionCountChange}
      />

      {answers.map((answer, i) => (
        <View key={i} style={styles.questionRow}>
          <Text style={styles.questionText}>Soru {i + 1}:</Text>
          <View style={styles.choicesContainer}>
            {choices.map((choice) => (
              <TouchableOpacity
                key={choice}
                style={[
                  styles.choiceButton,
                  answer === choice && styles.choiceSelected,
                ]}
                onPress={() => selectAnswer(i, choice)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    answer === choice && styles.choiceTextSelected,
                  ]}
                >
                  {choice}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {answers.length > 0 && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Kaydet</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default AnswerKeyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 33,  // add extra padding so back button doesn't overlap title
    paddingBottom: 100, // Kaydet butonu için extra alan
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'grey',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    zIndex: 10,
  },
  backButtonText: {
    marginBottom: 5,
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 6,
    marginVertical: 10,
    fontSize: 16,
  },
  questionRow: {
    marginVertical: 10,
  },
  questionText: {
    fontWeight: '600',
    marginBottom: 5,
    fontSize: 16,
  },
  choicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  choiceButton: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  choiceSelected: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  choiceText: {
    color: '#333',
    fontWeight: '600',
  },
  choiceTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#2196f3',
    padding: 14,
    marginTop: 25,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});