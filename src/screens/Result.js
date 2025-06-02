import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getAnswerKeyById } from '../../databases/database';

const { width } = Dimensions.get('window');

const Result = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // AnaSayfa'dan gelen parametreler
  const { resultData, selectedAnswerKeyId, questionCount } = route.params;
  
  const [answerKeyData, setAnswerKeyData] = useState(null);
  const [processedResults, setProcessedResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // useFocusEffect kullanarak her sayfa odaklandığında veriyi yeniden yükle
  useFocusEffect(
    React.useCallback(() => {
      // Sayfa her odaklandığında state'leri sıfırla ve yeniden yükle
      setLoading(true);
      setAnswerKeyData(null);
      setProcessedResults([]);
      loadAnswerKeyAndProcessResults();
    }, [resultData, selectedAnswerKeyId, questionCount])
  );

  const loadAnswerKeyAndProcessResults = async () => {
    try {
      // Seçili cevap anahtarını veritabanından yükle
      const keyData = await getAnswerKeyById(selectedAnswerKeyId);
      
      if (keyData) {
        // Cevap string'ini objeye çevir
        const answersObject = {};
        const answersString = keyData.answers;
        for (let i = 0; i < answersString.length; i++) {
          answersObject[(i + 1).toString()] = answersString[i];
        }
        setAnswerKeyData({ name: keyData.name, answers: answersObject });
        
        // Sonuçları işle
        processResults(resultData, answersObject);
      } else {
        Alert.alert('Hata', 'Cevap anahtarı bulunamadı.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Cevap anahtarı yüklenirken hata:', error);
      Alert.alert('Hata', 'Sonuçlar işlenirken bir hata oluştu.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const processResults = (resultData, correctAnswers) => {
    const processed = [];
    
    // resultData yapısını kontrol et - eğer students array'i varsa onu kullan
    const studentsData = resultData.students || resultData;
    
    Object.entries(studentsData).forEach(([studentName, studentData]) => {
      let correctCount = 0;
      let wrongCount = 0;
      let emptyCount = 0;
      const questionResults = [];
      
      // Öğrenci verilerinden cevapları al
      const studentAnswers = studentData.answers || studentData;
      // Öğrenci orijinal görselini al (eğer varsa)
      const studentImageUri = studentData.originalImageUri || null;
      
      // Her soru için sonuç hesapla
      for (let i = 1; i <= parseInt(questionCount); i++) {
        const questionNum = i.toString();
        const studentAnswer = studentAnswers[questionNum] || 'None';
        const correctAnswer = correctAnswers[questionNum];
        
        let status = 'empty';
        if (studentAnswer === 'None') {
          emptyCount++;
          status = 'empty';
        } else if (studentAnswer === correctAnswer) {
          correctCount++;
          status = 'correct';
        } else {
          wrongCount++;
          status = 'wrong';
        }
        
        questionResults.push({
          questionNumber: i,
          studentAnswer: studentAnswer === 'None' ? 'Boş' : studentAnswer,
          correctAnswer,
          status
        });
      }
      
      // Yüzde hesapla
      const totalQuestions = parseInt(questionCount);
      const successPercentage = ((correctCount / totalQuestions) * 100).toFixed(1);
      
      processed.push({
        studentName,
        correctCount,
        wrongCount,
        emptyCount,
        totalQuestions,
        successPercentage,
        questionResults,
        imageUri: studentImageUri // Orijinal görsel URI'ini ekle
      });
    });
    
    setProcessedResults(processed);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'correct': return '#4CAF50';
      case 'wrong': return '#F44336';
      case 'empty': return '#9E9E9E';
      default: return '#000';
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 85) return '#4CAF50';
    if (percentage >= 70) return '#FF9800';
    if (percentage >= 50) return '#FF5722';
    return '#F44336';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Sonuçlar işleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Sınav Sonuçları</Text>
      
      {/* Cevap anahtarı bilgisi */}
      {answerKeyData && (
        <View style={styles.answerKeyInfo}>
          <Text style={styles.answerKeyTitle}>
            Kullanılan Cevap Anahtarı: {answerKeyData.name}
          </Text>
          <Text style={styles.answerKeyPreview}>
            Toplam Soru: {questionCount}
          </Text>
        </View>
      )}

      {/* Her öğrenci için sonuçlar */}
      {processedResults.map((student, index) => (
        <View key={index} style={styles.studentContainer}>
          {/* Öğrenci orijinal görseli */}
          {student.imageUri && (
            <View style={styles.studentImageContainer}>
              <Text style={styles.studentImageTitle}>Orijinal Form:</Text>
              <Image 
                source={{ uri: student.imageUri }} 
                style={styles.studentImage}
                resizeMode="contain"
              />
            </View>
          )}

          <View style={styles.studentHeader}>
            {/* <Text style={styles.studentName}>{student.studentName}</Text> */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Doğru</Text>
                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                  {student.correctCount}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Yanlış</Text>
                <Text style={[styles.summaryValue, { color: '#F44336' }]}>
                  {student.wrongCount}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Boş</Text>
                <Text style={[styles.summaryValue, { color: '#9E9E9E' }]}>
                  {student.emptyCount}
                </Text>
              </View>
            </View>
          </View>

          {/* Başarı yüzdesi */}
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageLabel}>Başarı Oranı:</Text>
            <Text style={[
              styles.percentageValue, 
              { color: getGradeColor(parseFloat(student.successPercentage)) }
            ]}>
              %{student.successPercentage}
            </Text>
          </View>

          {/* Net hesaplama (doğru - (yanlış/4)) */}
          <View style={styles.netContainer}>
            <Text style={styles.netLabel}>Puan</Text>
            <Text style={styles.netValue}>
              {Math.ceil(student.correctCount * (100 / questionCount))}
            </Text>
          </View>

          {/* Soru detayları */}
          <View style={styles.questionsContainer}>
            <Text style={styles.questionsTitle}>Soru Detayları:</Text>
            <View style={styles.questionsGrid}>
              {student.questionResults.map((question) => (
                <View key={question.questionNumber} style={styles.questionItem}>
                  <Text style={styles.questionNumber}>S{question.questionNumber}</Text>
                  <Text style={[
                    styles.questionAnswer,
                    { color: getStatusColor(question.status) }
                  ]}>
                    {question.studentAnswer}
                  </Text>
                  <Text style={styles.correctAnswer}>({question.correctAnswer})</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}

      {/* Genel özet */}
      {processedResults.length > 1 && (
        <View style={styles.overallSummary}>
          <Text style={styles.overallTitle}>Genel Özet</Text>
          <Text style={styles.overallText}>
            Toplam Öğrenci Sayısı: {processedResults.length}
          </Text>
          <Text style={styles.overallText}>
            Ortalama Başarı: %{(
              processedResults.reduce((sum, student) => 
                sum + parseFloat(student.successPercentage), 0
              ) / processedResults.length
            ).toFixed(1)}
          </Text>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

export default Result;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#666',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 80,
    marginBottom: 20,
    color: '#333',
  },
  answerKeyInfo: {
    backgroundColor: '#e3f2fd',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  answerKeyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 5,
  },
  answerKeyPreview: {
    fontSize: 14,
    color: '#424242',
  },
  studentContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentImageContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  studentImageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  studentImage: {
    width: width - 80,
    height: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  studentHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
    marginBottom: 15,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  percentageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  percentageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  percentageValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  netContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  netLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  netValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  questionsContainer: {
    marginTop: 10,
  },
  questionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  questionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  questionItem: {
    width: width * 0.18,
    alignItems: 'center',
    marginVertical: 5,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  questionNumber: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  questionAnswer: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  correctAnswer: {
    fontSize: 10,
    color: '#999',
  },
  overallSummary: {
    backgroundColor: '#e8f5e8',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  overallText: {
    fontSize: 14,
    color: '#388E3C',
    marginBottom: 5,
  },
  bottomPadding: {
    height: 50,
  },
});