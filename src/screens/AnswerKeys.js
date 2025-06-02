import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { initDatabase, getAllAnswerKeys, deleteAnswer, updateAnswerKey } from '../../databases/database';

const AnswerKeysScreen = () => {
  const navigation = useNavigation();
  
  const [answerKeys, setAnswerKeys] = useState([]);
  const [selectedAnswerKey, setSelectedAnswerKey] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Edit için state'ler
  const [editExamName, setEditExamName] = useState('');
  const [editQuestionCount, setEditQuestionCount] = useState('');
  const [editAnswers, setEditAnswers] = useState([]);

  // Şık harfleri
  const choices = ['A', 'B', 'C', 'D', 'E'];

  // Component mount olduğunda database'i başlat ve verileri getir
useFocusEffect(
  React.useCallback(() => {
    initDatabase();
    loadAnswerKeys();
  }, [])
);

  // Cevap anahtarlarını yükle
  const loadAnswerKeys = async () => {
    try {
      setLoading(true);
      const keys = await getAllAnswerKeys();
      setAnswerKeys(keys);
    } catch (error) {
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cevap anahtarı detayını göster
  const showAnswerKeyDetail = (answerKey) => {
    setSelectedAnswerKey(answerKey);
    setShowDetailModal(true);
  };

  // Silme işlemi
  const handleDelete = (id, name) => {
    Alert.alert(
      'Silme Onayı',
      `"${name}" cevap anahtarını silmek istediğinizden emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAnswer(id);
              loadAnswerKeys(); // Listeyi yenile
            } catch (error) {
              Alert.alert('Hata', 'Silme işlemi sırasında bir hata oluştu: ' + error.message);
            }
          },
        },
      ]
    );
  };

  // Düzenleme işlemi
  const handleEdit = (answerKey) => {
    setSelectedAnswerKey(answerKey);
    setEditExamName(answerKey.name);
    setEditQuestionCount(answerKey.answers.length.toString());
    setEditAnswers(answerKey.answers.split(''));
    setShowEditModal(true);
  };

  // Modal'ı kapat
  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedAnswerKey(null);
  };

  // Edit modal'ı kapat
  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedAnswerKey(null);
    setEditExamName('');
    setEditQuestionCount('');
    setEditAnswers([]);
  };

  // Edit - Soru sayısı değişince answers dizisini baştan oluştur
  const handleEditQuestionCountChange = (text) => {
    // sadece rakamlara izin ver
    if (/^\d*$/.test(text)) {
      setEditQuestionCount(text);
      const count = parseInt(text);
      if (!isNaN(count) && count > 0) {
        const currentAnswers = [...editAnswers];
        if (count > currentAnswers.length) {
          // Yeni sorular ekle
          const newAnswers = [...currentAnswers, ...Array(count - currentAnswers.length).fill(null)];
          setEditAnswers(newAnswers);
        } else if (count < currentAnswers.length) {
          // Fazla soruları kırp
          setEditAnswers(currentAnswers.slice(0, count));
        }
      } else {
        setEditAnswers([]);
      }
    }
  };

  // Edit - Bir sorunun cevabını seçince answers dizisini güncelle
  const selectEditAnswer = (index, choice) => {
    const updated = [...editAnswers];
    updated[index] = choice;
    setEditAnswers(updated);
  };

  // Edit - Güncelleme işlemini kaydet
  const handleUpdateSubmit = async () => {
    if (!editExamName.trim()) {
      Alert.alert('Hata', 'Lütfen sınav ismini girin.');
      return;
    }
    
    if (editAnswers.length === 0) {
      Alert.alert('Hata', 'Lütfen soru sayısını girin.');
      return;
    }
    
    if (editAnswers.includes(null)) {
      Alert.alert('Hata', 'Tüm sorular için cevap seçin.');
      return;
    }

    try {
      // Cevapları string olarak birleştir (örn: "ABCDE")
      const answersString = editAnswers.join('');
      
      // Veritabanında güncelle
      await updateAnswerKey(selectedAnswerKey.id, editExamName.trim(), answersString);
      
      // Başarılı güncelleme sonrası modal'ı kapat ve listeyi yenile
      closeEditModal();
      loadAnswerKeys();
      
    } catch (error) {
      Alert.alert('Hata', 'Güncelleme sırasında bir hata oluştu: ' + error.message);
    }
  };

  // Cevapları dizi haline getir
  const getAnswersArray = (answersString) => {
    return answersString.split('');
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Cevap Anahtarları</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={true}
        >
          {answerKeys.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz cevap anahtarı eklenmemiş.</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('AnswerKey')} // AnswerKeyScreen'e git
              >
                <Text style={styles.addButtonText}>İlk Cevap Anahtarını Ekle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            answerKeys.map((item, index) => (
              <View key={item.id} style={styles.answerKeyCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>
                    {item.answers.length} Soru
                  </Text>
                </View>
                
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.detailButton}
                    onPress={() => showAnswerKeyDetail(item)}
                  >
                    <Text style={styles.detailButtonText}>Detay</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEdit(item)}
                  >
                    <Text style={styles.editButtonText}>Düzenle</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id, item.name)}
                  >
                    <Text style={styles.deleteButtonText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Detay Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAnswerKey && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedAnswerKey.name}</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalScrollView}>
                  <Text style={styles.modalSubtitle}>
                    Toplam {selectedAnswerKey.answers.length} Soru
                  </Text>
                  
                  {getAnswersArray(selectedAnswerKey.answers).map((answer, index) => (
                    <View key={index} style={styles.answerRow}>
                      <Text style={styles.answerQuestionText}>
                        Soru {index + 1}:
                      </Text>
                      <View style={styles.answerChoicesContainer}>
                        {choices.map((choice) => (
                          <View
                            key={choice}
                            style={[
                              styles.answerChoice,
                              answer === choice && styles.answerChoiceSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.answerChoiceText,
                                answer === choice && styles.answerChoiceTextSelected,
                              ]}
                            >
                              {choice}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </ScrollView>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.modalEditButton}
                    onPress={() => {
                      closeModal();
                      handleEdit(selectedAnswerKey);
                    }}
                  >
                    <Text style={styles.modalEditButtonText}>Düzenle</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.modalDeleteButton}
                    onPress={() => {
                      closeModal();
                      handleDelete(selectedAnswerKey.id, selectedAnswerKey.name);
                    }}
                  >
                    <Text style={styles.modalDeleteButtonText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cevap Anahtarını Düzenle</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeEditModal}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.editModalScrollView}>
              <View style={styles.editForm}>
                <Text style={styles.editLabel}>Sınav İsmini Giriniz:</Text>
                <TextInput 
                  style={styles.editInput}
                  placeholder='Matematik'
                  value={editExamName}
                  onChangeText={setEditExamName}
                />

                <Text style={styles.editLabel}>Soru Sayısı Giriniz:</Text>
                <TextInput
                  keyboardType="numeric"
                  style={styles.editInput}
                  placeholder="Örn: 10"
                  value={editQuestionCount}
                  onChangeText={handleEditQuestionCountChange}
                />

                {editAnswers.map((answer, i) => (
                  <View key={i} style={styles.editQuestionRow}>
                    <Text style={styles.editQuestionText}>Soru {i + 1}:</Text>
                    <View style={styles.editChoicesContainer}>
                      {choices.map((choice) => (
                        <TouchableOpacity
                          key={choice}
                          style={[
                            styles.editChoiceButton,
                            answer === choice && styles.editChoiceSelected,
                          ]}
                          onPress={() => selectEditAnswer(i, choice)}
                        >
                          <Text
                            style={[
                              styles.editChoiceText,
                              answer === choice && styles.editChoiceTextSelected,
                            ]}
                          >
                            {choice}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.editModalActions}>
              <TouchableOpacity 
                style={styles.editModalCancelButton}
                onPress={closeEditModal}
              >
                <Text style={styles.editModalCancelButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.editModalSaveButton}
                onPress={handleUpdateSubmit}
              >
                <Text style={styles.editModalSaveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AnswerKeysScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e0e0',
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
    marginTop: 50,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#2196f3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  answerKeyCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginLeft: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#f44336',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    padding: 20,
    paddingBottom: 10,
    textAlign: 'center',
  },
  answerRow: {
    marginVertical: 8,
    marginHorizontal: 20,
  },
  answerQuestionText: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
    color: '#333',
  },
  answerChoicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  answerChoice: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  answerChoiceSelected: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  answerChoiceText: {
    color: '#666',
    fontWeight: '600',
  },
  answerChoiceTextSelected: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalEditButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  modalEditButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalDeleteButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalDeleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Edit Modal Styles
  editModalContent: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    maxHeight: '90%',
    width: '95%',
  },
  editModalScrollView: {
    maxHeight: 500,
  },
  editForm: {
    padding: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
    color: '#333',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  editQuestionRow: {
    marginVertical: 8,
  },
  editQuestionText: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
    color: '#333',
  },
  editChoicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  editChoiceButton: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#f9f9f9',
  },
  editChoiceSelected: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  editChoiceText: {
    color: '#333',
    fontWeight: '600',
  },
  editChoiceTextSelected: {
    color: '#fff',
  },
  editModalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  editModalCancelButton: {
    backgroundColor: '#757575',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  editModalCancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editModalSaveButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  editModalSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});