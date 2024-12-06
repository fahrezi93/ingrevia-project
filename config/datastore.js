const express = require('express');
const app = express();

const admin = require('firebase-admin');
const credentials = require('../firebaseService.json');
const { Firestore } = require('@google-cloud/firestore');

// Inisialisasi Firebase Admin dan Firestore
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const db = new Firestore(); // Firestore instance

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fungsi Sign-up (Register)
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buat pengguna baru di Firebase Authentication
    const userResponse = await admin.auth().createUser({
      email: email,
      password: password, // Firebase akan meng-hash password secara otomatis
      emailVerified: false,
      disabled: false,
    });

    // Setelah pengguna dibuat, simpan data pengguna di Firestore
    const userDocRef = db.collection('users').doc(userResponse.uid);
    await userDocRef.set({
      email: email,
      createdAt: new Date().toISOString(),
      userProfile: {
        name: 'Default Name', // Kamu bisa tambahkan field lain sesuai kebutuhan
        address: 'Default Address',
      },
    });

    res.json({ message: 'User berhasil didaftarkan', userResponse });
  } catch (error) {
    console.error('Error saat signup:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat signup' });
  }
});

// Fungsi Sign-in (Login)
app.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Untuk login menggunakan Firebase Client SDK di frontend, tidak perlu memproses password di backend.
    res.json({ message: 'Signin harus dilakukan dari front-end menggunakan Firebase Client SDK' });
  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat signin' });
  }
});

// Fungsi Reset Password
app.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Kirim email reset password
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    res.json({ message: `Link reset password telah dikirim ke ${email}`, resetLink });
  } catch (error) {
    console.error('Error saat reset password:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat reset password' });
  }
});

// Fungsi untuk mengambil data pengguna
app.get('/user/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;

    // Mengambil data pengguna dari Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User data retrieved', data: userDoc.data() });
  } catch (error) {
    console.error('Error saat mengambil data pengguna:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data pengguna' });
  }
});

// Fungsi untuk memperbarui data pengguna
app.put('/user/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;
    const { name, address } = req.body;

    // Update data pengguna di Firestore
    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.update({
      'userProfile.name': name,
      'userProfile.address': address,
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: 'User data updated successfully' });
  } catch (error) {
    console.error('Error saat memperbarui data pengguna:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui data pengguna' });
  }
});

// Jalankan server
// const PORT = 8080;
// app.listen(PORT, () => {
//   console.log(`Server berjalan di PORT ${PORT}`);
// });
