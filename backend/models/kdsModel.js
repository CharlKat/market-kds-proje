const { getConnection } = require('../config/db');

class KdsModel {
    
    static async getFinans(sDate, eDate, filterSql, params) {
        const connection = await getConnection();
        const query = `
            SELECT 
                m.MagazaID, m.MagazaAdi, m.Bolge, m.Enlem, m.Boylam, m.AcilisTarihi,
                COALESCE(SUM(s.ToplamTutar), 0) AS Ciro,
                (m.KiraGideri * 1.5) + (COUNT(DISTINCT p.PersonelID) * 25000) + COALESCE(lm.SeferMaliyeti, 0) AS ToplamGider,
                (COALESCE(SUM(s.ToplamTutar), 0) - ((m.KiraGideri * 1.5) + (COUNT(DISTINCT p.PersonelID) * 25000) + COALESCE(lm.SeferMaliyeti, 0))) AS NetDurum,
                CASE WHEN MAX(ra.RakipID) IS NOT NULL THEN 1 ELSE 0 END as TehditVar
            FROM Magazalar m
            LEFT JOIN Satislar s ON m.MagazaID = s.MagazaID AND s.TarihSaat BETWEEN ? AND ? 
            LEFT JOIN Personel p ON m.MagazaID = p.MagazaID
            LEFT JOIN LojistikMaliyet lm ON m.MagazaID = lm.MagazaID
            LEFT JOIN RekabetAnalizi ra ON m.MagazaID = ra.MagazaID 
            WHERE m.AcilisTarihi <= ? 
            ${filterSql}
            GROUP BY m.MagazaID, m.MagazaAdi, m.Bolge, m.Enlem, m.Boylam, m.AcilisTarihi, m.KiraGideri, lm.SeferMaliyeti
        `;
        const [rows] = await connection.execute(query, params);
        await connection.end();
        return rows;
    }

