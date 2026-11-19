(function () {
  "use strict";

  const question = (id, q, opts, ans, info) => Object.freeze({
    id,
    q,
    opts: Object.freeze(opts),
    ans,
    info
  });

  window.KUTUP_QUIZ_DATA = Object.freeze([
    question(
      "q01",
      "Kuzey ve Güney kutup bölgeleri için kullanılan adlar aşağıdakilerin hangisinde doğru verilmiştir?",
      Object.freeze([
        "A) Kuzey: Antarktika — Güney: Arktik",
        "B) Kuzey: Arktik — Güney: Antarktika",
        "C) Kuzey: Grönland — Güney: Antarktika",
        "D) Kuzey: Arktik — Güney: Grönland"
      ]),
      1,
      "Kuzey Kutup Bölgesi “Arktik”, Güney Kutup Bölgesi ise “Antarktika” olarak adlandırılır. İki bölge de kutupsaldır ama dünyanın farklı uçlarındadır."
    ),
    question(
      "q02",
      "Kutup buzullarından alınan eski buz örnekleri, aşağıdakilerden hangisinin araştırılmasında kullanılır?",
      Object.freeze([
        "A) Geçmişte deniz akıntılarının izlediği yolların",
        "B) Geçmişte kıtaların yer değiştirme hızlarının",
        "C) Geçmişte kutup canlılarının izlediği göç yollarının",
        "D) Geçmişte atmosferin ve iklimin özelliklerinin"
      ]),
      3,
      "Buz çekirdeklerinin içindeki hava kabarcıkları geçmiş atmosferden küçük örnekler taşır. Bilim insanları bunlarla eski iklim ve sera gazı koşullarını inceleyebilir."
    ),
    question(
      "q03",
      "1960’lı yıllarda Antarktika’da araştırmalar yapan öncü Türk bilim insanı aşağıdakilerden hangisidir?",
      Object.freeze([
        "A) Aziz Sancar",
        "B) Cahit Arf",
        "C) Atok Karaali",
        "D) Hulusi Behçet"
      ]),
      2,
      "Atok Karaali, 1960’lı yıllarda Antarktika’da bilimsel çalışmalar yapan öncü Türk bilim insanlarından biridir. Adı kıtadaki Karaali Kayalıkları’na verilmiştir."
    ),
    question(
      "q04",
      "Antarktika’da Atok Karaali ve Ümran İnan’ın adlarını taşıyan coğrafi yerlerin bulunması, öncelikle neyin bir göstergesidir?",
      Object.freeze([
        "A) Bilimsel katkılarının uluslararası alanda tanınmasının",
        "B) Araştırma yaptıkları yerlerin mülkiyetini almalarının",
        "C) Türkiye’nin bu yerlerde araştırma kampı kurmasının",
        "D) Bu yerlerin haritada ilk kez Türklerce gösterilmesinin"
      ]),
      0,
      "Bir bilim insanının adının coğrafi bir oluşuma verilmesi, çalışmalarının uluslararası bilim dünyasında tanındığını gösterir. Bu durum o yerin mülkiyetinin o kişiye veya ülkeye geçtiği anlamına gelmez."
    ),
    question(
      "q05",
      "Aşağıdaki gelişmelerden hangisi diğerlerinden daha önce gerçekleşmiştir?",
      Object.freeze([
        "A) Türkiye’nin ilk ulusal Antarktika bilim seferini düzenlemesi",
        "B) Atok Karaali’nin Antarktika’da bilimsel çalışmalar yapması",
        "C) Türkiye’nin Antarktika’da geçici bilim kampı kurması",
        "D) TÜBİTAK Kutup Araştırmaları Enstitüsünün kurulması"
      ]),
      1,
      "Atok Karaali’nin Antarktika çalışmaları 1960’lı yıllara uzanır. Ulusal sefer, geçici kamp ve Kutup Araştırmaları Enstitüsü ise çok daha sonraki yıllarda gerçekleşmiştir."
    ),
    question(
      "q06",
      "Antarktika Antlaşması’nın bilimsel çalışmalar açısından temel yaklaşımı hangisidir?",
      Object.freeze([
        "A) Araştırma bölgelerini ülkeler arasında kalıcı olarak paylaştırmak",
        "B) Araştırma hakkını kıtaya yakın ülkelerin önceliğine bırakmak",
        "C) Araştırma sonuçlarını çalışmayı yapan ülkenin kullanımında tutmak",
        "D) Barışçıl araştırmaları ve ülkeler arasındaki bilimsel iş birliğini desteklemek"
      ]),
      3,
      "Antarktika Antlaşması kıtanın barışçıl amaçlarla kullanılmasını, bilimsel araştırmayı ve ülkeler arasındaki iş birliğini destekler. Antarktika’nın kalıcı biçimde ülkeler arasında paylaştırılmasını amaçlamaz."
    ),
    question(
      "q07",
      "Türkiye’nin ulusal kutup bilim seferlerine liderlik eden ve bu çalışmaların gelişmesinde görev alan bilim insanı kimdir?",
      Object.freeze([
        "A) Canan Dağdeviren",
        "B) Özlem Türeci",
        "C) Burcu Özsoy",
        "D) Feryal Özel"
      ]),
      2,
      "Prof. Dr. Burcu Özsoy, Türkiye’nin kutup araştırmalarının gelişmesinde ve ulusal bilim seferlerinin koordinasyonunda önemli görevler üstlenmiştir."
    ),
    question(
      "q08",
      "Türkiye’nin kutup araştırmalarını gelecekte de sürdürebilmesi için aşağıdaki adımlardan hangisi en doğrudan katkıyı sağlar?",
      Object.freeze([
        "A) Genç araştırmacılar yetiştirmek ve uzun süreli bilimsel çalışmaları desteklemek",
        "B) Tamamlanan bilim seferlerinin fotoğraf ve haber arşivlerini genişletmek",
        "C) Geçmiş seferlerde kullanılan araştırma araçlarını bilim müzelerinde sergilemek",
        "D) Bilim seferlerinin başlangıç törenlerini daha geniş kitlelere duyurmak"
      ]),
      0,
      "Kutup araştırmalarının geleceği, yeni araştırmacılar yetiştirmeye ve yıllar boyunca devam eden bilimsel çalışmalara bağlıdır. Uzun süreli ölçümler değişimi anlamamızı sağlar."
    ),
    question(
      "q09",
      "Türkiye’nin ulusal kutup araştırmalarının ve bilim seferlerinin birlikte planlanmasından sorumlu kurum hangisidir?",
      Object.freeze([
        "A) TÜBİTAK Uzay Teknolojileri Araştırma Enstitüsü",
        "B) TÜBİTAK Kutup Araştırmaları Enstitüsü",
        "C) Kandilli Rasathanesi ve Deprem Araştırma Enstitüsü",
        "D) Maden Tetkik ve Arama Genel Müdürlüğü"
      ]),
      1,
      "Ulusal kutup bilim çalışmalarının ve seferlerinin koordinasyonu TÜBİTAK Kutup Araştırmaları Enstitüsü tarafından yürütülür. Enstitü farklı bilim dallarından araştırmacıları bir araya getirir."
    ),
    question(
      "q10",
      "Aşağıdaki gelişmelerin eskiden yeniye doğru sıralanışı hangisidir?\nI. Türkiye’nin Antarktika’da geçici bilim kampı kurması\nII. İTÜ Kutup Araştırmaları Merkezinin kurulması\nIII. Birinci Ulusal Antarktika Bilim Seferi’nin yapılması",
      Object.freeze([
        "A) II – III – I",
        "B) I – II – III",
        "C) III – I – II",
        "D) II – I – III"
      ]),
      0,
      "Önce İTÜ Kutup Araştırmaları Merkezi kuruldu, ardından 2017’de Birinci Ulusal Antarktika Bilim Seferi yapıldı ve 2019’da geçici bilim kampı kuruldu. Doğru sıra II–III–I’dir."
    ),
    question(
      "q11",
      "Türkiye’nin Antarktika’daki geçici bilim kampı hangi adada kurulmuştur?",
      Object.freeze([
        "A) King George Adası",
        "B) Robert Adası",
        "C) Horseshoe Adası",
        "D) Deception Adası"
      ]),
      2,
      "Türkiye’nin Antarktika’daki geçici bilimsel araştırma kampı Horseshoe Adası’ndadır. Ada, Türk araştırmacıların saha çalışmalarında önemli bir merkezdir."
    ),
    question(
      "q12",
      "Türkiye’nin kutup araştırmalarında, öncü bilim insanlarının çalışmalarını zamanla araştırma merkezleri ve düzenli ulusal seferler izlemiştir. Bu gelişme nasıl açıklanabilir?",
      Object.freeze([
        "A) Araştırmaların alan çalışmasından masa başı çalışmasına yönelmesiyle",
        "B) Araştırmaların bilimsel amaçlardan gezi amaçlarına yönelmesiyle",
        "C) Araştırmaların daha planlı ve devamlı bir yapıya kavuşmasıyla",
        "D) Araştırmaların uluslararası ortaklıklardan uzaklaşmasıyla"
      ]),
      2,
      "Bireysel çalışmaların ardından merkezlerin kurulması ve düzenli seferlerin başlaması, araştırmaların daha planlı ve sürdürülebilir hâle geldiğini gösterir."
    ),
    question(
      "q13",
      "Osman Atasoy ve Sibel Karasu, Türkiye’nin kutuplara yönelik ilgisinin gelişmesine hangi çalışmalarıyla katkı sağlamıştır?",
      Object.freeze([
        "A) Kutuplara deniz yolculukları yapıp deneyimlerini paylaşarak",
        "B) Kutup araştırma merkezlerinin kuruluş çalışmalarını yöneterek",
        "C) Kutup koşullarında kullanılacak bilimsel cihazlar geliştirerek",
        "D) Kutuplardan alınan buz örneklerini laboratuvarda inceleyerek"
      ]),
      0,
      "Osman Atasoy ve Sibel Karasu, kutup bölgelerine yaptıkları deniz yolculuklarını ve deneyimlerini paylaşarak toplumun kutuplara ilgisinin artmasına katkı sağlamıştır."
    ),
    question(
      "q14",
      "Bilim insanlarının farklı yıllarda kutuplara giderek aynı bölgelerde ölçümler yapması neden önemlidir?",
      Object.freeze([
        "A) Bir seferde daha fazla bölgeyi ziyaret etmek için",
        "B) Doğadaki değişimleri yıllar arasında karşılaştırmak için",
        "C) Farklı ölçüm araçlarını aynı gün içinde denemek için",
        "D) Sefer ekibinin yolculuk süresini kısaltmak için"
      ]),
      1,
      "Aynı bölgede farklı yıllarda yapılan ölçümler karşılaştırıldığında buzulların, sıcaklığın ve canlı yaşamının zaman içinde nasıl değiştiği anlaşılabilir."
    ),
    question(
      "q15",
      "Bir öğrenci “Kutuplar Türkiye’ye çok uzak. Oradaki iklim araştırmaları bizi neden ilgilendiriyor?” diye soruyor. Hangi cevap uygundur?",
      Object.freeze([
        "A) Kutuplardaki değişimler, Türkiye’yi de etkileyen küresel iklim sistemiyle ilişkilidir.",
        "B) Türkiye ile kutup bölgeleri aynı iklim kuşağında bulunduğu için ilişkilidir.",
        "C) Kutuplardaki günlük sıcaklıklar, Türkiye’deki günlük sıcaklıkları gösterdiği için ilişkilidir.",
        "D) Türkiye’deki yağışların kaynağı kutuplardan taşınan su olduğu için ilişkilidir."
      ]),
      0,
      "Kutuplar uzakta olsa da dünya iklim sistemi birbirine bağlıdır. Kutuplardaki değişimler deniz seviyesi, hava olayları ve Türkiye’nin iklimi üzerinde de etkili olabilir."
    ),
    question(
      "q16",
      "Aşağıdaki çalışmalardan hangisi Türkiye’nin kutup araştırmalarında yeni bilimsel bilgi üretmesine doğrudan örnektir?",
      Object.freeze([
        "A) Diğer ülkelerin sefer haberlerini Türkçeye çevirmek",
        "B) Önceki araştırmaların fotoğraflarını bir sergide toplamak",
        "C) Alınan su örneklerini inceleyerek kirlilik düzeyini belirlemek",
        "D) Bilim insanlarının yaşam öykülerini bir kitapta derlemek"
      ]),
      2,
      "Su örneklerini inceleyip kirlilik düzeyini ölçmek, doğrudan gözlem ve deneyle yeni bilimsel bilgi üretmektir. Haber çevirmek veya sergi hazırlamak ise bilim iletişimine katkı sağlar."
    ),
    question(
      "q17",
      "Aşağıdakilerden hangisi kutup araştırmalarında ülkeler arası bilimsel iş birliğine örnektir?",
      Object.freeze([
        "A) Türkiye’deki iki üniversitenin bir sefer için ortak ekip kurması",
        "B) Türk ve yabancı araştırmacıların topladıkları verileri birlikte incelemesi",
        "C) Bir Türk araştırma ekibinin yabancı bir firmadan cihaz satın alması",
        "D) Bir Türk araştırmacının yabancı dilde bir tanıtım yazısı hazırlaması"
      ]),
      1,
      "Farklı ülkelerden araştırmacıların verileri birlikte incelemesi gerçek bir uluslararası bilimsel iş birliğidir. Bilgi paylaşımı sonuçların daha güçlü olmasını sağlar."
    ),
    question(
      "q18",
      "Bir kutup seferine buzulları, deniz canlılarını ve kayaçları inceleyen farklı uzmanların katılması neyle açıklanır?",
      Object.freeze([
        "A) Seferdeki araştırmaların aynı yöntemle yürütülmesiyle",
        "B) Seferdeki bütün uzmanların aynı soruya cevap aramasıyla",
        "C) Seferin temel amacının bilim olmasıyla",
        "D) Kutupların farklı bilim alanları için araştırma olanağı sunmasıyla"
      ]),
      3,
      "Kutuplar; iklim, buzullar, deniz yaşamı, kayaçlar ve atmosfer gibi birçok konuda araştırma olanağı sunar. Bu nedenle seferlerde farklı uzmanlık alanlarından bilim insanları birlikte çalışır."
    ),
    question(
      "q19",
      "Türkiye’nin kutup seferlerini anlatan bir belgeselin geniş kitlelere ulaştırılmasının temel amacı hangisidir?",
      Object.freeze([
        "A) Araştırma ekiplerinin günlük ölçüm kayıtlarını tutmak",
        "B) Gelecek sefere katılacak araştırmacıların görevlerini belirlemek",
        "C) Yapılan çalışmaları ve kutupların önemini topluma anlatmak",
        "D) Toplanan örneklerin laboratuvar incelemelerini tamamlamak"
      ]),
      2,
      "Belgeseller, yapılan araştırmaları ve kutupların dünya için neden önemli olduğunu geniş kitlelere anlatır. Böylece bilimsel bilgi toplumla paylaşılmış olur."
    ),
    question(
      "q20",
      "Ulusal Kutup Bilim Stratejisi’nde yer alması beklenen uzun vadeli hedef aşağıdakilerden hangisidir?",
      Object.freeze([
        "A) Araştırmacı yetiştirmek ve araştırmaların sürekliliğini sağlamak",
        "B) Bir seferin günlük rotasını ve mola yerlerini belirlemek",
        "C) Bir laboratuvardaki cihazların haftalık bakımını planlamak",
        "D) Bir araştırma ekibinin günlük görev dağılımını yapmak"
      ]),
      0,
      "Uzun vadeli bir bilim stratejisi araştırmacı yetiştirmeyi ve çalışmaların yıllarca devam etmesini hedefler. Günlük rota veya görev dağılımı ise kısa süreli bir plandır."
    )
  ]);
}());
