# Product Requirements Document: Sui Etkileşimli Varlık Kiralama Pazarı

**Sürüm:** 1.0 (Hackathon Sürümü)
**Tarih:** 25.10.2025

---

### 1. Giriş ve Amaç

**Proje Adı:** SuiRent  (Sui Interactive Asset Rental Marketplace)

**Amaç:** Sui blockchain üzerinde, kullanıcıların dijital varlıkları (NFT'ler, oyun içi eşyalar vb.) kalıcı olarak satın almak yerine belirli bir süreliğine kiralamasına olanak tanıyan merkeziyetsiz bir platform oluşturmak.

**Problem:** Değerli dijital varlıklar yüksek maliyetli olabilir ve kullanıcılar bu varlıklara sadece geçici bir süre için ihtiyaç duyabilir. Mevcut pazar yerleri genellikle sadece alım-satım üzerine odaklanmıştır ve esnek kiralama çözümleri sunmamaktadır.

**Çözüm:** Varlık sahiplerinin atıl duran varlıklarından pasif gelir elde etmelerini, kiracıların ise düşük bir maliyetle ihtiyaç duydukları varlıklara geçici olarak erişmelerini sağlayan güvenli ve verimli bir kiralama modeli sunmak. Bu model, Sui'nin object-centric yapısı sayesinde güvenli ve programlanabilir bir şekilde hayata geçirilecektir.

### 2. Hedef Kitle

*   **Varlık Sahipleri (Asset Owners):** Ellerindeki oyun NFT'lerini, dijital sanat eserlerini veya diğer Sui varlıklarını değerlendirerek pasif gelir elde etmek isteyen kullanıcılar.
*   **Varlık Kiracıları (Asset Renters):** Bir oyunda belirli bir görevi geçmek, bir projeyi tamamlamak veya bir etkinliğe katılmak için belirli bir varlığa geçici olarak ihtiyaç duyan ve yüksek satın alma maliyetinden kaçınmak isteyen kullanıcılar.

### 3. Temel Özellikler ve Kullanıcı Hikayeleri

#### Genel Özellikler
*   **Kullanıcı Hikayesi:** Bir kullanıcı olarak, Sui cüzdanımı (`@mysten/dapp-kit` destekli) kullanarak platforma kolayca bağlanabilmek istiyorum, böylece kimliğimi doğrulayabilir ve işlemlerimi güvenle yapabilirim.

#### Varlık Sahibi (Owner) İçin Özellikler
*   **Kullanıcı Hikayesi:** Bir varlık sahibi olarak, cüzdanımdaki kiralanabilir varlıkları platform üzerindeki "Varlıklarım" sayfasında görüntüleyebilmek istiyorum, böylece hangilerini kiraya vereceğime karar verebilirim.
*   **Kullanıcı Hikayesi:** Bir varlık sahibi olarak, seçtiğim bir varlığı günlük kiralama bedelini (SUI cinsinden) belirterek pazar yerinde listeleyebilmek istiyorum, böylece potansiyel kiracılar varlığımı keşfedebilir.
*   **Kullanıcı Hikayesi:** Bir varlık sahibi olarak, kiraya verdiğim varlıkların durumunu (kirada olup olmadığı, kiralama süresinin ne zaman biteceği) takip edebilmek istiyorum, böylece varlıklarımın kontrolünü kaybetmem.
*   **Kullanıcı Hikayesi:** Bir varlık sahibi olarak, kiralama süresi dolan veya hiç kiralanmamış varlığımı pazar yerinden geri çekebilmek istiyorum, böylece varlığımın sahipliğini tekrar tamamen geri alabilirim.

#### Varlık Kiracısı (Renter) İçin Özellikler
*   **Kullanıcı Hikayesi:** Bir kiracı olarak, pazar yerinde ("Marketplace") kiralanabilir durumdaki tüm varlıkları arayabilmek ve görüntüleyebilmek istiyorum, böylece ihtiyacıma uygun varlığı kolayca bulabilirim.
*   **Kullanıcı Hikayesi:** Bir kiracı olarak, bir varlığın detaylarını (görseli, özellikleri, günlük kiralama bedeli) görebilmek istiyorum, böylece kiralama kararı vermeden önce bilgi sahibi olabilirim.
*   **Kullanıcı Hikayesi:** Bir kiracı olarak, kiralamak istediğim süreyi (gün olarak) seçip toplam maliyeti görerek kiralama işlemini cüzdanımla onaylayabilmek istiyorum, böylece varlığı belirtilen süre boyunca kullanmaya başlayabilirim.
*   **Kullanıcı Hikayesi:** Bir kiracı olarak, "Kiraladıklarım" sayfasında kiraladığım varlıkları ve kalan kiralama sürelerini görüntüleyebilmek istiyorum, böylece ne kadar daha kullanım hakkım olduğunu bilirim.

### 4. Teknik Gereksinimler

*   **Blockchain:** Sui Ağı (Hackathon için Testnet veya Devnet)
*   **Akıllı Kontrat Dili:** Sui Move
*   **Frontend Framework:** React / Next.js (TypeScript ile)
*   **Sui Entegrasyonu:** `@mysten/dapp-kit` (Cüzdan bağlantısı ve UI için), `@mysten/sui.js` (RPC çağrıları ve transaction oluşturma için)
*   **Temel Move Mimarisi:**
    *   **`asset` modülü:** Kiralanabilir varlıkları temsil eden `Asset` objesini tanımlar.
    *   **`marketplace` modülü:**
        *   `Marketplace`: Listelenen varlıkları tutan bir `Shared Object`.
        *   `Listing`: Bir varlığın kiralama bilgilerini (fiyat, sahip, kiralama durumu) içeren ve `Marketplace` objesinin dinamik alanlarında (dynamic fields) tutulan bir obje.
        *   `RentalReceipt`: Kiralama gerçekleştiğinde kiracıya verilen ve kiralama süresini kanıtlayan geçici bir obje/yetki. Bu obje, süresi dolduğunda varlığın sahibine iadesini tetiklemek için kullanılabilir.

### 5. Kullanıcı Akışı (User Flow)

1.  **Cüzdan Bağlama:** Kullanıcı siteye girer ve "Connect Wallet" butonuna tıklar. Desteklenen cüzdanlardan birini seçerek platforma bağlanır.
2.  **Pazar Yerini Görüntüleme:** Ana sayfada (`/marketplace`) kiralanabilir durumdaki tüm varlıklar kartlar halinde listelenir.
3.  **Varlık Kiralama Akışı:**
    *   Kiracı bir varlığa tıklar, varlığın detay sayfasına gider.
    *   Kiralama süresini (örn: 3 gün) girer. Toplam ücret otomatik olarak hesaplanır.
    *   "Rent Now" butonuna tıklar. Cüzdan onayı penceresi açılır.
    *   İşlemi onaylar. Başarılı işlem sonrası varlık, kiracının "Kiraladıklarım" bölümünde görünür ve cüzdanında (veya ilgili obje içinde) belirir.
4.  **Varlık Listeleme Akışı:**
    *   Varlık sahibi "Varlıklarım" (`/my-assets`) sayfasına gider.
    *   Listelemek istediği varlığın yanındaki "List for Rent" butonuna tıklar.
    *   Açılan pencerede günlük kiralama fiyatını girer ve onaylar.
    *   Cüzdan onayı sonrası varlık, pazar yerinde listelenmeye başlar ve "Varlıklarım" sayfasından "Listelediklerim" bölümüne geçer.
5.  **Varlığı Geri Çekme Akışı:**
    *   Varlık sahibi, "Listelediklerim" sayfasında kirada olmayan veya kiralama süresi biten varlığını görür.
    *   "Claim Back" butonuna tıklar ve cüzdanıyla onaylar.
    *   Varlık, pazar yerinden çekilerek sahibinin "Varlıklarım" bölümüne geri döner.

### 6. Hackathon Kapsamı Dışındakiler (Future Scope)

*   Gelişmiş filtreleme ve sıralama (fiyata göre, popülerliğe göre, en yeni vb.).
*   Kullanıcı profilleri ve kiralama geçmişine dayalı puanlama/yorum sistemi.
*   Kullanım sırasında özellikleri değişen dinamik varlıklar (örn: kullanılan bir kılıcın dayanıklılığının azalması).
*   Gelir paylaşımı modeli (bir varlığın birden çok sahibi olması durumu).
*   Sigorta/depozito mekanizması.
