/*
 * Kutup Bayrak Kaşifi — bölüm içerikleri
 *
 * Bu dosya oyunun "senaryosudur": bölüm adları, anlatım metinleri, hangi sorunun
 * hangi bölümde çıkacağı, bölüm sonu mini oyunları ve sahne yerleşimi burada durur.
 * Metinleri değiştirmek için programlama bilmek gerekmez; tırnak içindeki yazıları
 * düzenlemek yeterlidir. Sorular questions.js dosyasındadır.
 *
 * Koordinatlar: x = doğu-batı (−31 … 31), z = kuzey-güney (60 güney/başlangıç … −82 kuzey/bitiş).
 */
(function () {
  "use strict";
  const KBK = (window.KBK = window.KBK || {});

  /* Karakterler */
  KBK.cast = {
    flag: { name: "Ay", model: "flag", avatar: "assets/avatar-penguin-flag.webp", blurb: "Bayrağını hiç bırakmayan imparator penguen yavrusu" },
    cute: { name: "Yıldız", model: "cute", avatar: "assets/avatar-penguin-cute.webp", blurb: "Kırmızı bereli, meraklı ve hızlı kaşif" },
    bear: { name: "Ayaz", model: "bear", avatar: "assets/avatar-polar-bear.webp", blurb: "Arktik'in güler yüzlü kutup ayısı" }
  };

  /* Yıldız kuralı: bölümdeki toplam hata sayısına göre (yanlış cevaplar + mini oyun hataları) */
  KBK.starRule = { three: 1, two: 3 };

  KBK.levels = [
    /* ───────────────────────── 1. BÖLÜM ───────────────────────── */
    {
      id: 1,
      title: "Öncülerin İzinde",
      lesson: "1. ders · Öncü bilim insanları",
      place: "Antarktika · Anı Parkuru",
      theme: "dawn",
      rim: "cliff",
      mechanic: "Buz gölü ve çatlaklar",
      brief: "Türkiye'nin kutup yolculuğu cesur öncülerle başladı. 1960'larda Antarktika'da çalışan bilim insanlarının ve kıtaya yelken açan denizcilerin izini sür.",
      goals: [
        "5 bilgi bayrağını bul, soruları yanıtla",
        "Buz çatlaklarının üzerinden zıpla",
        "Sefer Defteri'ne ulaş ve kişileri eşleştir"
      ],
      questions: ["q01", "q03", "q04", "q05", "q13"],
      spawn: [0, 54],
      terrain: {
        seed: 11,
        hills: [[13, -36, 9, 4.2], [-25, 30, 7, 2.6], [25, 45, 6, 2.2], [-23, -40, 7, 2.4]],
        flats: [[1, 22, 13, 8.5, -0.28], [-13, -63, 7.5, 6, -0.28]],
        tracks: [],
        pools: [[21, -81, 13, 7]],
        bands: [[-36, -5, 36, -7, 1.2, 0.5], [-36, -51, 36, -49, 1.2, 0.5]]
      },
      ice: [[1, 22, 12.4, 8], [-13, -63, 7, 5.5]],
      flags: [
        { x: -9, z: 40 },
        { x: 15, z: 9 },
        { x: -15, z: -22 },
        { x: 13, z: -36 },
        { x: 9, z: -66 }
      ],
      props: [
        { type: "hut", x: 22, z: 7, rot: -0.5 },
        { type: "sign", x: 18.5, z: 12.5, text: "Plato İstasyonu", sub: "Atok Karaali · 1960'lar" },
        { type: "rocks", x: -23, z: -24, s: 1.5 },
        { type: "rocks", x: -19.5, z: -27.5, s: 1.0 },
        { type: "sign", x: -19, z: -19.5, text: "Karaali Kayalıkları", sub: "Antarktika'da ilk Türk adı" },
        { type: "sign", x: 8, z: -30.5, text: "İnan Tepesi", sub: "Ümran İnan'ın anısına" },
        { type: "sailboat", x: 21, z: -80, rot: 0.5 },
        { type: "sign", x: 14.5, z: -70.5, text: "Uzaklar II", sub: "Antarktika'ya ulaşan yelkenli" },
        { type: "tent", x: -24, z: 50, color: 0xf2a23a, rot: 0.6 },
        { type: "crates", x: -19, z: 53 },
        { type: "marker", x: -4, z: 46 }, { type: "marker", x: -5, z: 33 }, { type: "marker", x: 9, z: 14 },
        { type: "marker", x: 3, z: 0 }, { type: "marker", x: -8, z: -14 }, { type: "marker", x: 2, z: -27 },
        { type: "marker", x: 3, z: -45 }, { type: "marker", x: -3, z: -57 },
        { type: "ice", x: -27, z: 10, s: 2.2 }, { type: "ice", x: 27, z: -18, s: 2.6 }, { type: "ice", x: -26, z: -70, s: 2.0 },
        { type: "ice", x: 26, z: 26, s: 1.8 }, { type: "ice", x: 27, z: -58, s: 2.2 }
      ],
      crystals: [
        [-4, 47], [-6, 22], [1, 25], [8, 21], [1, 18.5], [6, 33], [9, 0], [0, -6, 1], [-8, -13],
        [2, -27], [-4, -43], [0, -50, 1], [-13, -63], [-10, -60], [0, -58], [3, -71]
      ],
      tips: [
        { x: 0, z: 52, r: 7, who: "guide", text: "Hoş geldin kaşif! Yön tuşları ya da WASD ile yürü. Işıldayan bilgi bayrağına yaklaşınca soru açılır." },
        { x: 1, z: 33, r: 5, who: "guide", text: "Buz gölü! Buzda kayarsın; yönünü erkenden ayarla, kristalleri kaçırma." },
        { x: 3, z: 1, r: 5.5, who: "guide", text: "Dikkat, buz çatlağı! Koşarken Boşluk (Space) tuşuna basıp üzerinden zıpla." },
        { x: 12, z: -30, r: 5, who: "guide", text: "Bu tepe, Antarktika'da adı bir tepeye verilen Ümran İnan'ı hatırlatıyor." }
      ],
      npcs: [{ who: "guide", x: 5, z: 50, face: -0.6 }],
      finale: {
        x: -8, z: -75, label: "Sefer Defteri",
        game: {
          type: "match",
          title: "Kim, hangi adımı attı?",
          prompt: "Önce soldan bir kişi, sonra sağdan ona uygun adımı seç.",
          pairs: [
            ["Atok Karaali", "1960'larda Antarktika'da çalışan öncü bilim insanı"],
            ["Ümran İnan", "Atmosfer araştırmalarıyla tanınır; adı Antarktika'da bir tepeye verildi"],
            ["Osman Atasoy ve Sibel Karasu", "Yelkenliyle Antarktika'ya ulaşıp deneyimlerini paylaşan denizciler"],
            ["Burcu Özsoy", "Ulusal bilim seferlerinin gelişmesinde ve yönetiminde görev aldı"]
          ],
          note: "Öncülerin bireysel çalışmaları, bugünkü merkezlerin ve ulusal seferlerin yolunu açtı."
        }
      }
    },

    /* ───────────────────────── 2. BÖLÜM ───────────────────────── */
    {
      id: 2,
      title: "Kurumlar Kuruluyor",
      lesson: "2. ders · Kurumların gelişimi",
      place: "Antarktika · Üs Şantiyesi",
      theme: "day",
      rim: "cliff",
      mechanic: "Kartopu yolları ve üs kurma",
      brief: "Tek tek atılan adımlar zamanla kurumlara dönüştü. Her doğru cevapla bilim üssünün bir parçası yükselecek; antlaşmadan enstitüye uzanan yolu sen tamamla.",
      goals: [
        "5 bilgi bayrağıyla üssün 5 parçasını kur",
        "Yuvarlanan kartoplarına yakalanmadan karşıya geç",
        "Zaman çizelgesini doğru sırala"
      ],
      questions: ["q06", "q10", "q09", "q12", "q20"],
      spawn: [0, 54],
      terrain: {
        seed: 23,
        hills: [[-34, 26, 7, 5.5], [34, 0, 7, 5.5], [-34, -28, 7, 5.5]],
        flats: [[11, 38, 7, 4.5, 0.15], [-12, 14, 8, 5, 0.15], [12, -14, 8, 5, 0.15], [-10, -42, 8, 5, 0.15], [9, -64, 8, 4.5, 0.15], [0, -76, 7, 4, 0.15]],
        tracks: [[26, 2.5, -0.4], [0, 2.5, -0.4], [-28, 2.7, -0.4]],
        pools: [],
        bands: [[-36, -54, 36, -53, 1.2, 0.5]]
      },
      ice: [],
      flags: [
        { x: 6, z: 39, build: { type: "board", x: 14, z: 37, rot: -0.35, text: "ANTARKTİKA ANTLAŞMASI", sub: "Barış ve bilim kıtası" } },
        { x: -7, z: 15, build: { type: "domeTent", x: -15.5, z: 13, rot: 0.4, text: "İTÜ PolReC", sub: "2015" } },
        { x: 7, z: -13, build: { type: "module", x: 15.5, z: -15, rot: -0.3, color: 0x2b78c5, text: "TÜBİTAK MAM KARE", sub: "Kutup Araştırmaları Enstitüsü" } },
        { x: -5, z: -41, build: { type: "station", x: -13.5, z: -43, rot: 0.2, text: "Ölçüm İstasyonu", sub: "Planlı ve sürekli araştırma" } },
        { x: 4, z: -64, build: { type: "tower", x: 12.5, z: -65, rot: -0.2, text: "Ulusal Kutup Bilim Stratejisi", sub: "2023–2035" } }
      ],
      lanes: [
        { z: 26, dir: 1, speed: 8.5, every: 2.7, r: 1.45 },
        { z: 0, dir: -1, speed: 10.5, every: 2.3, r: 1.45 },
        { z: -28, dir: 1, speed: 9.5, every: 1.9, r: 1.3 }
      ],
      props: [
        { type: "crates", x: -8, z: 48 }, { type: "crates", x: 20, z: 47 }, { type: "sled", x: -14, z: 45, rot: 0.9 },
        { type: "tent", x: 22, z: 20, color: 0xe4572e, rot: -0.4 }, { type: "tent", x: -23, z: -8, color: 0xf2a23a, rot: 0.5 },
        { type: "crates", x: 22, z: -40 }, { type: "sled", x: 19, z: -58, rot: -0.6 },
        { type: "marker", x: 2, z: 44 }, { type: "marker", x: -2, z: 31 }, { type: "marker", x: -1, z: 21 }, { type: "marker", x: 1, z: 6 },
        { type: "marker", x: 2, z: -6 }, { type: "marker", x: 0, z: -22 }, { type: "marker", x: -2, z: -34 }, { type: "marker", x: 0, z: -48 }, { type: "marker", x: 1, z: -59 },
        { type: "ice", x: 27, z: 34, s: 2.0 }, { type: "ice", x: -27, z: 2, s: 2.4 }, { type: "ice", x: 27, z: -30, s: 2.0 }, { type: "ice", x: -26, z: -62, s: 2.4 }
      ],
      crystals: [
        [0, 46], [-10, 26], [0, 26], [10, 26], [-2, 20], [2, 8], [-7, 0], [7, 0], [0, -8], [0, -20],
        [-9, -28], [9, -28], [-2, -35], [0, -48], [0, -53.5, 1], [2, -59], [-3, -70]
      ],
      tips: [
        { x: 0, z: 52, r: 7, who: "guide", text: "Bugün bilim üssünü kuruyoruz! Her doğru cevapta üssün bir parçası yükselecek." },
        { x: 0, z: 32, r: 5, who: "guide", text: "Kartopları yuvarlanıyor! Geçmeden önce yolu kolla, boşluğu yakalayınca koş." },
        { x: 0, z: -47, r: 5, who: "guide", text: "Kurumlar sayesinde araştırmalar tek seferlik olmaktan çıktı; planlı ve sürekli hâle geldi." }
      ],
      npcs: [{ who: "guide", x: -5, z: 50, face: 0.6 }],
      finale: {
        x: 0, z: -76, label: "Zaman Kapsülü",
        game: {
          type: "order",
          title: "Zaman çizelgesini kur",
          prompt: "Olayları en eskiden en yeniye doğru sırayla seç.",
          items: [
            { text: "Türkiye, Antarktika Antlaşması'na taraf oldu", tag: "1995" },
            { text: "İTÜ Kutup Araştırmaları Merkezi (PolReC) kuruldu", tag: "2015" },
            { text: "Birinci Ulusal Antarktika Bilim Seferi yapıldı", tag: "2017" },
            { text: "TÜBİTAK MAM Kutup Araştırmaları Enstitüsü (KARE) kuruldu", tag: "2019" },
            { text: "Ulusal Kutup Bilim Stratejisi 2023–2035 yayımlandı", tag: "2023" }
          ],
          note: "Antlaşma, merkez, seferler, enstitü ve strateji: her adım bir öncekinin üzerine kuruldu."
        }
      }
    },

    /* ───────────────────────── 3. BÖLÜM ───────────────────────── */
    {
      id: 3,
      title: "Bilim Seferi",
      lesson: "3. ders · Ulusal bilim seferleri",
      place: "Antarktika · Horseshoe Adası, 68° Güney",
      theme: "sea",
      rim: "sea",
      mechanic: "Yüzen buzlarla kanal geçişi",
      brief: "Ulusal Antarktika Bilim Seferi başladı! Gemiden in, yüzen buzların üzerinden geçerek Horseshoe Adası'ndaki bilim kampına ulaş.",
      goals: [
        "Su kanallarını yüzen buzların üstünden geç",
        "5 bilgi bayrağını topla",
        "Sefer ekibindeki uzmanları işleriyle eşleştir"
      ],
      questions: ["q07", "q11", "q14", "q18", "q17"],
      spawn: [0, 54],
      terrain: {
        seed: 37,
        hills: [[-17, -40, 8, 2.2], [20, 48, 6, 1.8]],
        flats: [[-13, 8, 9.5, 6, 0.3], [15, 3, 6, 4.5, 0.3], [0, -68, 7, 4.5, 0.3]],
        tracks: [],
        pools: [],
        bands: [[-44, 26, 44, 26, 6.3, 1.2], [-44, -14, 44, -14, 8.6, 1.2], [-36, -55, 36, -56, 1.2, 0.5]]
      },
      ice: [],
      flags: [
        { x: 8, z: 43 },
        { x: -7, z: 10 },
        { x: 12, z: 4 },
        { x: -9, z: -33 },
        { x: 12, z: -43 }
      ],
      floes: [
        { z: 30.0, homes: [-20, -7, 6, 19], amp: 5, w: 0.55, r: 3.3 },
        { z: 22.0, homes: [-13.5, -0.5, 12.5], amp: 5.5, w: -0.7, r: 3.3 },
        { z: -7.9, homes: [-18, -5, 8, 21], amp: 5.5, w: 0.5, r: 3.3 },
        { z: -14.0, homes: [-12, 1.5, 15], amp: 6.5, w: -0.62, r: 3.3 },
        { z: -20.1, homes: [-19, -6, 7, 20], amp: 5.5, w: 0.56, r: 3.3 }
      ],
      props: [
        { type: "ship", x: -40, z: 44, rot: 0.25 },
        { type: "crates", x: 13, z: 47 }, { type: "crates", x: -9, z: 49 }, { type: "sled", x: 15, z: 40, rot: 0.4 },
        { type: "module", x: -19, z: 10.5, rot: 0.3, color: 0xe4572e }, { type: "module", x: -15, z: 4.5, rot: -0.15, color: 0xf2a23a },
        { type: "module", x: -21, z: 4, rot: 0.6, color: 0x2b78c5 },
        { type: "sign", x: -9.5, z: 14, text: "Türk Bilimsel Araştırma Kampı", sub: "Horseshoe Adası · 2019" },
        { type: "station", x: 18.5, z: 2, rot: -0.3 },
        { type: "sign", x: 15.5, z: 8, text: "Meteoroloji İstasyonu", sub: "Her yıl aynı noktada ölçüm" },
        { type: "drill", x: -15.5, z: -34 }, { type: "crates", x: -19, z: -30 },
        { type: "sign", x: -6, z: -28.5, text: "Örnek Alanı", sub: "Buzul · deniz · kayaç" },
        { type: "domeTent", x: 18.5, z: -45, rot: -0.5 },
        { type: "sign", x: 15.5, z: -38.5, text: "Ortak Çalışma Çadırı", sub: "Uluslararası iş birliği" },
        { type: "colony", x: 17, z: -29, n: 7 },
        { type: "rocks", x: 22, z: 14, s: 1.2 }, { type: "rocks", x: -22, z: -47, s: 1.3 },
        { type: "marker", x: 2, z: 37 }, { type: "marker", x: 0, z: 17 }, { type: "marker", x: 3, z: -3 }, { type: "marker", x: 1, z: -25 },
        { type: "marker", x: 2, z: -50 }, { type: "marker", x: -2, z: -61 },
        { type: "berg", x: -40, z: 6, s: 3.4 }, { type: "berg", x: 40, z: 30, s: 2.8 }, { type: "berg", x: 41, z: -22, s: 3.6 },
        { type: "berg", x: -41, z: -40, s: 3.0 }, { type: "berg", x: 38, z: -66, s: 2.6 }, { type: "berg", x: -36, z: -76, s: 2.4 }
      ],
      crystals: [
        [3, 48], [-4, 40], [-10, 26, 1], [3, 26, 1], [14, 26, 1], [0, 15], [5, 8], [-2, 0], [-9, -11, 1], [5, -11, 1],
        [-3, -17, 1], [11, -17, 1], [0, -27], [2, -38], [-3, -47], [0, -55.5, 1], [3, -62]
      ],
      tips: [
        { x: 0, z: 52, r: 7, who: "guide", text: "Gemiden indik! Kamp, su kanallarının ötesinde. Önce karşıdaki bayrağa bak." },
        { x: 0, z: 36, r: 4.5, who: "guide", text: "Yüzen buz yaklaşınca üstüne yürü, sonra öndeki buza zıpla. Suya düşersen kıyıya dönersin." },
        { x: -4, z: 12, r: 6, who: "guide", text: "Burası Horseshoe Adası'ndaki geçici bilim kampı. Araştırmacılar her sefer aynı noktalarda ölçüm yapar." },
        { x: 14, z: -31, r: 6, who: "guide", text: "Penguen kolonisi! Sessizce geçelim; bilim insanları canlıları rahatsız etmeden gözlem yapar." }
      ],
      npcs: [{ who: "guide", x: -5, z: 50, face: 0.6 }],
      finale: {
        x: 0, z: -68, label: "Sefer Laboratuvarı",
        game: {
          type: "match",
          title: "Sefer ekibi iş başında",
          prompt: "Her uzmanı seferde yaptığı işle eşleştir.",
          pairs: [
            ["Buzul bilimci", "Buzulların kalınlığını ve hareketini ölçer"],
            ["Deniz biyoloğu", "Deniz canlılarını ve yaşam alanlarını inceler"],
            ["Jeolog", "Kayaçları ve yer kabuğunun yapısını araştırır"],
            ["Meteorolog", "Sıcaklık, rüzgâr ve basınç ölçümlerini kaydeder"]
          ],
          note: "Kutuplar birçok bilim dalı için açık hava laboratuvarıdır; bu yüzden seferlere farklı uzmanlar birlikte katılır."
        }
      }
    },

    /* ───────────────────────── 4. BÖLÜM ───────────────────────── */
    {
      id: 4,
      title: "Kutuplar ve Gelecek",
      lesson: "4. ders · Araştırmaların önemi",
      place: "Arktik · Kuzey Buz Denizi",
      theme: "aurora",
      rim: "sea",
      mechanic: "Çatlayan deniz buzu",
      brief: "Şimdi dünyanın öbür ucundayız: Arktik! Kutuplardaki değişim hepimizi etkiliyor. İncelen deniz buzunu geç ve bu araştırmaların neden önemli olduğunu göster.",
      goals: [
        "Çatlayan buzların üstünde durmadan ilerle",
        "5 bilgi bayrağını topla",
        "Bir araştırmanın adımlarını sırala, sertifikanı al"
      ],
      questions: ["q02", "q15", "q16", "q08", "q19"],
      spawn: [0, 54],
      terrain: {
        seed: 53,
        hills: [[22, 46, 6, 1.6], [-20, -52, 7, 1.8]],
        flats: [[-12, 42, 6, 4, 0.3], [11, 7, 6, 4, 0.3], [-11, -23, 6, 4, 0.3], [0, -75, 8, 5, 0.3]],
        tracks: [],
        pools: [],
        bands: [[-44, 24, 44, 24, 6.8, 1.2], [-44, -8, 44, -8, 6.3, 1.2], [-44, -37, 44, -37, 6.8, 1.2]]
      },
      ice: [],
      flags: [
        { x: -8, z: 42 },
        { x: 10, z: 8 },
        { x: -9, z: -22 },
        { x: 10, z: -50 },
        { x: -9, z: -61 }
      ],
      tiles: [
        { zs: [30, 27, 24, 21, 18], x0: -20.8, cols: 13, pattern: "holes", seed: 5 },
        { zs: [-31, -34, -37, -40, -43], x0: -20.8, cols: 13, pattern: "stripes", seed: 9 }
      ],
      floes: [
        { z: -4.0, homes: [-20, -7, 6, 19], amp: 5, w: 0.6, r: 3.3 },
        { z: -12.0, homes: [-13.5, -0.5, 12.5], amp: 5.5, w: -0.75, r: 3.3 }
      ],
      props: [
        { type: "drill", x: -15, z: 42.5 },
        { type: "sign", x: -11, z: 47, text: "Buz Karotu Sondajı", sub: "Buzun içinde eski hava saklı" },
        { type: "station", x: 16.5, z: 7, rot: -0.3 },
        { type: "sign", x: 14, z: 12.5, text: "İklim Gözlem Noktası", sub: "Kutuplar dünyanın iklim aynası" },
        { type: "crates", x: -15.5, z: -24 }, { type: "sled", x: -17, z: -19, rot: 0.8 },
        { type: "sign", x: -5.5, z: -18, text: "Su Örnekleri", sub: "Kirlilik ölçümü" },
        { type: "tent", x: 16.5, z: -52, color: 0xf2a23a, rot: -0.5 }, { type: "tent", x: 19.5, z: -47, color: 0xe4572e, rot: 0.2 },
        { type: "sign", x: 13.5, z: -45.5, text: "Genç Araştırmacılar Kampı", sub: "Geleceğin kutup bilimcileri" },
        { type: "camera", x: -14, z: -62.5, rot: 0.9 },
        { type: "sign", x: -5.5, z: -57, text: "Belgesel Çekimi", sub: "Bilimi topluma anlat" },
        { type: "bigflag", x: 0, z: -79 },
        { type: "marker", x: 2, z: 46 }, { type: "marker", x: 1, z: 13 }, { type: "marker", x: 0, z: -1 }, { type: "marker", x: -1, z: -18 },
        { type: "marker", x: 1, z: -28 }, { type: "marker", x: 2, z: -47 }, { type: "marker", x: -1, z: -66 },
        { type: "berg", x: -40, z: 40, s: 3.0 }, { type: "berg", x: 40, z: 10, s: 3.4 }, { type: "berg", x: -41, z: -22, s: 3.6 },
        { type: "berg", x: 40, z: -44, s: 3.0 }, { type: "berg", x: -37, z: -70, s: 2.6 }, { type: "berg", x: 37, z: -76, s: 2.4 }
      ],
      crystals: [
        [3, 47], [-6, 27, 0.4], [4, 24, 0.4], [-2, 21, 0.4], [10, 27, 0.4], [3, 13], [0, 3], [-8, -8, 1], [6, -8, 1],
        [0, -17], [-4, -27], [-7, -34, 0.4], [1, -37, 0.4], [8, -40, 0.4], [3, -47], [0, -56], [3, -68]
      ],
      tips: [
        { x: 0, z: 52, r: 7, who: "bear", text: "Arktik'e hoş geldin, ben Ayaz! Kutup ayıları yalnızca burada, kuzeyde yaşar; penguenler ise Güney Yarımküre'de. Bugün konuğumsun!" },
        { x: 0, z: 35, r: 4.5, who: "bear", text: "Deniz buzu inceliyor. Bastığın buz çatlar ve batar; üstünde durma, hızlı geç!" },
        { x: 0, z: 12, r: 5, who: "guide", text: "Arktik'te deniz buzu azaldıkça dünyanın iklim dengesi de değişiyor. Bu yüzden ölçümler yıllarca sürüyor." },
        { x: 0, z: -66, r: 5, who: "bear", text: "Az kaldı! Büyük bayrağın önündeki son göreve gel." }
      ],
      npcs: [
        { who: "bear", x: -6, z: 50, face: 0.7, relocateZ: -40, to: [7, -77], toFace: -0.5 },
        { who: "guide", x: 6, z: 14, face: -0.8 }
      ],
      finale: {
        x: 0, z: -74, label: "Büyük Bayrak Meydanı",
        game: {
          type: "order",
          title: "Bir araştırmanın yolculuğu",
          prompt: "Adımları ilk adımdan son adıma doğru sırayla seç.",
          items: [
            { text: "Araştırma sorusu belirlenir, sefer planlanır", tag: "1. adım" },
            { text: "Ekip kutup bölgesine yolculuk eder", tag: "2. adım" },
            { text: "Sahada ölçüm yapılır, örnekler toplanır", tag: "3. adım" },
            { text: "Örnekler laboratuvarda incelenir", tag: "4. adım" },
            { text: "Sonuçlar bilim dünyası ve toplumla paylaşılır", tag: "5. adım" }
          ],
          note: "Bilim, sahada toplanan veriyle başlar; sonuçlar paylaşıldığında herkesin bilgisi olur."
        }
      }
    }
  ];
}());
