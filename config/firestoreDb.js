// config/filestoreDB.js
const { Firestore } = require('@google-cloud/firestore');
const path = require('path');

// Inisialisasi Firestore dengan kredensial dari file service account
const db = new Firestore({
  projectId: 'ingrevia', // Ganti dengan ID proyek Google Cloud Anda
  keyFilename: path.resolve(__dirname, '../service.json'), // Path ke file service account key JSON
});

// Export db agar bisa digunakan di file lain
module.exports = db;
