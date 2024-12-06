var admin = require('firebase-admin');

var serviceAccount = require('../firebaseService.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ingrevia-default-rtdb.asia-southeast1.firebasedatabase.app',
});

module.exports = admin;
