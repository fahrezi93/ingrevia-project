const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Ganti dengan file kunci Firestore Anda

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = db;
