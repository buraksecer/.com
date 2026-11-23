(() => {
  const scene = document.querySelector('#mimeda');
  const road = scene.querySelector('svg');
  const car = road.querySelector('.media-car');
  const journal = scene.querySelector('.media-story');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stops = [
    'A small team owned the entire system. I first led Azure CI/CD implementation alongside DevOps.',
    'I developed an Android and iOS SDK to collect ad events in Migros apps. The pipeline processed billions of events.',
    'Attribution windows defined which sales could be linked to prior ad interactions. Hourly Hangfire jobs processed BigQuery data and wrote results to the reporting database.',
    'Each job stored its last completed hour so it could resume after a failure. Reports ran an hour behind without gaps. I am now working on SQL partitioning.',
    'I own monitoring and dashboards and build new dashboards for the team.',
    'I write RFCs, break work into tasks and lead the team. We coordinate OpenAI and campaign integrations with Migros. I share Strangler Fig and Anti-Corruption Layer patterns as we prepare to modernize legacy systems.'
  ];
  const interval = 4300;
  const duration = interval * stops.length;
  const bids = [['Waiting for bids', '—'], ['Campaign A', '12 ₺ CPM'], ['Campaign B', '15 ₺ CPM'], ['Campaign A', '18 ₺ CPM'], ['Winner: A', '18 ₺ CPM']];
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
