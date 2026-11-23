const interview = [
  ['Bir legacy sistemi taşırken Strangler Fig ve Anti-Corruption Layer nasıl birlikte çalışır?', 'Önce sınırı net ve geri dönüşü kolay bir akış seçerim. Strangler Fig (eski sistemi parça parça yenisiyle değiştirme) ile o akışın trafiğini yeni servise yönlendiririm. Anti-Corruption Layer (iki sistemin modelleri arasında çeviri yapan katman), eski veri ve API modellerini yeni domain modeline (iş kurallarını temsil eden veri yapısına) çevirir. Bir backend geçişinde Golang proxy’leri (isteği başka servise ileten ara servisler) kullanmıştık. Benzer bir geçişte hata oranını ve gecikmeyi iki tarafta ölçer, eşikler aşılırsa trafiği eski rotaya alırım.'],
  ['Distributed lock ne zaman gerekir, lease süresi dolarsa ne yaparsın?', 'Birden çok worker aynı kaynağı değiştirecekse önce unique constraint (aynı değerin iki kez kaydedilmesini engelleyen veritabanı kuralı) veya optimistic concurrency (yazmadan önce kaydın arada değişip değişmediğini kontrol etme) ile problemi çözebilir miyim diye bakarım. Lock gerekiyorsa lease (lock’u belirli bir süre tutma hakkı) ve sahiplik token’ı (lock’u kimin aldığını gösteren kimlik) kullanırım. Eski worker (arka planda iş yapan süreç) lease dolduktan sonra hâlâ çalışıyor olabilir. Bu durumda yazma yapılan sistem artan fencing token’ı (lock her alındığında artan sıra numarası) doğrulayıp eski worker’ın yazmasını reddetmeli. Sahiplik kontrolü yapmadan lock’u silmem.'],
  ['Bir API isteğini nasıl idempotent yaparsın?', 'İstemciden bir idempotency key (tekrar gönderilen aynı işlemi tanıtan anahtar) alırım ve bunu müşteri ile operasyon kapsamında benzersiz tutarım. Aynı key ve payload (isteğin taşıdığı veri) tekrar gelirse önceki sonucu döndürürüm. Payload farklıysa isteği reddederim. İş sonucuyla key kaydını mümkünse aynı transaction (birlikte tamamlanan ya da geri alınan veritabanı işlemleri) içinde yazarım. Harici servis de işin içindeyse ona aynı key’i iletirim veya sonucu reconciliation (iki sistemdeki işlem sonuçlarını karşılaştırıp farkları giderme) ile doğrularım.'],
  ['Veritabanı kaydı güncellendi ama event yayınlanamadı. Nasıl çözersin?', 'Domain değişikliğiyle outbox kaydını (daha sonra yayınlanacak event’in veritabanındaki kaydı) aynı transaction (birlikte tamamlanan ya da geri alınan veritabanı işlemleri) içinde yazarım. Ayrı bir worker (arka planda iş yapan süreç) commit edilmiş outbox kayıtlarını broker (mesajları servisler arasında taşıyan sistem)’a gönderir. Gönderimden sonra worker durursa event tekrar yayınlanabilir. Consumer tarafında event ID ile deduplication (tekrar gelen event’i ayıklama) yaparım ve aynı kayda ait olaylarda sıra gerekiyorsa version kontrolü eklerim.'],
  ['Retry pattern ve dead-letter queue’yu nasıl birlikte kullanırsın?', 'Timeout gibi geçici hatalarda exponential backoff (her denemede beklemeyi artırma) ve jitter (beklemeye küçük rastgele farklar ekleme) ile sınırlı sayıda retry (başarısız işlemi yeniden deneme) yaparım. Şeması hatalı bir event’i tekrar denemek yerine DLQ’ya (işlenemeyen mesajların ayrıldığı kuyruk) alırım. Saatlik raporlamada offset (son tamamlanan zaman diliminin işaretçisi) son tamamlanan dilimi gösterir. Sonuç kalıcı hale gelmeden offset’i ilerletmem. DLQ kaydına hata nedeni ve zaman aralığını eklerim ki düzeltmeden sonra ilgili raporu güvenle yeniden hesaplayabilelim.'],
  ['Event streaming platformunda partition key’i neye göre seçersin?', 'Önce hangi olayların sırasının korunması gerektiğini belirlerim. Aynı siparişe ait olaylar sıralı olmalıysa order ID uygun bir adaydır. Dağılımı gerçek trafik üzerinden kontrol ederim. Tek bir müşteri yükün büyük kısmını oluşturuyorsa müşteri ID’si hot partition (yükün tek bölüme yığılması) yaratabilir. Consumer (mesajı alıp işleyen servis) lag’i (işlenmeyi bekleyen mesaj sayısı) partition bazında izlerim.'],
  ['Circuit breaker ile retry arasındaki ilişkiyi nasıl tasarlarsın?', 'Retry geçici bir hatadan kurtulmak için sınırlı sayıda yeniden deneme yapar. Circuit breaker (sürekli hata veren servise çağrıları geçici olarak kesen mekanizma) ise bağımlılık sürekli hata verdiğinde çağrıları bir süre durdurur. İlk olarak her istek için bir zaman bütçesi belirlerim. Birden fazla katmana retry (başarısız işlemi yeniden deneme) eklememeye dikkat ederim. Breaker açıldığında işlemin türüne göre anlamlı bir fallback (esas işlem çalışmadığında devreye alınan alternatif davranış) veya hızlı bir hata döndürürüm.'],
  ['Saga kullanırken compensation adımını nasıl tasarlarsın?', 'Her servisin kendi transaction (birlikte tamamlanan ya da geri alınan veritabanı işlemleri)’ı olur. Sonraki adım başarısız olduğunda önceki işin etkisini iş kurallarına uygun bir işlemle telafi ederim. Örneğin stok rezervasyonunu serbest bırakırım. Compensation (önceki işin etkisini telafi eden adım) da hata alabilir. Durumunu kalıcı tutar, idempotent (tekrarlandığında aynı sonucu veren) yapar ve otomatik toparlanamayan işlemleri incelemeye açarım.'],
  ['Cache invalidation için nasıl karar verirsin?', 'Önce verinin ne kadar eski olmasına izin verebildiğimizi belirlerim. Cache-aside (veriyi ilk okumada cache’e alma) kullanıyorsam yazma commit olduktan sonra ilgili key’i silerim. TTL (cache kaydının geçerlilik süresi) eklerim ve yoğun okunan key’lerde aynı anda çok sayıda cache miss (aranan verinin cache’te bulunmaması) oluşmasını engellerim. Yetki gibi hassas kararlarda güncellik şartını ayrıca ele alırım.'],
  ['Production’da SQL sorgusu yavaşladı. Nereden başlarsın?', 'Önce yavaşlığın tek sorguda mı yoksa sistem genelinde mi olduğunu ölçerim. Execution plan (veritabanının sorguyu hangi adımlarla çalıştırdığı), bekleme türleri ve okunan satır sayısına bakarım. Index eklemeden önce sorgunun filtrelerini ve veri dağılımını incelerim. Index’in yazma maliyetini de hesaba katıp sonucu gerçekçi veriyle karşılaştırırım.'],
  ['SQL partitioning ne zaman fayda sağlar?', 'Zamana göre büyüyen rapor tablolarında tarih aralığıyla sorgulama ve eski veriyi yönetme ihtiyacı varsa partitioning (tabloyu yönetilebilir bölümlere ayırma) değerlendiririm. Sorgular partition key (verinin hangi bölüme gideceğini belirleyen alan)’e göre filtrelenirse partition elimination (sorguyla ilgisi olmayan bölümleri atlama) işe yarayabilir. Beklenen sorguların planını ve bakım maliyetini ölçerim. Tek başına partitioning, yetersiz index (veritabanında kayıtlara erişimi hızlandıran yapı) tasarımını çözmez.'],
  ['Bir API’de cursor pagination nasıl tasarlanır?', 'Sıralamayı deterministik (aynı veride her zaman aynı sırayı üreten) yapmak için örneğin createdAt ve benzersiz ID’yi birlikte kullanırım. Cursor (sonraki sayfanın nereden başlayacağını gösteren işaretçi) son kaydın sıralama değerlerini taşır. Yeni sayfa bu değerlerden sonraki kayıtları okur. İlgili index (veritabanında kayıtlara erişimi hızlandıran yapı)’i sıralamayla uyumlu kurarım. Sonuçların sayfalar arasında sabit kalması gerekiyorsa snapshot (verinin belirli bir andaki görünümü) veya sabit bir üst sınır düşünürüm.'],
  ['Bir consumer aynı mesajı iki kez alırsa nasıl davranmalı?', 'İlk denemede sonuç yazılıp mesaj broker (mesajları servisler arasında taşıyan sistem)’a onaylanmadan süreç durmuş olabilir. Consumer (mesajı alıp işleyen servis) işlemi event ID üzerinden tanır. Deduplication kaydıyla iş sonucunu aynı transaction (birlikte tamamlanan ya da geri alınan veritabanı işlemleri) içinde tutar, iş tamamlandıktan sonra mesajı onaylarım. Harici çağrı varsa idempotency key veya sonradan doğrulama akışı gerekir.'],
  ['Optimistic concurrency ile pessimistic locking arasında nasıl seçim yaparsın?', 'Çakışma seyrekse version alanıyla (kayda her değişiklikte verilen sürüm numarasıyla) optimistic concurrency (kayıt arada değişmediyse yazmaya izin verme) kullanırım. Yazma sırasında version değişmişse işlemi reddedip güncel veriyi okurum. Çakışmanın sık olduğu ve işlemin kısa sürdüğü bir bölümde pessimistic lock (çakışmayı önlemek için kaydı işlem boyunca kilitleme) uygun olabilir. Bu durumda lock süresini, deadlock (iki işlemin birbirinin kilidini bekleyip ilerleyememesi) riskini ve throughput (birim zamanda tamamlanan iş sayısı) etkisini ölçerim.'],
  ['Bir servis yavaşladığında hangi metrikleri incelersin?', 'Önce p95 ve p99 gecikmeye (isteklerin sırasıyla yüzde 95’inin ve 99’unun altında tamamlandığı süreler), hata oranına ve istek hacmine bakarım. Yavaşlığın hangi endpoint (API’de belirli bir işlemin adresi) veya bağımlılıktan geldiğini trace’lerle (bir isteğin servisler arasındaki yolunu gösteren kayıtlarla) daraltırım. Event işleyen sistemlerde consumer lag (mesaj üretimiyle işleme arasındaki fark) ve son başarılı işleme zamanı da önemlidir. Dashboard’u kullanıcının yaşadığı etkiyi ve sorunun yerini birlikte gösterecek şekilde kurarım.'],
  ['Backpressure’ı nasıl uygularsın?', 'Sınırsız queue ile sorunu belleğe taşımak yerine bekleyen iş sayısını ve worker (arka planda iş yapan süreç) concurrency’sini (aynı anda çalışan iş sayısını) sınırlarım. Kapasite dolduğunda çağrıyı reddetmek, yavaşlatmak veya dayanıklı bir queue’ya yönlendirmek işin önceliğine bağlıdır. Queue derinliğiyle (kuyrukta bekleyen iş sayısıyla) birlikte en eski işin yaşını izlerim.'],
  ['Production’da database değişikliğini kesintisiz nasıl yayınlarsın?', 'Önce eski uygulamayla uyumlu bir şema değişikliği yaparım. Yeni uygulamayı yayınlar, gerekiyorsa geçmiş veriyi küçük dilimlerle taşırım. Okuma akışını değiştirmeden önce eski ve yeni sonuçları karşılaştırırım. Eski kolon ya da sözleşmeyi ancak tüm kullanıcıları taşındıktan sonra kaldırırım.'],
  ['Fiziksel bir cihaza güvenli deployment nasıl yapılır?', 'Tek işlem çalıştıran bir cihazda controller (cihazın güncelleme sürecini yöneten uygulama) önce aktif işlemin bitmesini bekler. Ardından cihazı bakım moduna alır ve yeni paketi ayrı bir dizine açar. Paketi doğrulayıp uygulamayı yeni sürümle başlatır. Sağlık kontrolü başarısız olduğunda önceki sürüme dönülebilecek bir akış tasarlarım.'],
  ['Bir event şemasını kırmadan nasıl değiştirirsin?', 'Önce eski consumer (mesajı alıp işleyen servis)’ların yeni mesajı okuyabildiğini doğrularım. Yeni alanları mümkünse optional (gönderilmesi zorunlu olmayan) eklerim ve alanların anlamını değiştirmem. Kırıcı değişiklik gerekiyorsa yeni bir version yayınlarım. Producer (mesajı yayınlayan servis) ve consumer geçişini kullanım metrikleriyle takip eder, eski version’ı tüm tüketiciler taşındıktan sonra kapatırım.'],
  ['Bir teknik tasarım kararını RFC’de (ekip görüşüne açılan teknik tasarım dokümanı) nasıl savunursun?', 'RFC (ekibin değerlendirmesine açılan teknik tasarım belgesi) hazırlarken önce ürün hedefini ve ölçülebilir kısıtları yazarım. Birkaç uygulanabilir seçeneği operasyon maliyeti, hata senaryoları ve entegrasyon riski açısından karşılaştırırım. Seçtiğim yaklaşımı hangi koşulda gözden geçireceğimizi de belirtirim. Karar alındığında işi doğrulanabilir task’lara böler, yayına çıktıktan sonra sonuçları dashboard (sistem metriklerini bir arada gösteren ekran)’da takip ederim.']
];

