const { v4: uuidv4 } = require('uuid'); // Untuk membuat unique user ID
const db = require('../config/firestoreDb.js');  // Pastikan path ini benar sesuai struktur direktori Anda
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const axios = require('axios');

console.log(' Auth Firestore db:', db);

//register user
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validasi input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Semua field (email, password, name) harus diisi.' });
    }

    // Cek apakah email sudah terdaftar di Firebase Auth
    try {
      await admin.auth().getUserByEmail(email);
      return res.status(400).json({ 
        success: false, 
        message: 'Email sudah terdaftar.' 
      });
    } catch (error) {
      // Lanjutkan jika user belum terdaftar
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Buat user di Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: false
    });

    const userId = userRecord.uid;

    // Simpan data tambahan di Firestore
    await db.collection('users').doc(userId).set({
      userId,
      email,
      name,
      createdAt: new Date(),
    });

    console.log('User berhasil dibuat:', {
      uid: userId,
      email: email,
      displayName: name
    });

    return res.status(201).json({ 
      success: true,
      message: 'User berhasil didaftarkan.',
      data: {
        userId,
        email,
        name
      }
    });

  } catch (error) {
    console.error('Error register user:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ 
        success: false, 
        message: 'Email sudah terdaftar.' 
      });
    }

    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ 
        success: false, 
        message: 'Format email tidak valid.' 
      });
    }

    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ 
        success: false, 
        message: 'Password terlalu lemah. Minimal 6 karakter.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mendaftar user.',
      error: error.message 
    });
  }
};

// Fungsi login dengan email dan password
const loginWithEmailPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email dan password harus diisi.' 
      });
    }

    try {
      // Get user by email
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // Create custom token
      const customToken = await admin.auth().createCustomToken(userRecord.uid);

      return res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: {
          token: customToken,
          user: {
            userId: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat login',
      error: error.message 
    });
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
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    console.log('Processing password reset for email:', email);

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Cek apakah email terdaftar di Firebase Auth
    try {
      await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({
          success: false,
          message: 'Email tidak terdaftar'
        });
      }
      throw error;
    }

    // Generate reset password link
    await admin.auth().generatePasswordResetLink(email)
      .then(async (link) => {
        console.log('Reset password link generated:', link);
        
        // Di sini bisa ditambahkan kode untuk mengirim email menggunakan nodemailer atau layanan email lainnya
        
        return res.status(200).json({ 
          success: true,
          message: 'Link reset password telah dikirim ke email Anda',
          data: {
            email,
            // Dalam production, jangan tampilkan link
            resetLink: link
          }
        });
      });

  } catch (error) {
    console.error('Error in forgotPassword:', error);
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      });
    }

    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        success: false,
        message: 'Email tidak terdaftar'
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengirim email reset password',
      error: error.message
    });
  }
};

// Logout user (Firebase token management dilakukan di client-side)
const logout = async (req, res) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    const token = authHeader.split(' ')[1]; // Ambil token dari format "Bearer <token>"
    
    // Revoke token di Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    await admin.auth().revokeRefreshTokens(decodedToken.uid);

    res.status(200).json({ 
      success: true,
      message: 'Logout berhasil' 
    });
  } catch (error) {
    console.error('Error saat logout:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat logout',
      error: error.message
    });
  }
};

module.exports = { register, loginWithEmailPassword, loginWithGoogle, forgotPassword, logout };
