require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./ingrevia-firebase-adminsdk-n4aon-691dee1cf8.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_BUCKET,
});

const db = admin.firestore();  // Akses Firestore
const bucket = admin.storage().bucket();  // Akses Firebase Storage

console.log(db); 

module.exports = { db, bucket };