const progress = document.querySelector('#progress');
const question = document.querySelector('#question');
const answer = document.querySelector('#answer');
const response = document.querySelector('#response');
const next = document.querySelector('#next');
const skip = document.querySelector('#skip');
let index = 0;
let frame;

function finish() {
  cancelAnimationFrame(frame);
  [question.textContent, response.textContent] = interview[index];
  answer.hidden = false;
  skip.hidden = true;
  next.hidden = false;
}

function showTurn() {
  const [prompt, reply] = interview[index];
  progress.textContent = (index + 1) + ' / ' + interview.length;
  question.textContent = '';
  response.textContent = '';
  answer.hidden = true;
  next.hidden = true;
  next.textContent = index === interview.length - 1 ? 'Yeniden başla ↻' : 'Sonraki soru →';
  skip.hidden = false;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finish();
    return;
  }
  const start = performance.now();
  const answerStart = prompt.length * 23 + 450;
  function type(now) {
    const elapsed = now - start;
    question.textContent = prompt.slice(0, elapsed / 23);
    if (elapsed >= answerStart) {
      answer.hidden = false;
      response.textContent = reply.slice(0, (elapsed - answerStart) / 9);
      if (response.textContent === reply) {
        finish();
        return;
      }
    }
    frame = requestAnimationFrame(type);
  }
  frame = requestAnimationFrame(type);
}

skip.onclick = () => {
  finish();
  next.focus();
};
next.onclick = () => {
  index = (index + 1) % interview.length;
  showTurn();
  window.scrollTo(0, 0);
  (next.hidden ? skip : next).focus();
};
showTurn();
