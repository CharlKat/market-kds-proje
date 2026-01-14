const KdsModel = require('../models/kdsModel');

// Yardımcı: Query parametrelerini hazırla
const prepareFilters = (query) => {
    const { start, end, bolge, search } = query;
    const sDate = start || '2023-01-01';
    const eDate = end || '2025-12-31';
    let filterSql = "";
    const params = [];
    
    if (bolge && bolge !== 'Tümü') {
        filterSql += " AND m.Bolge = ?";
        params.push(bolge);
    }
    if (search) {
        filterSql += " AND m.MagazaAdi LIKE ?";
        params.push(`%${search}%`);
    }
    return { sDate, eDate, filterSql, params };
};

exports.getFinans = async (req, res) => {
    try {
        const { sDate, eDate, filterSql, params } = prepareFilters(req.query);
        const dbParams = [sDate, eDate, eDate, ...params]; // Params sıralaması önemli
        const rows = await KdsModel.getFinans(sDate, eDate, filterSql, dbParams);
        res.json(rows);
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.getEnerji = async (req, res) => {
    try {
        const rows = await KdsModel.getEnerji();
        res.json(rows);
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.getRekabet = async (req, res) => {
    try {
        const rows = await KdsModel.getRekabet();
        res.json(rows);
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.getTahmin = async (req, res) => {
    try {
        const gecmisVeri = await KdsModel.getSatisGecmisi();
        
        // Regresyon Mantığı (Değiştirilmedi)
        let n = gecmisVeri.length;
        let gelecekVeri = [];
        if (n > 1) {
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
            gecmisVeri.forEach((veri, i) => {
                let x = i + 1;
                let y = parseFloat(veri.Ciro);
                sumX += x; sumY += y; sumXY += x*y; sumXX += x*x;
            });
            let slope = (n*sumXY - sumX*sumY) / (n*sumXX - sumX*sumX);
            let intercept = (sumY - slope*sumX) / n;
            let sonAy = new Date();
            for(let i=1; i<=6; i++) {
                let gelecekX = n + i;
                let tahmin = (slope * gelecekX) + intercept;
                sonAy.setMonth(sonAy.getMonth() + 1);
                gelecekVeri.push({ ay: sonAy.toISOString().slice(0,7), ciro: Math.max(0, tahmin) });
            }
        }
        res.json({ gecmis: gecmisVeri.map(v => ({ay: v.Ay, ciro: parseFloat(v.Ciro)})), gelecek: gelecekVeri });
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.getDetay = async (req, res) => {
    try {
        const { start, end } = req.query;
        const rows = await KdsModel.getKategoriDetay(start || '2023-01-01', end || '2025-12-31');

        const enrichedData = rows.map(row => {
            let karMarji, buyumeHizi, memnuniyet;
            if (row.KategoriAdi === 'Atıştırmalık & İçecek') { karMarji = 35; buyumeHizi = 12; memnuniyet = 85; }
            else if (row.KategoriAdi === 'Temel Gıda') { karMarji = 15; buyumeHizi = 5; memnuniyet = 90; } 
            else if (row.KategoriAdi === 'Temizlik & Hijyen') { karMarji = 25; buyumeHizi = 8; memnuniyet = 75; }
            else if (row.KategoriAdi === 'Kişisel Bakım') { karMarji = 45; buyumeHizi = 20; memnuniyet = 80; } 
            else { karMarji = 20; buyumeHizi = 15; memnuniyet = 70; }
            return {
                ...row,
                KarMarji: karMarji,
                BuyumeHizi: buyumeHizi,
                MusteriMemnuniyeti: memnuniyet,
                StokDevirHizi: Math.floor(Math.random() * 30) + 5
            };
        });
        res.json(enrichedData);
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.getAnalizTedarik = async (req, res) => {
    try {
        // Mock Veri Mantığı (Değiştirilmedi)
        const sifatlar = ['Hızlı', 'Güvenilir', 'Anadolu', 'Ege', 'Global', 'Yerel', 'Mega', 'Süper', 'Doğal', 'Teknik', 'Modern', 'Star', 'Kuzey', 'Batı', 'Toros'];
        const isler = ['Lojistik', 'Gıda', 'Bakliyat', 'Temizlik', 'Ambalaj', 'Dağıtım', 'Toptan', 'Ticaret', 'Pazarlama', 'Tarım', 'Et', 'Süt', 'Un', 'İçecek', 'Kimya'];
        const turler = ['A.Ş.', 'Ltd. Şti.', 'Ticaret', 'Holding', 'Grup'];
        const firmalar = [];
        for (let i = 0; i < 25; i++) {
            const ad = `${sifatlar[Math.floor(Math.random() * sifatlar.length)]} ${isler[Math.floor(Math.random() * isler.length)]} ${turler[Math.floor(Math.random() * turler.length)]}`;
            firmalar.push({
                ad: ad,
                gecikme: parseFloat((Math.random() * 12).toFixed(1)), 
                iade: parseFloat((Math.random() * 8).toFixed(1)),
                hacim: Math.floor(Math.random() * 950000) + 50000
            });
        }
        firmalar.push({ ad: '>>> MÜKEMMEL TEDARİK A.Ş.', gecikme: 0.5, iade: 0.1, hacim: 900000 }); 
        firmalar.push({ ad: '>>> RİSKLİ LOJİSTİK LTD.', gecikme: 11.5, iade: 7.8, hacim: 850000 }); 
        res.json(firmalar);
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.getAnalizEnflasyon = async (req, res) => {
    try {
        const data = [
            { ay: 'Ocak', enflasyon: 45, sepet: 320 },
            { ay: 'Şubat', enflasyon: 48, sepet: 310 },
            { ay: 'Mart', enflasyon: 52, sepet: 290 }, 
            { ay: 'Nisan', enflasyon: 55, sepet: 280 },
            { ay: 'Mayıs', enflasyon: 60, sepet: 250 },
            { ay: 'Haziran', enflasyon: 65, sepet: 220 }
        ];
        res.json(data);
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.getAnalizIk = async (req, res) => {
    try {
        const rows = await KdsModel.getPersonelAlimi();
        const currentYearData = new Array(12).fill(0); // 2025
        const prevYearData = new Array(12).fill(0);    // 2024
        rows.forEach(row => {
            if (row.Yil === 2025) { currentYearData[row.Ay - 1] = row.Sayi; } 
            else if (row.Yil === 2024) { prevYearData[row.Ay - 1] = row.Sayi; }
        });
        const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        res.json({ aylar, current: currentYearData, previous: prevYearData });
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.getAnalizVerimlilik = async (req, res) => {
    try {
        const rows = await KdsModel.getVerimlilik();
        res.json(rows);
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.getUrunPerformans = async (req, res) => {
    try {
        const { start, end, bolge, search } = req.query;
        const params = [start || '2023-01-01', end || '2025-12-31'];
        let filterSql = "";
        if (bolge && bolge !== 'Tümü') { filterSql += " AND m.Bolge = ?"; params.push(bolge); }
        if (search) { filterSql += " AND m.MagazaAdi LIKE ?"; params.push(`%${search}%`); }
        
        const data = await KdsModel.getUrunPerformans(params, filterSql);
        res.json({ top: data.topRows, bottom: data.bottomRows });
    } catch (error) { console.error("Ürün Performans Hatası:", error); res.status(500).send('Hata'); }
};

exports.getAnalizLojistik = async (req, res) => {
    try {
        const rows = await KdsModel.getLojistik();
        res.json(rows);
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.getAnalizOtomasyon = async (req, res) => {
    try {
        if(req.query.bolge || req.query.search) {
             // Dinamik filtreli versiyon (Son eklenen route)
            const { bolge, search } = req.query;
            let filterSql = "";
            const params = [];
            if (bolge && bolge !== 'Tümü') { filterSql += " AND m.Bolge = ?"; params.push(bolge); }
            if (search) { filterSql += " AND m.MagazaAdi LIKE ?"; params.push(`%${search}%`); }
            const rows = await KdsModel.getOtomasyonAnaliz(filterSql, params);
            res.json(rows);
        } else {
            // Ham data versiyonu
            const rows = await KdsModel.getOtomasyonHamData();
            const analizData = rows.map(r => {
                const personelVerimi = r.ToplamCiro / r.PersonelSayisi;
                const otoPuan = r.OtomasyonPuani;
                let durum = 'Normal';
                if (otoPuan > 80 && personelVerimi < 200000) { durum = 'Yatırım İsrafı'; } 
                else if (otoPuan < 40 && personelVerimi > 300000) { durum = 'Gizli Kahramanlar'; }
                return { Magaza: r.MagazaAdi, OtomasyonPuani: otoPuan, PersonelVerimi: parseInt(personelVerimi), Durum: durum };
            });
            res.json(analizData);
        }
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.getRafVerimlilik = async (req, res) => {
    try {
        const rows = await KdsModel.getRafVerimlilik();
        const toplamCiro = rows.reduce((acc, item) => acc + parseFloat(item.Ciro), 0);
        const analizData = rows.map(r => {
            const ciroPayi = (parseFloat(r.Ciro) / toplamCiro) * 100;
            let rafPayi = ciroPayi + (Math.random() * 10 - 5); 
            if (rafPayi < 1) rafPayi = 1;
            let durum = 'Normal';
            if (ciroPayi > 10 && rafPayi < 5) durum = 'Verimli (Altın)'; 
            if (ciroPayi < 3 && rafPayi > 8) durum = 'Verimsiz (İşgalci)'; 
            return {
                Urun: r.UrunAdi,
                x: parseFloat(rafPayi.toFixed(2)), 
                y: parseFloat(ciroPayi.toFixed(2)), 
                r: Math.max(5, parseFloat(r.Ciro) / 1000), 
                Durum: durum
            };
        });
        res.json(analizData);
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.getAnalizIklim = async (req, res) => {
    try {
        const veri = (await KdsModel.getIklimFaktorleri())[0] || { TarımsalKuraklikEndeksi: 75, AkaryakitLitreFiyat: 42 };
        const riskAnalizi = [];
        if (veri.TarımsalKuraklikEndeksi > 70) {
            riskAnalizi.push({ UrunGrubu: 'Bakliyat', Risk: 'Yüksek', TahminiZam: '%25', Oneri: '6 Aylık Stok Yap' });
            riskAnalizi.push({ UrunGrubu: 'Sıvı Yağ', Risk: 'Orta', TahminiZam: '%15', Oneri: 'Sözleşme Yenile' });
        } else if (veri.TarımsalKuraklikEndeksi > 40) {
            riskAnalizi.push({ UrunGrubu: 'Sebze/Meyve', Risk: 'Düşük', TahminiZam: '%5', Oneri: 'Normal Seyir' });
        }
        if (veri.AkaryakitLitreFiyat > 40) {
            riskAnalizi.push({ UrunGrubu: 'Tüm Lojistik', Risk: 'Kritik', TahminiZam: '%10 Maliyet Artışı', Oneri: 'Rota Optimize Et' });
        }
        res.json({ KuraklikEndeksi: veri.TarımsalKuraklikEndeksi, Akaryakit: veri.AkaryakitLitreFiyat, RiskTablosu: riskAnalizi });
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.getKpiOzet = async (req, res) => {
    try {
        const { sDate, eDate, filterSql, params } = prepareFilters(req.query);
        const currentParams = [sDate, eDate, eDate, ...params];
        const prevParams = [sDate, eDate, eDate, ...params];

        const currentQuery = `
            SELECT 
                COUNT(*) as MagazaSayisi,
                SUM(Ciro) as Ciro,
                SUM(CASE WHEN (Ciro - Gider) < 0 THEN 1 ELSE 0 END) as ZararEdenler,
                SUM(CASE WHEN TehditVar > 0 THEN 1 ELSE 0 END) as Tehdit
            FROM (
                SELECT 
                    m.MagazaID,
                    COALESCE(SUM(s.ToplamTutar), 0) as Ciro,
                    ((m.KiraGideri * 1.5) + ((SELECT COUNT(*) FROM Personel WHERE MagazaID = m.MagazaID) * 25000)) as Gider,
                    (SELECT COUNT(*) FROM RekabetAnalizi WHERE MagazaID = m.MagazaID) as TehditVar
                FROM Magazalar m
                LEFT JOIN Satislar s ON m.MagazaID = s.MagazaID AND s.TarihSaat BETWEEN ? AND ?
                WHERE m.AcilisTarihi <= ?
                ${filterSql}
                GROUP BY m.MagazaID
            ) as OzetTablo
        `;
        const prevQuery = `
            SELECT 
                COUNT(*) as MagazaSayisi,
                SUM(Ciro) as Ciro,
                SUM(CASE WHEN (Ciro - 180000) < 0 THEN 1 ELSE 0 END) as ZararEdenler,
                0 as Tehdit
            FROM (
                SELECT m.MagazaID, COALESCE(SUM(s.ToplamTutar), 0) as Ciro
                FROM Magazalar m
                LEFT JOIN Satislar s ON m.MagazaID = s.MagazaID 
                    AND s.TarihSaat BETWEEN DATE_SUB(?, INTERVAL 1 YEAR) AND DATE_SUB(?, INTERVAL 1 YEAR)
                WHERE m.AcilisTarihi <= DATE_SUB(?, INTERVAL 1 YEAR)
                ${filterSql}
                GROUP BY m.MagazaID
            ) as OzetTabloGecmis
        `;
        const { current, prev } = await KdsModel.getKpiOzet(currentQuery, currentParams, prevQuery, prevParams);
        prev.Tehdit = Math.max(0, Math.round(current.Tehdit * 0.8));
        res.json({ current, previous: prev });
    } catch (error) { console.error(error); res.status(500).send('KPI Hatası'); }
};

exports.getBolgeselCiro = async (req, res) => {
    try {
        const { start, end, bolge, search } = req.query;
        let filterSql = "";
        const params = [];
        if (bolge && bolge !== 'Tümü') { filterSql += " AND m.Bolge = ?"; params.push(bolge); }
        if (search) { filterSql += " AND m.MagazaAdi LIKE ?"; params.push(`%${search}%`); }
        const rows = await KdsModel.getBolgeselCiro(start || '2023-01-01', end || '2025-12-31', filterSql, params);
        res.json(rows);
    } catch (error) { console.error(error); res.status(500).send(error); }
};

exports.getAylikKarsilastirma = async (req, res) => {
    try {
        const { start, end, bolge, search } = req.query;
        let filterSql = "";
        const params = [];
        if (bolge && bolge !== 'Tümü') { filterSql += " AND m.Bolge = ?"; params.push(bolge); }
        if (search) { filterSql += " AND m.MagazaAdi LIKE ?"; params.push(`%${search}%`); }
        const rows = await KdsModel.getAylikKarsilastirma(start || '2023-01-01', end || '2025-12-31', filterSql, params);
        const buAy = rows.length > 0 ? rows[0] : { Ciro: 0 };
        const gecenAy = rows.length > 1 ? rows[1] : { Ciro: 0 };
        res.json({ buAy, gecenAy });
    } catch (error) { console.error(error); res.status(500).send(error); }
};

exports.getGunlukCiro = async (req, res) => {
    try {
        const { sDate, eDate, filterSql, params } = prepareFilters(req.query);
        const rows = await KdsModel.getGunlukCiro(sDate, eDate, filterSql, params);
        res.json(rows);
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await KdsModel.loginUser(username, password);
        if (user) {
            res.json({ success: true, message: 'Giriş Başarılı', user: { ad: user.AdSoyad, unvan: user.Unvan } });
        } else {
            res.status(401).json({ success: false, message: 'Hatalı Kullanıcı Adı veya Şifre!' });
        }
    } catch (error) { console.error(error); res.status(500).json({ success: false, message: 'Sunucu Hatası' }); }
};

exports.getStratejikKarar = async (req, res) => {
    try {
        const { kapatilacak, firsatBolgesi } = await KdsModel.getStratejikKarar();
        const kapatData = kapatilacak.length > 0 ? kapatilacak[0] : { MagazaAdi: 'Tespit Edilemedi', ToplamCiro: 0 };
        const acData = firsatBolgesi.length > 0 ? firsatBolgesi[0] : { Bolge: 'İzmir', MagazaBasiOrtalamaCiro: 50000 };
        res.json({
            kapat: {
                baslik: "KÜÇÜLME STRATEJİSİ",
                magaza: kapatData.MagazaAdi,
                detay: `${kapatData.Bolge} bölgesindeki bu mağaza, ortalamanın %40 altında performans gösteriyor. Enerji ve personel maliyetini karşılamıyor.`,
                aksiyon: "Mağazayı Kapat",
                renk: "danger"
            },
            ac: {
                baslik: "BÜYÜME FIRSATI",
                bolge: acData.Bolge,
                detay: `${acData.Bolge} bölgesinde mağaza başına düşen ciro rekor seviyede (${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(acData.MagazaBasiOrtalamaCiro)}). Talep arzdan fazla.`,
                aksiyon: "Yeni Şube Aç",
                renk: "success"
            }
        });
    } catch (error) { console.error(error); res.status(500).send('Hata'); }
};


exports.deleteMagaza = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await require('../config/db').getConnection();

        // --- İŞ KURALI (BUSINESS RULE) ---
        // Kural: İçinde aktif personel varsa mağaza silinemez!
        const [personelCheck] = await connection.execute(
            'SELECT COUNT(*) as Sayi FROM Personel WHERE MagazaID = ?', 
            [id]
        );

        if (personelCheck[0].Sayi > 0) {
            await connection.end();
            // 400 Bad Request döneriz çünkü iş kuralına takıldı
            return res.status(400).json({ 
                success: false, 
                message: 'HATA: Bu mağazada çalışan personel var! Önce personelleri taşıyın.' 
            });
        }

        // Kurala takılmadıysa silme işlemi yapılır (CRUD - Delete)
        await connection.execute('DELETE FROM Magazalar WHERE MagazaID = ?', [id]);
        await connection.end();

        res.json({ success: true, message: 'Mağaza başarıyla silindi.' });

    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu Hatası');
    }
};