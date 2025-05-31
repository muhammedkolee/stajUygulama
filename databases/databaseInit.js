// import * as SQLite from 'expo-sqlite';

// const db = SQLite.openDatabase('datas.db');

// export const initDatabase = () => {
//   db.transaction(tx => {
//     tx.executeSql(
//       `CREATE TABLE IF NOT EXISTS answerKeys (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT,
//         answers TEXT,
//         createdDate TEXT
//       );`,
//       [],
//       () => console.log("✅ answerKeys tablosu oluşturuldu (veya zaten var)"),
//       (_, error) => {
//         console.error("❌ answerKeys tablosu oluşturulurken hata:", error);
//         return false;
//       }
//     );
//   });
// };

// export const insertAnswerKey = (name, answers) => {
//   const createdDate = new Date().toISOString();

//   return new Promise((resolve, reject) => {
//     db.transaction(tx => {
//       tx.executeSql(
//         `INSERT INTO answerKeys (name, answers, createdDate) VALUES (?, ?, ?);`,
//         [name, JSON.stringify(answers), createdDate],
//         (_, result) => resolve(result),
//         (_, error) => {
//           reject(error);
//           return false;
//         }
//       );
//     });
//   });
// };

// export default db;
