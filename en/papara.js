(() => {
  const scene = document.querySelector('#papara');
  const svg = scene.querySelector('.club svg');
  const guest = svg.querySelector('.club-guest');
  const bill = svg.querySelector('.cash-note');
  const tokens = [...svg.querySelectorAll('.stack-token')];
  const screen = svg.querySelector('#cash-screen');
  const caption = scene.querySelector('.club-caption');
  const replay = caption.querySelector('button');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const beats = [
    [0,'Day one','I started on a team of two and learned how ATMs work and which rules they must follow.'],
    [2400,'First code','I connected the C++ library through a proxy DLL. The HTML screen communicated with the device app over a socket.'],
    [4900,'One operation at a time','The lock mechanism made updates wait until withdrawals finished.'],
    [7200,'Safe maintenance','I built CI/CD for the physical device. A separate controller managed releases.'],
    [9400,'Year one','The team grew to five or six. We had a demo in six months. The ATM went live within a year and found a buyer at Money20/20 in the Netherlands.']
  ];
  const stories = caption.querySelector('.club-stories');
  const cards = beats.map(([, heading, story]) => {
    const article = document.createElement('article');
    const title = document.createElement('h2');
    const paragraph = document.createElement('p');
    const typed = document.createTextNode('');
    const pending = document.createElement('span');
    pending.style.visibility = 'hidden';
    pending.textContent = story;
    paragraph.append(typed, pending);
    title.textContent = heading;
    article.append(title, paragraph);
    stories.append(article);
    return {article, typed, pending, story};
  });
  const landing = [[-145,-108],[-56,-125],[19,-115],[83,-100],[-170,-76],[-92,-83],[-12,-90],[66,-72],[-145,-48]];
  const deployment = [
    'Check version',
    'Operation complete · Maintenance mode',
    'Unpack the release into a separate folder',
    'Swap application files',
    'Restart the ATM application'
  ];
  const duration = 16500;
  let elapsed = 0, previous, frame, aspect = 2, shown = -1;
  const clamp = value => Math.max(0, Math.min(1,value));
  function draw() {
    const walking = clamp(elapsed / 4900);
    const exitWalk = clamp((elapsed - 14600) / 1900);
    const x = 64 + 400 * walking + 200 * exitWalk;
    const exit = svg.querySelector('.mimeda-exit');
    exit.toggleAttribute('hidden', exitWalk < 1);
    const height = Math.max(250, 335 / aspect);
    const width = height * aspect;
    svg.setAttribute('viewBox',[x-width*.50,250-height,width,height].join(' '));
    const rhythm = walking < 1 ? Math.sin(walking * Math.PI * 24) : 0;
    guest.setAttribute('transform', `translate(${x} ${202-3*Math.abs(rhythm)}) rotate(${5*rhythm})`);
    guest.classList.toggle('moving', walking < 1 || (exitWalk > 0 && exitWalk < 1));
    const paying = clamp((elapsed - 6500) / 700);
    bill.style.opacity = elapsed >= 6500 ? 1 : 0;
    bill.setAttribute('transform', `translate(${505-20*paying} ${164+5*paying}) rotate(${-12*paying})`);
    tokens.forEach((token,i) => {
      const f = clamp((elapsed - 6650 - 100*i)/1050);
      const [dx,dy] = landing[i];
      token.style.opacity = f;
      token.setAttribute('transform', `translate(${505+dx*f} ${164+dy*f-31*Math.sin(Math.PI*f)})`);
    });
    const index = beats.filter(([time])=>elapsed>=time).length-1;
    if (index !== shown) {
      screen.textContent = index < 2 ? 'Ready' : index === 2 ? 'Withdrawing cash' : 'Complete ✓';
      caption.querySelector('output').textContent = index === 2 ? 'LOCK · Withdrawal in progress' : '';
      shown = index;
    }
    if (elapsed >= 7200) {
      const step = Math.min(deployment.length - 1, Math.floor((elapsed - 7200) / 1500));
      const status = 'CI/CD · ' + (step + 1) + '/5 · ' + deployment[step];
      const output = caption.querySelector('output');
      if (output.textContent !== status) output.textContent = status;
    }
    cards.forEach(({article, typed, pending, story}, i) => {
      article.style.visibility = i > index ? 'hidden' : 'visible';
      const progress = clamp((elapsed - beats[i][0]) / 1750);
      const length = Math.floor(progress * story.length);
      if (typed.length !== length) {
        typed.data = story.slice(0, length);
        pending.textContent = story.slice(length);
      }
    });
    replay.style.visibility = elapsed < duration ? 'hidden' : 'visible';
  }
  function tick(now) {
    elapsed = Math.min(duration,elapsed+(previous === undefined ? 0 : now-previous));
    previous=now; draw();
    if(elapsed<duration) frame=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); previous=undefined;
    if(scene.hidden || document.hidden || document.querySelector('.request-curtain')) return;
    if(motion.matches) elapsed=duration;
    draw();
    if(elapsed<duration) frame=requestAnimationFrame(tick);
  }
  function restart(){elapsed=0;shown=-1;sync();}
  replay.onclick=restart;
  window.addEventListener('hashchange',restart);
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('introcomplete',sync);
  motion.addEventListener('change',sync);
  new ResizeObserver(([entry])=>{
    const {width,height}=entry.contentRect;
    if(width && height){aspect=width/height;draw();}
  }).observe(svg);
  sync();
})();
