(() => {
  const scene = document.querySelector('#mimeda');
  const road = scene.querySelector('svg');
  const car = road.querySelector('.media-car');
  const journal = scene.querySelector('.media-story');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stops = [
    'Sistemin tamamını küçük bir ekiple yönetiyorduk. İlk iş olarak DevOps ekibiyle birlikte Azure üzerinde CI/CD süreçlerinin kurulmasını yönettim.',
    'Android ve iOS için bir SDK geliştirdim. Migros uygulamalarındaki ad event’lerini toplamaya başladık. Bu veri akışı milyarlarca eventi işledi.',
    'Attribution window ile bir satışın hangi süre içinde önceki reklam etkileşimiyle ilişkilendirileceğini belirledik. Saatlik Hangfire işleri BigQuery verisini işleyip sonuçları rapor veritabanına yazıyordu.',
    'Her iş, tamamladığı saati kaydediyordu. Durursa son kayıttan devam ediyordu. Böylece bir saat geriden gelen raporlarda veri boşluğu oluşmuyordu. Şimdi SQL verisini partition’larla yönetmek üzerine çalışıyorum.',
    'İzleme altyapısının ve dashboard’ların sorumluluğu bende. Ekibin ihtiyaç duyduğu yeni dashboard’ları da hazırlıyorum.',
    'Büyük işleri RFC ile tanımlıyor, görevlere bölüyor ve ekibe liderlik ediyorum. OpenAI entegrasyonu ile yeni bir kampanya tipi üzerinde Migros’la birlikte çalışıyoruz. Eski projeleri yenilemeye hazırlık olarak ekibe Strangler Fig ve Anti-Corruption Layer kalıplarını anlatıyorum.'
  ];
  const interval = 4300;
  const duration = interval * stops.length;
  const bids = [['Teklif bekleniyor', '—'], ['Kampanya A', '12 ₺ CPM'], ['Kampanya B', '15 ₺ CPM'], ['Kampanya A', '18 ₺ CPM'], ['Kazanan: A', '18 ₺ CPM']];
  let elapsed = 0, previous, frame, width = 640;
  const paragraphs = stops.map(story => {
    const p = document.createElement('p');
    const typed = document.createTextNode('');
    const remaining = document.createElement('span');
    remaining.style.visibility = 'hidden';
    remaining.textContent = story;
    p.append(typed, remaining);
    journal.append(p);
    return {story, typed, remaining, p};
  });
  const technologies = ['Azure Cloud', '.NET', 'CI/CD', 'Android', 'iOS', 'Event Hubs', 'BigQuery', 'Hangfire', 'MS SQL', 'Partitioning', 'New Relic', 'Grafana', 'Elasticsearch', 'Redis', 'OpenAI'];
  const trail = road.querySelector('.media-trail');
  const carX = time => 10 + 779 * Math.min(1, time / (duration - 1100));
  const drops = technologies.map((name, i) => {
    const group = document.createElementNS(road.namespaceURI, 'g');
    group.innerHTML = '<g class="exhaust"><circle r="6"/><circle cx="-6" cy="-2" r="4"/><circle cx="5" cy="2" r="4"/></g><text text-anchor="middle" y="3"></text>';
    group.lastElementChild.textContent = name;
    trail.append(group);
    return {group, smoke:group.firstElementChild, start:600+i*1570};
  });
  const exitDoor = road.querySelector('.media-exit');
  const finale = scene.querySelector('.media-finale');
  let returnTimer;
  exitDoor.addEventListener('click', event => {
    event.preventDefault();
    if (elapsed < duration || finale.open) return;
    finale.showModal();
    returnTimer = setTimeout(() => location.assign(exitDoor.getAttribute('href')), 2400);
  });
  finale.addEventListener('close', () => clearTimeout(returnTimer));
  window.addEventListener('pagehide', () => { if (finale.open) finale.close(); });
  let activeParagraph;
  function draw() {
    paragraphs.forEach(({story, typed, remaining, p}, i) => {
      const age = elapsed - i * interval;
      const length = Math.floor(story.length * Math.min(1, Math.max(0, age / 3300)));
      if (typed.length !== length) {
        typed.data = story.slice(0, length);
        remaining.textContent = story.slice(length);
      }
      p.style.visibility = age >= 0 ? 'visible' : 'hidden';
    });
    const active = paragraphs[Math.min(paragraphs.length-1, Math.floor(elapsed/interval))].p;
    if (activeParagraph !== active && !scene.hidden) {
      activeParagraph = active;
      if (journal.scrollHeight > journal.clientHeight) {
        journal.scrollTop += active.getBoundingClientRect().top - journal.getBoundingClientRect().top - 10;
      }
    }
    drops.forEach(({group, smoke, start}, i) => {
      const t = Math.min(1, Math.max(0, (elapsed-start)/950));
      group.setAttribute('opacity', elapsed >= start ? 1 : 0);
      const y = 196 + (i%2 ? 36 : 22)*t*t - 7*Math.sin(Math.PI*t);
      group.setAttribute('transform', `translate(${carX(start)-37-16*t} ${y})`);
      smoke.setAttribute('opacity', 1-t);
      smoke.setAttribute('transform', `scale(${1+t})`);
      group.lastElementChild.setAttribute('opacity', t);
    });
    const x = carX(elapsed);
    car.setAttribute('transform', 'translate('+x+' 202)');
    const reveal = Math.min(1, Math.max(0, (elapsed-duration+1800)/1800));
    const pan = Math.max(0, 1140 - (x+width*.56)) * reveal;
    road.setAttribute('viewBox', [x-width*.44+pan,0,width,240].join(' '));
    exitDoor.toggleAttribute('hidden', elapsed < duration);
    const bid = bids[Math.max(0,Math.min(4,Math.floor((elapsed-9200)/1150)))];
    road.querySelector('.bid-name').textContent = bid[0];
    road.querySelector('.bid-value').textContent = bid[1];
  }
  function stop() { cancelAnimationFrame(frame); previous = undefined; }
  function tick(now) {
    elapsed = Math.min(duration, elapsed + (previous === undefined ? 0 : now-previous));
    previous = now; draw();
    if (elapsed < duration) frame = requestAnimationFrame(tick);
  }
  function sync() {
    stop();
    if (scene.hidden || document.hidden) return;
    if (motion.matches) elapsed = duration;
    draw();
    if (elapsed < duration) frame = requestAnimationFrame(tick);
  }
  function restart() { if (finale.open) finale.close(); elapsed = 0; sync(); }
  scene.querySelector('.media-replay').onclick = restart;
  window.addEventListener('hashchange', restart);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  new ResizeObserver(([entry]) => {
    const box = entry.contentRect;
    if (box.height) { width = Math.max(320,240*box.width/box.height); draw(); }
  }).observe(road);
  sync();
})();
