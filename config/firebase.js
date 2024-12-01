const admin = require('firebase-admin');
const serviceAccount = require('./ingrevia-firebase-adminsdk-n4aon-691dee1cf8.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;
