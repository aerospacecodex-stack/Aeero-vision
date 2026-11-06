 const $ = id => document.getElementById(id), sys = $('sys');
    // name, size(px), orbit radius, speed, [light, base, dark], description, extra background, bands
    const P = [
      ['Sun', 72, 0, 0, ['#fff7c2', '#ffb21f', '#c44a00'], 'Our star · 99.8% of the system\'s mass'],
      ['Mercury', 10, 90, 1.6, ['#ddd', '#a8a39c', '#555'], 'Smallest planet · 88 day year'],
      ['Venus', 16, 135, .9, ['#fff0c0', '#e3bb76', '#8a5a20'], 'Hottest planet · 225 day year'],
      ['Earth', 18, 185, .6, ['#9fd0ff', '#2f6fdb', '#0b2a66'], 'Our home · 1 moon', 'radial-gradient(ellipse 30% 22% at 38% 40%,#3d9e4f 85%,transparent),radial-gradient(ellipse 22% 28% at 66% 62%,#3d9e4f 85%,transparent),'],
      ['Mars', 13, 235, .45, ['#f0a080', '#c1440e', '#5a1a05'], 'The red planet · 2 moons'],
      ['Jupiter', 44, 320, .25, ['#fff', '#d8ca9d', '#8a6a3a'], 'Largest planet · 95 moons', '', 'repeating-linear-gradient(0deg,rgba(150,90,50,.28) 0 4px,rgba(255,255,255,.12) 4px 9px,rgba(120,70,40,.2) 9px 12px),'],
      ['Saturn', 36, 410, .18, ['#fff', '#ead6a6', '#8a7440'], 'Famous for its rings', '', 'repeating-linear-gradient(0deg,rgba(150,120,70,.22) 0 4px,rgba(255,255,255,.1) 4px 9px),'],
      ['Uranus', 26, 490, .12, ['#e0ffff', '#9fe3e8', '#3a8f98'], 'Ice giant · spins on its side'],
      ['Neptune', 25, 565, .09, ['#a0b8ff', '#4b70dd', '#14286a'], 'Windiest planet · 165 year orbit']
    ];
    const bodies = [], orbits = [];
    function sphere(size, c, extra = '', bands = '', cls = '') {
      const w = document.createElement('div'); w.className = 'planet';
      w.style.width = w.style.height = size + 'px'; w.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
      const b = document.createElement('div'); b.className = 'body ' + cls;
      b.style.background = `radial-gradient(circle at 32% 30%,rgba(255,255,255,.4),transparent 45%),radial-gradient(circle at 72% 72%,rgba(0,0,0,${cls ? 0 : .65}),transparent 65%),${extra}${bands}linear-gradient(${c[1]},${c[1]})`;
      if (cls) b.style.background = `radial-gradient(circle at 35% 35%,${c[0]},${c[1]} 40%,${c[2]})`;
      w.appendChild(b); sys.appendChild(w); return w;
    }
    P.forEach(([name, size, d, sp, c, desc, extra, bands], i) => {
      const el = sphere(size, c, extra || '', bands || '', i === 0 ? 'sun' : '');
      const l = document.createElement('span'); l.className = 'label'; l.textContent = name; el.appendChild(l);
      const b = { name, size, d, sp, desc, el, a: Math.random() * 6.28, x: 0, z: 0, c }; bodies.push(b);
      if (d) { const o = document.createElement('div'); o.className = 'orbit'; o.style.width = o.style.height = d * 2 + 'px'; o.style.margin = -d + 'px 0 0 ' + -d + 'px'; sys.insertBefore(o, sys.firstChild); orbits.push(o); }
      if (name === 'Saturn') { const r = document.createElement('div'); r.className = 'ring'; const s = size * 2.6; r.style.width = r.style.height = s + 'px'; r.style.margin = `${-s / 2}px 0 0 ${-s / 2}px`; sys.appendChild(r); b.ring = r; }
      if (name === 'Earth') { const m = sphere(5, ['#eee', '#bbb', '#555']); b.moon = m; b.ma = 0; }
      el.dataset.i = i;
    });
    // Stars
    { let s = []; for (let i = 0; i < 220; i++)s.push(`${Math.random() * 100}vw ${Math.random() * 100}vh 0 ${Math.random() < .2 ? 1 : 0}px rgba(255,255,255,${.3 + Math.random() * .7})`); $('stars').style.boxShadow = s.join(','); }
    // UI
    const list = $('list');
    bodies.forEach((b, i) => { const t = document.createElement('button'); t.textContent = b.name; t.onclick = () => focus(i); list.appendChild(t); b.btn = t; });
    const z0 = () => Math.max(.25, Math.min(innerWidth / 1250, innerHeight / 820, 1.5));
    let rx = -30, ry = 20, zoom = z0(), tz = zoom, fi = 0, fx = 0, fz = 0, sim = 1, paused = false;
    function focus(i) { fi = i; const b = bodies[i]; bodies.forEach(x => x.btn.classList.toggle('on', x === b)); tz = i ? Math.min(3.5, 70 / b.size) : z0(); $('iname').textContent = b.name; $('idesc').textContent = b.desc; }
    focus(0);
    $('reset').onclick = () => { rx = -30; ry = 20; focus(0); };
    $('pause').onclick = e => { paused = !paused; e.target.textContent = paused ? 'Play' : 'Pause'; };
    $('orb').onclick = e => { const v = orbits[0].style.display === 'none'; orbits.forEach(o => o.style.display = v ? '' : 'none'); e.target.textContent = 'Orbits: ' + (v ? 'On' : 'Off'); };
    $('spd').oninput = e => sim = +e.target.value;
    // Drag, zoom, click
    const ptrs = new Map(); let moved = 0, pd = 0;
    $('scene').addEventListener('pointerdown', e => { ptrs.set(e.pointerId, [e.clientX, e.clientY]); moved = 0; });
    addEventListener('pointermove', e => {
      if (!ptrs.has(e.pointerId)) return; const o = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pd) tz = Math.min(4, Math.max(.2, tz * d / pd)); pd = d; moved = 9; return; }
      const dx = e.clientX - o[0], dy = e.clientY - o[1]; moved += Math.abs(dx) + Math.abs(dy);
      ry += dx * .4; rx = Math.max(-90, Math.min(15, rx - dy * .3));
    });
    addEventListener('pointerup', e => {
      if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId); pd = 0;
      const p = e.target.closest && e.target.closest('.planet');
      if (moved < 5 && p) focus(+p.dataset.i);
    });
    addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); pd = 0; });
    $('scene').addEventListener('wheel', e => { e.preventDefault(); tz = Math.min(4, Math.max(.2, tz * (1 - e.deltaY * .001))); }, { passive: false });
    // Animation
    let last = performance.now();
    function frame(t) {
      const dt = Math.min((t - last) / 1000, .05); last = t;
      bodies.forEach(b => {
        if (!paused) b.a += b.sp * dt * sim;
        b.x = Math.cos(b.a) * b.d; b.z = Math.sin(b.a) * b.d;
      });
      const f = bodies[fi]; fx += (f.x - fx) * .08; fz += (f.z - fz) * .08; zoom += (tz - zoom) * .08;
      sys.style.transform = `scale(${zoom}) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${-fx}px,0,${-fz}px)`;
      const inv = `rotateY(${-ry}deg) rotateX(${-rx}deg)`;
      bodies.forEach(b => {
        b.el.style.transform = `translate3d(${b.x}px,0,${b.z}px) ${inv}`;
        if (b.ring) b.ring.style.transform = `translate3d(${b.x}px,0,${b.z}px) rotateX(90deg) rotateY(18deg)`;
        if (b.moon) { if (!paused) b.ma += dt * 3 * sim; b.moon.style.transform = `translate3d(${b.x + Math.cos(b.ma) * 20}px,0,${b.z + Math.sin(b.ma) * 20}px) ${inv}`; }
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);