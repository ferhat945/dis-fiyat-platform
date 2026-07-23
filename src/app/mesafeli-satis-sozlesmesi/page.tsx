import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mesafeli Satış ve Dijital Hizmet Sözleşmesi | DişFiyat360",
  description:
    "DişFiyat360 kredi paketleri, Premium üyelik, klinik paneli ve diğer dijital hizmetlere ilişkin satış ve kullanım sözleşmesi.",
  alternates: {
    canonical: "/mesafeli-satis-sozlesmesi",
  },
};

type ContractBlock = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

const CONTRACT_BLOCKS: ContractBlock[] = [
  {
    title: "1) Taraflar",
    paragraphs: [
      "İşbu Mesafeli Satış ve Dijital Hizmet Sözleşmesi, aşağıda bilgileri bulunan hizmet sağlayıcı ile DişFiyat360 platformu üzerinden kredi paketi, Premium üyelik, panel erişimi veya başka bir dijital hizmet satın alan gerçek ya da tüzel kişi arasında elektronik ortamda kurulmaktadır.",
    ],
    items: [
      "Hizmet sağlayıcı / Satıcı: Ferhat Menekşe",
      "Vergi dairesi: 5 Ocak Vergi Dairesi",
      "Vergi numarası: 6150625779",
      "Adres: Dumlupınar Mahallesi, 38007 Sokak No:4, Seyhan / Adana",
      "Telefon: 0531 917 17 39",
      "E-posta: ferhatmenekse945@gmail.com",
      "İnternet adresi: www.disfiyat360.com",
      "Alıcı: DişFiyat360 üzerinden ücretli dijital hizmet satın alan klinik, işletme, şirket, sağlık kuruluşu veya bunların yetkili temsilcisidir.",
    ],
  },
  {
    title: "2) Tanımlar",
    items: [
      "Platform: www.disfiyat360.com alan adı ve buna bağlı DişFiyat360 dijital hizmetlerini ifade eder.",
      "Hizmet sağlayıcı: DişFiyat360 platformunun işletmecisi Ferhat Menekşe'yi ifade eder.",
      "Alıcı: Platform üzerinden ücretli dijital hizmet satın alan gerçek veya tüzel kişiyi ifade eder.",
      "Klinik hesabı: Alıcının DişFiyat360 üzerinde oluşturduğu veya yetkili olduğu işletme hesabını ifade eder.",
      "Lead: Bir kullanıcının belirli bir şehir ve diş hizmeti için platform üzerinden oluşturduğu iletişim veya teklif talebini ifade eder.",
      "Kredi: Uygun bir leadin iletişim bilgilerini görüntülemek için kullanılabilen dijital kullanım hakkını ifade eder.",
      "Kredi paketi: Belirli sayıda kredi kullanım hakkı içeren ücretli dijital paketi ifade eder.",
      "Premium üyelik: Satın alma ekranında belirtilen süre boyunca uygun lead dağıtımlarında standart hesaplara göre öncelik ve ilan edilen diğer dijital avantajları sağlayan üyelik türünü ifade eder.",
      "Dijital hizmet: Kredi paketi, Premium üyelik, panel erişimi, dijital görünürlük, profil yönetimi, lead görüntüleme ve platform üzerinden sunulan diğer çevrim içi hizmetleri ifade eder.",
    ],
  },
  {
    title: "3) Sözleşmenin Konusu",
    paragraphs: [
      "İşbu sözleşmenin konusu, alıcının DişFiyat360 platformu üzerinden elektronik ortamda sipariş verdiği kredi paketi, Premium üyelik, klinik paneli erişimi, dijital görünürlük, lead yönetimi veya diğer dijital hizmetlerin satışına, aktivasyonuna, kullanımına, ödemesine, iptaline ve tarafların hak ve yükümlülüklerine ilişkin esasların belirlenmesidir.",
      "Satın alınan hizmetin adı, kapsamı, süresi, miktarı ve toplam bedeli ödeme öncesinde alıcıya gösterilen sipariş özeti ile belirlenir.",
    ],
  },
  {
    title: "4) Sözleşmenin Ticari Niteliği",
    paragraphs: [
      "DişFiyat360 tarafından sunulan ücretli hizmetler esas olarak diş klinikleri, şirketler, işletmeler ve mesleki faaliyet yürüten sağlık hizmeti sağlayıcılarına yöneliktir.",
      "Alıcı, satın alma işlemini ticari veya mesleki faaliyeti kapsamında gerçekleştiriyorsa işlem işletmeler arası dijital hizmet satışı niteliğindedir.",
      "Alıcının yürürlükteki mevzuat kapsamında tüketici sayıldığı istisnai bir durumda, uygulanması zorunlu tüketici mevzuatı hükümleri saklıdır.",
    ],
  },
  {
    title: "5) Hizmetin Niteliği",
    paragraphs: [
      "Satın alınan hizmet fiziksel ürün değildir. Hizmet; elektronik ortamda sunulan kredi, üyelik, panel erişimi, görünürlük, profil yönetimi, lead yönlendirme ve yazılım kullanım haklarından oluşur.",
      "DişFiyat360 üzerinden doğrudan diş tedavisi, muayene, teşhis, reçete, tıbbi danışmanlık veya başka bir sağlık hizmeti satılmaz.",
      "Platform tarafından sunulan ücretli hizmet, kliniğin dijital platform özelliklerinden yararlanmasını sağlar.",
    ],
  },
  {
    title: "6) Sipariş Bilgileri",
    paragraphs: [
      "Alıcı tarafından satın alınan hizmete ilişkin aşağıdaki bilgiler ödeme işlemi tamamlanmadan önce sipariş ekranında gösterilir:",
    ],
    items: [
      "Satın alınan paket veya üyeliğin adı",
      "Paket kapsamında sağlanan kredi miktarı veya dijital haklar",
      "Varsa üyelik veya kullanım süresi",
      "Paketin veya üyeliğin toplam satış bedeli",
      "Ödeme yöntemi",
      "Aktivasyon şekli",
      "Yenileme koşulları",
      "İptal ve iade esaslarına yönlendiren bağlantı",
      "Kullanım Koşulları ve bu sözleşmeye yönlendiren bağlantılar",
    ],
  },
  {
    title: "7) Siparişin Oluşturulması",
    paragraphs: [
      "Alıcı, satın alma ekranında istenen bilgileri girerek, paket detaylarını ve toplam bedeli kontrol ederek ve gerekli sözleşme onaylarını vererek sipariş oluşturur.",
      "Ödeme işleminin banka veya ödeme altyapısı tarafından başarılı olarak onaylanmasıyla sipariş alınmış sayılır.",
      "Ödeme işleminin başarısız olması, banka tarafından reddedilmesi veya teknik olarak tamamlanmaması hâlinde hizmet sağlayıcının hizmeti aktive etme yükümlülüğü doğmaz.",
    ],
  },
  {
    title: "8) Satış Bedeli",
    paragraphs: [
      "Satın alınan hizmetin toplam bedeli, ödeme işlemi öncesinde sipariş ekranında Türk lirası olarak gösterilir.",
      "Alıcının ödeyeceği tutar, ödeme onayı verilmeden önce ekranda gösterilen nihai tutardır.",
      "Paket fiyatları, kampanyalar ve hizmet kapsamları geleceğe yönelik olarak değiştirilebilir. Fiyat değişiklikleri daha önce tamamlanmış siparişlerin bedelini geriye dönük olarak değiştirmez.",
    ],
  },
  {
    title: "9) Vergiler ve Faturalandırma",
    paragraphs: [
      "Satış bedelinin vergisel niteliği ve düzenlenecek mali belge, yürürlükteki vergi mevzuatına ve hizmet sağlayıcının mali yükümlülüklerine göre belirlenir.",
      "Alıcı, fatura veya mali belge düzenlenebilmesi için gerekli unvan, vergi numarası, vergi dairesi, adres ve diğer bilgileri doğru ve eksiksiz vermekle sorumludur.",
      "Yanlış veya eksik fatura bilgisi verilmesinden kaynaklanan sorunlardan alıcı sorumludur.",
    ],
  },
  {
    title: "10) Ödeme Yöntemi",
    paragraphs: [
      "Ödemeler, DişFiyat360 tarafından kullanılan banka, sanal POS veya ödeme hizmeti sağlayıcısı üzerinden gerçekleştirilebilir.",
      "Kart numarası, kart son kullanma tarihi ve güvenlik kodu gibi ödeme kartı bilgileri, kullanılan ödeme altyapısına bağlı olarak doğrudan banka veya ödeme hizmeti sağlayıcısının güvenli sistemlerinde işlenebilir.",
      "DişFiyat360 sistemlerinde ödeme sonucu, işlem tutarı, işlem tarihi, sipariş numarası ve banka işlem referansı gibi kayıtlar tutulabilir.",
    ],
  },
  {
    title: "11) Ödeme Güvenliği",
    paragraphs: [
      "Ödeme işlemleri sırasında banka veya ödeme hizmeti sağlayıcısının güvenlik kontrolleri uygulanabilir.",
      "Şüpheli işlem, yetkisiz kart kullanımı, hatalı ödeme bilgisi veya banka tarafından uygulanan güvenlik kısıtlamaları nedeniyle ödeme reddedilebilir.",
      "Alıcı, yalnızca kullanmaya yetkili olduğu ödeme aracını kullanmakla sorumludur.",
    ],
  },
  {
    title: "12) Hizmetin Aktivasyonu",
    paragraphs: [
      "Satın alınan dijital hizmet, ödemenin başarılı olarak doğrulanmasından sonra sistem tarafından otomatik olarak veya gerekli kontrollerin ardından makul süre içinde klinik hesabına tanımlanır.",
      "Kredi paketi, kredilerin klinik hesabına eklenmesiyle; Premium üyelik ise klinik hesabında Premium statüsünün aktif hâle getirilmesiyle kullanıma sunulmuş sayılır.",
      "Teknik veya güvenlik kontrolü gerektiren durumlarda aktivasyon işlemi geçici olarak bekletilebilir.",
    ],
  },
  {
    title: "13) Hizmetin Başlangıcı",
    paragraphs: [
      "Dijital hizmetin klinik hesabına tanımlanması, panel erişiminin açılması, kredi bakiyesinin yüklenmesi veya Premium üyeliğin aktive edilmesiyle hizmetin ifasına başlanmış sayılır.",
      "Alıcının hesabına giriş yapmaması veya hizmeti fiilen kullanmaması, aktive edilmiş hizmetin başlamadığı anlamına gelmez.",
    ],
  },
  {
    title: "14) Kredi Paketleri",
    paragraphs: [
      "Kredi paketi satın alındığında, sipariş ekranında belirtilen miktarda kredi klinik hesabına tanımlanır.",
      "Bir kredi, platform tarafından ilgili kliniğe yönlendirilmiş uygun bir leadin iletişim bilgilerini görüntüleme hakkı sağlar.",
      "Krediler nakit para değildir, faiz veya getiri sağlamaz, aksi açıkça belirtilmedikçe başka bir hesaba devredilemez ve nakde çevrilemez.",
      "Kredilerin kullanım koşulları ve varsa geçerlilik süresi, satın alma ekranında belirtilen paket açıklamalarına göre uygulanır.",
    ],
  },
  {
    title: "15) Lead İletişim Bilgilerinin Görüntülenmesi",
    paragraphs: [
      "Klinik, kendisine yönlendirilmiş uygun bir leadin iletişim bilgilerini görüntülemek için hesabındaki krediyi kullanabilir.",
      "İletişim bilgileri görüntülendiğinde ilgili kredi kullanılmış sayılır.",
      "Kullanılmış kredi, leadin daha sonra randevuya veya tedaviye dönüşmemesi nedeniyle otomatik olarak iade edilmez.",
    ],
  },
  {
    title: "16) Leadlerin Niteliği ve Garanti Verilmemesi",
    paragraphs: [
      "Lead, bir kullanıcının platform üzerinden oluşturduğu iletişim veya teklif talebidir.",
      "Lead yönlendirilmesi kesin hasta, kesin randevu, kesin tedavi, satış, ciro veya gelir garantisi anlamına gelmez.",
      "Kullanıcının iletişim bilgilerini hatalı girmesi, telefonuna yanıt vermemesi, fikrini değiştirmesi, başka bir kliniği tercih etmesi veya sağlık hizmeti satın almaması mümkündür.",
      "DişFiyat360, her leadin klinik tarafından hastaya dönüştürüleceğini veya belirli bir ticari sonuç sağlayacağını taahhüt etmez.",
    ],
  },
  {
    title: "17) Hatalı veya Mükerrer Leadler",
    paragraphs: [
      "Aynı kullanıcı talebinin sistemsel hata nedeniyle aynı klinik hesabında mükerrer kredi kullanımına neden olması veya açıkça kullanılamaz bir kaydın sistem kaynaklı olarak oluşturulması hâlinde klinik inceleme talebinde bulunabilir.",
      "İnceleme sonucunda sistem kaynaklı mükerrerlik veya teknik hata doğrulanırsa kullanılan kredi hesaba iade edilebilir.",
      "Kullanıcının yanıt vermemesi, randevu oluşturmaması veya tedaviyi kabul etmemesi hatalı lead olarak değerlendirilmez.",
    ],
  },
  {
    title: "18) Premium Üyelik",
    paragraphs: [
      "Premium üyelik, satın alma ekranında belirtilen süre boyunca uygun lead dağıtımlarında standart kliniklere göre öncelik ve ilan edilen diğer dijital avantajları sağlar.",
      "Premium üyelik, tüm leadlerin yalnızca Premium kliniğe gönderileceği, belirli sayıda lead sağlanacağı veya belirli bir gelir elde edileceği anlamına gelmez.",
      "Lead dağıtımı; kullanıcının seçtiği şehir ve hizmet, klinik kapsamı, klinik aktifliği, üyelik durumu, kota ve sistem kuralları dikkate alınarak gerçekleştirilir.",
    ],
  },
  {
    title: "19) Üyelik ve Paket Süresi",
    paragraphs: [
      "Premium üyelik veya süreli başka bir hizmet, satın alma ekranında belirtilen süre boyunca geçerlidir.",
      "Süre, hizmetin aktive edildiği tarih ve saatten itibaren başlar.",
      "Satın alma ekranında 30 günlük kullanım belirtilmişse hizmet, aktivasyon tarihinden itibaren 30 gün boyunca geçerlidir.",
      "Takvim aylarının farklı gün sayılarına sahip olması nedeniyle 30 günlük hizmet, her durumda bir sonraki takvim ayının aynı gününde sona erecek şekilde yorumlanmaz.",
    ],
  },
  {
    title: "20) Otomatik Yenileme",
    paragraphs: [
      "Aksi satın alma ekranında açıkça belirtilmedikçe DişFiyat360 kredi paketleri ve Premium üyelikler otomatik olarak yenilenmez.",
      "Hizmet süresi sona erdiğinde yeni dönem için alıcının yeniden satın alma işlemi gerçekleştirmesi gerekir.",
      "İleride otomatik yenileme özelliği sunulursa yenileme bedeli, ödeme dönemi ve iptal yöntemi satın alma öncesinde ayrıca açıklanır ve gerekli onay alınır.",
    ],
  },
  {
    title: "21) Alıcının Yükümlülükleri",
    items: [
      "Hesap, şirket, klinik, ödeme ve fatura bilgilerini doğru vermek",
      "Klinik hesabının kullanıcı adı ve şifresini korumak",
      "Hesabı yalnızca yetkili kişiler aracılığıyla kullanmak",
      "Lead verilerini yalnızca ilgili kullanıcı talebine dönüş yapmak amacıyla kullanmak",
      "Kişisel verileri yetkisiz üçüncü kişilerle paylaşmamak",
      "Kullanıcılarla hukuka ve mesleki kurallara uygun biçimde iletişim kurmak",
      "Yanıltıcı, rahatsız edici veya talep dışı iletişim faaliyetinde bulunmamak",
      "Platformun güvenliğini tehlikeye düşürecek işlemler yapmamak",
      "Bot, otomasyon, izinsiz veri çekme veya tersine mühendislik faaliyetinde bulunmamak",
      "DişFiyat360 Kullanım Koşulları, Gizlilik Politikası ve ilgili diğer kurallara uymak",
    ],
  },
  {
    title: "22) Lead Verilerinin Kullanılması",
    paragraphs: [
      "Klinik, kendisine iletilen lead bilgilerini yalnızca kullanıcının oluşturduğu talebe dönüş yapmak, bilgi vermek ve kullanıcının istemesi hâlinde randevu sürecini yürütmek amacıyla kullanabilir.",
      "Lead bilgilerinin satılması, yetkisiz üçüncü kişilere aktarılması, kullanıcı talebiyle ilgisi olmayan pazarlama faaliyetlerinde kullanılması veya hukuka aykırı bir veri tabanına eklenmesi yasaktır.",
      "Kliniğin lead verileri üzerinde platform dışında gerçekleştirdiği kişisel veri işleme faaliyetlerinden ilgili klinik sorumludur.",
    ],
  },
  {
    title: "23) Hizmet Sağlayıcının Yükümlülükleri",
    items: [
      "Ödemesi başarıyla tamamlanan hizmeti makul süre içinde aktive etmek",
      "Alıcının satın aldığı paket veya üyelik kapsamını hesabına tanımlamak",
      "Platformun güvenli ve düzenli şekilde çalışması için makul teknik önlemleri almak",
      "Ödeme ve sipariş kayıtlarını gerekli süre boyunca muhafaza etmek",
      "Teknik sorun ve destek taleplerini makul süre içinde incelemek",
      "Kişisel verileri ilgili politika ve mevzuat çerçevesinde işlemek",
    ],
  },
  {
    title: "24) Sağlık Hizmeti Sunulmadığına İlişkin Bilgilendirme",
    paragraphs: [
      "DişFiyat360 bir diş kliniği, hastane, sağlık kuruluşu veya sağlık hizmeti sağlayıcısı değildir.",
      "Platform üzerinden tıbbi teşhis, tedavi planı, reçete, muayene veya kesin tedavi fiyatı sunulmaz.",
      "Sağlık hizmetleri, tedavi kararları, kullanılan malzemeler, randevu, fiyatlandırma ve tedavi sonuçlarından ilgili klinik sorumludur.",
    ],
  },
  {
    title: "25) Kliniklerin Bağımsızlığı",
    paragraphs: [
      "Platformda yer alan klinikler, DişFiyat360'dan bağımsız hizmet sağlayıcılardır.",
      "Klinik ile kullanıcı arasında kurulacak muayene, tedavi, ödeme veya başka bir sağlık hizmeti ilişkisine DişFiyat360 taraf değildir.",
      "Bir kliniğin platformda yer alması, DişFiyat360 tarafından tıbbi yeterlilik, tedavi sonucu veya hizmet kalitesi garantisi verildiği anlamına gelmez.",
    ],
  },
  {
    title: "26) Cayma Hakkı ve Ticari Alımlar",
    paragraphs: [
      "DişFiyat360'ın ücretli hizmetleri esas olarak ticari veya mesleki amaçla hareket eden klinik ve işletmelere sunulmaktadır.",
      "Alıcının satın alma işlemini ticari veya mesleki faaliyeti kapsamında gerçekleştirmesi hâlinde tüketicilere özgü cayma hakkı hükümleri uygulanmayabilir.",
      "Alıcının yürürlükteki mevzuata göre tüketici sayıldığı bir işlemde, emredici mevzuattan kaynaklanan cayma ve diğer tüketici hakları saklıdır.",
    ],
  },
  {
    title: "27) Dijital Hizmetin Derhâl Başlatılması",
    paragraphs: [
      "Alıcı, satın alma ekranında hizmetin ödeme sonrasında derhâl veya kısa süre içinde aktive edileceği konusunda bilgilendirilir.",
      "Kredi paketinin hesaba tanımlanması, Premium üyeliğin aktive edilmesi veya dijital hizmetin kullanıma açılmasıyla hizmetin ifasına başlanır.",
      "Alıcının tüketici sayıldığı ve ilgili mevzuat uyarınca ayrıca onay alınmasının gerektiği durumlarda, dijital hizmetin cayma süresi sona ermeden başlatılmasına ilişkin onay satın alma ekranında ayrıca alınabilir.",
    ],
  },
  {
    title: "28) İptal ve İade",
    paragraphs: [
      "İptal ve iade talepleri, satın alınan hizmetin aktive edilip edilmediği, kredilerin kullanılıp kullanılmadığı, Premium üyelik avantajlarından yararlanılıp yararlanılmadığı, mükerrer tahsilat ve teknik sorunlar dikkate alınarak incelenir.",
      "Kullanılmış kredi, görüntülenmiş lead veya yararlanılmış dijital hizmet için kural olarak iade yapılmaz.",
      "Mükerrer ödeme, yanlış tahsilat veya hizmet sağlayıcı kaynaklı olarak hizmetin hiç sunulamaması durumlarında kısmi veya tam iade yapılabilir.",
      "Ayrıntılı koşullar İptal ve İade Politikası sayfasında yer almaktadır.",
    ],
  },
  {
    title: "29) İade Başvurusu",
    paragraphs: [
      "İptal veya iade talebinin incelenebilmesi için alıcının aşağıdaki bilgilerle birlikte hizmet sağlayıcıya başvurması gerekir:",
    ],
    items: [
      "Klinik veya işletme adı",
      "Klinik hesabında kullanılan e-posta adresi",
      "Satın alınan paket veya üyeliğin adı",
      "Ödeme tarihi ve tutarı",
      "Varsa sipariş veya banka işlem referansı",
      "İptal veya iade talebinin gerekçesi",
    ],
  },
  {
    title: "30) İadenin Yapılması",
    paragraphs: [
      "İade talebinin kabul edilmesi hâlinde iade, teknik olarak mümkün olduğu ölçüde ödemenin gerçekleştirildiği ödeme aracına yapılır.",
      "Bankaların ve ödeme altyapılarının işlem süreleri nedeniyle iade tutarının karta veya hesaba yansıması ek süre alabilir.",
      "İade tamamlandığında ilgili kredi, Premium üyelik süresi veya dijital kullanım hakkı klinik hesabından geri alınabilir.",
    ],
  },
  {
    title: "31) Mükerrer ve Hatalı Tahsilat",
    paragraphs: [
      "Aynı sipariş için birden fazla tahsilat yapılması veya sipariş ekranında gösterilen tutardan farklı bir tutarın tahsil edilmesi hâlinde alıcı hizmet sağlayıcıyla iletişime geçebilir.",
      "Ödeme ve banka kayıtları incelendikten sonra mükerrer ya da hatalı olduğu doğrulanan tahsilat düzeltilir veya iade edilir.",
    ],
  },
  {
    title: "32) Kampanyalar ve Promosyonlar",
    paragraphs: [
      "Kampanya, indirim, kupon veya özel fiyatla satın alınan hizmetlerde işlem, alıcının fiilen ödediği tutar üzerinden değerlendirilir.",
      "Ücretsiz verilen promosyon kredileri, deneme süreleri veya ek dijital haklar nakde çevrilemez.",
      "Kampanyaların süresi, kapsamı ve kullanım şartları ilgili kampanya ekranında ayrıca belirtilir.",
    ],
  },
  {
    title: "33) Hesabın Askıya Alınması veya Kapatılması",
    paragraphs: [
      "Alıcının yanıltıcı bilgi vermesi, lead verilerini amacı dışında kullanması, üçüncü kişilere ait bilgileri izinsiz kullanması, platform güvenliğini ihlal etmesi veya sözleşme koşullarına ciddi şekilde aykırı davranması hâlinde hesabı geçici olarak askıya alınabilir.",
      "Ciddi veya tekrarlanan ihlallerde hesap kapatılabilir ve platform erişimi engellenebilir.",
      "Hukuka aykırı kullanım nedeniyle hesabın kapatılması hâlinde kullanılmamış dijital haklar için iade yapılmayabilir.",
    ],
  },
  {
    title: "34) Hizmet Kesintileri",
    paragraphs: [
      "Bakım, güncelleme, güvenlik müdahalesi, internet kesintisi, veri merkezi sorunu, banka sistemi arızası veya üçüncü taraf altyapı kesintileri nedeniyle platform geçici olarak kullanılamayabilir.",
      "Hizmet sağlayıcı, platformun güvenli ve düzenli şekilde çalışması için makul çaba gösterir ancak hizmetin her zaman kesintisiz ve hatasız çalışacağını garanti etmez.",
      "Uzun süreli ve hizmet sağlayıcı kaynaklı kesintilerde hizmet süresi uzatılabilir veya uygun başka bir telafi yöntemi uygulanabilir.",
    ],
  },
  {
    title: "35) Mücbir Sebep",
    paragraphs: [
      "Doğal afet, savaş, terör, salgın, genel internet kesintisi, enerji kesintisi, kamu otoritesi kararı, siber saldırı, veri merkezi arızası, banka veya ödeme sistemi kesintisi ve tarafların makul kontrolü dışında gelişen benzeri durumlar mücbir sebep olarak değerlendirilebilir.",
      "Mücbir sebep nedeniyle yükümlülüklerin geçici olarak yerine getirilememesinden etkilenen taraf, durumun koşullarına göre sorumlu tutulmayabilir.",
    ],
  },
  {
    title: "36) Fikri Mülkiyet Hakları",
    paragraphs: [
      "DişFiyat360 adı, logosu, yazılımı, tasarımı, veri tabanı yapısı, metinleri ve özgün içerikleri üzerindeki haklar, aksi açıkça belirtilmedikçe hizmet sağlayıcıya veya ilgili hak sahibine aittir.",
      "Alıcıya yalnızca satın aldığı hizmet süresince ve hizmetin amacıyla sınırlı bir kullanım hakkı verilir.",
      "Platformun veya içeriklerin izinsiz kopyalanması, çoğaltılması, satılması, dağıtılması veya başka bir sistemde kullanılması yasaktır.",
    ],
  },
  {
    title: "37) Kişisel Verilerin Korunması",
    paragraphs: [
      "Kişisel veriler, DişFiyat360 KVKK Aydınlatma Metni, Gizlilik Politikası ve Çerez Politikası kapsamında işlenir.",
      "Alıcı, klinik hesabı üzerinden eriştiği kullanıcı bilgilerini yalnızca ilgili talep kapsamında ve yürürlükteki kişisel verilerin korunması kurallarına uygun olarak kullanmalıdır.",
      "Alıcının platform dışında gerçekleştirdiği veri işleme faaliyetlerinden doğan hukuki sorumluluk kendisine aittir.",
    ],
  },
  {
    title: "38) Ticari Elektronik İletiler",
    paragraphs: [
      "Kullanıcıya yalnızca oluşturduğu talebe dönüş yapmak amacıyla iletişim kurulması, sınırsız pazarlama izni anlamına gelmez.",
      "Alıcı, ticari elektronik ileti gönderirken yürürlükteki mevzuata, iletişim izinlerine ve kullanıcının tercihine uymakla sorumludur.",
    ],
  },
  {
    title: "39) Sorumluluğun Sınırı",
    paragraphs: [
      "DişFiyat360, klinik ile kullanıcı arasında kurulacak sağlık hizmeti, tedavi, randevu, ödeme veya başka bir sözleşmenin tarafı değildir.",
      "DişFiyat360, bir leadin randevuya, hastaya, tedaviye, satışa veya gelire dönüşeceğini garanti etmez.",
      "Kliniklerin sunduğu hizmetlerin kalitesi, tedavi sonucu, fiyatı, personeli, ruhsatı, tıbbi değerlendirmesi ve kullanıcıyla kurduğu ilişkiden ilgili klinik sorumludur.",
      "Emredici mevzuattan kaynaklanan sorumluluklar saklı olmak üzere, alıcının beklenen kazanç, müşteri veya ticari fırsat kaybından dolayı hizmet sağlayıcı sorumlu tutulamaz.",
    ],
  },
  {
    title: "40) Delil ve Elektronik Kayıtlar",
    paragraphs: [
      "Taraflar arasında doğabilecek uyuşmazlıklarda, hukuka uygun şekilde tutulan sipariş, ödeme, aktivasyon, hesap, kredi kullanımı, lead görüntüleme, e-posta, sistem ve güvenlik kayıtları delil olarak değerlendirilebilir.",
      "Bu hüküm, tarafların kanunen sahip olduğu başka delil sunma haklarını ortadan kaldırmaz.",
    ],
  },
  {
    title: "41) Bildirimler",
    paragraphs: [
      "Alıcıya ilişkin sipariş, ödeme, aktivasyon, güvenlik ve hizmet bildirimleri, klinik hesabında kayıtlı e-posta adresine veya platform içi bildirim kanallarına gönderilebilir.",
      "Alıcı, iletişim ve hesap bilgilerinin güncel tutulmasından sorumludur.",
    ],
  },
  {
    title: "42) Sözleşmenin Kurulması ve Saklanması",
    paragraphs: [
      "Alıcının satın alma ekranında gerekli sözleşme onaylarını vermesi ve ödeme işlemini tamamlamasıyla sözleşme elektronik ortamda kurulur.",
      "Sipariş ve sözleşme onay kayıtları, yasal ve operasyonel gereklilikler doğrultusunda elektronik ortamda saklanabilir.",
      "Alıcı, sözleşmenin güncel hâline internet sitesi üzerinden erişebilir.",
    ],
  },
  {
    title: "43) Sözleşmenin Bütünlüğü",
    paragraphs: [
      "Sipariş ekranında gösterilen paket bilgileri, ödeme özeti, Kullanım Koşulları, İptal ve İade Politikası, Gizlilik Politikası ve ilgili diğer metinler işbu sözleşmeyle birlikte değerlendirilir.",
      "Siparişe özgü paket adı, tutar, kredi miktarı ve süre bilgilerinde sipariş ekranında alıcı tarafından onaylanan kayıtlar esas alınır.",
    ],
  },
  {
    title: "44) Sözleşmede Değişiklik",
    paragraphs: [
      "Hizmet sağlayıcı, mevzuat, iş modeli, teknik altyapı veya hizmet kapsamındaki değişiklikler nedeniyle bu sözleşmeyi güncelleyebilir.",
      "Güncellenen sözleşme, internet sitesinde yayımlandığı tarihten sonraki yeni siparişler bakımından uygulanır.",
      "Daha önce tamamlanan bir siparişe ilişkin temel fiyat, süre ve paket hakları alıcının aleyhine geriye dönük olarak değiştirilemez.",
    ],
  },
  {
    title: "45) Uyuşmazlıkların Çözümü",
    paragraphs: [
      "Taraflar, uyuşmazlık hâlinde öncelikle iletişim kanalları üzerinden uzlaşma sağlamaya çalışır.",
      "Ticari veya mesleki amaçla gerçekleştirilen işletmeler arası işlemlerde görevli ve yetkili mahkeme ile icra daireleri, yürürlükteki usul ve ticaret mevzuatına göre belirlenir.",
      "Alıcının yürürlükteki mevzuat kapsamında tüketici sayıldığı durumlarda, tüketici hakem heyetleri ve tüketici mahkemelerine ilişkin zorunlu yetki hükümleri saklıdır.",
    ],
  },
  {
    title: "46) Yürürlük",
    paragraphs: [
      "İşbu sözleşme, alıcının satın alma ekranında sözleşmeyi okuyup kabul ettiğini onaylaması ve ödeme işlemini tamamlamasıyla yürürlüğe girer.",
      "Sözleşmenin alıcı tarafından onaylanmaması hâlinde ücretli satın alma işlemi tamamlanmaz.",
    ],
  },
  {
    title: "47) İletişim",
    paragraphs: [
      "Sözleşme, ödeme, paket aktivasyonu, iptal, iade veya destek talepleriniz için aşağıdaki iletişim kanallarını kullanabilirsiniz.",
    ],
    items: [
      "E-posta: ferhatmenekse945@gmail.com",
      "Telefon: 0531 917 17 39",
      "Adres: Dumlupınar Mahallesi, 38007 Sokak No:4, Seyhan / Adana",
    ],
  },
];

