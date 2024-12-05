const Firestore = require('@google-cloud/firestore');
const fs = require('fs');
const path = require('path');

// Konfigurasi Firestore
const db = new Firestore({
  projectId: 'ingrevia',
  keyFilename: path.resolve(__dirname, 'service.json'), // Path absolut untuk keamanan
});

// Membaca dan memproses file recipes.json
const filePath = path.resolve(__dirname, 'resep.json');

fs.readFile(filePath, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    // Parse data JSON
    const recipes = JSON.parse(data);

    // Validasi bahwa data adalah array
    if (!Array.isArray(recipes)) {
      throw new Error('File JSON tidak valid, data harus berupa array.');
    }

    // Pisahkan data menjadi batch kecil
    const batchSize = 500; // Maksimum dokumen per batch
    for (let i = 0; i < recipes.length; i += batchSize) {
      const batch = db.batch();
      const chunk = recipes.slice(i, i + batchSize);

      chunk.forEach((recipe, index) => {
        const docRef = db.collection('recipes').doc(`recipe_${i + index + 1}`); // ID dokumen unik
        batch.set(docRef, recipe);
      });

      // Commit batch
      await batch.commit();
      console.log(`Batch ${Math.floor(i / batchSize) + 1} berhasil disimpan.`);
    }

    console.log('Semua data berhasil disimpan ke Firestore.');
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
  }
});
