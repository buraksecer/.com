(() => {
  const scene = document.querySelector('#alpata');
  const svg = scene.querySelector('svg');
  const actor = scene.querySelector('#exchange-walker');
  const episodes = [...scene.querySelectorAll('.episode')];
  const back = scene.querySelector('.exchange-actions a');
  const door = scene.querySelector('#sodyum-door');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const greeters = [...svg.querySelectorAll('[data-greet-x]')].map(arm => ({
    arm, forearm: arm.querySelector('.forearm'), doorX: Number(arm.dataset.greetX)
  }));
  const bidPrice = svg.querySelector('#hazelnut-bid');
  const bidNumber = svg.querySelector('#bid-number');
  const bids = [120, 122, 125, 128, 130];
  let displayedBid = -1;
  const duration = 13000;
  let elapsed = 0;
  let last;
  let frame;
  let width = 540;
  let height = 320;

  function draw() {
    const progress = Math.min(1, elapsed / duration);
    const x = 85 + 1735 * progress;
    const left = Math.min(2010 - width, Math.max(0, x - width * .42));
    svg.setAttribute('viewBox', [left, 320 - height, width, height].join(' '));
    actor.setAttribute('transform', `translate(${x} 278) scale(1.5)`);
    for (const {arm, forearm, doorX} of greeters) {
      const lift = Math.max(0, Math.min(1, (155 - Math.abs(x - doorX)) / 40));
      const wave = Math.sin(elapsed / 95);
      arm.setAttribute('transform', `translate(5 -26) rotate(${lift * -100})`);
      forearm.setAttribute('transform', `translate(3 8) rotate(${lift * (-47 + wave * 39)})`);
    }
    // The panel sits on the roof; its right edge is at world coordinate 1475.
    const arrivalX = Math.max(1160, 1480 - width * .58);
    const bid = Math.min(bids.length - 1, Math.max(0, Math.floor((x - arrivalX) / Math.max(1, 1440 - arrivalX) * bids.length)));
    if (bid !== displayedBid) {
      bidPrice.textContent = bids[bid] + ' ₺/kg';
      bidNumber.textContent = 'TEKLİF 0' + (bid + 1);
      displayedBid = bid;
    }
    scene.classList.toggle('paused', progress === 1 || document.hidden);
    episodes.forEach((episode, i) => {
      const reveal = Math.max(0, Math.min(1, (progress - [0, .24, .56][i]) / .14));
      episode.style.setProperty('--cut', (1 - reveal) * 100 + '%');
    });
    door.toggleAttribute('hidden', progress < 1);
    back.hidden = progress < 1;
  }
  function tick(now) {
    elapsed += last === undefined ? 0 : now - last;
    last = now;
    draw();
    if (elapsed < duration) frame = requestAnimationFrame(tick);
  }
  function play() {
    cancelAnimationFrame(frame);
    last = undefined;
    if (scene.hidden || document.hidden || document.querySelector('.request-curtain')) return;
    if (motion.matches) elapsed = duration;
    draw();
    if (elapsed < duration) frame = requestAnimationFrame(tick);
  }
  new ResizeObserver(([entry]) => {
    const {width:w, height:h} = entry.contentRect;
    if (!w || !h) return;
    const aspect = w / h;
    height = Math.min(320, Math.max(270, 940 / aspect), 2010 / aspect);
    width = height * aspect;
    draw();
  }).observe(svg.parentElement);
  window.addEventListener('hashchange', () => { elapsed = 0; play(); });
  document.addEventListener('visibilitychange', play);
  document.addEventListener('introcomplete', play);
  motion.addEventListener('change', play);
  play();
})();
