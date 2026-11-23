(() => {
  if (location.hash === '#secim') return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const nodes = [
    ['browser', 56, 62, 'Your browser', 'M-10 -8h20v14h-20z M-5 10h10 M0 6v4'],
    ['edge', 180, 62, 'CDN edge', 'M-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0 M-10 0h20 M0 -10q-8 10 0 20q8 -10 0 -20'],
    ['lb', 304, 62, 'Load balancer', 'M-9 0h7 M-2 0l8 -7h4 M-2 0l8 7h4'],
    ['webA', 180, 164, 'Web · A', 'M-10 -8h20v6h-20z M-10 2h20v6h-20z M5 -5h2 M5 5h2'],
    ['webB', 304, 224, 'Web · B', 'M-10 -8h20v6h-20z M-10 2h20v6h-20z M5 -5h2 M5 5h2'],
    ['bucket', 56, 164, 'Amazon S3', 'M-10 -7q10 -6 20 0l-3 15q-7 4 -14 0z M-10 -7q10 6 20 0'],
    ['object', 56, 244, 'index.html', 'M-7 -10h9l5 5v15H-7z M2 -10v5h5 M-3 0h6 M-3 4h6']
  ];
  const path = 'M56 62H304V104Q304 110 298 110H186Q180 110 180 116V164H56V244';
  const curtain = document.createElement('div');
  curtain.className = 'request-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = `
    <div class="curtain-half curtain-left"></div><div class="curtain-half curtain-right"></div>
    <div class="request-stage">
      <div class="request-caption"><span>${document.documentElement.lang === 'en' ? 'Your page request' : 'Sayfa isteğin'}</span><strong>GET /</strong></div>
      <svg class="request-path" viewBox="0 0 360 299" fill="none">
        <rect x="9" y="116" width="94" height="173" rx="9" stroke="#875727" stroke-dasharray="3 4"/>
        <text x="20" y="133" fill="#ffc278" font-size="10">AWS</text>
        <path class="standby-link" d="M304 104V224H129V164H56"/>
        <path class="wire" d="${path}"/><path class="tail" d="${path}"/>
        ${nodes.map(([id,x,y,label,icon]) => `<g class="service" data-id="${id}" transform="translate(${x} ${y})">
          <rect x="-18" y="-18" width="36" height="36" rx="8"/>
          <path d="${icon}"/><text y="34">${label}</text>
        </g>`).join('')}
        <g class="packet"><circle r="6" opacity=".24"/><circle r="2.8"/></g>
      </svg>
    </div>`;
  const choices = document.querySelector(".welcome");
  choices.inert = true;
  document.body.prepend(curtain);
  const route = curtain.querySelector('.wire');
  const tail = curtain.querySelector('.tail');
  const packet = curtain.querySelector('.packet');
  const status = curtain.querySelector('.request-caption strong');
  const services = [...curtain.querySelectorAll('.service')];
  const length = route.getTotalLength();
  let start;
  let frame;
  let timeout;
  function finish() {
    clearTimeout(timeout);
    cancelAnimationFrame(frame);
    curtain.remove();
    choices.inert = false;
    document.dispatchEvent(new Event('introcomplete'));
    document.removeEventListener('keydown', finish);
    window.removeEventListener('pagehide', finish);
  }
  function draw(elapsed) {
    const returning = elapsed >= 1300;
    const progress = returning ? 1 - Math.min((elapsed - 1300) / 840, 1) : Math.min(elapsed / 1160, 1);
    const distance = progress * length;
    const point = route.getPointAtLength(distance);
    curtain.classList.toggle('returning', returning);
    packet.setAttribute('transform', `translate(${point.x} ${point.y})`);
    const from = returning ? distance : Math.max(0, distance - 30);
    const to = returning ? Math.min(length, distance + 30) : distance;
    tail.style.strokeDasharray = `0 ${from} ${to - from} ${length + 1}`;
    services.forEach((node, index) => {
      const [,x,y] = nodes[index];
      node.classList.toggle('lit', Math.hypot(point.x - x, point.y - y) < 28);
    });
    let label = 'GET /';
    if (returning) label = '200 OK · text/html';
    else if (point.y >= 164 && point.x <= 75) label = 'Amazon S3 · index.html';
    else if (distance >= 240) label = 'Route → Web A';
    else if (distance >= 115) label = 'CDN · cache miss';
    if (status.textContent !== label) status.textContent = label;
  }
  function animate(now) {
    start ??= now;
    const elapsed = now - start;
    draw(elapsed);
    if (elapsed < 2260) frame = requestAnimationFrame(animate);
    else curtain.classList.add('opening');
  }
  draw(0);
  curtain.addEventListener('transitionend', event => {
    if (event.propertyName === 'transform') finish();
  });
  document.addEventListener('keydown', finish, {once:true});
  window.addEventListener('pagehide', finish, {once:true});
  frame = requestAnimationFrame(animate);
  timeout = setTimeout(finish, 3400);
})();
