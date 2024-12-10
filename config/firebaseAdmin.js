require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./ingrevia-firebase-adminsdk-n4aon-691dee1cf8.json');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_BUCKET,
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

console.log(db); 

module.exp
var admin = require('firebase-admin');

var serviceAccount = require('../firebaseService.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ingrevia-default-rtdb.asia-southeast1.firebasedatabase.app',
});

module.exports = admin;

