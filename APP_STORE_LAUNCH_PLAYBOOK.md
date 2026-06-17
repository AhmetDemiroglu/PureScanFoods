# PureScan Foods — iOS App Store Launch Playbook

> **Bu dosya nedir?** Kod tarafı tamamlandı (bkz. [APP_STORE_RELEASE_TRACKER.md](APP_STORE_RELEASE_TRACKER.md) — Faz A-E ✅).
> Bundan sonra App Store'a gönderim için yapılacak **TÜM** işleri (Apple Developer, App Store Connect, Firebase Console, RevenueCat, AdMob, Xcode, fiziksel cihaz testleri, TestFlight, review submission) sıralı ve uçtan uca adımlarla bu dosyada takip edeceğiz.
>
> **Son güncelleme:** 2026-06-09
> **Bundle ID:** `com.purescan.foods`
> **Hedef sürüm/build:** `1.0` / `1` (Info.plist CFBundleShortVersionString=1.0, ASC version=1.0, pbxproj MARKETING_VERSION=1.0 — hepsi eşit. ITSAppUsesNonExemptEncryption=false eklendi → export compliance otomatik.)
> **Hedef platform:** iPhone (iPad desteği kapatıldı — `supportsTablet: false`)

---

## 🎉 GÜNCEL DURUM (2026-06-16) — CANLI / APP STORE'DA YAYINDA

**Uygulama onaylandı ve App Store'da canlı.**
- **Apple ID:** `6778348937`
- **App Store linki:** https://apps.apple.com/app/id6778348937
- **Onaylanan build:** 1.0 (2) — ATT timing fix (waitForActiveAndSettle).
- **Geçmiş:** Build 1.0(1) submit (2026-06-09) → 5.5 gün sonra **Guideline 2.1 (ATT prompt görünmüyor)** reddi → kod fix (app/_layout.tsx) + build 1.0(2) + Resolution Center'a video/açıklama → resubmit (2026-06-15) → **Approved (2026-06-16)**.
- **Onay sonrası iş YAPILDI:** Landing repo `index.html` `STORE.appStore` gerçek linkle dolduruldu + privacy/terms/support/marketing'deki "App Store Soon" butonları gerçek linke çevrildi + marketing "coming soon" metinleri kaldırıldı → push edildi (commit 635df3c).

**Sıradaki (güncelleme yayınlarken):** Adım 24'e bak — version bump (1.0→1.0.1) + build number artır + Archive/upload + ASC'de yeni version + submit. ATT/IAP/metadata zaten kurulu, sadece "what's new" + yeni build gerekir.

---

## 🟢 ESKİ DURUM (2026-06-09) — SUBMISSION AŞAMASI (arşiv)