export default function DistanceSalesPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">
                🧾 Mesafeli Satış ve Dijital Hizmet Sözleşmesi
              </div>

              <h1
                className="h1"
                style={{
                  fontSize: 34,
                  marginTop: 10,
                }}
              >
                Mesafeli Satış ve{" "}
                <span className="grad">Dijital Hizmet Sözleşmesi</span>
              </h1>

              <p
                className="heroDesc"
                style={{
                  maxWidth: 820,
                }}
              >
                Bu sözleşme, DişFiyat360 üzerinden kliniklere sunulan kredi
                paketleri, Premium üyelik, klinik paneli, dijital görünürlük,
                lead yönetimi ve diğer çevrim içi hizmetlere ilişkin satış ve
                kullanım koşullarını düzenler.
              </p>

              <div
                className="miniRow"
                style={{
                  marginTop: 10,
                }}
              >
                <span className="miniItem">🏢 B2B dijital hizmet</span>
                <span className="miniItem">💳 Güvenli ödeme</span>
                <span className="miniItem">📄 Şeffaf sözleşme</span>
              </div>

              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 18,
                  border: "1px solid rgba(79,70,229,0.16)",
                  background:
                    "linear-gradient(135deg, rgba(238,242,255,0.92), rgba(255,255,255,0.84))",
                  color: "rgba(15,23,42,0.72)",
                  fontWeight: 750,
                  lineHeight: 1.7,
                }}
              >
                <strong
                  style={{
                    color: "rgba(15,23,42,0.92)",
                  }}
                >
                  Son güncelleme:
                </strong>{" "}
                17 Temmuz 2026
              </div>

              <div className="section">
                <div
                  className="sectionBox"
                  style={{
                    background: "rgba(255,255,255,0.82)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    <ImportantNotice />

                    <OrderNotice />

                    {CONTRACT_BLOCKS.map((block) => (
                      <ContractCard key={block.title} block={block} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="section" style={{ paddingTop: 0 }}>
                <div
                  className="finalCta"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(124,58,237,0.06))",
                  }}
                >
                  <div>
                    <h2
                      className="finalTitle"
                      style={{
                        fontSize: 18,
                      }}
                    >
                      Lead Garantisi Bulunmaz
                    </h2>

                    <p className="finalDesc">
                      Kredi kullanımı, kliniğe yönlendirilmiş bir kullanıcının
                      iletişim bilgilerini görüntüleme hakkı sağlar. Leadin
                      randevuya, hastaya, tedaviye veya gelire dönüşeceği garanti
                      edilmez.
                    </p>
                  </div>

                  <Link href="/panel/abonelik" className="btn btnPrimary">
                    Paketleri İncele →
                  </Link>
                </div>
              </div>

              <div className="ctaRow">
                <Link href="/teslimat-iade" className="btn btnSoft">
                  Teslimat ve İade Şartları →
                </Link>

                <Link href="/iptal-iade" className="btn btnGhost">
                  İptal ve İade Politikası →
                </Link>

                <Link href="/iletisim" className="btn btnPrimary">
                  İletişim →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ImportantNotice(): JSX.Element {
  return (
    <article
      style={{
        border: "1px solid rgba(245,158,11,0.28)",
        background:
          "linear-gradient(135deg, rgba(255,251,235,0.96), rgba(255,255,255,0.92))",
        borderRadius: 20,
        padding: 16,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontWeight: 950,
          fontSize: 17,
          lineHeight: 1.4,
          color: "rgba(120,53,15,0.94)",
        }}
      >
        Önemli Bilgilendirme
      </h2>

      <p
        style={{
          margin: "9px 0 0",
          color: "rgba(120,53,15,0.78)",
          fontWeight: 750,
          lineHeight: 1.78,
        }}
      >
        DişFiyat360 sağlık hizmeti sunmaz. Satın alınan hizmet; kredi paketi,
        Premium üyelik, panel erişimi, dijital görünürlük ve lead yönetimi gibi
        çevrim içi hizmetlerden oluşur. Lead yönlendirilmesi kesin hasta,
        randevu, tedavi veya gelir garantisi sağlamaz.
      </p>
    </article>
  );
}

function OrderNotice(): JSX.Element {
  return (
    <article
      style={{
        border: "1px solid rgba(79,70,229,0.18)",
        background:
          "linear-gradient(135deg, rgba(238,242,255,0.94), rgba(255,255,255,0.90))",
        borderRadius: 20,
        padding: 16,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontWeight: 950,
          fontSize: 17,
          lineHeight: 1.4,
          color: "rgba(15,23,42,0.94)",
        }}
      >
        Siparişe Özgü Bilgiler
      </h2>

      <p
        style={{
          margin: "9px 0 0",
          color: "rgba(15,23,42,0.72)",
          fontWeight: 750,
          lineHeight: 1.78,
        }}
      >
        Satın alınan paketin adı, kredi miktarı, Premium üyelik süresi, toplam
        bedeli ve aktivasyon bilgileri ödeme öncesindeki sipariş özetinde
        gösterilir. Sipariş ekranında onaylanan bilgiler, bu sözleşmenin
        siparişe özgü ayrılmaz parçasıdır.
      </p>
    </article>
  );
}

function ContractCard({
  block,
}: {
  block: ContractBlock;
}): JSX.Element {
  return (
    <article
      style={{
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(255,255,255,0.86)",
        borderRadius: 20,
        padding: 16,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontWeight: 950,
          fontSize: 17,
          lineHeight: 1.4,
          color: "rgba(15,23,42,0.94)",
        }}
      >
        {block.title}
      </h2>

      {block.paragraphs?.map((paragraph) => (
        <p
          key={paragraph}
          style={{
            margin: "9px 0 0",
            color: "rgba(15,23,42,0.72)",
            fontWeight: 750,
            lineHeight: 1.78,
          }}
        >
          {paragraph}
        </p>
      ))}

      {block.items ? (
        <ul
          style={{
            margin: "10px 0 0",
            paddingLeft: 20,
          }}
        >
          {block.items.map((item) => (
            <li
              key={item}
              style={{
                marginTop: 7,
                color: "rgba(15,23,42,0.72)",
                fontWeight: 750,
                lineHeight: 1.75,
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}