(() => {
  const campus = document.querySelector('#university');
  const chapters = [...document.querySelectorAll('main > section[id]')];
  const view = document.querySelector('#campus-view');
  const walker = document.querySelector('#walker');
  const pack = view.querySelector('#school-pack');
  const hoodie = view.querySelector('#hoodie');
  const jacket = view.querySelector('#jacket');
  const next = document.querySelector('#next');
  const walkDuration = 5000;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let ready = !document.querySelector('.request-curtain');
  let cameraWidth = 1150;
  let cameraHeight = 350;
  let elapsed = 0;
  let previous;
  let frame;

  const lessons = [...campus.querySelectorAll('.lessons li')];
  const sun = view.querySelector('#daylight');
  const moon = view.querySelector('#moonlight');
  const clouds = view.querySelector('#cloudbank');
  const stars = view.querySelector('#stars');
  const particles = view.querySelector('#weather-particles');
  const svgNS = view.namespaceURI;
  for (let i = 0; i < 55; i++) {
    const star = document.createElementNS(svgNS, 'circle');
    star.setAttribute('cx', (i * 277) % 1150);
    star.setAttribute('cy', 8 + (i * 47) % 103);
    star.setAttribute('r', .6 + (i % 3) * .4);
    stars.append(star);
  }
  const weather = Array.from({length: 72}, (_, i) => {
    const flake = i >= 30;
    const item = document.createElementNS(svgNS, flake ? 'circle' : 'path');
    if (flake) item.setAttribute('r', 1 + i % 3 * .55);
    else item.setAttribute('d', 'M-3 0Q-1-4 4-1Q2 3-3 0');
    particles.append(item);
    return item;
  });
  function seasonLight(t, center, width) {
    const weight = Math.max(0, 1 - Math.abs(t - center) / width);
    return weight * weight * (3 - 2 * weight);
  }
  function paintWeather(t, left) {
    const summer = seasonLight(t, .30, .26);
    const autumn = seasonLight(t, .58, .24);
    const winter = seasonLight(t, .80, .18);
    view.style.setProperty('--summer', summer);
    view.style.setProperty('--autumn', autumn);
    view.style.setProperty('--winter', winter);
    view.style.setProperty('--foliage', `rgb(${138 + 74 * autumn - 67 * summer},${167 - 50 * autumn},${110 - 52 * autumn})`);
    view.style.setProperty('--glass', `rgb(${55 + 196 * winter},${89 + 120 * winter},${92 + 44 * winter})`);
    const top = 350 - cameraHeight;
    const arc = Math.sin(Math.PI * (t < .80 ? t / .72 : (t - .88) / .50));
    const skyY = Math.min(161, top + 24);
    sun.setAttribute('transform', `translate(${left + cameraWidth * (.22 + .53 * t)} ${165 - (165 - skyY) * arc})`);
    moon.setAttribute('transform', `translate(${left + cameraWidth * .66} ${skyY + 12})`);
    clouds.setAttribute('transform', `translate(${52 * t} ${skyY + 17})`);
    weather.forEach((item, i) => {
      const snow = i >= 30;
      const strength = snow ? winter : Math.max(autumn, seasonLight(t, .11, .12));
      item.setAttribute('opacity', strength * .9);
      if (!strength) return;
      const x = (i * 137 + t * 235 + Math.sin(i + t * 24) * 8) % 1150;
      const y = (i * 67 + t * (390 + i % 5 * 19)) % 300;
      item.setAttribute('transform', `translate(${x} ${y}) rotate(${snow ? 0 : i * 18 + t * 510})`);
      item.setAttribute('fill', snow ? '#fcfbf0' : autumn > .1 ? '#c16b36' : '#ffd3cd');
    });
  }
  function paint() {
    const walk = motion.matches ? 1 : Math.min(elapsed / walkDuration, 1);
    const x = 85 + walk * 889;
    const left = Math.max(0, Math.min(x - cameraWidth * .4, 1150 - cameraWidth));
    paintWeather(walk, left);
    view.setAttribute('viewBox', [left, 350 - cameraHeight, cameraWidth, cameraHeight].join(' '));
    next.style.left = ((1006 - left) / cameraWidth * 100) + '%';
    next.style.bottom = (74 / cameraHeight * 100) + '%';
    next.style.width = (28 / cameraWidth * 100) + '%';
    next.style.height = (45 / cameraHeight * 100) + '%';
    const casual = seasonLight(walk, .48, .30);
    const graduate = Math.min(1, Math.max(0, (walk - .63) / .16));
    walker.setAttribute('transform', `translate(${x} 296) scale(${1.02 + walk * .32} ${1.02 + walk * .48})`);
    pack.setAttribute('opacity', 1 - graduate);
    hoodie.setAttribute('opacity', casual * (1 - graduate));
    jacket.setAttribute('opacity', graduate);
    lessons.forEach((lesson, index) => {
      const reveal = Math.max(0, Math.min(walk * 4 - index, 1));
      lesson.style.setProperty('--mask', (1 - reveal) * 100 + '%');
    });
  }
  function tick(now) {
    elapsed += previous === undefined ? 0 : now - previous;
    previous = now;
    if (elapsed >= walkDuration) {
      sync();
      return;
    }
    paint();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    previous = undefined;
    paint();
    const finished = elapsed >= walkDuration || motion.matches;
    next.hidden = !finished;
    const running = !finished && ready && !campus.hidden && !document.hidden;
    campus.classList.toggle('paused', !running);
    if (running) frame = requestAnimationFrame(tick);
  }
  function show() {
    const chapter = chapters.find(section => '#' + section.id === location.hash) || campus;
    chapters.forEach(section => { section.hidden = section !== chapter; });
    if (chapter !== campus) chapter.querySelector('h1').focus();
    elapsed = 0;
    sync();
  }
  new ResizeObserver(([entry]) => {
    const {width, height} = entry.contentRect;
    if (!width || !height) return;
    cameraWidth = Math.min(1150, 350 * width / height);
    cameraHeight = Math.min(350, 1150 * height / width);
    paint();
  }).observe(view.parentElement);
  document.addEventListener('introcomplete', () => { ready = true; sync(); }, {once:true});
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('hashchange', show);
  motion.addEventListener('change', sync);
  show();
})();
