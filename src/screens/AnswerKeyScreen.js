import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const choices = ['A', 'B', 'C', 'D', 'E'];

const AnswerKeyScreen = () => {
  const [questionCount, setQuestionCount] = useState('');
  const [answers, setAnswers] = useState([]);

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
  const handleSubmit = () => {
    if (answers.length === 0) {
      Alert.alert('Hata', 'Lütfen soru sayısını girin.');
      return;
    }
    if (answers.includes(null)) {
      Alert.alert('Hata', 'Tüm sorular için cevap seçin.');
      return;
    }

    Alert.alert('Cevap Anahtarı', answers.join(''));
    // Burada backend'e göndermek istersen yapabilirsin
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cevap Anahtarı Oluştur</Text>

      <Text>Soru Sayısı Giriniz:</Text>
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
    padding: 20,
    backgroundColor: '#e0e0e0',
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
