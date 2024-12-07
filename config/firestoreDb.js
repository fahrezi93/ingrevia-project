const admin = require('./firebaseAdmin');
const { Firestore } = require('@google-cloud/firestore');
const path = require('path');

const db = new Firestore({
  projectId: 'ingrevia', 
  keyFilename: path.resolve(__dirname, './ingrevia-firebase-adminsdk-n4aon-691dee1cf8.json'),
});

module.exports = db;
