require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_BUCKET,
});

const db = admin.firestore();  // Akses Firestore
const bucket = admin.storage().bucket();  // Akses Firebase Storage

module.exports = { db, bucket };