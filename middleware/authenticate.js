const admin = require('firebase-admin'); // Mengimpor Firebase Admin SDK

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Ambil token dari header Authorization

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verifikasi ID token dengan Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid; // Simpan userId dari token yang terverifikasi ke dalam request

    // Cek apakah user ada di Firestore (opsional)
    // const userRef = db.collection('users').doc(req.userId);
    // const userDoc = await userRef.get();
    // if (!userDoc.exists) return res.status(404).json({ message: 'User not found' });

    next();
  } catch (error) {
    console.error('Error in authentication:', error);
    return res.status(401).json({ message: 'Invalid token' }); // Jika token tidak valid
  }
};

module.exports = authenticate;
