// controllers/authController.js
const db = require('../config/firebase');  // Pastikan Firebase dikonfigurasi dengan benar
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fungsi register user
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Mengecek apakah email sudah terdaftar
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

// Fungsi login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Mengambil data user dari Firestore berdasarkan email
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const user = userSnapshot.docs[0].data();

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Password salah' });
    }

    // Membuat token JWT
    const token = jwt.sign({ userId: userSnapshot.docs[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login berhasil', token });
  } catch (error) {
    console.error('Error login user:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
};

// Fungsi logout user
const logout = (req, res) => {
  res.status(200).json({ message: 'Logout berhasil' });
};

// Fungsi forgot password
const forgotPassword = (req, res) => {
  res.status(200).json({ message: 'Fitur reset password akan datang segera' });
};

module.exports = {
  login,
  register,
  logout,
  forgotPassword,
};
