(() => {
  if (customElements.get('system-trace')) return;
  const routes = [
    'M36 80 H109 L137 108 H179 L210 139 H237',
    'M36 144 H116 L132 128 H168 L196 156 H237',
    'M36 208 H104 L133 179 H178 L192 165 H237',
    'M283 139 H310 L347 102 H389 L411 80 H484',
    'M283 156 H324 L348 132 H392 L405 145 H484',
    'M283 165 H314 L341 192 H381 L397 208 H484'
  ];
  const terminals = ['EDGE', 'API', 'QUEUE', 'STORE', 'CACHE', 'EVENT'];
  const ys = [80, 144, 208, 80, 145, 208];
  class SystemTrace extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({mode:'open'});
      root.innerHTML = `
        <style>
          :host{display:block;min-width:0;color:#edeaff;font:11px/1.4 'IBM Plex Mono',ui-monospace,monospace}
          *{box-sizing:border-box}
          .panel{background:#11101c;border:1px solid #393447;border-radius:14px;overflow:hidden;box-shadow:0 18px 70px #05041238}
          header,footer{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 18px}
          header{border-bottom:1px solid #302d40;color:#d7d1e7;letter-spacing:.11em;font-size:10px}
          .status{display:flex;align-items:center;gap:7px;color:#adf4df;font-size:9px}
          .lamp{width:6px;height:6px;border-radius:50%;background:#84eecb;box-shadow:0 0 9px #7bf4cb99}
          .paused .lamp{background:#c7bbdc;box-shadow:none}
          svg{display:block;width:100%;height:auto;background:radial-gradient(ellipse at center,#30213c 0%,#171321 39%,#12111d 75%)}
          svg text{font-family:inherit;letter-spacing:1.1px}
          footer{border-top:1px solid #302d40;color:#aaa1ba;font-size:10px;letter-spacing:.05em}
          button{font:inherit;color:#e3daf1;background:#282232;border:1px solid #483d55;border-radius:5px;padding:5px 9px;cursor:pointer}
          button:hover,button:focus-visible{border-color:#a790c6;background:#352b42}
          button:focus-visible{outline:2px solid #b9a0ee;outline-offset:2px}
        </style>
        <div class="panel">
          <header><span>SYSTEM TRACE</span><span class="status"><i class="lamp"></i><span class="state">LIVE</span></span></header>
          <svg viewBox="0 0 520 275" role="img" aria-label="Packets travel from edge, API and queue through a processor to storage, cache and events">
            <defs><pattern id="grid" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#635375" opacity=".56"/></pattern>
            <radialGradient id="core"><stop stop-color="#b990ff"/><stop offset="1" stop-color="#63458a"/></radialGradient>
            <filter id="glow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="2.5"/></filter></defs>
            <rect width="520" height="275" fill="url(#grid)"/>
            <g fill="#8f839f" font-size="8"><text x="28" y="27">INGRESS</text><text x="492" y="27" text-anchor="end">EGRESS</text></g>
            ${routes.map((d,i)=>`<path id="r${i}" d="${d}" stroke="${i<3?'#9873bd':'#66a6a0'}" stroke-width="1.5" opacity=".8" fill="none"/>`).join('')}
            ${terminals.map((name,i)=>`<g transform="translate(${i<3?36:484} ${ys[i]})"><circle r="5" fill="#191624" stroke="${i<3?'#aa87cf':'#88cec0'}"/><circle r="1.5" fill="#e6def6"/><text x="${i<3?-5:5}" y="-13" text-anchor="${i<3?'start':'end'}" fill="#b3a6c1" font-size="8">${name}</text></g>`).join('')}
            <g transform="translate(260 152)"><rect x="-31" y="-31" width="62" height="62" rx="11" fill="#191421" stroke="#694f83"/>
            <rect x="-24" y="-24" width="48" height="48" rx="7" fill="url(#core)" stroke="#e3c6ff"/>
            <path d="m0 -12 12 7v13L0 15l-12-7V-5z M-12-5l12 7 12-7 M0 2v13" fill="none" stroke="#f4eaff" stroke-width="1.8" stroke-linejoin="round"/></g>
            <g class="packets"></g>
            <text x="260" y="205" fill="#c4adcf" text-anchor="middle" font-size="8">CORE / 01</text>
          </svg>
          <footer><span>06 routes connected</span><button type="button">Pause trace</button></footer>
        </div>`;
      this.svg = root.querySelector('svg');
      root.querySelector('.packets').innerHTML = routes.map((_,i)=>`<g fill="${i<3?'#e4bcff':'#adffe4'}"><circle r="5" filter="url(#glow)" opacity=".5"/><circle r="2.4"/></g>`).join('');
      this.packets = [...root.querySelector('.packets').children].map((node,i)=>{
        const path = root.getElementById('r'+i);
        return {node,path,length:path.getTotalLength()};
      });
      this.media = matchMedia('(prefers-reduced-motion: reduce)');
      this.playing = !this.media.matches;
      this.elapsed = 0;
      this.tick = now => {
        if (this.previous != null) this.elapsed += Math.min(now-this.previous,100);
        this.previous = now;
        this.draw();
        this.frame = requestAnimationFrame(this.tick);
      };
      this.onMotion = () => {this.playing = !this.media.matches; this.sync();};
      root.querySelector('button').onclick = () => {this.playing = !this.playing; this.sync();};
    }
    draw() {
      this.packets.forEach(({node,path,length},i)=>{
        const t = (this.elapsed/3600 + (i%3)*.32 + (i>=3?.5:0))%1;
        const p = path.getPointAtLength(t*length);
        node.setAttribute('transform',`translate(${p.x} ${p.y})`);
      });
    }
    sync() {
      cancelAnimationFrame(this.frame);
      this.previous = null;
      this.shadowRoot.querySelector('button').textContent = this.playing?'Pause trace':'Resume trace';
      this.shadowRoot.querySelector('.state').textContent = this.playing?'LIVE':'PAUSED';
      this.shadowRoot.querySelector('.panel').classList.toggle('paused',!this.playing);
      this.draw();
      if (this.playing && this.isConnected) this.frame = requestAnimationFrame(this.tick);
    }
    connectedCallback(){this.media.addEventListener('change',this.onMotion);this.sync();}
    disconnectedCallback(){this.media.removeEventListener('change',this.onMotion);cancelAnimationFrame(this.frame);}
  }
  customElements.define('system-trace',SystemTrace);
})();
