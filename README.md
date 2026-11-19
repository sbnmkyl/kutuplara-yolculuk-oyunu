# Kutup Bayrak Kaşifi

**Oyna:** https://sbnmkyl.github.io/kutuplara-yolculuk-oyunu/

Penguen kaşifinle dört bölümlük bir kutup seferine çıktığın 3B eğitim oyunu.
Her bölüm bir derse karşılık gelir; bölümde 5 bilgi bayrağı (5 soru) ve bölüm
sonunda bir eşleştirme ya da sıralama görevi vardır. Dört bölüm bitince kişisel
"Kutup Elçisi" sertifikası açılır.

## Bölümler

| Bölüm | Ders | Sorular | Oynanış | Son görev |
| --- | --- | --- | --- | --- |
| 1. Öncülerin İzinde | Öncü bilim insanları | q01, q03, q04, q05, q13 | Buz gölünde kayma, çatlakların üzerinden zıplama | Eşleştirme: kim, hangi adımı attı? |
| 2. Kurumlar Kuruluyor | Kurumların gelişimi | q06, q10, q09, q12, q20 | Kartopu yollarından geçme; her doğru cevapta üssün bir parçası kurulur | Sıralama: zaman çizelgesi |
| 3. Bilim Seferi | Ulusal bilim seferleri | q07, q11, q14, q18, q17 | Yüzen buzların üstünden kanal geçişi (Horseshoe Adası) | Eşleştirme: uzman ve işi |
| 4. Kutuplar ve Gelecek | Araştırmaların önemi | q02, q15, q16, q08, q19 | Çatlayıp batan deniz buzu (Arktik) | Sıralama: bir araştırmanın adımları |

Yıldızlar yalnızca hata sayısına bağlıdır (yanlış cevaplar + son görevdeki hatalar):
en fazla 1 hata 3 yıldız, en fazla 3 hata 2 yıldız. Süre yıldızı etkilemez, yalnızca
puana küçük bir katkı yapar. Süre dolunca oyun bitmez; her öğrenci bölümü tamamlar.

## Çalıştırma

- **En kolayı:** `index.html` dosyasına çift tıklayın. Oyun artık sunucu gerektirmez;
  modeller ve yazı tipleri dosyaların içine gömülüdür, internet de gerekmez.
- `OYUNU_BASLAT.bat` eskisi gibi yerel sunucuyla da açar (Python 3 gerekir).
- İnternette: https://sbnmkyl.github.io/kutuplara-yolculuk-oyunu/ (GitHub Pages, `main` dalının kökünden yayımlanır).

## Kontroller

| Eylem | Klavye | Dokunmatik |
| --- | --- | --- |
| Yürü | W A S D veya yön tuşları | Soldaki kol |
| Zıpla | Boşluk | "Zıpla" düğmesi |
| Soruyu yanıtla | 1–4 veya A–D, fare | Dokunma |
| Hedefin yönünü dinle | K | Pusulaya dokunma |

## İçeriği düzenleme

- **Sorular:** `questions.js`. Biçim eskisiyle aynıdır; hiçbir soru değiştirilmedi.
- **Bölümler:** `levels.js`. Bölüm adları, rehber konuşmaları, hangi sorunun hangi
  bölümde çıkacağı (`questions` listesi), tabela yazıları ve bölüm sonu görevleri
  (`finale.game`) buradadır. Tırnak içindeki metinleri değiştirmek yeterlidir.
- Bölüm sonu görevlerindeki bilgiler (kişi eşleştirmeleri, 1995–2023 zaman çizelgesi,
  uzman–iş eşleştirmesi) sizin zaman çizelgenize göre gözden geçirilmelidir.

## Sınıfta kullanım

- Bölümler sırayla açılır. Dersin bölümüne doğrudan girmek için Sefer Haritası'nın
  altındaki **"Öğretmen: tüm bölümleri aç"** bağlantısını kullanın.
- İlerleme yalnızca o bilgisayarın tarayıcısında, tek oyuncu için saklanır. Açılışta
  farklı bir ad yazılırsa sefer baştan başlar. Hiçbir veri dışarı gönderilmez.
- Ses varsayılan olarak kapalıdır; sağ üstteki hoparlör düğmesiyle açılır.

## Dosyalar

```
index.html        Sayfa ve arayüz iskeleti
styles.css        Görünüm
fonts.css         Gömülü yazı tipleri (Baloo 2, Nunito)
questions.js      20 soru
levels.js         Bölüm içerikleri ve sahne yerleşimi
js/util.js        Yardımcılar, kayıt, ses
js/art.js         Dokular, modeller, sahne parçaları, Türk bayrağı çizimi
js/world.js       Arazi, su, bölüm kurulumu, parçacıklar
js/ui.js          Ekranlar, soru paneli, mini oyunlar, sertifika
js/game.js        Oyun akışı, oyuncu kontrolü, kamera
assets/models.js  Meshy modellerinin oyun için hafifletilmiş sürümleri
assets/*.webp     Karakter görselleri
vendor/           three.js r128
araclar/          Yeni Meshy modeli eklemek için dönüştürme betikleri ve hafif GLB'ler
```

Türk bayrağı oyunun her yerinde (3B bayraklar, gösterge, soru paneli, sertifika)
yasal ölçülerle çizilir: en G, boy 1,5 G; ay ve yıldız 2893 sayılı Kanun'daki
oranlarla. Çizim tek yerde, `js/art.js` içindeki `drawFlag` işlevindedir.

## Modeller

Üç Meshy modeli (bayraklı penguen, bereli penguen, kutup ayısı) toplam 29 MB'tan
1,2 MB'a indirildi: üçgen sayısı ~10 bine düşürüldü, dokular küçültüldü. Yeni bir
model eklemek için `araclar/` klasöründeki betikleri kullanın (Node.js gerekir):

```
cd araclar
npm install @gltf-transform/core @gltf-transform/functions meshoptimizer sharp
node optimize.mjs  yeni-model.glb  hafif/penguin-cute.glb  0.05  1024  84
node export_models.mjs      # hafif/ içindeki üç modelden assets/models.js üretir
```

## Lisanslar

- three.js r128: MIT (`vendor/THREE-LICENSE.txt`)
- Baloo 2 ve Nunito yazı tipleri: SIL Open Font License 1.1
