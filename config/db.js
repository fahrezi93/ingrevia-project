const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const loadCSVData = async () => {
    try {
        const filePath = path.join(__dirname, '../full_format_recipes.csv'); // Path ke file CSV
        const results = [];

        // Membaca file CSV
        fs.createReadStream(filePath)
            .pipe(csv()) // Gunakan csv-parser untuk membaca file
            .on('data', (row) => {
                results.push(row); // Tambahkan setiap baris ke array
            })
            .on('end', () => {
                console.log('Data dari CSV berhasil dimuat:');
                console.log(results);
                // Lakukan sesuatu dengan data CSV, misalnya simpan ke database atau olah datanya di sini
            })
            .on('error', (error) => {
                console.error('Gagal memuat file CSV:', error);
            });
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
};

module.exports = loadCSVData;
