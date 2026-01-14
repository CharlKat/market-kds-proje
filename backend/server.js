require('dotenv').config();
const compression = require('compression');
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Middleware Ayarları
app.use(cors());
app.use(express.json());
app.use(compression());

// Rotaları Kullan
app.use('/api', apiRoutes);

// Sunucuyu Başlat
const PORT = 3300; // Önceki kodda 3000'di, React bazen çakışır diye 3300 yapılabilir ama 3000 kalsın diyorsan burayı 3000 yap.
app.listen(3000, () => {
    console.log('KDS MVC Sunucusu 3000 portunda çalışıyor...');
});