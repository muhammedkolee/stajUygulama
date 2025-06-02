import * as SQLite from 'expo-sqlite';
import { Alert } from 'react-native';

// Veritabanını aç
const db = SQLite.openDatabaseSync('datas.db');


// Başlangıçta tabloyu oluştur (sadece bir kere oluşturulur)
export const initDatabase = async () => {
  try {
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS answer_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        answers TEXT NOT NULL
      );`
    );
  } catch (error) {
    Alert.alert("Bir hata oluştu: ", error.message);
  }
};

// Cevap anahtarlarını getir
export const getAllAnswerKeys = async () => {
  try {
    return await db.getAllAsync('SELECT * FROM answer_keys');
  } catch (error) {
    Alert.alert("Veri çekme hatası: ", error.message);
    return [];
  }
};

// Cevap anahtarını sil
export const deleteAnswer = async (id) => {
  try {
    await db.runAsync("DELETE FROM answer_keys WHERE id = ?", [id]);
    Alert.alert("İşlem Başarılı!", "Cevap anahtarı başarıyla silindi.")
  } catch (error) {
    Alert.alert("Silme işlemi sırasında bir hata oluştu!", error.message);
    throw error
  }
}

// Yeni cevap anahtarı ekle
export const insertAnswerKey = async (name, answers) => {
  try {
    await db.runAsync('INSERT INTO answer_keys (name, answers) VALUES (?, ?)', name, answers);
    Alert.alert("İşlem başarılı!", "Cevap anahtarı kaydedildi.");
  } catch (error) {
    Alert.alert("Ekleme sırasında bir hata oluştu.\n", error.message);
    throw error; // Hata durumunda yukarı fırlat
  }
};

// Cevap anahtarını güncelle
export const updateAnswerKey = async (id, name, answers) => {
  try {
    await db.runAsync('UPDATE answer_keys SET name = ?, answers = ? WHERE id = ?', [name, answers, id]);
    Alert.alert("İşlem başarılı!", "Cevap anahtarı güncellendi.");
  } catch (error) {
    Alert.alert("Güncelleme sırasında bir hata oluştu.\n", error.message);
    throw error;
  }
};

// Tek bir cevap anahtarı getir (detay)
export const getAnswerKeyById = async (id) => {
  try {
    const result = await db.getFirstAsync('SELECT * FROM answer_keys WHERE id = ?', [id]);
    return result;
  } catch (error) {
    Alert.alert("Veri çekme hatası: ", error.message);
    return null;
  }
};

export default db;