(() => {
  const chapter = document.querySelector('#yemeksepeti');
  const sea = chapter.querySelector('#seaside');
  const actor = sea.querySelector('.angler');
  const line = sea.querySelector('.fish-line');
  const floats = [...sea.querySelectorAll('.tech-float')];
  const notes = [...chapter.querySelectorAll('article')];
  const replay = chapter.querySelector('.coast-replay');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  // World coordinates keep released buoys anchored as the camera follows the pier.
  const moorings = [
    [156, 196], [427, 182], [267, 219], [413, 213],
    [82, 153], [516, 151], [291, 188], [554, 219],
    [762, 186], [689, 216], [844, 210]
  ];
  floats.forEach((buoy, i) => {
    buoy.style.setProperty('--swell-time', (2 + i * .31 % 1.8) + 's');
    buoy.style.setProperty('--swell-delay', (-i * .79) + 's');
  });
  const castTime = 1100;
  const firstCount = floats.filter(el => el.dataset.pier === '0').length;
  const firstCast = 2500;
  const leaveBanabi = firstCast + firstCount * castTime;
  const secondWalk = 2200;
  const secondCast = leaveBanabi + secondWalk;
  const finalCatch = secondCast + (floats.length - firstCount) * castTime;
  const approachStart = leaveBanabi + 300;
  const dockingTime = finalCatch + 2300;
  const duration = dockingTime + 900;
  const ferry = sea.querySelector('.meeting-ferry');
  const door = sea.querySelector('.meeting-door');
  let elapsed = 0, previous, frame, aspect = 2;
  const clamp = value => Math.max(0, Math.min(1, value));
  function draw() {
    const walkOne = clamp(elapsed / 2450);
    const walkTwo = clamp((elapsed - leaveBanabi) / secondWalk);
    const approach = clamp((elapsed - approachStart) / (dockingTime - approachStart));
    const cruise = approach * approach * (3 - 2 * approach);
    const boarding = clamp((elapsed - dockingTime) / 900);
    const scale = .12 + .88 * cruise;
    const horizonX = Math.min(1050, 76 + 211 * walkOne + 390 * walkTwo + Math.max(300, 290 * aspect) * .55);
    const boatX = horizonX + (1080 - horizonX) * cruise;
    const boatY = 122 + 80 * cruise + Math.sin(6 * Math.PI * cruise) * scale;
    ferry.setAttribute('transform', `translate(${boatX} ${boatY}) scale(${scale})`);
    ferry.setAttribute('opacity', clamp(approach * 12));
    const pierWalk = clamp((elapsed - finalCatch) / (dockingTime - finalCatch));
    const x = 76 + 211 * walkOne + 390 * walkTwo + 360 * pierWalk + 51 * boarding;
    const y = 251 - 49 * boarding;
    door.toggleAttribute('hidden', boarding < 1);
    const height = Math.max(290, 300 / aspect);
    const width = height * aspect;
    sea.setAttribute('viewBox', [x - width * .34, 290 - height, width, height].join(' '));
    actor.setAttribute('transform', `translate(${x} ${y})`);
    actor.classList.toggle('walking', walkOne < 1 || (walkTwo > 0 && walkTwo < 1) || (pierWalk > 0 && pierWalk < 1) || (boarding > 0 && boarding < 1));
    actor.querySelector('.beach-shirt').setAttribute('fill', walkTwo > .55 ? '#418b8a' : '#d88565');
    actor.querySelector('.fishing-rod').style.opacity = 1 - pierWalk;
    let fishing = false;
    floats.forEach((buoy, i) => {
      const first = i < firstCount;
      const slot = first ? i : i - firstCount;
      const start = (first ? firstCast : secondCast) + slot * castTime;
      const age = elapsed - start;
      const t = clamp(age / (castTime - 120));
      const castX = x + 63;
      const [berth, endY] = moorings[i];
      const fx = castX + (berth - castX) * t;
      const arcY = endY - 40 * Math.sin(Math.PI * t);
      // A label is 122 units wide. Keep its top below either sign during the cast.
      const nearSign = [270, 660].some(signX => Math.abs(fx - signX) < 132);
      const fy = nearSign ? Math.max(186, arcY) : arcY;
      buoy.setAttribute('transform', `translate(${fx} ${fy})`);
      buoy.setAttribute('opacity', age >= 0 ? 1 : 0);
      if (age >= 0 && t < 1) {
        fishing = true;
        line.setAttribute('d', `M${x+53} 176 Q${(x+53+fx)/2} ${Math.max(176,fy)+9} ${fx} ${fy-16}`);
      }
    });
    if (!fishing) line.removeAttribute('d');
    [walkOne, walkTwo].forEach((progress,i) => notes[i].style.setProperty('--reveal', (1-progress)*100+'%'));
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
    if (chapter.hidden || document.hidden || document.querySelector('.request-curtain')) return;
    if (motion.matches) elapsed = duration;
    draw();
    if (elapsed < duration) frame = requestAnimationFrame(tick);
  }
  function restart() {elapsed = 0; sync();}
  replay.onclick = restart;
  window.addEventListener('hashchange',restart);
  document.addEventListener('introcomplete',sync);
  document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',sync);
  new ResizeObserver(([entry]) => {
    const {width,height} = entry.contentRect;
    if (width && height) {aspect = width / height; draw();}
  }).observe(sea);
  sync();
})();
