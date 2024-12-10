// Import modul yang diperlukan
const { Firestore } = require('@google-cloud/firestore');
const path = require('path');


// Inisialisasi Firestore dengan kredensial dari file service account
const db = new Firestore({
  projectId: 'ingrevia',  // Ganti dengan projectId yang sesuai
  keyFilename: path.resolve(__dirname, './service.json')
});

// // Inisialisasi Firebase Admin SDK
// if (!admin.apps.length) {
//   admin.initializeApp({
//       credential: admin.credential.cert(path.join(__dirname, './service.json')),
//       databaseURL: 'https://ingrevia-default-rtdb.asia-southeast1.firebasedatabase.app',
//   });
// }

// Cek jika Firestore berhasil diinisialisasi
db.collection('users') // Contoh query sederhana untuk mengecek apakah koneksi berhasil
  .get()
  .then(snapshot => {
    console.log('Firestore connected successfully');
  })
  .catch(err => {
    console.error('Error connecting to Firestore:', err);
  });

// Export db agar bisa digunakan di file lain
module.exports = db;
