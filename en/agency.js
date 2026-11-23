(() => {
  const scene = document.querySelector('#sodyum');
  const world = scene.querySelector('.flight-world');
  const plane = world.querySelector('.plane');
  const drops = [...world.querySelectorAll('.stack-drop')];
  const impacts = [...world.querySelectorAll('.impact')];
  const signs = [...world.querySelectorAll('.stop-sign')];
  const status = plane.querySelector('.json-status');
  const states = ['new', 'queued', 'contacted', 'validated', 'active'];
  const stories = [...scene.querySelectorAll('.episode')];
  const caption = scene.querySelector('.station-caption');
  const replay = scene.querySelector('.retrace');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const city = world.querySelector('.city-strip');
  let aspect = 700 / 300;
  const descriptions = [
    'The application reaches the API. SQL marks it as pending a call.',
    'The call center fetches the list through the API. The agent calls and logs the outcome in the CRM.',
    'The CRM validates the application and prepares it for activation.',
    'Selenium completes activation on Vodafone’s screens.'
  ];
  const travel = 1000, dwell = 1000;
  const cycle = travel + dwell;
  const routeDuration = drops.length * cycle;
  const duration = routeDuration + 1600;
  const door = world.querySelector('.delivery-door');
  const cargo = plane.querySelector('.flight-cargo');
  let elapsed = 0, frame, previous;
  function draw() {
    const index = Math.min(drops.length - 1, Math.floor(elapsed / cycle));
    const local = Math.min(cycle, elapsed - index * cycle);
    const arrived = local >= travel;
    const t = Math.min(1, local / travel);
    const easing = t * t * (3 - 2 * t);
    const start = index ? 195 + (index - 1) * 250 : 85;
    const landing = Math.max(0, Math.min(1, (elapsed - routeDuration) / 1600));
    const glide = landing * landing * (3 - 2 * landing);
    const x = start + (195 + index * 250 - start) * easing + 258 * glide;
    cargo.style.opacity = Math.max(0, 1 - landing * 4);
    door.toggleAttribute('hidden', landing < 1);
    const height = Math.max(300, 210 / aspect);
    const width = height * aspect;
    const left = x - width * .45;
    world.setAttribute('viewBox', [left, 300 - height, width, height].join(' '));
    city.setAttribute('x', Math.floor(left) - 1);
    city.setAttribute('width', Math.ceil(width) + 3);
    plane.setAttribute('transform', `translate(${x} ${49 - 5 * Math.sin(t * Math.PI) + 51 * glide})`);
    const active = arrived ? index : index - 1;
    status.textContent = `  "status": "${states[active + 1]}"`;
    status.classList.toggle('updated', arrived);
    drops.forEach((drop, i) => {
      const age = elapsed - (i * cycle + travel);
      const fall = Math.min(1, Math.max(0, age / 520));
      drop.style.opacity = age >= 0 ? 1 : 0;
      drop.setAttribute('transform', `translate(0 ${140 + 99 * fall * fall})`);
      impacts[i].style.opacity = Math.max(0, 1 - Math.abs(age - 625) / 105);
      signs[i].style.opacity = age >= 520 ? 1 : 0;
    });
    caption.textContent = descriptions[active] || 'The lead form creates a JSON application.';
    stories.forEach((story, i) => {
      const reveal = Math.max(0, Math.min(1, (elapsed - [0, 3600, 6400][i]) / 700));
      story.style.setProperty('--cut', (1 - reveal) * 100 + '%');
    });
    if (landing > 0) caption.textContent = landing < 1 ? 'Landing on the Yemeksepeti rooftop…' : 'Landing complete. The Yemeksepeti door is open.';
    replay.hidden = elapsed < duration;
  }
  function tick(now) {
    elapsed = Math.min(duration, elapsed + (previous === undefined ? 0 : now - previous));
    previous = now;
    draw();
    if (elapsed < duration) frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    previous = undefined;
    if (scene.hidden || document.hidden || document.querySelector('.request-curtain')) return;
    if (motion.matches) elapsed = duration;
    draw();
    if (elapsed < duration) frame = requestAnimationFrame(tick);
  }
  function restart() { elapsed = 0; sync(); }
  replay.onclick = restart;
  window.addEventListener('hashchange', restart);
  document.addEventListener('introcomplete', sync);
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(([entry]) => {
    const {width, height} = entry.contentRect;
    if (width && height) {
      aspect = width / height;
      draw();
    }
  }).observe(world);
  motion.addEventListener('change', sync);
  sync();
})();
