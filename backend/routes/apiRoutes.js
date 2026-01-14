const express = require('express');
const router = express.Router();
const kdsController = require('../controllers/kdsController');

// Finans ve Genel Analiz
router.get('/kds/finans', kdsController.getFinans);
router.get('/kds/enerji', kdsController.getEnerji);
router.get('/kds/rekabet', kdsController.getRekabet);
router.get('/kds/tahmin', kdsController.getTahmin);
router.get('/kds/detay', kdsController.getDetay);

// Detaylı Analizler
router.get('/kds/analiz/tedarik', kdsController.getAnalizTedarik);
router.get('/kds/analiz/enflasyon', kdsController.getAnalizEnflasyon);
router.get('/kds/analiz/ik', kdsController.getAnalizIk);
router.get('/kds/analiz/verimlilik', kdsController.getAnalizVerimlilik);
router.get('/kds/analiz/urun-performans', kdsController.getUrunPerformans);
router.get('/kds/analiz/lojistik', kdsController.getAnalizLojistik);
router.get('/kds/analiz/otomasyon', kdsController.getAnalizOtomasyon);
router.get('/kds/analiz/raf-verimlilik', kdsController.getRafVerimlilik);
router.get('/kds/analiz/iklim', kdsController.getAnalizIklim);
router.get('/kds/analiz/bolgesel-ciro', kdsController.getBolgeselCiro);
router.get('/kds/analiz/aylik-karsilastirma', kdsController.getAylikKarsilastirma);
router.get('/kds/analiz/gunluk-ciro', kdsController.getGunlukCiro);
router.get('/kds/analiz/stratejik-karar', kdsController.getStratejikKarar);

// CRUD ve İş Kuralı İçin
router.delete('/kds/magaza/:id', kdsController.deleteMagaza);
// KPI ve Login
router.get('/kds/kpi-ozet', kdsController.getKpiOzet);
router.post('/login', kdsController.login);

module.exports = router;