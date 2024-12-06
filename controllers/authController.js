const admin = require('../config/firebaseAdmin');
const db = admin.firestore();

// Register user (Sign-up)
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buat user dengan email dan password
    const userResponse = await admin.auth().createUser({
      email: email,
      password: password, // Firebase akan otomatis meng-handle password hashing
      emailVerified: false,
      disabled: false,
    });

    // Menyimpan data pengguna di Firestore setelah registrasi
    await db.collection('users').doc(userResponse.uid).set({
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: 'User berhasil didaftarkan', userResponse });
  } catch (error) {
    console.error('Error saat signup:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat signup' });
  }
};

// Login user menggunakan email dan password
const loginWithEmailPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Login dengan Firebase SDK di sisi klien
    res.json({ message: 'Login harus dilakukan di front-end menggunakan Firebase Client SDK' });
  } catch (error) {
    console.error('Error saat login dengan email dan password:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
};

// Login user menggunakan Google ID Token
const loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body; // ID Token yang dikirim dari frontend

    // Verifikasi ID Token dari Google
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Ambil data user berdasarkan UID dari Firebase Authentication
    const userRecord = await admin.auth().getUser(userId);

    // Cek apakah data pengguna sudah ada di Firestore, jika belum, buat data
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      // Menyimpan data pengguna di Firestore jika belum ada
      await db.collection('users').doc(userId).set({
        email: userRecord.email,
        name: userRecord.displayName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ message: 'Login berhasil dengan Google', userRecord });
  } catch (error) {
    console.error('Error saat signin dengan Google:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat signin dengan Google' });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const resetLink = await admin.auth().generatePasswordResetLink(email);
    res.json({ message: `Link reset password telah dikirim ke ${email}`, resetLink });
  } catch (error) {
    console.error('Error saat reset password:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat reset password' });
  }
};

// Logout user (Firebase token management dilakukan di client-side)
const logout = (req, res) => {
  // Tidak perlu implementasi logout di server, cukup hapus token di client
  res.json({ message: 'Logout berhasil' });
};

module.exports = { register, loginWithEmailPassword, loginWithGoogle, forgotPassword, logout };
