const admin = require('firebase-admin');
const serviceAccount = require('./service.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const insertDataToFirestore = async (collectionName, dataset) => {
  try {
    if (Array.isArray(dataset)) {
      const batch = db.batch();
      dataset.forEach((item) => {
        const docRef = db.collection(collectionName).doc();
        batch.set(docRef, item);
      });
      await batch.commit();
      console.log(`Dataset berhasil ditambahkan ke koleksi "${collectionName}"`);
    } else {
      const docRef = db.collection(collectionName).doc();
      await docRef.set(dataset);
      console.log(`Data berhasil ditambahkan ke koleksi "${collectionName}"`);
    }
  } catch (error) {
    console.error('Error saat memasukkan data ke Firestore:', error);
  }
};

const dataset = [
  {
    name: 'John Doe',
    email: 'johndoe@example.com',
    age: 30,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    name: 'Jane Smith',
    email: 'janesmith@example.com',
    age: 25,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

insertDataToFirestore('users', dataset);
