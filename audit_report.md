# Proje Güvenlik ve Performans Analiz Raporu

## 1. Güvenlik Açıkları (Security Vulnerabilities)

### 🚨 KRİTİK: Kimlik Doğrulama (Broken Authentication)
**Dosya:** `backend/middleware/authMiddleware.js`
- **Sorun:** Middleware, `userId` bilgisini doğrudan `req.body`, `req.query` veya `header` üzerinden doğrulama yapmadan kabul ediyor.
- **Risk:** Herhangi bir kullanıcı, başka bir kullanıcının ID'sini göndererek o kullanıcıymış gibi işlem yapabilir (Account Takeover).
- **Kod Analizi:**
  ```javascript
  let userId = req.query.userId || req.body.userId || req.headers['x-user-id'];
  // Token kontrolü yapılıyor gibi görünse de, token string'i userId olarak atanıyor!
  if (token && token !== 'null' && token !== 'undefined') {
      userId = token; // BURASI HATALI: Token decode edilmiyor, direkt ID olarak kullanılıyor.
  }
  ```

### 🚨 KRİTİK: Güvensiz Dosya Yükleme (Unrestricted File Upload)
**Dosya:** `backend/controllers/proofController.js`
- **Sorun:** `multer` konfigürasyonunda dosya tipi (mime-type) ve dosya boyutu kontrolü yok.
- **Risk:** Saldırganlar sunucuya zararlı dosyalar (.exe, .sh, .php vb.) yükleyebilir. `uploads` klasörü statik olarak sunulduğu için bu dosyalar çalıştırılabilir (Remote Code Execution - RCE riski).
- **Kod Analizi:**
  ```javascript
  const storage = multer.diskStorage({ ... }); // fileFilter ve limits eksik
  ```

### ⚠️ ORTA: Admin Yetkilendirmesi
**Dosya:** `backend/middleware/adminMiddleware.js`
- **Sorun:** Admin kontrolü, manipüle edilebilir `userId` parametresine dayanıyor.
- **Risk:** Kimlik doğrulama açığı ile birleştiğinde, saldırganlar kolayca admin yetkilerine erişebilir.

### ℹ️ DÜŞÜK: Hassas Veri Gösterimi
**Dosya:** `backend/config/db.js`
- **Sorun:** Veritabanı bağlantı string'i konsola loglanıyor.
- **Risk:** Loglara erişimi olan biri veritabanı şifresini görebilir.

---

## 2. Performans Sorunları (Performance Issues)

### 🚨 KRİTİK: Veritabanı Sorguları ve Pagination Eksikliği
**Dosya:** `backend/models/challengeModel.js`
- **Sorun (`getAllChallenges`):** `LIMIT` ve `OFFSET` kullanılmamış.
- **Risk:** Veritabanındaki kayıt sayısı arttıkça bu sorgu tüm tabloyu çekecek, sunucu belleğini (RAM) dolduracak ve uygulamayı çökertecektir.

### ⚠️ ORTA: N+1 Sorgu Problemi
**Dosya:** `backend/models/challengeModel.js` (`getChallengeById`)
- **Sorun:** Her challenge detayı çekilirken, katılımcı sayısını ve kullanıcının durumunu bulmak için `proofs` tablosuna ek sorgular atılıyor.
- **Etki:** Yüksek trafikte veritabanı bağlantı havuzunu tüketebilir. `JOIN` veya `GROUP BY` kullanılarak tek sorguda çekilmelidir.

### ⚠️ ORTA: Caching (Önbellekleme) Eksikliği
- **Sorun:** `getPopularChallenges`, `getLatestChallenges` gibi sık çağrılan endpoint'ler için Redis veya in-memory caching mekanizması yok.
- **Etki:** Her sayfa yenilemede veritabanına gidilmesi yanıt sürelerini uzatır ve veritabanı yükünü artırır.

### ℹ️ DÜŞÜK: Statik Dosya Sunumu
**Dosya:** `backend/server.js`
- **Sorun:** `app.use('/uploads', express.static('uploads'));`
- **Etki:** Node.js statik dosya sunumunda Nginx veya CDN kadar verimli değildir.

### ℹ️ POTANSİYEL: OCR İşlemleri
**Dosya:** `backend/controllers/proofController.js`
- **Not:** Kodda `TODO: Integrate Tesseract.js` notu var.
- **Risk:** Tesseract.js CPU yoğun bir işlemdir. Node.js ana thread'inde çalıştırılırsa sunucuyu kilitler (Event Loop Blocking). Bu işlem mutlaka asenkron bir Worker Thread veya ayrı bir mikro serviste yapılmalıdır.

---

## 3. İyileştirme Önerileri (Action Plan)

1.  **Güvenlik:**
    *   `jsonwebtoken` (JWT) kütüphanesi ile güvenli kimlik doğrulama sistemi kurulmalı.
    *   `multer` konfigürasyonuna dosya tipi (`image/jpeg`, `video/mp4` vb.) ve boyut limiti (örn. 50MB) eklenmeli.
    *   `helmet` kütüphanesi ile HTTP başlık güvenliği sağlanmalı.

2.  **Performans:**
    *   Tüm listeleme endpoint'lerine (Challenges, Proofs) Pagination (`page`, `limit`) eklenmeli.
    *   Sık erişilen veriler için `redis` entegrasyonu yapılmalı.
    *   Veritabanı sorguları `EXPLAIN ANALYZE` ile incelenip gerekli indeksler (Index) eklenmeli.