    static async getEnerji() {
        const connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT EnerjiSinifi, COUNT(*) as CihazSayisi
            FROM Demirbaslar GROUP BY EnerjiSinifi
        `);
        await connection.end();
        return rows;
    }

    static async getRekabet() {
        const connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT m.MagazaAdi, r.RakipAdi, rmi.MesafeMetre, 'Acil Önlem Alınmalı' as Stratejik_Oneri
            FROM RakipMagazaIliskisi rmi
            JOIN Magazalar m ON rmi.MagazaID = m.MagazaID
            JOIN Rakipler r ON rmi.RakipID = r.RakipID
            WHERE rmi.MesafeMetre < 100
        `);
        await connection.end();
        return rows;
    }

    static async getSatisGecmisi() {
        const connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT DATE_FORMAT(TarihSaat, '%Y-%m') as Ay, SUM(ToplamTutar) as Ciro 
            FROM Satislar GROUP BY DATE_FORMAT(TarihSaat, '%Y-%m') ORDER BY Ay ASC
        `);
        await connection.end();
        return rows;
    }

    static async getKategoriDetay(start, end) {
        const connection = await getConnection();
        const query = `
            SELECT 
                CASE 
                    WHEN ToplamTutar < 200 THEN 'Atıştırmalık & İçecek'
                    WHEN ToplamTutar < 500 THEN 'Temel Gıda'
                    WHEN ToplamTutar < 1000 THEN 'Temizlik & Hijyen'
                    WHEN ToplamTutar < 2000 THEN 'Kişisel Bakım'
                    ELSE 'Elektronik & Ev'
                END as KategoriAdi,
                COUNT(*) as SatisAdedi,
                SUM(ToplamTutar) as ToplamCiro,
                AVG(ToplamTutar) as OrtalamaSepet
            FROM Satislar
            WHERE TarihSaat BETWEEN ? AND ?
            GROUP BY KategoriAdi
        `;
        const [rows] = await connection.execute(query, [start, end]);
        await connection.end();
        return rows;
    }

    static async getPersonelAlimi() {
        const connection = await getConnection();
        const query = `
            SELECT MONTH(IseGirisTarihi) as Ay, YEAR(IseGirisTarihi) as Yil, COUNT(*) as Sayi
            FROM Personel WHERE YEAR(IseGirisTarihi) IN (2024, 2025)
            GROUP BY Yil, Ay ORDER BY Yil, Ay
        `;
        const [rows] = await connection.execute(query);
        await connection.end();
        return rows;
    }

    static async getVerimlilik() {
        const connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT m.MagazaAdi, m.Metrekare, COALESCE(SUM(s.ToplamTutar), 0) as Ciro,
            (COALESCE(SUM(s.ToplamTutar), 0) / m.Metrekare) as M2_Basina_Ciro
            FROM Magazalar m
            LEFT JOIN Satislar s ON m.MagazaID = s.MagazaID
            GROUP BY m.MagazaID, m.MagazaAdi, m.Metrekare
            HAVING Ciro > 0 ORDER BY M2_Basina_Ciro DESC
        `);
        await connection.end();
        return rows;
    }

    static async getUrunPerformans(params, filterSql) {
        const connection = await getConnection();
        const topQuery = `
            SELECT 
                CASE 
                    WHEN s.ToplamTutar > 4000 THEN 'Robot Süpürge X'
                    WHEN s.ToplamTutar > 3000 THEN 'Akıllı TV 50"'
                    WHEN s.ToplamTutar > 2000 THEN 'Premium Kahve Mak.'
                    WHEN s.ToplamTutar > 1500 THEN 'Kablosuz Kulaklık'
                    ELSE 'Air Fryer Pro'
                END as UrunAdi, SUM(s.ToplamTutar) as Ciro
            FROM Satislar s JOIN Magazalar m ON s.MagazaID = m.MagazaID
            WHERE s.TarihSaat BETWEEN ? AND ? ${filterSql}
            GROUP BY UrunAdi ORDER BY Ciro DESC LIMIT 5
        `;
        const bottomQuery = `
            SELECT 
                CASE 
                    WHEN s.ToplamTutar < 50 THEN 'Eski Sezon Çorap'
                    WHEN s.ToplamTutar < 80 THEN 'Plastik Kap Seti'
                    WHEN s.ToplamTutar < 100 THEN 'Ucuz Oyuncak'
                    WHEN s.ToplamTutar < 120 THEN 'Promosyon Bardak'
                    ELSE 'Manuel Rende'
                END as UrunAdi, SUM(s.ToplamTutar) as Ciro
            FROM Satislar s JOIN Magazalar m ON s.MagazaID = m.MagazaID
            WHERE s.TarihSaat BETWEEN ? AND ? ${filterSql}
            GROUP BY UrunAdi ORDER BY Ciro ASC LIMIT 5
        `;
        
        const [topRows] = await connection.execute(topQuery, params);
        const [bottomRows] = await connection.execute(bottomQuery, params);
        await connection.end();
        return { topRows, bottomRows };
    }

    static async getLojistik() {
        const connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT m.MagazaAdi, m.Enlem, m.Boylam, l.DepoTuru, l.MesafeKm, l.SeferMaliyeti
            FROM LojistikMaliyet l JOIN Magazalar m ON l.MagazaID = m.MagazaID
            ORDER BY l.MesafeKm DESC LIMIT 150
        `);
        await connection.end();
        return rows;
    }

    static async getOtomasyonHamData() {
        const connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT m.MagazaAdi, m.OtomasyonPuani, COUNT(DISTINCT p.PersonelID) as PersonelSayisi,
            COALESCE(SUM(s.ToplamTutar), 0) as ToplamCiro
            FROM Magazalar m
            LEFT JOIN Personel p ON m.MagazaID = p.MagazaID
            LEFT JOIN Satislar s ON m.MagazaID = s.MagazaID
            GROUP BY m.MagazaID HAVING PersonelSayisi > 0 LIMIT 100
        `);
        await connection.end();
        return rows;
    }

    static async getRafVerimlilik() {
        const connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT u.UrunAdi, SUM(sd.Adet * sd.SatisAnindakiFiyat) as Ciro
            FROM SatisDetay sd JOIN Urunler u ON sd.UrunID = u.UrunID
            GROUP BY u.UrunID ORDER BY Ciro DESC LIMIT 20
        `);
        await connection.end();
        return rows;
    }

    static async getIklimFaktorleri() {
        const connection = await getConnection();
        const [rows] = await connection.execute(`SELECT * FROM DisFaktorler ORDER BY Tarih DESC LIMIT 1`);
        await connection.end();
        return rows;
    }

    static async getKpiOzet(currentQuery, currentParams, prevQuery, prevParams) {
        const connection = await getConnection();
        const [currentRows] = await connection.execute(currentQuery, currentParams);
        const [prevRows] = await connection.execute(prevQuery, prevParams);
        await connection.end();
        return { current: currentRows[0], prev: prevRows[0] };
    }

    static async getBolgeselCiro(start, end, filterSql, params) {
        const connection = await getConnection();
        const query = `
            SELECT m.Bolge, SUM(s.ToplamTutar) as Ciro
            FROM Satislar s JOIN Magazalar m ON s.MagazaID = m.MagazaID
            WHERE s.TarihSaat BETWEEN ? AND ? ${filterSql}
            GROUP BY m.Bolge ORDER BY Ciro DESC
        `;
        const [rows] = await connection.execute(query, [start, end, ...params]);
        await connection.end();
        return rows;
    }

    static async getAylikKarsilastirma(start, end, filterSql, params) {
        const connection = await getConnection();
        const query = `
            SELECT DATE_FORMAT(s.TarihSaat, '%Y-%m') as Ay, SUM(s.ToplamTutar) as Ciro
            FROM Satislar s JOIN Magazalar m ON s.MagazaID = m.MagazaID
            WHERE s.TarihSaat BETWEEN ? AND ? ${filterSql}
            GROUP BY Ay ORDER BY Ay DESC LIMIT 2
        `;
        const [rows] = await connection.execute(query, [start, end, ...params]);
        await connection.end();
        return rows;
    }

    static async getGunlukCiro(sDate, eDate, filterSql, params) {
        const connection = await getConnection();
        const query = `
            SELECT DATE_FORMAT(s.TarihSaat, '%Y-%m') as Tarih, SUM(s.ToplamTutar) as GunlukCiro
            FROM Satislar s JOIN Magazalar m ON s.MagazaID = m.MagazaID
            WHERE s.TarihSaat BETWEEN ? AND ? AND m.AcilisTarihi <= ? ${filterSql}
            GROUP BY DATE_FORMAT(s.TarihSaat, '%Y-%m') ORDER BY Tarih ASC
        `;
        const [rows] = await connection.execute(query, [sDate, eDate, eDate, ...params]);
        await connection.end();
        return rows;
    }

    static async getOtomasyonAnaliz(filterSql, params) {
        const connection = await getConnection();
        const query = `
            SELECT m.MagazaAdi as Magaza, m.Bolge,
            (COALESCE((SELECT SUM(ToplamTutar) FROM Satislar WHERE MagazaID = m.MagazaID), 0) / 
             NULLIF((SELECT COUNT(*) FROM Personel WHERE MagazaID = m.MagazaID), 0)) as PersonelVerimi,
            (SELECT COUNT(*) * 20 FROM Demirbaslar WHERE MagazaID = m.MagazaID AND EnerjiSinifi = 'A++') as OtomasyonPuani,
            CASE 
                WHEN (SELECT COUNT(*) FROM Demirbaslar WHERE MagazaID = m.MagazaID AND EnerjiSinifi = 'A++') > 3 
                     AND (COALESCE((SELECT SUM(ToplamTutar) FROM Satislar WHERE MagazaID = m.MagazaID), 0) / NULLIF((SELECT COUNT(*) FROM Personel WHERE MagazaID = m.MagazaID), 0)) < 150000 
                THEN 'Yatırım İsrafı'
                WHEN (SELECT COUNT(*) FROM Demirbaslar WHERE MagazaID = m.MagazaID AND EnerjiSinifi = 'A++') < 2 
                     AND (COALESCE((SELECT SUM(ToplamTutar) FROM Satislar WHERE MagazaID = m.MagazaID), 0) / NULLIF((SELECT COUNT(*) FROM Personel WHERE MagazaID = m.MagazaID), 0)) > 250000 
                THEN 'Gizli Kahramanlar'
                ELSE 'Normal'
            END as Durum
            FROM Magazalar m WHERE 1=1 ${filterSql}
            HAVING PersonelVerimi IS NOT NULL ORDER BY PersonelVerimi ASC LIMIT 50
        `;
        const [rows] = await connection.execute(query, params);
        await connection.end();
        return rows;
    }

    static async loginUser(username, password) {
        const connection = await getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM Yoneticiler WHERE KullaniciAdi = ? AND Sifre = ?', 
            [username, password]
        );
        if(rows.length > 0) {
            await connection.execute('UPDATE Yoneticiler SET SonGiris = NOW() WHERE ID = ?', [rows[0].ID]);
        }
        await connection.end();
        return rows[0];
    }

    static async getStratejikKarar() {
        const connection = await getConnection();
        const [kapatilacak] = await connection.execute(`
            SELECT m.MagazaAdi, m.Bolge, SUM(s.ToplamTutar) as ToplamCiro, 'Sürekli Zarar Ediyor' as Sebep, 'KAPATILMALI' as Karar
            FROM Satislar s JOIN Magazalar m ON s.MagazaID = m.MagazaID
            GROUP BY m.MagazaID ORDER BY ToplamCiro ASC LIMIT 1
        `);
        const [firsatBolgesi] = await connection.execute(`
            SELECT m.Bolge, COUNT(DISTINCT m.MagazaID) as MagazaSayisi, SUM(s.ToplamTutar) / COUNT(DISTINCT m.MagazaID) as MagazaBasiOrtalamaCiro
            FROM Satislar s JOIN Magazalar m ON s.MagazaID = m.MagazaID
            GROUP BY m.Bolge ORDER BY MagazaBasiOrtalamaCiro DESC LIMIT 1
        `);
        await connection.end();
        return { kapatilacak, firsatBolgesi };
    }
}

module.exports = KdsModel;