# Gunakan image Node.js versi 16 sebagai base image
FROM node:16

# Tentukan direktori kerja di dalam container
WORKDIR /usr/src/app

# Salin file package.json dan package-lock.json ke dalam container
COPY package*.json ./

# Install dependencies yang dibutuhkan oleh aplikasi
RUN npm install

# Salin seluruh kode aplikasi ke dalam container
COPY . .

# Tentukan port yang akan digunakan oleh aplikasi
EXPOSE 5000

# Perintah untuk menjalankan aplikasi setelah container dijalankan
CMD ["npm", "start"]
