const { db } = require('../config/firestoreDb.js');  // Pastikan db diimpor dari firebase.js dengan benar
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fungsi Register
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Mengecek apakah email sudah terdaftar di Firestore
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (!userSnapshot.empty) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Menyimpan data user di Firestore
    const newUserRef = await db.collection('users').add({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    });

    return res.status(201).json({ message: 'User berhasil didaftarkan', userId: newUserRef.id });
  } catch (error) {
    console.error('Error register user:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mendaftar user' });
  }
};

// Fungsi login dengan email dan password
const loginWithEmailPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek apakah user ada di Firestore berdasarkan email
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(400).json({ error: 'Email tidak ditemukan' });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Password salah' });
    }

    // Membuat JWT token untuk session
    const token = jwt.sign(
      { userId: userDoc.id, email: userData.email },
      'SECRET_KEY',  // Ganti dengan secret key yang lebih aman
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login berhasil', token });
  } catch (error) {
    console.error('Error saat login dengan email dan password:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
};

// Fungsi login menggunakan Google ID Token
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
const admin = require('firebase-admin');

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    await admin.auth().generatePasswordResetLink(email);
    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ error: 'Terjadi kesalahan saat reset password' });
  }
};

// Logout user (Firebase token management dilakukan di client-side)
const logout = (req, res) => {
  // Tidak perlu implementasi logout di server, cukup hapus token di client
  res.json({ message: 'Logout berhasil' });
};

module.exports = { register, loginWithEmailPassword, loginWithGoogle, forgotPassword, logout };
