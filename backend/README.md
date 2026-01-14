# 🛒 EGE KDS - Perakende Zinciri Karar Destek Sistemi

Bu proje, bir perakende market zincirinin yönetim süreçlerini optimize etmek amacıyla geliştirilmiş, **MVC (Model-View-Controller)** mimarisine sahip sunucu taraflı bir REST API uygulamasıdır.

Proje; finansal verileri, personel verimliliğini, stok durumunu ve dış faktörleri (iklim, rekabet) analiz ederek yöneticilere stratejik karar alma konusunda destek olmayı amaçlar.

## 📂 Proje Mimarisi

Uygulama, sürdürülebilirlik ve ölçeklenebilirlik sağlamak adına katı **MVC** prensiplerine göre yapılandırılmıştır:

* **Models:** Veritabanı şemaları ve SQL sorguları.
* **Controllers:** İş mantığı (Business Logic), validasyonlar ve algoritmalar.
* **Routes:** API uç noktaları (Endpoints) ve yönlendirmeler.
* **Config:** Veritabanı ve ortam değişkenleri konfigürasyonu.

## 📋 Senaryo ve İş Kuralları (Business Rules)

Projede gerçek hayat senaryolarını simüle eden iki temel iş kuralı uygulanmıştır:

### Senaryo 1: Stratejik Mağaza Kapatma/Açma Kararı (Analitik Kural)
Sistem, tüm mağazaların ciro, kira gideri, personel maliyeti ve rekabet durumunu analiz eder.
* **Kural:** Eğer bir mağaza, bölge ortalamasının %40 altında performans gösteriyorsa ve "net zarar" durumu 3 aydır devam ediyorsa, sistem bu mağaza için "KAPATILMALI" etiketi üretir.
* **Fırsat:** Aynı zamanda mağaza başına düşen cironun en yüksek olduğu bölgeyi tespit ederek "YENİ ŞUBE AÇILMALI" önerisi sunar.

### Senaryo 2: Veri Bütünlüğü Koruması (CRUD Engelleyici Kural)
Veritabanı tutarlılığını sağlamak adına silme işlemlerinde katı kurallar vardır.
* **Kural:** Bir mağaza silinmek istendiğinde (`DELETE /api/kds/magaza/:id`), sistem önce içeride aktif çalışan personel olup olmadığını kontrol eder. Eğer mağazaya kayıtlı personel varsa, silme işlemi **reddedilir** ve `400 Bad Request` hatası dönülür. Mağaza ancak personeller başka şubeye taşındıktan sonra silinebilir.

## ⚙️ Kurulum Adımları

Projenin yerel makinede çalıştırılması için aşağıdaki adımları izleyin:

1.  **Projeyi Klonlayın:**
    ```bash
    git clone [https://github.com/katatsuke/market-kds-backend.git](https://github.com/katatsuke/market-kds-backend.git)
    cd market-kds-backend
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Ortam Değişkenlerini Ayarlayın:**
    Ana dizinde `.env` dosyası oluşturun ve veritabanı bilgilerinizi girin:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=sifreniz
    DB_NAME=market_kds
    DB_PORT=3308
    PORT=3000
    ```

4.  **Uygulamayı Başlatın:**
    ```bash
    node server.js
    ```

## 📡 API Endpoint Listesi

### 🔹 Temel CRUD ve Yönetim
| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| `POST` | `/api/login` | Yönetici girişi ve yetkilendirme. |
| `DELETE`| `/api/kds/magaza/:id` | Mağaza silme (İş kuralı korumalı). |

### 🔹 Finansal Analizler
| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| `GET` | `/api/kds/finans` | Mağaza bazlı ciro ve net kâr/zarar raporu. |
| `GET` | `/api/kds/tahmin` | Gelecek 6 ayın ciro tahmini (Lineer Regresyon). |
| `GET` | `/api/kds/analiz/gunluk-ciro` | Tarih bazlı ciro trend analizi. |

### 🔹 Operasyonel ve Stratejik
| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| `GET` | `/api/kds/analiz/stratejik-karar` | AI tabanlı kapatma/açma önerileri. |
| `GET` | `/api/kds/analiz/otomasyon` | Mağaza otomasyon ve verimlilik puanı. |
| `GET` | `/api/kds/analiz/lojistik` | Depo-Mağaza arası lojistik maliyet analizi. |
| `GET` | `/api/kds/analiz/urun-performans` | En çok ve en az satan ürünlerin analizi (ABC Analizi). |

## 🛠 Kullanılan Teknolojiler
* **Backend:** Node.js, Express.js
* **Veritabanı:** MySQL
* **Mimari:** MVC (Model-View-Controller)