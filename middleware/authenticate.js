const admin = require('firebase-admin'); // Mengimpor Firebase Admin SDK
const { db } = require('../config/firestoreDb.js'); // Pastikan Anda mengimpor Firestore jika dibutuhkan

// Middleware untuk autentikasi
const authenticate = async (req, res, next) => {
  // Ambil token dari header Authorization
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // Jika tidak ada token, kirimkan respons 401 (Unauthorized)
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verifikasi ID token dengan Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid; // Simpan userId dari token yang terverifikasi ke dalam request

    // Cek apakah user ada di Firestore (opsional, jika Anda perlu memverifikasi keberadaan pengguna)
    // const userRef = db.collection('users').doc(req.userId);
    // const userDoc = await userRef.get();
    // if (!userDoc.exists) {
    //   return res.status(404).json({ message: 'User not found' });
    // }

    // Jika token valid, lanjutkan ke route berikutnya
    next();
  } catch (error) {
    console.error('Error in authentication:', error);
    // Menyediakan error yang lebih spesifik jika token tidak valid
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
