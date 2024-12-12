const { v4: uuidv4 } = require('uuid'); // Untuk membuat unique user ID
const db = require('../config/firestoreDb.js');  // Pastikan path ini benar sesuai struktur direktori Anda
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

console.log(' Auth Firestore db:', db);

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

// Tambahkan object untuk tracking percobaan login
const loginAttempts = {};

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
      // Coba login dengan Firebase Auth
      const userCredential = await admin.auth().getUserByEmail(email);
      
      // Jika berhasil, reset counter percobaan
      if (loginAttempts[email]) {
        delete loginAttempts[email];
      }

      // Proses login normal
      const customToken = await admin.auth().createCustomToken(userCredential.uid);
      
      return res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: {
          token: customToken,
          user: {
            email: userCredential.email,
            displayName: userCredential.displayName
          }
        }
      });

    } catch (error) {
      // Jika password salah atau error lainnya
      if (!loginAttempts[email]) {
        loginAttempts[email] = {
          count: 1,
          lastAttempt: new Date()
        };
      } else {
        loginAttempts[email].count += 1;
        loginAttempts[email].lastAttempt = new Date();

        // Jika gagal 3 kali dalam 5 menit, kirim email reset password
        const timeDiff = (new Date() - loginAttempts[email].lastAttempt) / 1000 / 60; // dalam menit
        if (loginAttempts[email].count >= 3 && timeDiff <= 5) {
          // Generate dan kirim link reset password
          const resetLink = await admin.auth().generatePasswordResetLink(email);

          return res.status(401).json({
            success: false,
            message: 'Terlalu banyak percobaan login gagal. Link reset password telah dikirim ke email Anda.',
            resetLink: resetLink
          });
        }
      }

      // Response untuk gagal login biasa
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
        attemptsLeft: 3 - (loginAttempts[email]?.count || 0)
      });
    }

  } catch (error) {
    console.error('Error in loginWithEmailPassword:', error);
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
const logout = (req, res) => {
  // Tidak perlu implementasi logout di server, cukup hapus token di client
  res.json({ message: 'Logout berhasil' });
};

// Fungsi untuk membersihkan login attempts yang sudah lama
setInterval(() => {
  const now = new Date();
  for (const email in loginAttempts) {
    const timeDiff = (now - loginAttempts[email].lastAttempt) / 1000 / 60;
    if (timeDiff > 5) {
      delete loginAttempts[email];
    }
  }
}, 300000); // Bersihkan setiap 5 menit

module.exports = { register, loginWithEmailPassword, loginWithGoogle, forgotPassword, logout };