**Tamamlananlar (✅):**
- **Apple Developer:** App ID + Sign In with Apple capability + Key (.p8) + Service ID + Firebase Apple provider.
- **App Store Connect:** App kaydı, App Information (kategori Food&Drink + Health&Fitness, content rights), Age Rating **4+**, **App Privacy** (publish edildi — ama bkz. blocker), Subtitle/Description/Keywords/Promotional (EN/TR/ES, emoji+em dash temiz), Screenshots (6.5", yüklü), Support URL.
- **IAP:** Subscription Group + 2 ürün (monthly/yearly) → **Ready to Submit**. Shared Secret + IAP Key alındı.
- **RevenueCat:** iOS app + `premium` entitlement (4 ürün bağlı) + offering ($rc_monthly/$rc_annual). Android yıllık entitlement bug'ı da düzeltildi.
- **AdMob:** iOS app + interstitial + rewarded ad units.
- **Paid Apps Agreement:** Active (DSA trader + banking + W-8BEN).
- **`.env` + Info.plist:** production key'ler, GADApplicationIdentifier prod, ITSAppUsesNonExemptEncryption=false, sürüm 1.0. Gemini key bundle'dan kaldırıldı.
- **Native/Xcode:** Sign In with Apple entitlement, TARGETED_DEVICE_FAMILY=1 (iPhone-only), signing (Team L56HGU8K3U), Archive + **upload → build 1.0(1) Ready to Submit (TestFlight)**.
- **Kod bug fix'leri (cihaz testinde bulundu, düzeltildi):** (1) paywall tarama metni 3, (3) dil cihaz diline göre, (4) Apple login donması, (5) ölü topbar (modal yarışı). tsc temiz. Bug 2 (reklamlar) = AdMob yeni unit no-fill, kod doğru, servis edince çalışır.
- **Sandbox satın alma:** test edildi, premium açıldı, TR fiyat geldi, premium tek kaynak RevenueCat (abonelik bitince otomatik düşer).
- **Legal/landing site:** privacy/terms/support/marketing + landing canlı; cihaz-algılayan indirme + tablı navbar + çift mağaza butonu (App Store "Soon", yayınlanınca aktifleşecek).
- **App Review Information:** sign-in required ✓ + demo hesap (premium@septimus.com/123456), notes (sade İngilizce), contact.

**✅ SUBMIT EDİLDİ — "Waiting for Review" (2026-06-09 20:41)**
- **Submission ID:** `fe8a7362-8952-418f-83f4-f6912572259f`
- Item: iOS App 1.0 (build 1) — App Version — Waiting for Review. Submitted by: Ahmet Demiroglu.
- Çözülen 2 blocker: **Regulated Medical Devices** = "not a regulated medical device in any country or region" beyanı (App Store Regulations & Permits); **App Privacy** publish edildi. DSA = trader (zaten).
- IDFA modalı: "Serve advertisements within the app" ✓ + ATT/Limited Ad Tracking uyum onayı ✓.

**⏳ SIRADAKİ — Apple yanıtı bekleniyor (~24-48 saat, bazen daha kısa/uzun; Apple e-posta atar → ahmetdemiroglu89@gmail.com):**
- Durum akışı: Waiting for Review → In Review → **Pending Developer Release** (manuel release seçildiyse) / Rejected.
- **Onaylanırsa:** ASC'de **"Release This Version"** → 1-24 saatte App Store'da yayında.
- **Onay sonrası TEK İŞ (önemli):** Landing repo `index.html` → `STORE.appStore = ''` değişkenine `https://apps.apple.com/app/id<APPLE_ID>` yaz (Apple ID: ASC > App Information > General Information > Apple ID) → push et → iOS otomatik yönlendirme + tüm sayfalardaki "Soon" App Store butonları aktifleşir.
- **Reddedilirse:** Resolution Center'daki red metnini Claude'a olduğu gibi paste et → Adım 23'teki olası red senaryoları + çözümler hazır. Kod düzeltmesi gerekirse: düzelt → build numarası 1→2 → yeni Archive + upload → tekrar submit.

**Reddedilirse hızlı bakılacaklar (Adım 23 özeti):** 4.8 (Apple Sign-In — çalışıyor), 5.1.1 (privacy/data deletion — hazır), 3.1.2 (abonelik metni/Terms/Restore — paywall'da var), 1.4.1 (medical claims — disclaimer her ekranda, "not a medical device" beyan edildi), 2.3.x (metadata/screenshots doğru). En olası takılma: IAP review (sandbox), reklamların review anında görünmemesi (red sebebi değil).

---

### 📋 Kaydedilen Değerler

| Değer | İçerik | Durum |
|---|---|---|
| **Apple Team ID** | `L56HGU8K3U` | ✅ |
| **Enrollment tipi** | Individual (App Store satıcı adı = yasal adın) | ✅ |
| **Bundle ID / App ID** | `com.purescan.foods` | ✅ kayıtlı |
| **Sign In with Apple — App ID capability** | Aktif | ✅ |
| **Sign In with Apple — Key ID (.p8)** | `5752895G5N` (dosya güvende) | ✅ |
| **Sign In with Apple — Service ID** | `com.purescan.foods.signin` (konfig Adım 4'te tamamlanacak) | ✅ yaratıldı |
| **Firebase Project ID** | `purescan-foods` | ✅ |
| **Firebase Apple callback URL** | `https://purescan-foods.firebaseapp.com/__/auth/handler` | ✅ |
| **RevenueCat iOS API Key** | `appl_UhECzdcbKAJJGjdCYJnBtvFRTRJ` | ✅ |
| **AdMob iOS App ID** | `ca-app-pub-5745551393591703~1249093946` | ✅ |
| **AdMob iOS Interstitial ID** | `ca-app-pub-5745551393591703/9595860971` (scan_interstitial) | ✅ |
| **AdMob iOS Rewarded ID** | `ca-app-pub-5745551393591703/9211344446` (rewarded_limit_boost) | ✅ |
| **AdMob Android ad unit isimleri (ref)** | `scan_interstitial`, `rewarded_limit_boost` | ✅ |
| **ASC IAP Key — Issuer ID / Key ID** | Issuer + Key ID `K39782Z426` + .p8 RevenueCat'e girildi ("Valid credentials") | ✅ |
| **Sandbox tester email** | `septimus.labb@gmail.com` (Türkiye) | ✅ |
| **IAP Product ID'leri** | `purescan_premium_monthly` ($1.99/ay), `purescan_premium_yearly` ($12.99/yıl) — Android ile aynı, free trial yok | ✅ oluşturuldu, Ready to Submit |
| **Entitlement adı** | `premium` (kod: `lib/revenuecat.ts` `ENTITLEMENT_ID="premium"`) | ✅ doğrulandı |
| **App Review demo hesabı** | `premium@septimus.com` / `123456` (FREE; uygulama email/şifre login) | ✅ |
| **App Store version / build** | `1.0` / `1` (Ready to Submit, TestFlight'ta) | ✅ |
| **Legal/landing site** | privacy + terms + support + marketing + landing (cihaz-algılayan, tablı navbar, çift mağaza butonu) — `purescan-foods.septimuslab.com` | ✅ canlı |

---

## 0. Bu Playbook'u Nasıl Kullanacağız

### Rol Dağılımı

| Rol | Kim | Ne Yapar |
|---|---|---|
| **Rehber** | Claude (ben) | Adım adım talimat, doğrulama, kod tarafı düzeltmeler, araştırma, hata çözme. |
| **Operasyon** | Sen | Apple/Firebase/RevenueCat/AdMob panel tıklamaları, Xcode işlemleri, fiziksel cihaz testleri. |

Her büyük adımın başında şu etiketleri göreceksin:

- 🧭 **REHBER** — Ben senin için araştıracağım/doğrulayacağım/kod yazacağım.
- 👤 **SEN** — Sen kendi makinende/panelinde yapacaksın. Detaylı talimat verilir.
- 🤝 **BİRLİKTE** — Senin yaptığın bir işin çıktısını bana göstereceksin, ben doğrulayıp bir sonraki adıma geçeceğim.

### İlerleme Takibi

Her adımın başında bir checkbox var:

- `[ ]` Henüz yapılmadı.
- `[x]` Tamamlandı.

Bir adımı bitirdiğinde bana **"X adımı tamam"** de; ben kutuyu işaretleyeceğim ve bir sonraki adıma geçeceğiz. Tek tek ilerleyeceğiz, sırayı bozmayalım — çünkü çoğu adım bir sonrakinin önkoşulu.

### Sırayı Neden Bozmamalıyız

```
Apple Developer kayıt
  → App ID + Capabilities
    → Sign in with Apple Key (.p8)
      → Firebase Apple provider (Key gerekir)
        → App Store Connect app kaydı (App ID gerekir)
          → IAP subscription (App kaydı gerekir)
            → RevenueCat (IAP + ASC API Key gerekir)
              → AdMob iOS (App kaydı bağımsız ama bundle ID gerekir)
                → Xcode capability sync + Archive
                  → TestFlight (Archive gerekir)
                    → Sandbox/cihaz testleri (TestFlight gerekir)
                      → App Store submission (her şey hazır olmalı)
```

---

## 1. Önkoşullar — Başlamadan Önce Elinde Olması Gerekenler

`[ ]` Hepsini doğrulayalım:

### 1.1 Apple Developer Program Üyeliği — **ZORUNLU**
- 👤 **SEN:** [developer.apple.com/programs](https://developer.apple.com/programs/) adresinde **ücretli** Apple Developer Program üyeliğin aktif olmalı (yıllık $99 USD).
- **Nasıl doğrularsın:** [developer.apple.com/account](https://developer.apple.com/account) > sağ üstte hesap adının yanında "Account Holder" yazıyorsa ve "Membership" sayfasında "Active" görünüyorsa tamam.
- Eğer **şirket hesabı** ise: D-U-N-S numarası ve şirket doğrulaması bitmiş olmalı.
- Bu üyelik yoksa hiçbir şey yapamayız — önce bunu hallet.

**Team ID notu:** Apple Developer hesabında **Team ID** (10 karakter, harf+rakam karışık) olacak. Bunu birden fazla yerde kullanacağız. Şimdi bulalım:
- [developer.apple.com/account](https://developer.apple.com/account) > sol menüde **Membership Details**
- "Team ID" satırını bul — örn: `A1B2C3D4E5`. **Bu değeri bir yere not et**, sana sık sık soracağım.

### 1.2 Apple ID
- 👤 **SEN:** Apple Developer hesabıyla **aynı** Apple ID'yi App Store Connect ve Xcode'a girmiş olmalısın.

### 1.3 Mac + Xcode
- 👤 **SEN:** macOS makinen var ve Xcode kurulu (zaten kuruluymuş — debug build başarılı). Xcode sürümü en az **15.x** olmalı (Xcode 15 = iOS 17 SDK; App Store şu an iOS 17+ SDK ile build edilmiş app'leri kabul ediyor).
- Doğrulama: Xcode > Xcode menüsü > About Xcode.

### 1.4 Fiziksel iPhone
- 👤 **SEN:** Apple Sign-In, ATT izin dialogu, StoreKit sandbox satın alma ve AdMob testleri **simulator'de yapılamaz**. En az bir fiziksel iPhone şart.
- iPhone'un Apple ID'sini bilmen gerek (sandbox tester için ayrı bir hesap yaratacağız ama uygulamayı yüklerken cihazın kendi Apple ID'si lazım).

### 1.5 Apple Sign In ile test için sandbox Apple ID **DEĞİL**
- Apple Sign-In **gerçek bir Apple ID** ile test edilir (sandbox hesap değil).

### 1.6 Web Tarafı Hazır Olmalı
- Privacy Policy URL: `https://purescan-foods.septimuslab.com/privacy-policy/`
- Terms of Use URL: `https://purescan-foods.septimuslab.com/terms/`
- Support URL (App Store Connect zorunlu istiyor): muhtemelen `https://purescan-foods.septimuslab.com/support/` veya `https://septimuslab.com/contact` gibi.
- Marketing URL (opsiyonel ama önerilir).

**Bu adımda yapacağın:** Yukarıdaki 3 URL'in **canlı ve erişilebilir** olduğunu tarayıcıda kontrol et. Çalışmıyorsa önce onları halletmen lazım — App Store reviewer linklere tıklar ve 404 alırsa reject yer.

---

## 2. Şu Anki Durum — Nelerin Hazır Olduğunu Bilelim

### ✅ Kod Tarafı (Hepsi Tamam)
- Sign in with Apple entegrasyonu (`context/AuthContext.tsx` + `components/profile/AuthModal.tsx`)
- ATT akışı (`app/_layout.tsx`)
- AdMob platform-aware config (`lib/admob.ts`)
- RevenueCat env-driven config (`lib/revenuecat.ts`) — key boşsa runtime hata atmıyor
- Paywall (Restore + Terms + Privacy + Manage Subscription linkleri)
- Hesap silme + Storage + AsyncStorage + device_limits temizliği
- `app.config.ts` (Expo config persistance)
- `.env.example` şablonu
- Tüm UI/dokunma/safe-area düzeltmeleri

### ✅ Native (Sınırlı)
- `cd ios && pod install` çalıştırıldı (yeni paketler: `expo-apple-authentication`, `expo-tracking-transparency`)
- `Info.plist`'ten mikrofon ve Face ID izinleri silindi, `NSUserTrackingUsageDescription` eklendi

### ❌ Henüz Yapılmamış (Bu Dosyada Yapılacak)
- Apple Developer panelinde Sign in with Apple capability + Key (.p8) + Service ID
- Firebase Console'da Apple provider aktivasyonu
- App Store Connect'te app kaydı + IAP + privacy + metadata + screenshots
- RevenueCat iOS app kaydı + offering + API key
- AdMob iOS app + ad unit'ler
- `.env` dosyasını doldurmak
- Xcode'da Sign In with Apple capability + iPhone-only ayarı
- Fiziksel cihaz testleri
- TestFlight upload + sandbox testleri
- App Store review submission

### ⚠️ Önemli Not (Önceki Ajanın Karıştırdığı)
Önceki ajan `npx expo prebuild --no-clean` yazmış ama bu Expo'nun bazı sürümlerinde geçerli değil. **Bizim durumumuzda prebuild'e GEREK YOK** çünkü native iOS klasörü zaten mevcut ve elle yönetiliyor. Tüm native işleri Xcode'da yapacağız.

---

## 3. ADIM ADIM SÜREÇ

Aşağıdaki adımları **sırayla** yapacağız. Atlamak yok.

---

### Adım 1 — Apple Developer: App ID Oluştur ve Capabilities Ekle

`[x]` ✅ TAMAMLANDI (2026-06-09) — `com.purescan.foods` kayıtlı, Sign In with Apple aktif, Team ID `L56HGU8K3U`.

`[x]` 👤 **SEN**

App ID = Apple sisteminde uygulamanın benzersiz kimliği. Bundle ID `com.purescan.foods` ile eşleşecek.

**Talimatlar:**

1. Tarayıcıda [developer.apple.com/account](https://developer.apple.com/account) aç ve giriş yap.
2. Sol menüden **"Certificates, Identifiers & Profiles"** linkine tıkla.
3. Sol panelde **"Identifiers"** seç.
4. Sağ üstte **mavi (+)** butonuna bas.
5. **"App IDs"** seç, **Continue**.
6. Type olarak **"App"** seç, **Continue**.
7. Aşağıdaki alanları doldur:
   - **Description:** `PureScan Foods` (boşluklara izin var ama özel karakter yasak)
   - **Bundle ID:** "Explicit" seçili olsun, kutuya **tam olarak** `com.purescan.foods` yaz.
8. Aşağıda **Capabilities** listesi var. Şunları **işaretle (checkbox)**:
   - ✅ **Sign In with Apple**
   - ✅ **Push Notifications** (ileride lazım olabilir, şimdi açmak zararsız — uygulamada şu an push yok ama gelecekte ekleyebiliriz)
   - ✅ **Associated Domains** (universal links için; şu an kullanmıyoruz ama ileride hazır olsun — opsiyonel)
   - **Diğerlerine dokunma.**
9. **Sign In with Apple** satırının yanındaki **"Edit"** linkine tıkla:
   - Açılan pencerede **"Enable as a primary App ID"** seçili kalsın. **Save**.
10. **Continue** > **Register**.

**Bana ne ileteceksin:** "Adım 1 tamam, Bundle ID `com.purescan.foods` kayıtlı, Sign In with Apple aktif."

**Doğrulama:** Identifiers listesinde `com.purescan.foods` görünmeli.

📚 **Referans:** [Apple — Register an App ID](https://developer.apple.com/help/account/manage-identifiers/register-an-app-id)

---

### Adım 2 — Apple Developer: Sign In with Apple Private Key (.p8) Oluştur

`[x]` ✅ TAMAMLANDI (2026-06-09) — Key ID `5752895G5N`, .p8 indirildi ve güvende.

`[x]` 👤 **SEN**

Firebase'in Apple Sign-In token'larını doğrulayabilmesi için Apple'dan bir private key alacağız. Bu key **bir kez** oluşturulur, **bir kez** indirilir — kaybedersen yenisini yaratman gerekir.

**Talimatlar:**

1. [developer.apple.com/account](https://developer.apple.com/account) > **Certificates, Identifiers & Profiles**.
2. Sol panelde **"Keys"** seç.
3. Sağ üstte **mavi (+)** butonu.
4. **Key Name:** `PureScan Foods Sign In with Apple Key` (istediğin isim; tanımlayıcı olsun).
5. Listeden **"Sign In with Apple"** checkbox'ını işaretle.
6. Yanındaki **"Configure"** butonuna bas.
7. Açılan ekranda **"Primary App ID"** dropdown'undan az önce yarattığın `com.purescan.foods` (PureScan Foods) seç. **Save**.
8. **Continue** > **Register**.
9. Sonraki ekranda **"Download"** butonu var. **Hemen indir** — bu pencereyi kapatırsan key bir daha indirilemez.
10. İndirdiğin dosya: `AuthKey_XXXXXXXXXX.p8` (XXXXXXXXXX = 10 karakter Key ID).
11. **Bu dosyayı güvenli bir yere kaydet** — örn: `~/Documents/PureScanFoods-keys/AuthKey_XXXXXXXXXX.p8`. **Asla git'e commit etme**, asla bir bulut paylaşımına atma.

**Bana ne ileteceksin:**
- Key ID (10 karakter — dosya adında ve key detay sayfasında görünür): örn `7K3X4MN8AB`
- "P8 dosyası indirildi ve güvenli yerde."

**Bana p8 dosyasının içeriğini gönderme** — bu private key, sızdırılırsa Apple Sign-In güvenliğin gider.

📚 **Referans:** [Apple — Create a Sign in with Apple private key](https://developer.apple.com/help/account/manage-keys/create-a-private-key)

---

### Adım 3 — Apple Developer: Service ID Oluştur (Firebase için)

`[x]` ✅ TAMAMLANDI (2026-06-09) — Service ID `com.purescan.foods.signin` yaratıldı (konfig Adım 4'te).

`[x]` 👤 **SEN**

Firebase Apple provider, Service ID denilen bir tanımlayıcı ister. Bundle ID'den ayrı bir Service ID yaratacağız.

**Talimatlar:**

1. [developer.apple.com/account](https://developer.apple.com/account) > **Certificates, Identifiers & Profiles** > **Identifiers**.
2. Sağ üstte **(+)** butonu.
3. **"Services IDs"** seç (App IDs'in altında olabilir; radio button), **Continue**.
4. Aşağıdaki alanları doldur:
   - **Description:** `PureScan Foods Sign In with Apple Service`
   - **Identifier:** `com.purescan.foods.signin`
     - **DİKKAT:** Bu, Bundle ID'den farklı bir değer. Apple zaten Bundle ID'yi tekrar Service ID olarak kullanmana izin vermez. `.signin` veya `.service` gibi bir suffix ekle.
5. **Continue** > **Register**.
6. Şimdi az önce yarattığın Service ID'ye **tıkla** (listede görünür):
7. **"Sign In with Apple"** checkbox'ını işaretle.
8. Yanındaki **"Configure"** butonuna bas.
9. Açılan modal:
   - **Primary App ID:** `com.purescan.foods (PureScan Foods)` seç.
   - **Domains and Subdomains:** `purescan-foods.septimuslab.com` (privacy policy domain'in — Firebase auth handler domain'i de olabilir; aşağıda Firebase tarafında bunu netleştireceğiz)
   - **Return URLs:** Şimdilik boş bırak (Firebase Apple provider kurulumunda doldurulacak — Firebase'in callback URL'si: `https://YOUR-PROJECT-ID.firebaseapp.com/__/auth/handler`. Bunu Adım 4'te netleştireceğiz, geri dönüp dolduracağız.)
10. Şimdilik **Next** > **Save** > **Continue** > **Save**.

**Not:** Return URL'leri Adım 4'ten sonra geri dönüp dolduracağız çünkü Firebase project ID'yi orada onaylayacağız.

**Bana ne ileteceksin:** "Adım 3 tamam, Service ID = `com.purescan.foods.signin`."

📚 **Referans:** [Firebase — Authenticate Using Apple — iOS section](https://firebase.google.com/docs/auth/ios/apple)

---

### Adım 4 — Firebase Console: Apple Provider'ı Aktive Et

`[x]` ✅ TAMAMLANDI (2026-06-09) — Firebase Apple provider enabled (Services ID `com.purescan.foods.signin`, Team ID `L56HGU8K3U`, Key ID `5752895G5N`, .p8 girildi). Apple Service ID → domain `purescan-foods.firebaseapp.com` + return URL `https://purescan-foods.firebaseapp.com/__/auth/handler` bağlandı. ⚠️ Service ID'de "2 Website URLs" görünüyor; Apple login testinde sorun çıkarsa fazla URL temizlenecek.

`[x]` 👤 **SEN** (ben yanında olacağım, değerleri doğrularım)

**Talimatlar:**

1. [console.firebase.google.com](https://console.firebase.google.com) aç ve PureScan Foods projeni seç.
2. Sol menüde **Build** > **Authentication**.
3. **Sign-in method** sekmesine geç.
4. Listede **"Apple"** satırını bul, sağındaki **kalem ikonu**na veya satırın kendisine tıkla.
5. Sağ taraftan açılan panelde **"Enable"** toggle'ını aç.
6. Aşağıdaki alanları doldur:
   - **Services ID:** Adım 3'te yarattığın `com.purescan.foods.signin`.
   - **OAuth code flow configuration (OPTIONAL but RECOMMENDED):**
     - **Apple team ID:** Adım 1.1'de not ettiğin 10 karakterlik Team ID.
     - **Key ID:** Adım 2'de indirdiğin .p8 dosyasının ID'si (10 karakter).
     - **Private key:** Adım 2'de indirdiğin `AuthKey_XXXXXXXXXX.p8` dosyasını bir text editör (TextEdit, VS Code, Cursor) ile aç. İçeriği şuna benzer:
       ```
       -----BEGIN PRIVATE KEY-----
       MIGTAgEAMBMGByqGSM49...
       -----END PRIVATE KEY-----
       ```
     - **Bu içeriğin tamamını** (BEGIN ve END satırları dahil) Firebase'deki "Private key" alanına yapıştır.
7. **Save**.
8. Firebase sana en altta bir **"OAuth redirect URI"** gösterir:
   ```
   https://YOUR-PROJECT-ID.firebaseapp.com/__/auth/handler
   ```
   - Bu URL'i **kopyala**.

9. **Şimdi Apple Developer'a geri dön** (Adım 3'te bıraktığımız Service ID'yi tamamlayalım):
   - [developer.apple.com/account](https://developer.apple.com/account) > Identifiers > `com.purescan.foods.signin` (Service ID).
   - **Sign In with Apple** satırı yanında **Configure** > açılan modalda:
     - **Domains and Subdomains:** Buraya Firebase callback URL'inin **domain kısmını** yaz (HTTP/HTTPS olmadan, sadece domain):
       ```
       YOUR-PROJECT-ID.firebaseapp.com
       ```
     - **Return URLs:** Firebase'den kopyaladığın tam URL'i yapıştır:
       ```
       https://YOUR-PROJECT-ID.firebaseapp.com/__/auth/handler
       ```
   - **Next** > **Save** > **Continue** > **Save**.

**Bana ne ileteceksin:**
- "Adım 4 tamam."
- Firebase project ID (kontrol için, örn: `purescan-foods-xxxxx`)
- Apple Service ID konfigürasyonu tamamlandı.

📚 **Referans:** [Firebase — Apple Sign-In iOS Setup](https://firebase.google.com/docs/auth/ios/apple#configure-sign-in-with-apple)

---

### Adım 5 — App Store Connect: Uygulamayı Kaydet

`[x]` ✅ TAMAMLANDI (2026-06-09) — App Store Connect'te `PureScan Foods` kaydı oluştu, "1.0 Prepare for Submission" durumunda. Diller: EN/TR/ES. Screenshot'lar Play Store görselleriyle aynı kullanılacak (Adım 16'da işlenecek).

`[x]` 👤 **SEN**

Apple Developer App ID'sini kaydettik, şimdi App Store Connect'te uygulama kaydını oluşturacağız.

**Talimatlar:**

1. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) aç, Apple ID ile giriş yap.
2. Üst menüde **"My Apps"** tıkla.
3. Sol üstte **mavi (+)** butonu > **"New App"**.
4. Açılan modal:
   - **Platforms:** `iOS` (yalnızca iOS, macOS işaretleme)
   - **Name:** `PureScan Foods`
     - **DİKKAT:** Bu, App Store'da görünecek isim. Maks 30 karakter. Bu isim sonradan değiştirilebilir ama itinalı seç.
   - **Primary Language:** `English (U.S.)` (uygulamanın varsayılan dili)
   - **Bundle ID:** Dropdown'dan `com.purescan.foods (PureScan Foods)` seç (Adım 1'de yarattığın App ID burada görünmeli).
   - **SKU:** `PURESCAN-FOODS-IOS-001` (kendi iç tanımlayıcın, App Store'a görünmez, dilediğin formatta).
   - **User Access:** `Full Access` (sadece sen varsan).
5. **Create**.

**Bana ne ileteceksin:** "Adım 5 tamam, App Store Connect'te uygulama yaratıldı, ana ekranı görüyorum."

📚 **Referans:** [App Store Connect Help — Add a new app](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app)

---

### Adım 6 — App Store Connect: App Information ve App Privacy Hazırlığı

`[x]` ✅ TAMAMLANDI (2026-06-09) — App Information (kategori Food & Drink + Health & Fitness, content rights third-party YES, age rating **4+**, Subtitle EN/TR/ES). App Privacy questionnaire publish edildi (yukarıdaki Tablo X-1 uygulandı; Sensitive Info eklenmedi — lifeStage "Other User Content" altında). Privacy Policy URL `https://purescan-foods.septimuslab.com/privacy-policy/` 3 dile de girildi. User Privacy Choices URL boş. Product Page Preview doğrulandı (Track: Identifiers+Usage; Linked: Contact/Usage/Purchases/UserContent/Identifiers; Not Linked: Usage).

**Age Rating cevapları (kayıt):** Step1 sadece Advertising=YES; Step2 hepsi NONE; Step3 Medical/Treatment=NONE + Health/Wellness Topics=NO; Step4-6 hepsi None/No; Step7 Not Applicable → **4+**.

`[x]` 👤 **SEN** + 🤝 **BİRLİKTE**

App kaydedildi, şimdi temel meta bilgileri girelim. (Screenshots ve description'ı Adım 16'da, üretim hazır olduğunda dolduracağız — şimdilik privacy/info gibi bağımsız işleri yapalım.)

**Talimatlar:**

1. App Store Connect > My Apps > **PureScan Foods**.
2. Sol menüden **"App Information"** seç.
3. Aşağıdaki alanları doldur:
   - **Category:**
     - **Primary:** `Food & Drink` (ana kategori — Health & Fitness alternatif olabilir, sen karar ver)
     - **Secondary:** `Health & Fitness` (opsiyonel)
   - **Content Rights:** "Does your app contain, show, or access third-party content?" sorusunu:
     - **EVET** — çünkü OpenFoodFacts API'dan ürün verisi çekiyoruz.
     - "Do you have all the necessary rights to that third-party content?" → **EVET** (OpenFoodFacts veri tabanı Open Database License — ticari kullanım dahil, attribution gerekli).
   - **Age Rating:** `Set Age Rating` butonuna bas. Açılan questionnaire'da:
     - **Unrestricted Web Access:** No
     - **Gambling:** No
     - **Medical/Treatment Information:** **"Infrequent/Mild"** (gıda/beslenme bilgisi var ama medical advice değil — kod tarafında uyarı metinleri mevcut, bunu reviewer'a iletmek için işaretle)
     - **Diğer hepsi:** No
     - Sonuç tahmini: **4+** olmalı.
4. **Save** (sağ üst).

5. Şimdi sol menüden **"App Privacy"** seç.
6. **"Get Started"** butonuna bas.
7. **Data Collection Questionnaire'ı**: Aşağıdaki Tablo X-1'de listelenen verilere göre işaretle. Bu liste **kodda gerçekten toplanan verilere** dayalı, ben kodu okuyarak çıkardım:

**Tablo X-1 — Toplanan Veriler (KOD TARAMASIYLA DOĞRULANDI, 2026-06-09)**

> Kod taraması bulguları: Firebase Auth/Firestore/Storage/Functions AKTİF. Firebase Analytics/Crashlytics/Performance/FCM **YOK**. Location/Contacts/Health framework **YOK**. AdMob + RevenueCat aktif. Gemini Firebase callable proxy üzerinden (API key client'ta değil).

**App Privacy'de SEÇİLECEK data type'lar (data-types grid):**

| Kategori | Seç | Neden |
|---|---|---|
| **Contact Info** | ☑️ Name, ☑️ Email Address | Apple/Google/email login displayName + email |
| **User Content** | ☑️ Photos or Videos, ☑️ Other User Content | Scan görselleri (Storage) + diyet/alerjen/lifeStage/aile profilleri/Guru mesajları |
| **Identifiers** | ☑️ User ID, ☑️ Device ID | Firebase UID + RevenueCat appUserID; cihaz limit ID + AdMob device ID |
| **Purchases** | ☑️ Purchase History | RevenueCat abonelik durumu |
| **Usage Data** | ☑️ Product Interaction, ☑️ Advertising Data | Scan/chat sayaçları + AdMob reklam etkileşimi |
| Diagnostics | ❌ SEÇME | Crashlytics/Performance yok |
| Location / Health / Contacts / Financial / Browsing / Search | ❌ SEÇME | Kodda yok |

**Her data type için takip cevapları (Purpose / Linked / Tracking):**

| Data Type | Purposes (amaç) | Linked to user? | Used for Tracking? |
|---|---|---|---|
| **Name** | App Functionality | Yes | **No** |
| **Email Address** | App Functionality | Yes | **No** |
| **Photos or Videos** | App Functionality | Yes | **No** |
| **Other User Content** | App Functionality, Product Personalization | Yes | **No** |
| **User ID** | App Functionality | Yes | **No** |
| **Device ID** | App Functionality, Third-Party Advertising | Yes | **YES** ⚠️ |
| **Purchase History** | App Functionality | Yes | **No** |
| **Product Interaction** | App Functionality, Analytics | Yes | **No** |
| **Advertising Data** | Third-Party Advertising | No | **YES** ⚠️ |

> **Tracking = Yes** sadece Device ID + Advertising Data'da (AdMob, ATT izni verilince personalized reklam = tracking). Bu, uygulamadaki ATT dialogu ile **tutarlı** olmalı — her yere "No" dersek Apple "neden ATT prompt'un var?" diye sorar. Bu yüzden bu ikisi **Yes**.
>
> **Location (coarse) beyan etmiyoruz:** AdMob IP'den ülke düzeyi konum çıkarabilir ama biz ATT reddinde non-personalized'a düşüyoruz; çoğu uygulama IP-türevli coarse location beyan etmez. Reviewer özellikle sorarsa eklenir.
>
> **Diyet/alerjen/lifeStage "Health" mi?** Hayır — bunlar HealthKit verisi değil, kullanıcının gıda-eşleştirme için girdiği **tercih ayarları**. "Other User Content" altında beyan ediyoruz. Bu, uygulamayı gereksizce "sağlık uygulaması" statüsüne sokmaz ve disclaimer ile tutarlıdır.

📚 **Referans:** [Google — Data disclosure for Mobile Ads SDK](https://developers.google.com/admob/ios/privacy/data-collection)

**Bana ne ileteceksin:** "Adım 6 başladım, App Information girdim. App Privacy questionnaire'ı sana açacağım, soruları paste edeceğim." → Birlikte yapacağız.

📚 **Referans:** [App Store — App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)

---

### Adım 7 — App Store Connect: In-App Purchase Subscription Group ve Ürünler

`[x]` ✅ TAMAMLANDI (2026-06-09) — Subscription Group "PureScan Premium Monthly" (dahili ad), içinde 2 ürün: `purescan_premium_monthly` ($1.99/ay) + `purescan_premium_yearly` ($12.99/yıl). Tüm ülkeler seçili. Localization EN (+TR/ES). Review screenshot Adım 15'te eklenecek (şu an Missing Metadata — normal). Free trial yok.

`[x]` 👤 **SEN**

Premium subscription için ürünleri tanımlayacağız. RevenueCat sonra bunlara bağlanacak.

**Önce karar:** Mevcut Android tarafında hangi ürün ID'lerini kullanıyoruz? Bana söyle (örn: `premium_monthly`, `premium_yearly`, fiyatlar?). Birebir aynı isimlendirmeyi iOS'ta kullanırsak RevenueCat eşlemesi kolaylaşır. **Bana cevap verene kadar bu adımı atlama.**

Varsayım (sen onayla): aylık + yıllık iki ürün.

**Talimatlar:**

1. App Store Connect > My Apps > **PureScan Foods**.
2. Sol menüde **Monetization** > **Subscriptions** (yeni UI; eski UI'de "In-App Purchases" başlığı altında).
3. **"Create"** veya **(+)** butonuyla yeni **Subscription Group** yarat:
   - **Reference Name:** `Premium Subscriptions` (App Store'a görünmez, iç ad)
   - **Subscription Group Reference Name:** aynısı
4. Subscription Group oluşturulduktan sonra **içine** gir.
5. **App Store Localization** ekle:
   - Group display name: `PureScan Premium`
   - Dilleri ekle (en, tr, es — uygulama hangi dilleri destekliyorsa).
6. Şimdi **(+)** ile **ilk subscription product'ı** ekle:
   - **Reference Name:** `PureScan Monthly Premium`
   - **Product ID:** `purescan_monthly` (RevenueCat'te aynısı olacak)
   - **Continue**.
7. Açılan ürün detayında:
   - **Subscription Duration:** `1 Month`
   - **Subscription Price:**
     - **"Set Up Subscription Pricing"** > yeni base country (örn USA — $9.99) seç, sonra Apple sana tüm ülkelerdeki tier-based fiyatları gösterir.
     - **Çoklu ülke desteği için** Apple'ın price tier'larını kullan (manuel her ülkeyi geçmek zorunda değilsin).
     - **Mevcut Android fiyatlarıyla eşleştir** — kullanıcı confused olmasın.
   - **Localizations** > Display name + description ekle (en/tr/es).
     - Örnek display name: `Monthly Premium`
     - Örnek description: `Unlimited scans, AI Guru access, ad-free experience.`
   - **Review Information:**
     - **Screenshot:** Paywall ekranının screenshot'ını ekle (1024x1024 veya store-friendly bir boyut)
     - **Review Notes:** "Unlocks unlimited product scans, removes ads, enables AI nutrition advisor (Guru)."
   - **Save**.
8. Aynı şekilde **yıllık ürün** ekle:
   - **Product ID:** `purescan_yearly`
   - **Duration:** `1 Year`
   - **Price:** Android'deki yıllık fiyat.
   - Aynı şekilde lokalizasyon + screenshot + review notes.
9. **Subscription Group seviyesinde**:
   - **Subscription Group Display Name (Localized)** ve **App Store Promotion** alanlarını doldur.

**Önemli — Subscription Submission State:**
- Yeni subscription'lar "Ready to Submit" değil "Missing Metadata" durumunda olabilir. Tüm alanları (özellikle review screenshot ve description) doldurmadan submit edemezsin.
- **Subscription'lar app submission'la BİRLİKTE review'a gider** — ayrı submit etmiyorsun, ama app submit'inden önce bu ürünlerin "Ready to Submit" durumunda olması lazım.

**Bana ne ileteceksin:**
- "Adım 7 tamam"
- Product ID'leri: `purescan_premium_monthly`, `purescan_premium_yearly` (veya senin verdiklerin)
- Subscription Group adı: `Premium Subscriptions`

📚 **Referans:** [App Store Connect — Create auto-renewable subscriptions](https://developer.apple.com/help/app-store-connect/manage-subscriptions/create-an-auto-renewable-subscription)

---

### Adım 8 — App Store Connect: Shared Secret + In-App Purchase API Key (RevenueCat İçin)

`[x]` ✅ TAMAMLANDI (2026-06-09) — App-Specific Shared Secret üretildi (güvende). In-App Purchase Key "RevenueCat IAP Key" üretildi, .p8 indirildi. Issuer ID + Key ID RevenueCat formunda kullanılacak.

`[x]` 👤 **SEN**

RevenueCat, App Store Connect ile konuşabilmek için iki "credential" ister:
1. **App-Specific Shared Secret** (server-to-server bildirimler için)
2. **In-App Purchase Key** (server API erişimi için — modern yol)

#### 8.1 App-Specific Shared Secret

1. App Store Connect > My Apps > **PureScan Foods** > **App Information** (sol menü).
2. En altta **"App-Specific Shared Secret"** bölümü > **Manage** > **Generate** (varsa zaten "View" görünür).
3. Çıkan 32 karakterlik string'i kopyala — bunu RevenueCat'e gireceğiz.

#### 8.2 In-App Purchase Key (Modern Yöntem — Önerilen)

1. App Store Connect > **Users and Access** (üst menü).
2. Üst sekmelerden **"Integrations"** seç.
3. Sol menüden **"In-App Purchase"** seç.
4. **(+)** butonu > **"Generate In-App Purchase Key"**.
5. **Name:** `RevenueCat IAP Key`
6. **Generate**.
7. Çıkan key'i **hemen indir** (.p8 dosyası, bir kez indirilir).
8. Aynı sayfada **Key ID** ve **Issuer ID** (sayfanın üstünde tüm key'lerin üstünde) görünür — ikisini de not et.

**Bana ne ileteceksin:**
- "Adım 8 tamam"
- (Shared Secret'ı bana **gönderme** — sadece "elimde" de. RevenueCat'e sen gireceksin.)
- (P8 dosyasını ve issuer ID'yi de güvende tut.)

📚 **Referans:** [RevenueCat — App Store Connect API key setup](https://www.revenuecat.com/docs/projects/app-store-connect-api)

---

### Adım 9 — RevenueCat: iOS App Kaydı ve Bağlantılar

`[x]` ✅ TAMAMLANDI (2026-06-09) — iOS app eklendi (`com.purescan.foods`), IAP Key + Shared Secret "Valid credentials", iOS public API key `appl_UhECzdcbKAJJGjdCYJnBtvFRTRJ`. iOS ürünleri manuel eklendi (`purescan_premium_monthly`, `purescan_premium_yearly`) — "Could not check" (App Store Connect Missing Metadata yüzünden, normal). **4 ürün de `premium` entitlement'ına bağlandı** (kod `ENTITLEMENT_ID="premium"`). ⚠️ "PureScan Foods Pro" entitlement'ı kullanılmıyor, dokunulmadı. 🐛 **Android yıllık entitlement bug'ı düzeltildi** (yıllık da artık premium'a bağlı). **Offering `default` (Current):** $rc_monthly = Android+iOS aylık, $rc_annual = Android+iOS yıllık. Paket identifier'ları kodun beklediği `$rc_monthly`/`$rc_annual` ile uyumlu.

**Not — Android canlı bug:** `purescan_premium_yearly` Android'de hiç `premium` entitlement'ına bağlı değildi; yıllık aboneler premium alamıyordu. 2026-06-09'da düzeltildi. Bir sonraki Android sürümünde test edilmeli.

`[~]` 👤 **SEN**

Uygulamanın Android tarafı zaten RevenueCat'te kayıtlı. Şimdi aynı **project**'in altına iOS app'i ekleyeceğiz.

**Talimatlar:**

1. [app.revenuecat.com](https://app.revenuecat.com) aç, giriş yap.
2. Sol üstte mevcut PureScan Foods **Project**'i seç (Android için kullandığın).
3. Sol menüden **"Project settings"** seç (dişli ikon, sol altta).
4. **"Apps"** sekmesi.
5. **"+ New"** > **"App Store"** seç.
6. Açılan formda:
   - **App Name:** `PureScan Foods (iOS)`
   - **App Bundle ID:** `com.purescan.foods`
   - **App-Specific Shared Secret:** Adım 8.1'de aldığın 32 karakterli secret.
   - **In-App Purchase Key Configuration** (modern yöntem):
     - **Issuer ID:** Adım 8.2'de aldığın Issuer ID.
     - **Key ID:** Adım 8.2'de aldığın Key ID.
     - **Private Key (.p8):** Adım 8.2'de indirdiğin p8 dosyasının **içeriğini** yapıştır.
7. **Save**.

#### 9.1 iOS Public API Key'i Al

1. Aynı App'in detay sayfasında:
2. Sol panelde **"API Keys"** > iOS app'in altında **"Public API Key"** görünür.
3. Format: `appl_xxxxxxxxxxxxxxxxxxxxxx`.
4. **Kopyala** — bunu `.env`'e gireceğiz (Adım 12).

#### 9.2 Entitlement Eşlemesi

Android'de muhtemelen `premium` entitlement'ı var. iOS'ta aynısını kullanacağız (kodda `premium` ile arıyor).

1. Sol menüden **Product catalog** > **Entitlements**.
2. `premium` entitlement'ı görmelisin.
3. Üstüne tıkla, açılan ekranda **"Attach Products"** veya benzer butonla yeni iOS ürünlerini bağla:
   - `purescan_monthly` (Adım 7'de oluşturduğun) — **App Store** > seç.
   - `purescan_yearly` — aynı şekilde.

> **Not:** Eğer ürünler RevenueCat'te otomatik görünmüyorsa: Sol menüden **Product catalog** > **Products** > **+ New** > **App Store** > Product ID'yi (`purescan_monthly`) gir.
> **Eğer "App Store Connect'e bağlan ve otomatik çek" özelliği görünüyorsa onu kullan**, manuel hata riski azalır.

#### 9.3 Offering Güncelleme

1. **Product catalog** > **Offerings** > Android için kullandığın "default" (veya benzer) offering'in üstüne tıkla.
2. Mevcut paketler (Android ürünleri) listede görünür. Sağ tarafta her paket için "App Store Product" alanı boş olabilir — **iOS ürününü her pakete bağla**:
   - `$rc_monthly` paket → `purescan_monthly` (iOS).
   - `$rc_annual` paket → `purescan_yearly` (iOS).
3. **Save**.

#### 9.4 Sandbox Test Hazırlığı

RevenueCat sandbox'da çalışmak için ayrı bir şey gerekmiyor; App Store Connect'te sandbox tester yaratacağız (Adım 13).

**Bana ne ileteceksin:**
- "Adım 9 tamam"
- iOS public API key: `appl_xxxxxxxx...` — bunu paste et bana, `.env` Adım 12'de dolduracağız.
- Offering içinde iOS ürünleri görünüyor mu? (Evet/hayır)

📚 **Referans:** [RevenueCat — iOS Quickstart](https://www.revenuecat.com/docs/getting-started/quickstart)

---

### Adım 10 — AdMob: iOS App + Ad Unit'ler

`[x]` ✅ TAMAMLANDI (2026-06-09) — iOS App ID `ca-app-pub-5745551393591703~1249093946`. Ad units: scan_interstitial `ca-app-pub-5745551393591703/9595860971`, rewarded_limit_boost `ca-app-pub-5745551393591703/9211344446`. Android ile aynı publisher hesabı.

`[x]` 👤 **SEN**

**Talimatlar:**

1. [admob.google.com](https://apps.admob.com) aç, giriş yap.
2. Sol menü > **Apps** > **Add app**.
3. **Platform:** `iOS`.
4. "Have you published the app on a supported app store?" → **No** (henüz yayında değil, post-launch'ta linkleyeceğiz).
5. **App name:** `PureScan Foods`.
6. **Add**.
7. Sonraki ekranda **App ID** verilir: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`. **Kopyala** — bu `EXPO_PUBLIC_ADMOB_IOS_APP_ID` olacak.

#### 10.1 Interstitial Ad Unit

1. **App detail** sayfasında > **Ad units** > **Add ad unit**.
2. **Ad format:** `Interstitial`.
3. **Ad unit name:** `iOS Interstitial Main`.
4. **Create ad unit**.
5. Verilen Ad Unit ID: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`. **Kopyala** — `EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID`.

#### 10.2 Rewarded Ad Unit

1. **Ad units** > **Add ad unit**.
2. **Ad format:** `Rewarded`.
3. **Ad unit name:** `iOS Rewarded Main`.
4. **Reward settings:** Android'deki ile aynı (örn: 1 reward, "scan_credit"). Bana sor, Android tarafındaki konfigürasyonu söyle.
5. **Create**.
6. Ad Unit ID'yi kopyala — `EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID`.

#### 10.3 iOS App ID'yi Info.plist'te Doğrula (kritik)

🧭 **REHBER (BEN):** AdMob, iOS uygulamasında **gerçek app ID'nin `Info.plist`'te `GADApplicationIdentifier` key'i olarak bulunmasını** zorunlu kılıyor. Şu an Info.plist'te Google test ID'si var. AdMob production app ID'yi aldığında:

- Eğer hala test ID'si varsa AdMob runtime'da çalışmaz.
- **Sen** `.env`'e değeri girdikten sonra, **ben** Info.plist'i (veya app.config.ts üzerinden) düzenleyip production app ID'yi yansıtacağım. Bunu Adım 12'de halledeceğiz.

**Bana ne ileteceksin:**
- "Adım 10 tamam"
- 3 değer (paste et, AdMob ID'leri public, gizli değiller):
  - iOS App ID: `ca-app-pub-...~...`
  - Interstitial: `ca-app-pub-.../...`
  - Rewarded: `ca-app-pub-.../...`

📚 **Referans:** [AdMob — Get started (iOS)](https://developers.google.com/admob/ios/quick-start)

---

### Adım 11 — Privacy Policy ve Terms of Use URL'lerini Doğrula/Güncelle

`[x]` ✅ TAMAMLANDI & CANLI (2026-06-09) — Her iki URL HTTP 200 doğrulandı. Legal site repo: `~/Desktop/purescan download git/purescan-download-foods/` → GitHub `AhmetDemiroglu/purescan-download-foods` → `purescan-foods.septimuslab.com` (GitHub Pages). Push edildi, canlı.

> **Terms URL yerleşimi (Adım 16):** ASC'de Terms için ayrı alan yok. Privacy Policy URL alana girildi. Terms (EULA): (a) paywall içinde link var ✅, (b) App Description'ın altına `Terms of Use: https://purescan-foods.septimuslab.com/terms/` + `Privacy Policy: ...` metin olarak eklenecek. License Agreement = Apple standart EULA (varsayılan, dokunma).
- **Privacy gerçekten kapsamlıymış** (otomatik tarama JS-render'ı görememiş). Sadece 2 eksik eklendi (3 dil): Bölüm 5'e Apple servisleri (Sign in with Apple + App Store/StoreKit), Bölüm 9'a iOS IDFA + App Tracking Transparency. Tarih 09.06.2026.
- **Terms sayfası sıfırdan oluşturuldu** (`terms/index.html`, privacy ile aynı tasarım, 3 dil, 11 bölüm). Bölüm 5'te Apple+Google **auto-renewable abonelik zorunlu metni** (Apple ID'ye tahsil, 24 saat kuralı, hesap ayarlarından yönetim, Restore Purchases). Guideline 3.1.2 + 5.1.1 karşılanıyor.
- Her iki dosyanın i18n JS'i Node ile doğrulandı (geçerli, doğru bölüm sayıları).
- Kod tarafında değişiklik gerekmedi (TERMS_URL `.../terms/` zaten doğru, sayfa yayınlanınca 404 çözülür).
- ⏳ **KALAN: git commit + push** (canlıya geçer) — kullanıcı onayı bekleniyor.

`[~]` 🤝 **BİRLİKTE**

App Store reviewer **kesin** linklere tıklar. 404 = reject.

**Senin yapacakların:**

1. Tarayıcıda aç ve **her birini** kontrol et:
   - https://purescan-foods.septimuslab.com/privacy-policy/
   - https://purescan-foods.septimuslab.com/terms/
2. Her ikisi de yayında ve içerik anlamlı mı?
3. Privacy Policy aşağıdaki noktaları içermeli (App Store Review Guideline 5.1.1):
   - Hangi verileri topluyoruz (Tablo X-1'deki Apple data type listesi)
   - Üçüncü taraf SDK'lar (Firebase, Google Mobile Ads, RevenueCat, OpenFoodFacts)
   - Verilerin kullanım amacı
   - Saklama süresi ve silme yolu (in-app delete + email request)
   - İletişim adresi
4. Terms of Use aşağıdaki noktaları içermeli:
   - Auto-renewable subscription şartları (Apple zorunlu metni — aşağıda bu metnin tipik şablonunu göstereceğim)
   - Kullanım kısıtlamaları (medical advice değil disclaimer)

**🧭 REHBER:** Apple, paywall ekranındaki ve Terms sayfasındaki **auto-renewable subscription standart metnini** zorunlu kılar. Şu pasajlar **mutlaka** Terms'inde olmalı:

```
- Payment will be charged to your Apple ID account at the confirmation of purchase.
- Subscription automatically renews unless it is canceled at least 24 hours before the end of the current period.
- Your account will be charged for renewal within 24 hours prior to the end of the current period.
- Subscriptions may be managed by the user and auto-renewal may be turned off by going to the user's Account Settings after purchase.
- Any unused portion of a free trial period, if offered, will be forfeited when the user purchases a subscription.
```

**Bana ne ileteceksin:**
- Privacy Policy yayında: ✅/❌
- Terms of Use yayında: ✅/❌
- Terms'inde yukarıdaki auto-renewable metni var mı?
- Eğer yayında değilse: doğru URL'i ver veya yayına geçir.

**Eğer URL'lerin değişirse**, ben şunları güncelleyeceğim:
- `components/ui/PaywallModal.tsx` içindeki `TERMS_URL`, `PRIVACY_URL`
- `app.config.ts` varsa (privacy/terms reference)
- App Store Connect'te metadata bölümü

📚 **Referans:** [App Store Review — 3.1.2(a) Subscriptions](https://developer.apple.com/app-store/review/guidelines/#3.1.2)

---

### Adım 12 — `.env` Dosyasını Doldur

`[x]` ✅ TAMAMLANDI (2026-06-09 — Claude yaptı) — `.env` production değerleriyle yazıldı (RevenueCat appl_+goog_ key, AdMob iOS app/interstitial/rewarded + Android app ID). `.env` `.gitignore`'da (satır 29). **Güvenlik:** `EXPO_PUBLIC_GEMINI_API_KEY` `.env`'den kaldırıldı (client'ta kullanılmıyordu, bundle'a sızıyordu — Gemini server-side `functions/` üzerinden). **Info.plist `GADApplicationIdentifier`** test ID'den production iOS App ID'ye (`ca-app-pub-5745551393591703~1249093946`) elle güncellendi (prebuild yapılmadığı için manuel).

⚠️ **Güvenlik takibi:** Eski Gemini key (`AIzaSyD4sB3D...`) muhtemelen mevcut Android production bundle'ında zaten gömülü → ifşa olmuş olabilir. Google Cloud Console'da bu key'i **rotate + API restriction** yapmak önerilir (functions tarafı kendi key'ini kullanıyorsa client key'i tamamen iptal edilebilir).

`[x]` 🧭 **REHBER (BEN yaptım)**

Adım 9 ve 10'dan aldığın değerleri bana paste et, ben **proje root'unda `.env` dosyası oluşturup** dolduracağım. **`.env` git'e commit edilmez** — `.gitignore`'da olmalı (kontrol edeceğim).

**Sen bana şu listeyi paste et:**

```
EXPO_PUBLIC_REVENUECAT_APPLE_KEY=appl_xxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=goog_xxxxxxxxxxxx        # zaten var olmalı, Android'deki
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-XXXXXXXXXX~XXXXXXXXXX
EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID=ca-app-pub-XXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID=ca-app-pub-XXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-XXXXXXXXXX~XXXXXXXXXX  # zaten var
EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID=ca-app-pub-XXXXXXXXXX/XXXXXXXXXX  # zaten var
EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID=ca-app-pub-XXXXXXXXXX/XXXXXXXXXX  # zaten var
```

**Sonra ben:**
1. `.env`'i bu değerlerle yazacağım.
2. `.gitignore`'ı doğrulayacağım (`.env` orada olmalı — değilse ekleyeceğim).
3. `app.config.ts`'i kontrol edeceğim, AdMob app ID'nin `app.config.ts`'ten env'i okuyarak iOS Info.plist'e enjekte ettiğini doğrulayacağım.
4. **Eğer `app.config.ts` bunu yapmıyorsa** Info.plist'i elle güncelleyeceğim (`GADApplicationIdentifier`).

📚 **Referans:** [Expo — Environment variables in Expo](https://docs.expo.dev/guides/environment-variables/)

---

### Adım 13 — App Store Connect: Sandbox Tester Yarat

`[x]` ✅ TAMAMLANDI (2026-06-09) — Sandbox tester `septimus.labb@gmail.com` (Test User, Türkiye). Adım 17'de demo hesap olarak da kullanılacak.

`[x]` 👤 **SEN**

StoreKit sandbox satın alma testleri için **gerçek Apple ID'nle satın alma yapmayacaksın** (paranı çekmesin diye). Apple, sandbox tester denilen sahte ID'ler veriyor.

**Talimatlar:**

1. App Store Connect > **Users and Access** > **Integrations** sekmesi (üst) yanında **Sandbox** veya direkt: [appstoreconnect.apple.com/access/users](https://appstoreconnect.apple.com/access/users) > sol menüde **"Sandbox Testers"** (bazı UI versiyonlarında **"Sandbox"** > **"Testers"**).
2. **(+)** butonuna bas.
3. Form doldur:
   - **First Name / Last Name:** istediğin
   - **Email:** **gerçek olmayan, daha önce Apple ID olarak kullanılmamış bir email**. Önerim: kendi Gmail'inde + işareti kullan, örn: `ahmet+sandbox1@gmail.com` (Gmail bunu aynı kutuya yönlendirir).
   - **Password:** güçlü şifre (Apple kurallarına uygun)
   - **Country:** Türkiye veya test edeceğin bölge
4. **Invite**.
5. Apple test kullanıcısı için bir doğrulama maili gönderebilir — gelen kutusunu kontrol et.

**Bana ne ileteceksin:** "Sandbox tester yaratıldı."

**iPhone'da Sandbox Tester'a Geçiş:**
- Settings > App Store > Sandbox Account (en altta) > sandbox tester email/şifresiyle giriş.
- **NOT:** Cihazın gerçek Apple ID'sinden çıkış YAPMA — sadece App Store > Sandbox Account.

📚 **Referans:** [Apple — Sandbox testing for in-app purchases](https://developer.apple.com/help/app-store-connect/test-in-app-purchases/sandbox-overview)

---

### Adım 14 — Xcode: Sign In with Apple Capability + iPhone-Only + Build Configuration

`[~]` DOSYA TARAFI CLAUDE TARAFINDAN YAPILDI (2026-06-09):
- `ios/PureScanFoods/PureScanFoods.entitlements` → `com.apple.developer.applesignin` = `[Default]` eklendi.
- `project.pbxproj` → `TARGETED_DEVICE_FAMILY = "1"` (iPhone-only, Debug+Release).
- `Info.plist` → `GADApplicationIdentifier` production iOS AdMob ID.
- ⏳ KALAN (kullanıcı, Xcode'da): workspace aç → Signing & Capabilities'te **Team** seç + Automatically manage signing açık → "Sign In with Apple" capability göründüğünü doğrula → Devices=iPhone teyit.

`[~]` 👤 **SEN (Xcode'da)** + 🧭 **REHBER (BEN — ekran ekran anlatacağım)**

> Önceki ajanla `pod install` yapılmış. Burada Xcode'da elle yapmamız gerekenler var. **Lütfen Xcode'da `.xcworkspace` dosyasını aç**, `.xcodeproj`'u DEĞİL. (Pod kullanan tüm Expo projelerinde böyledir.)

#### 14.1 Workspace'i Aç

Terminal:
```bash
open /Users/ahmetdemiroglu/Desktop/PureScanFoods/ios/PureScanFoods.xcworkspace
```

Xcode açıldığında sol panelde **mavi proje ikonu** "PureScanFoods" göreceksin.

#### 14.2 Sign In with Apple Capability Ekle

1. Sol panel'in en üstünde mavi **PureScanFoods** proje ikonuna tıkla.
2. Orta panelde **TARGETS** altında **PureScanFoods** target'ını seç (project değil, **target**).
3. Üstteki sekmelerden **"Signing & Capabilities"** tıkla.
4. **Team** dropdown'unda Apple Developer Team'in seçili olmalı. Değilse seç (Apple ID ile Xcode'a login olmuş olmalısın: Xcode menüsü > Settings > Accounts).
5. **"Automatically manage signing"** checkbox'ı **işaretli** olsun (kolay yol).
6. Sol üstte **"+ Capability"** butonuna bas.
7. Açılan listede **"Sign In with Apple"** ara, çift tıkla.
8. Bu capability artık listenin altına eklenmiş olmalı. Xcode otomatik olarak `PureScanFoods.entitlements` dosyasını oluşturur veya günceller.

**Doğrulama (terminal):**
```bash
cat /Users/ahmetdemiroglu/Desktop/PureScanFoods/ios/PureScanFoods/PureScanFoods.entitlements
```

Çıktıda şuna benzer satırlar olmalı:
```xml
<key>com.apple.developer.applesignin</key>
<array>
    <string>Default</string>
</array>
```

#### 14.3 iPhone-Only Ayarı

1. Aynı target ekranında üst sekmelerden **"General"** tıkla.
2. **Deployment Info** bölümünde:
   - **iOS Deployment Target:** `15.1` (zaten doğru olmalı — kod 15.1 hedefliyor)
   - **Devices:** Dropdown'dan **`iPhone`** seç (`Universal` veya `iPad` değil).
   - Veya altta **"iPad"** checkbox'ı varsa **işaretini kaldır**.
3. **Supported Destinations** listesinden iPad varsa **(-)** ile sil.

#### 14.4 Build Number Kontrolü

İlk submission için:
- **Version (Marketing):** `1.0.0`
- **Build:** `1`

Eğer önceki bir build attığıysa **Build** numarasını her seferinde 1 artırman gerekir. Şimdilik **`1`** olmalı.

#### 14.5 Bundle Identifier Doğrulaması

- **General** sekmesinde **Bundle Identifier:** `com.purescan.foods` olmalı.

#### 14.6 Display Name

- **General** > **Display Name:** `PureScan Foods` (boşluklu, ana ekran ikonu altında görünecek). Eğer boşsa, Info.plist'teki `CFBundleDisplayName` kullanılır.

#### 14.7 Pods Yenileme (Eğer Sonradan Bir Şey Eklersek)

Eğer `.env` veya `app.config.ts` değişikliği sonrası ben native bir paket eklersem (örn AdMob app ID'sini Info.plist'e elle yazacağım), pod install gerekebilir:
```bash
cd /Users/ahmetdemiroglu/Desktop/PureScanFoods/ios && pod install && cd ..
```
Bu komutu **ben söylediğimde** çalıştır.

**Bana ne ileteceksin:**
- "Adım 14 tamam"
- `.entitlements` dosyasının içeriğini paste et (yukarıdaki `cat` komutunun çıktısı).
- Xcode'da Signing & Capabilities sekmesinde "Sign In with Apple" görünüyor mu?
- Devices = iPhone'a alındı mı?

📚 **Referans:** [Apple — Configuring Sign in with Apple](https://developer.apple.com/documentation/sign_in_with_apple/configuring_your_environment_for_sign_in_with_apple)

---

### 🐞 Cihaz Test Bulguları (2026-06-09) ve Düzeltmeler

İlk fiziksel cihaz testinde (iPhone 17 Pro / iOS 27, Release build) bulunanlar:

| # | Bug | Kök sebep | Durum |
|---|---|---|---|
| 1 | Paywall "5 tarama" diyor ama enforcement 3 | Cihaz limiti 3, kullanıcı 5 → min=3; tablo "5" hardcode | ✅ DÜZELTİLDİ — `PremiumCompareModal.tsx` scan satırı `freeValue="3"` (kullanıcı kararı: 3 sıkı). AI chat=5, aile=1 zaten doğru. |
| 2a | Limit dolunca "reklam izle +1" butonu yok | Reklam yüklenemezse buton gizleniyor (yeni AdMob unit no-fill) | ⏳ AdMob bekleme — kod doğru, AdMob servis edince çalışır |
| 2b | Tarama sonrası interstitial gelmiyor | Yeni AdMob unit no-fill + AdMob app "inceleme gerekli" | ⏳ AdMob bekleme — kod doğru |
| 3 | Dil İngilizce açıldı (cihaz Türkçe) | `i18n.ts` Türkçe'yi sadece region=TR ile tetikliyordu | ✅ DÜZELTİLDİ — `languageCode === "tr"` da eklendi |
| 4 | Apple Sign-In sonrası donma (iOS) | `updateDoc` olmayan doc'ta takılma + modal swap yarışı | ✅ DÜZELTİLDİ — `setDoc merge` + premium-modal effect'e `!loading` guard |
| 5 | Topbar profil → premium dialog açıp kapatınca **tüm topbar ölüyor** (dil/tema/profil dokunmuyor) | iOS çoklu-Modal yarışı: ana AuthModal `visible={visible && !showPremiumModal}` ile PremiumCompareModal senkron present/dismiss → görünmez katman dokunmaları yutuyor (iOS-only) | ✅ DÜZELTİLDİ — auto-show effect kaldırıldı; ana modal `visible={visible}`; renderProfile'a açık "Premium'a Geç" butonu (onClose + 350ms gecikme ile tek modal açar). Artık aynı anda tek Modal. |

**Pozitifler:** ✅ Apple Sign-In çalışıyor (mevcut hesap içeriği geldi), ✅ uygulama Release'de standalone açılıyor, ✅ tsc temiz. **1,3,4,5 düzeltmeleri yeni build gerektirir.** 2a/2b AdMob reklam servis etmeye başlayınca doğrulanacak.

**✅ Sandbox satın alma doğrulandı (2026-06-09):** Paid Apps Active sonrası IAP review screenshot'ları eklendi → her iki ürün "Ready to Submit". Sandbox tester ile yıllık satın alma başarılı, **premium açıldı**. Premium tek kaynak = RevenueCat (`finalIsPremium = isRevenueCatPremium || isFirebaseVip`; `subscriptionStatus` kodda hiç "premium" yazılmıyor → Firestore kilitlemiyor → abonelik bitince premium otomatik düşer, production-doğru). Sandbox yıllık ~1 saat geçerli; "Clear Purchase History" aktif entitlement'ı anında iptal etmez. Paywall fiyatı sandbox'ta USD göründü (storefront artifact) — production'da Türk hesabı TRY görür; ASC'de Turkey TRY fiyatı teyit edilecek. KALAN: logout→paywall'da aylık+yıllık ikisi de görünüyor mu + restore testi.

> **Paid Apps Agreement:** ✅ Active (2026-06-09). DSA=trader, banking (Garanti BBVA), W-8BEN (Article 12, %10) tamamlandı. "Packages could not be loaded" için kalan iki sebep: (1) IAP ürünleri "Missing Metadata" → StoreKit döndürmez; review screenshot eklenip "Ready to Submit" yapılmalı (Premium Benefits ekranı screenshot'ı). (2) Agreement yeni aktif → StoreKit propagasyonu birkaç saat. Sandbox satın alma için cihazda Settings > App Store > Sandbox Account = septimus.labb@gmail.com.

### Adım 15 — Xcode: İlk Test Build (Fiziksel Cihazda)

`[ ]` 👤 **SEN (Xcode'da)** + 🧭 **REHBER**

App Store'a göndermeden önce mutlaka fiziksel cihazda denememiz lazım.

#### 15.1 iPhone'u Mac'e Bağla

1. iPhone'u USB ile Mac'e bağla.
2. iPhone ekranında "Trust This Computer?" sorusunda **Trust**.
3. iPhone Settings > Privacy & Security > Developer Mode > **Enable** (iOS 16+).
4. Cihaz yeniden başlar, tekrar açıldığında Developer Mode aktif.

#### 15.2 Xcode'da Cihazı Seç

1. Xcode üst toolbar'da **destination dropdown** (proje adının yanında, "Any iOS Device" yazıyor olabilir).
2. Dropdown'a tıkla, fiziksel iPhone'un (örn "Ahmet's iPhone") seç.

#### 15.3 Build et ve Çalıştır

1. Üst sol köşede **▶ (Play)** butonuna bas, veya `⌘R`.
2. Build başlar. İlk seferde 5-10 dakika sürebilir.
3. **Hata 1:** "Untrusted Developer" — iPhone'da Settings > General > VPN & Device Management > Apple Development > **Trust**.
4. **Hata 2:** Provisioning profile sorunu — "Automatically manage signing" işaretliyse Xcode kendi kendine halletmeli; değilse beni çağır.
5. Uygulama açıldığında **Faz A-E'nin** tüm fonksiyonlarını test et:

**Test Listesi:**

`[ ]` Onboarding ekranı açılıyor → Diller arası geçiş.
`[ ]` Onboarding kabul sonrası **ATT izin dialogu** çıkıyor (Apple'ın native popup'ı).
`[ ]` ATT'ye "Ask App Not to Track" ya da "Allow" seç, uygulamanın crash etmediğini doğrula.
`[ ]` Anonim kullanıcı oluştu, ana ekran açıldı.
`[ ]` **Kamera modal** — X'e basılabiliyor (önceki sorun düzeltildi).
`[ ]` Bir ürün tara (barkod), sonuç ekranı açılıyor.
`[ ]` **Guru** sekmesinde aktif ürün karta X'i bastığında çalışıyor.
`[ ]` **Ansiklopedi** sekmesinde 3 tab dar ekranda taşmıyor.
`[ ]` **Guru** alt uyarısı kenara taşmıyor, input safe-area'da.
`[ ]` Settings > Sign In > **email kaydı** ile yeni hesap aç, çık, tekrar gir.
`[ ]` Settings > Sign In > **Apple ile Giriş** butonu var (iOS'ta görünmeli) → Apple Sign-In flow'unu dene.
`[ ]` Apple Sign-In ile login olduğunda Firebase'de yeni user gözüküyor mu? (Firebase Console > Authentication > Users)
`[ ]` Logout > Apple ile tekrar gir → aynı user'a düşüyor mu?
`[ ]` Settings > Data Management > **Delete My Data** → onayla, Firestore'da scans temizlendi mi? Storage'da resim kaldı mı?
`[ ]` Settings > **Delete Account** → onayla, hesap silindi, anonim olarak geri açıldı.
`[ ]` Paywall'u aç (limit aşımı veya manuel) → fiyatlar görünüyor mu? **Eğer iOS API key yoksa** "Premium unavailable on iOS" mesajı çıkmalı (kodda fallback var).
`[ ]` (Sandbox tester'a geçtikten sonra) Aboneliği satın al → premium açıldı mı?
`[ ]` Restore Purchases çalışıyor mu?
`[ ]` Terms of Use / Privacy Policy linklerine bas, doğru URL açılıyor mu?
`[ ]` Manage Subscription linki → Apple ID Subscriptions sayfasına yönlendiriyor mu?
`[ ]` AdMob interstitial reklam görünüyor mu? (sandbox/dev modda Apple Test ID; eğer .env'de prod ID varsa prod ID).
`[ ]` Light/Dark mode iki ekranı da test et.
`[ ]` Dil: TR/EN/ES sırayla test et.

**Bana ne ileteceksin:** Hangi testler ✅ hangileri ❌. Her ❌ için ekran görüntüsü ve hata mesajı paste et.

📚 **Referans:** [Apple — Running Your App in the Simulator or on a Device](https://developer.apple.com/documentation/xcode/running-your-app-in-the-simulator-or-on-a-device)

---

### Adım 16 — App Store Connect: App Metadata, Description, Keywords, Screenshots

`[~]` DEVAM (2026-06-09) — Metin içeriği [LISTING_METADATA.md](LISTING_METADATA.md)'de hazır (EN/TR/ES: Subtitle, Promotional Text, Keywords, Description). ⚠️ Description'larda **emoji YOK** (App Store kabul etmiyor) ve **em dash YOK**. Support URL için `purescan-foods.septimuslab.com/support/` sayfası oluşturuldu ve yayınlandı (canlı, 3 dilli SSS). Copyright: `2026 SeptimusLab`. Marketing URL + Routing File boş. App Previews (video) boş. Screenshots: kullanıcı Canva'da 1284×2778 (6.5") hazırlıyor — ⚠️ Android nav bar görünmemeli.

**Değerler:** Support URL=`https://purescan-foods.septimuslab.com/support/`, Privacy=`.../privacy-policy/`, Terms=`.../terms/` (Description içinde).

**Legal/landing site (purescan-download-foods repo, 2026-06-09 — CANLI):**
- `/support/` (yeni, 3 dil SSS) ve `/marketing/` (yeni, 3 dil özellik vitrini) oluşturuldu.
- `index.html` (landing): **cihaz algılayan** indirme — iOS→App Store, Android→Play, masaüstü→seçim. App Store linki boşken iOS otomatik Play'e ZORLAMAZ ("çok yakında" gösterir).
- privacy/terms/support/marketing + landing: **çift mağaza butonu** (App Store ikonlu "Soon" placeholder + çalışan Google Play). Tüm Türkçe karakterler doğru, em dash yok (3 paralel ajanla adversarial doğrulandı, temiz).
- ⏳ **APP STORE YAYINLANINCA TEK İŞ:** `index.html` içindeki `STORE.appStore = ''` değişkenine `https://apps.apple.com/app/id<APPLE_ID>` yaz → iOS otomatik yönlendirme + tüm "Soon" butonları gerçek App Store linkine çevrilir (privacy/terms/support/marketing'deki `btn-appstore btn-soon` → aktif link). Apple ID numarası: App Store Connect > App Information > General Information > Apple ID.

`[~]` 👤 **SEN** + 🧭 **REHBER (metin yazımında yardım)**

App Store ana sayfasında görünecek tüm metni ve görseli hazırlayacağız.

#### 16.1 App Listing — Genel

1. App Store Connect > My Apps > **PureScan Foods**.
2. Sol menü > **iOS App** altında **1.0 Prepare for Submission**.

#### 16.2 Metin Alanları

Aşağıdaki alanları **her dil için** ayrı ayrı doldur (English, Turkish, Spanish — uygulama hangi dilleri destekliyorsa). Sol panelde **dil eklemek için** "Language" dropdown'ında **Add Language**.

| Alan | Limit | Açıklama |
|---|---|---|
| **Promotional Text** | 170 karakter | Sürüm öncesi de değiştirilebilen tek alan. Güncel kampanya/öne çıkan özellik. |
| **Description** | 4000 karakter | Uygulamanın ne yaptığı. Markdown desteklemez. |
| **Keywords** | 100 karakter (virgülle ayrılmış) | Arama optimizasyonu. Aralara boşluk koyma. |
| **Support URL** | URL | Zorunlu. Örn `https://purescan-foods.septimuslab.com/support/` |
| **Marketing URL** | URL | Opsiyonel. Uygulama landing sayfası. |
| **Privacy Policy URL** | URL | Zorunlu. `https://purescan-foods.septimuslab.com/privacy-policy/` |

🧭 **REHBER:** Bu metinleri yazmak istersen sana her dil için Description + Keywords + Promotional Text taslağı hazırlayabilirim. Söyle, vereyim. Veya zaten Play Store'da kullandığın metinleri varsa onları uyarlayabiliriz.

#### 16.3 Screenshots — Apple Zorunlu Boyutları

App Store **şu boyutta screenshot ister** (en az):

| Cihaz | Çözünürlük (pixel) | Zorunlu? |
|---|---|---|
| **6.7" Display (iPhone 15 Pro Max, 14 Pro Max, 13 Pro Max)** | 1290 x 2796 (portrait) | ✅ ZORUNLU |
| **6.5" Display (iPhone 11 Pro Max, XS Max)** | 1242 x 2688 veya 1284 x 2778 | ⚠️ Tercihen |
| **5.5" Display (iPhone 8 Plus)** | 1242 x 2208 | ❌ İsteğe bağlı (kabul ediliyor) |

**Pratik:** **Sadece 6.7" screenshot'ları yükle**, Apple bunları küçük cihazlar için otomatik scale eder.

**Adet:** Her dil için **3-10 adet** screenshot.

**Nasıl alacaksın:**
1. Xcode > Simulator > **iPhone 15 Pro Max** seç.
2. Build et (`⌘R`).
3. Simulator'de ekrana git, `⌘S` ile screenshot al — `~/Desktop`'a düşer, 1290x2796 boyutunda.
4. **Hangi ekranların screenshot'ını çekeceksin?**
   - Onboarding (varsa)
   - Ana scan ekranı (kamera açık, ürün taranır)
   - Sonuç ekranı (bir ürünün analizi)
   - Guru chat (AI nutrition advisor)
   - Encyclopedia (additives/NOVA/Nutri-Score)
   - Paywall (premium features)
   - History (taramalar geçmişi)

#### 16.4 App Preview Video (Opsiyonel)

15-30 saniye, app'in kullanımını gösteren video. Şimdilik atla, sürüm sonrası ekleyebiliriz.

#### 16.5 App Icon

App Store icon: **1024x1024 PNG**, alpha channel YOK. Mevcut uygulamada `assets/images/icon.png` var — eğer 1024x1024 ise direkt kullanılabilir.

Doğrulama:
```bash
sips -g pixelHeight -g pixelWidth /Users/ahmetdemiroglu/Desktop/PureScanFoods/assets/images/icon.png
```
🧭 **REHBER (BEN):** Bunu ben kontrol edebilirim. Söyle, kontrol edeyim. Eğer yanlış boyuttaysa ImageMagick ile yeniden boyutlandırırım.

📚 **Referans:** [App Store — Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/)

---

### Adım 17 — App Store Connect: App Review Information

`[~]` İÇERİK HAZIR (Claude yazdı, 2026-06-09) — Kullanıcı: demo hesap oluştur + iletişim bilgisi + aşağıdaki notları yapıştır.

**Nerede:** App Store Connect → PureScan Foods → "1.0 Prepare for Submission" sayfasının altında **"App Review Information"** bölümü.

#### 17.1 Sign-In Required + Demo Account

- **"Sign-in required?" toggle → HAYIR / kapalı.** Uygulama anonim çalışır; login opsiyoneldir (yalnızca cloud sync).
- **Demo account (önerilir):** Reviewer'ın login'li deneyimi görebilmesi için uygulamada bir **email/şifre hesabı** oluştur:
  1. Uygulama → Settings → giriş → **Register** → email: `review@septimuslab.com` (veya erişebildiğin bir email) + güçlü bir şifre.
  2. Bu email/şifreyi aşağıdaki notların sonundaki DEMO ACCOUNT satırına yaz.
- ⚠️ **Sandbox tester (`septimus.labb@gmail.com`) BURAYA YAZILMAZ** — o, Apple'ın IAP test hesabıdır, uygulama login hesabı değildir. Apple reviewer satın almayı kendi sandbox ortamında test eder; bizim sandbox tester'ımıza ihtiyaç duymaz.

#### 17.2 Notes (Review Notes) — TAM METİN, kopyala-yapıştır

```
Thank you for reviewing PureScan Foods.

PureScan analyzes the ingredients of packaged food. A product can be checked in three ways:
- Camera (OCR): photograph the ingredients label and the app reads the text.
- Barcode: scan a barcode or type it manually. Product data is retrieved from the OpenFoodFacts database, so a product that is not in that database may not be found.
- Text: type or paste an ingredients list manually.

The app then breaks the contents down into additives and E-codes, the NOVA processing level and the Nutri-Score. "Guru" is an AI assistant (processed server-side) that answers questions such as "what is E249?".

The camera and text methods work for any product. For a barcode example, 3017620422003 (Nutella) exists in OpenFoodFacts.

Additional notes:
- Sign in with Apple is offered as a primary login option alongside Google and email. Signing in is optional; a demo account is provided above.
- Premium is an auto-renewable subscription (monthly and yearly) and can be tested in the sandbox. The paywall includes Restore Purchases, Terms of Use and Privacy Policy links.
- Account and data deletion: Settings > Data Management (available to anonymous users as well).
- PureScan is not a medical device and does not provide medical advice; a disclaimer is shown on the analysis screens.
```

#### 17.3 Attachment — opsiyonel, **atla** (boş bırak).

#### 17.4 Contact Information
- **First Name / Last Name:** yasal adın (Ahmet Demiroglu).
- **Phone Number:** ulaşılabilir telefonun.
- **Email:** `info@septimuslab.com` (veya aktif kontrol ettiğin adres). Reviewer sorusu olursa buradan ulaşır; cevapsız kalırsa review uzar.

**Senden bekleyen 2 iş:**
1. Uygulamada **demo hesap** oluştur (email/şifre) ve notlardaki DEMO ACCOUNT satırına yaz.
2. **Contact Information**'ı doldur (ad + telefon + email).

---

### Adım 18 — App Store Connect: Pricing & Availability

`[ ]` 👤 **SEN**

1. Sol menüden **Pricing and Availability**.
2. **Price:** `Free` (uygulama free, premium subscription IAP üzerinden).
3. **Availability:**
   - **Available in all countries / regions** veya **belirli ülkeler** seç. Mevcut Android piyasası hangi ülkelerdeyse aynısını yapmanı öneririm.
   - 🧭 **REHBER:** Çin'de yayınlamak istiyorsan ekstra ICP filing gerekir. **Çin'i hariç tut** ilk başta. Başkaca special-handling ülkeler: Russia (sanctions etkili olabilir), North Korea (yasak), Iran, Syria (yasak).
4. **Save**.

📚 **Referans:** [App Store — Availability and pricing](https://developer.apple.com/help/app-store-connect/set-app-availability/set-app-availability)

---

### Adım 19 — TestFlight Archive ve Upload

`[ ]` 👤 **SEN (Xcode)** + 🧭 **REHBER**

Şimdi App Store'a binary'yi göndereceğiz. **TestFlight** = Apple'ın beta dağıtım platformu. Önce TestFlight internal test'e yükleyeceğiz, sonra release submission.

#### 19.1 Release Configuration'a Geç

1. Xcode > üst toolbar > destination dropdown > **"Any iOS Device (arm64)"** seç (fiziksel cihaz değil).
2. Xcode menüsü > **Product** > **Scheme** > **Edit Scheme**.
3. Sol panelde **Run** seç > **Build Configuration: Release** (test için Debug ama archive için zaten Release otomatik).
4. **Close**.

#### 19.2 Archive

1. Xcode menüsü > **Product** > **Archive**.
2. 5-15 dakika sürebilir. Sonunda **Organizer** penceresi açılır.
3. Hata olursa (örn missing entitlement) — bana paste et.

#### 19.3 Distribute App

1. Organizer'da az önce yapılan archive'ı seç (en üstte).
2. Sağda **"Distribute App"** butonu.
3. Method: **"App Store Connect"** > **Next**.
4. Destination: **"Upload"** > **Next**.
5. Options:
   - ✅ **Upload your app's symbols** (crash log için)
   - ✅ **Manage Version and Build Number** (Apple otomatik build number artırsın)
6. Re-sign: **"Automatically manage signing"** > **Next**.
7. Review penceresi > **Upload**.
8. 5-15 dakika upload süresi.
9. Başarılı olunca "Upload Successful" mesajı.

#### 19.4 App Store Connect'te Build'i Bekle

1. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) > My Apps > **PureScan Foods** > **TestFlight** sekmesi.
2. "Processing" durumunda görünür (10-60 dakika).
3. Processing bitince **Yellow Yield ikonu (Export Compliance)**:
   - Export Compliance Information sorusuna **No** (uygulama standart HTTPS dışında encryption kullanmıyor) cevap ver, **Save**.
4. Build artık "Ready to Submit" oldu.

#### 19.5 Internal Testing'e Ekle

1. **TestFlight** > sol menüden **Internal Testing** > **+** ile bir Internal Test Group yarat.
2. Gruba kendini ve test edecek kişileri ekle (Apple ID email'leri ile).
3. Build'i bu gruba ata.
4. Test edenler iPhone'da **TestFlight uygulamasını** App Store'dan indirip davetiye linkiyle uygulamayı yükler.

📚 **Referans:** [TestFlight overview](https://developer.apple.com/testflight/)

---

### Adım 20 — TestFlight'ta Tam Test (Sandbox Subscription Dahil)

`[ ]` 👤 **SEN**

iPhone'da TestFlight üzerinden uygulamayı yükle ve **Adım 15'teki tüm test listesini** baştan tekrar et. **Bu sefer release build'i** test ediyorsun, dev build'i değil. Farklar:

- AdMob production ad unit'lerini gerçekten çağırır (sandbox key olduğu sürece test ads döner ama prod env'de gerçek istek atar).
- StoreKit sandbox satın alma çalışır:
  1. iPhone Settings > App Store > Sandbox Account > sandbox tester ile giriş.
  2. Uygulamayı aç, Paywall'a git.
  3. Subscription satın alma butonuna bas.
  4. Apple sandbox passcode/Face ID isteyebilir → sandbox şifre ver.
  5. "Subscription confirmed" mesajı, premium aktif olmalı.
  6. Settings > Manage Subscription → Apple subscriptions sayfası açılır.
  7. Restore Purchases → premium restore edilmeli.
- ATT izin dialogu **release**'te de bir kez çıkar (cold start).

**Bana ne ileteceksin:** Tüm test listesinin ✅/❌ durumu. ❌ varsa o release blocker.

---

### Adım 21 — Final Sanity Check: Submission Öncesi Liste

`[ ]` 🤝 **BİRLİKTE**

Submission'dan önce her şeyi tek tek doğrulayacağız. Aşağıdakilerden HEPSİ ✅ olmalı:

#### Apple Developer
`[ ]` App ID `com.purescan.foods` mevcut.
`[ ]` Sign In with Apple capability App ID'de aktif.
`[ ]` Sign In with Apple .p8 private key indirildi.
`[ ]` Service ID `com.purescan.foods.signin` yaratıldı ve Firebase callback'i bağlandı.

#### Firebase Console
`[ ]` Authentication > Sign-in method > Apple provider **Enabled**.
`[ ]` Team ID, Key ID, .p8 içeriği, Services ID girildi.
`[ ]` Authentication > Users'da test Apple login user'ı oluştu (en az bir tane).

#### App Store Connect
`[ ]` App kaydı oluşturuldu (`com.purescan.foods`).
`[ ]` App Information dolduruldu (kategori, age rating, content rights).
`[ ]` App Privacy questionnaire tamamlandı (tüm data type'lar işaretli).
`[ ]` Subscription Group + 2 ürün (`purescan_premium_monthly`, `purescan_premium_yearly`) yaratıldı, fiyatlar girildi, lokalizasyon ve review screenshot var.
`[ ]` Shared Secret ve IAP API Key (Issuer ID, Key ID, .p8) yaratıldı.
`[ ]` Sandbox tester yaratıldı.
`[ ]` Pricing: Free.
`[ ]` Availability: hedef ülkeler seçildi.
`[ ]` Screenshots (6.7" iPhone): 3+ adet, her dil için.
`[ ]` App icon 1024x1024 PNG (no alpha).
`[ ]` Description, Keywords, Promotional Text dolduruldu (her dil için).
`[ ]` Support URL, Privacy Policy URL, Marketing URL (varsa).
`[ ]` App Review Information: notes, demo account, contact.

#### RevenueCat
`[ ]` iOS App kaydedildi (`com.purescan.foods`).
`[ ]` Shared Secret + IAP Key girildi.
`[ ]` `premium` entitlement iOS ürünlerine bağlandı.
`[ ]` Offering iOS ürünlerini içeriyor.
`[ ]` Public iOS API Key alındı (`appl_xxx...`).

#### AdMob
`[ ]` iOS App kaydedildi.
`[ ]` Interstitial ad unit yaratıldı.
`[ ]` Rewarded ad unit yaratıldı.

#### .env (Proje Root)
`[ ]` `EXPO_PUBLIC_REVENUECAT_APPLE_KEY` dolu.
`[ ]` `EXPO_PUBLIC_ADMOB_IOS_APP_ID` dolu ve Info.plist'e yansımış (Xcode build sonrası `Info.plist` içinde `GADApplicationIdentifier` doğru olmalı).
`[ ]` `EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID` dolu.
`[ ]` `EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID` dolu.

#### Xcode
`[ ]` Sign In with Apple capability eklendi (Signing & Capabilities'te görünür).
`[ ]` `PureScanFoods.entitlements` dosyası `com.apple.developer.applesignin` içeriyor.
`[ ]` Devices = iPhone (iPad yok).
`[ ]` Version 1.0.0, Build 1 (veya artırılmış).
`[ ]` Bundle ID `com.purescan.foods`.
`[ ]` Automatically manage signing aktif.

#### Cihaz Testleri (Release/TestFlight Build'i)
`[ ]` ATT dialogu çıkıyor.
`[ ]` Apple Sign-In end-to-end çalışıyor (login + logout + tekrar login).
`[ ]` StoreKit sandbox satın alma + restore + Manage Subscription çalışıyor.
`[ ]` AdMob iOS production ID ile reklam istiyor (loglarda görünür).
`[ ]` Hesap silme: Apple/Google/email/anonim tüm türlerde Firestore + Storage + AsyncStorage + device_limits temizlendi.
`[ ]` Kamera + galeri izin akışı (ilk istek + ret + Settings yönlendirme).
`[ ]` Dar ekran (iPhone SE simülatörü) + light/dark + TR/EN/ES regression.

#### Privacy Policy + Terms Sayfaları
`[ ]` Privacy Policy URL canlı, gerçek veri envanteri içeriyor.
`[ ]` Terms of Use URL canlı, auto-renewable subscription standart metnini içeriyor.

---

### Adım 22 — App Store Submission (For Review)

`[x]` ✅ TAMAMLANDI (2026-06-09 20:41) — Submit edildi, **"Waiting for Review"**. Submission ID `fe8a7362-8952-418f-83f4-f6912572259f`. Build 1.0(1) + 2 abonelik + tüm metadata dahil. IDFA: Serve ads + ATT uyum onaylandı.

Her şey ✅ ise, submission!

1. App Store Connect > My Apps > **PureScan Foods** > **iOS App** > **1.0 Prepare for Submission**.
2. **Build** bölümünde "Select a build" — Adım 19'da yüklediğin build'i seç.
3. Sayfanın en altında **"Save"** > **"Add for Review"** veya **"Submit for Review"** butonu.
4. Çıkan modal:
   - **Export Compliance:** No (Adım 19.4'te zaten cevapladık).
   - **Content Rights:** Onayla.
   - **Advertising Identifier (IDFA):** **YES** (AdMob kullanıyoruz).
     - Aşağıdaki seçeneklerden işaretle:
       - ✅ Serve advertisements within the app
       - ✅ Attribute this app installation to a previously served advertisement (eğer Apple Search Ads veya benzeri attribution kullanıyorsan; AdMob için genelde işaretli)
       - ✅ Attribute an action taken within this app to a previously served advertisement (aynı)
       - ✅ I, [name], confirm that this app, and any third-party SDKs included, use the Advertising Identifier in the ways indicated above and I will limit my use of the IDFA to these purposes.
5. **Submit**.

#### Review Süresi

- Apple ortalama **24-48 saat** içinde dönüş yapar (bazen 1 hafta).
- Status: `Waiting for Review` → `In Review` → `Pending Developer Release` veya `Rejected`.

---

### Adım 23 — Olası Reject Senaryoları ve Hızlı Yanıt

`[ ]` 🧭 **REHBER**

**Yaygın reject sebepleri (PureScan Foods için olası):**

1. **Guideline 4.8 — Sign in with Apple eksik veya bozuk**
   - Çözüm: Adım 14'ü doğrula, kod tarafında AuthModal'da iOS'ta görünüyor mu kontrol et.

2. **Guideline 5.1.1 — Data Use & Sharing (Privacy)**
   - Çözüm: App Privacy questionnaire'ı yeniden gözden geçir; AdMob/Firebase veri toplama tipleri eksiksiz mi?

3. **Guideline 5.1.1(v) — Account Deletion**
   - Çözüm: Apple "in-app account deletion" arıyor. Settings > Delete Account akışı var — reviewer'a paste ettiğimiz notlarda bunu vurgula.

4. **Guideline 3.1.2 — Subscription Disclosure**
   - Çözüm: Paywall'da auto-renewable standart metni + Terms + Privacy + Restore butonları görünür olmalı. Kod tarafı ✅, ama screenshots ve description'da da bu vurgulanmalı.

5. **Guideline 5.1.5 — Location Services / Health Data**
   - Sıfır risk (location yok, Health framework yok).

6. **Guideline 1.4.1 — Safety: Medical Claims**
   - Çözüm: Description'da "diagnosis", "treatment", "cure" kelimeleri YOK olmalı. Disclaimer her ekranda görünür.

7. **Guideline 2.3.10 — Accurate Metadata**
   - Çözüm: Screenshots gerçek uygulamadan, mock değil. Description gerçek özellikleri açıklıyor.

8. **Guideline 4.0 — Design — UI**
   - Çözüm: Çıkmaz ekran, kapatma butonu olmayan modal yok (Adım 15 test).

**Reject Olursa:**
1. Mail/portal'da reject sebebi metni gelir.
2. Bana **olduğu gibi** paste et.
3. Ben uygun düzeltmeyi planlarım, sen App Store Connect > Resolution Center'da Apple'a yanıt yazarsın veya yeni build atarız.

📚 **Referans:** [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

### Adım 24 — Approval Sonrası: Release

`[x]` ✅ TAMAMLANDI (2026-06-16) — Build 1.0(2) onaylandı, otomatik release ile App Store'da **canlı**. Link: https://apps.apple.com/app/id6778348937 (Apple ID 6778348937). Landing sayfası linkleri güncellendi.

1. Approval gelir → status `Pending Developer Release` (manuel release seçtiysek) veya direkt `Ready for Sale`.
2. **Pending Developer Release**: App Store Connect'te app sayfasında **"Release This Version"** butonuna bas.
3. 1-24 saat içinde App Store'da görünür. Arama indeksine girmesi ayrıca birkaç saat–48 saat sürebilir (direkt link hemen çalışır).

---

### Adım 25 — Gelecek Güncellemeler (Versiyon Çıkarma)

`[ ]` 👤 **SEN + 🤖 CLAUDE** (kod tarafını Claude yapar, panel/Xcode'u sen)

Her yeni güncellemede izlenecek akış (ilk kurulumun aksine kısa — ATT/IAP/metadata/privacy zaten kurulu):

1. **🤖 Kod:** Değişiklikleri yap, `tsc` temiz olsun.
2. **🤖 Sürüm numaraları (ikisi birden):**
   - `ios/PureScanFoods/Info.plist` → `CFBundleShortVersionString` (örn. 1.0 → **1.0.1**) ve `CFBundleVersion` (build, örn. 2 → **3**).
   - `ios/PureScanFoods.xcodeproj/project.pbxproj` → `MARKETING_VERSION` (= 1.0.1) ve `CURRENT_PROJECT_VERSION` (= 3), her iki config'de.
   - Kural: **MARKETING_VERSION = ASC'deki version**, **CURRENT_PROJECT_VERSION = build**, her yeni upload'ta build numarası bir öncekinden büyük olmalı.
3. **👤 Xcode:** Product → Archive → Distribute App → App Store Connect → Upload. (Xcode Cloud'u değil, menü çubuğundan Archive.)
4. **👤 ASC:** App sayfası → sol üstte version dropdown yanı → **"+ Version or Platform"** → yeni version numarasını (1.0.1) gir.
5. **👤 ASC:** Yeni version sayfasında **"What's New in This Version"** (zorunlu, her dil için kısa değişiklik notu) + Build bölümünden yeni build'i (1.0.1 (3)) seç.
6. **👤 ASC:** Screenshots/description değişmeyecekse aynı kalır. Değişecekse güncelle.
7. **👤 ASC:** **Add for Review** → submit. (IDFA modalı yine çıkar: Serve ads ✓ + ATT ✓.)
8. Güncelleme review'ları genelde ilk review'dan hızlıdır.

> Not: Sadece metadata/screenshot/açıklama değişikliği için yeni build gerekmez — version açıp metni değiştir, submit et. Kod değişikliği varsa yeni build şart.

---

## 4. Apple Policies — Hızlı Referans (Bilmediğin İçin)

Bu uygulamayı ilgilendiren ana kurallar:

### App Review Guidelines (en çok karşılaşacağın)

- **1.4.1 Safety > Medical Claims** — Tanı/tedavi iddiası yok, disclaimer her ekranda.
- **2.3 Accurate Metadata** — Screenshots gerçek; description gerçeği yansıtır.
- **3.1.1 In-App Purchase** — Premium içeriği subscription dışında satın aldırmıyoruz (Stripe yok, sadece App Store IAP).
- **3.1.2 Auto-Renewable Subscriptions** — Standart metni, restore, manage, terms/privacy.
- **4.0 Design** — Çıkmaz ekran yok, tüm modal'lar kapanabilir.
- **4.8 Login Services** — Google Sign-In var → Sign in with Apple zorunlu (kod tarafı ✅).
- **5.1.1 Privacy** — Privacy Policy + App Privacy questionnaire + data deletion.
- **5.1.2 Data Use & Sharing** — Üçüncü taraf SDK'lar (AdMob, Firebase) privacy policy'de açıklanmış.
- **5.1.5 Location Services** — Yok, sıfır risk.
- **App Tracking Transparency** — ATT dialogu (kod tarafı ✅).

📚 **Tüm guidelines:** https://developer.apple.com/app-store/review/guidelines/

### Apple Human Interface Guidelines (HIG)

- Touch target minimum **44x44 pt** (kod tarafı ✅).
- Safe area kullan (kod tarafı ✅).
- System fonts ve native gestures.

### Privacy

- App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- AdMob data collection: https://developers.google.com/admob/ios/privacy/data-collection
- Firebase data collection: https://firebase.google.com/support/privacy

---

## 5. Acil Durum: Build Submission'dan Sonra Kritik Bug Bulursam?

1. App Store Connect > **TestFlight** > Build'i **expire** et veya **Submit'i geri çek** (mümkünse).
2. Bug'ı düzelt.
3. `Build` numarasını artır (1 → 2).
4. Yeni archive + upload.
5. Submission'ı güncelle.

---

## 6. Versiyon 1.0.0 Sonrası — Sonraki Adımlar (Bu Playbook'un Kapsamı Dışı)

- App analytics (App Store Connect > Analytics)
- Crash log inceleme (Xcode > Organizer > Crashes)
- Yeni özellik ekleme: yeni version (1.1.0, 1.2.0...)
- Subscription pricing güncellemeleri (App Store Connect > IAP > Edit)
- ASO (App Store Optimization) — keyword/description iyileştirme

---

## 7. İletişim — Eğer Tıkanırsan

Bana şunları söyle, her zaman:
- Hangi adımdayım
- Hata mesajı/ekran görüntüsü (paste edebileceğin formatta)
- App Store Connect veya Apple Developer'da gördüğün uyarı

Ben sana o adıma özel daha detaylı talimatla döneceğim. Bu dosya **kanonik kaynak**; her tamamladığımız adımda checkbox'ı işaretleyeceğiz.

---

## 8. Resmi Referans Linkleri (Hepsi)

- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Sign in with Apple Configuration: https://developer.apple.com/documentation/sign_in_with_apple/configuring_your_environment_for_sign_in_with_apple
- Firebase Apple Sign-In iOS: https://firebase.google.com/docs/auth/ios/apple
- App Store Connect Help: https://developer.apple.com/help/app-store-connect/
- App Store Screenshot Specifications: https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/
- TestFlight: https://developer.apple.com/testflight/
- App Tracking Transparency: https://developer.apple.com/documentation/apptrackingtransparency
- Offering Account Deletion: https://developer.apple.com/support/offering-account-deletion-in-your-app/
- AdMob iOS Quick Start: https://developers.google.com/admob/ios/quick-start
- AdMob Data Collection: https://developers.google.com/admob/ios/privacy/data-collection
- RevenueCat iOS Quickstart: https://www.revenuecat.com/docs/getting-started/quickstart
- RevenueCat App Store Connect API: https://www.revenuecat.com/docs/projects/app-store-connect-api
- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/

---

## ✅ Şu An Nerden Başlıyoruz?

**Adım 1: Apple Developer — App ID Oluştur ve Capabilities Ekle**.

Hazır mısın? Apple Developer hesabına giriş yap ve **"Adım 1'i başlatıyorum"** de. Tıkandığında bana yaz.
