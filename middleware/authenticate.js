const admin = require('firebase-admin'); // Mengimpor Firebase Admin SDK
const { db } = require('../config/firestoreDb.js'); // Impor Firestore jika dibutuhkan

// Middleware untuk autentikasi
const authenticate = async (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Pisahkan prefix Bearer dan token
    const token = authorizationHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verifikasi ID token dengan Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Simpan informasi pengguna dari token yang terverifikasi
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
    };

    // (Opsional) Verifikasi keberadaan user di Firestore
    // Uncomment bagian ini jika ingin memeriksa keberadaan user di database
    /*
    const userRef = db.collection('users').doc(req.user.id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    */

    // Lanjutkan ke route berikutnya jika token valid
    next();
  } catch (error) {
    console.error('Error in authentication:', error);

    // Tanggapi dengan pesan yang lebih spesifik
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
