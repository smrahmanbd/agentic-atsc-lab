/* Go 1 widgets: the agent at work, controller race, pressure, green wave,
   GLOSA eco-driving, ITS architecture, CAV visibility. */
(function () {
  const $ = id => document.getElementById(id);
  const tk = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const f1 = v => (+v).toFixed(1);
  function canvas(cv) {
    const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    cv.width = r.width * d; cv.height = r.height * d;
    const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); return { c, W: r.width, H: r.height };
  }
  function bind(id, fmt, fn) { const el = $(id), out = $(id + 'o'); const u = () => { if (out) out.textContent = fmt(+el.value); fn && fn(); }; el.addEventListener('input', u); u(); return () => +el.value; }

  // ============================================================ A. agent at work
  if ($('agCv')) {
    let J, A, speed = 4, running = true;
    const goals = () => ({ queue: +$('agWq').value, wait: +$('agWw').value, hysteresis: +$('agWh').value });
    function reset() { J = new ATSC.Junction({ seed: 11, demand: { EW: +$('agEW').value, NS: +$('agNS').value } }); A = ATSC.Agent(goals()); }
    ['agWq', 'agWw', 'agWh'].forEach(id => bind(id, v => v.toFixed(2), () => { if (A) Object.assign(A.G, goals()); }));
    ['agEW', 'agNS'].forEach(id => bind(id, v => v + ' veh/h', () => { if (J) J.demand[id === 'agEW' ? 'EW' : 'NS'] = +$(id).value; }));
    bind('agSp', v => v + '×', () => speed = +$('agSp').value);
    reset();
    $('agPause').onclick = () => { running = !running; $('agPause').textContent = running ? 'Pause' : 'Resume'; };
    $('agReset').onclick = reset;
    let acc = 0, last = performance.now();
    function frame(now) {
      const dt = Math.min(0.25, (now - last) / 1000); last = now;
      if (running) { acc += dt * speed; while (acc >= 1) { J.step(1); A.step(J); acc -= 1; } }
      ATSC.draw($('agCv'), J);
      const L = A.last;
      if (L) {
        $('agPer').innerHTML = `queue EW <b>${L.o.qEW}</b> · NS <b>${L.o.qNS}</b><br>arriving EW ${L.o.aEW} · NS ${L.o.aNS}<br>longest wait EW ${f1(L.o.wEW)} s · NS ${f1(L.o.wNS)} s<br>green for ${L.o.green.toFixed(0)} s`;
        $('agRea').innerHTML = `score now (${L.o.stage}) <b>${f1(L.r.sc)}</b><br>score other <b>${f1(L.r.so)}</b><br>proposal: <b>${L.r.act}</b>`;
        $('agSh').innerHTML = L.block ? `<span style="color:var(--stop)">blocked: ${L.block}</span>` : 'checks passed';
        $('agAct').innerHTML = `<b>${L.safe}</b> ${L.safe === 'switch' ? '→ yellow, all-red, then ' + (L.o.stage === 'EW' ? 'NS' : 'EW') : ''}`;
      }
      const st = J.stats();
      $('agStat').textContent = `${st.n} vehicles served · mean delay ${f1(st.delay)} s · longest wait ${f1(st.maxWait)} s`;
      $('agLog').innerHTML = A.log.slice(0, 30).map(l => `<div class="${l.blocked ? 'blk' : l.act === 'switch' ? 'sw' : ''}">t=${l.t} ${l.act.toUpperCase()} · ${l.why}</div>`).join('');
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // ============================================================ B. controller race
  if ($('raceBtn')) {
    $('raceBtn').onclick = () => {
      const d = { EW: +$('raceEW').value, NS: +$('raceNS').value };
      const rows = [['Fixed time', () => ATSC.Fixed()], ['Actuated', () => ATSC.Actuated()], ['Agent', () => ATSC.Agent()]]
        .map(([n, f]) => { const r = [1, 2, 3].map(s => ATSC.race(f, { seed: s * 13, demand: d, seconds: 3600 })); return [n, r.reduce((a, x) => a + x.delay, 0) / 3, r.reduce((a, x) => a + x.stops, 0) / 3, Math.max(...r.map(x => x.maxWait))]; });
      const best = Math.min(...rows.map(r => r[1]));
      $('raceOut').innerHTML = `<table class="data"><tr><th>Controller</th><th>Mean delay (s)</th><th>Stops / veh</th><th>Longest wait (s)</th></tr>` +
        rows.map(r => `<tr class="${r[1] === best ? 'best' : ''}"><td>${r[0]}</td><td>${f1(r[1])}</td><td>${r[2].toFixed(2)}</td><td>${r[3].toFixed(0)}</td></tr>`).join('') + '</table>';
    };
    bind('raceEW', v => v + ' veh/h'); bind('raceNS', v => v + ' veh/h');
  }

  // ============================================================ C. pressure
  if ($('prCv')) {
    const ids = ['prIE', 'prOE', 'prIN', 'prON'];
    function draw() {
      const iE = +$('prIE').value, oE = +$('prOE').value, iN = +$('prIN').value, oN = +$('prON').value;
      const pE = iE - oE, pN = iN - oN, pick = pE >= pN ? 'EW' : 'NS';
      $('prOut').innerHTML = `pressure EW = ${iE} − ${oE} = <b>${pE}</b> · pressure NS = ${iN} − ${oN} = <b>${pN}</b> → serve <b>${pick}</b>` +
        (Math.max(oE, oN) >= 18 ? `<br><span style="color:var(--stop)">An exit is nearly full: sending more cars there would block the junction behind it. Pressure already discourages that.</span>` : '');
      const { c, W, H } = canvas($('prCv')); c.clearRect(0, 0, W, H);
      const bar = (x, label, inn, out, col) => {
        const sc = (H - 50) / 25; c.fillStyle = tk('--sunk'); c.fillRect(x, 20, 46, H - 50); c.fillRect(x + 60, 20, 46, H - 50);
        c.fillStyle = col; c.fillRect(x, H - 30 - inn * sc, 46, inn * sc); c.globalAlpha = .45; c.fillRect(x + 60, H - 30 - out * sc, 46, out * sc); c.globalAlpha = 1;
        c.fillStyle = tk('--fg'); c.font = '600 13px Barlow, sans-serif'; c.textAlign = 'center';
        c.fillText('waiting in', x + 23, H - 12); c.fillText('on exit', x + 83, H - 12); c.fillText(label, x + 53, 14);
      };
      bar(10, 'EW stage', iE, oE, tk('--agent')); bar(W / 2 + 10, 'NS stage', iN, oN, tk('--go'));
    }
    ids.forEach(id => bind(id, v => v + ' veh', draw));
  }

  // ============================================================ D. green wave (time-space)
  if ($('gwCv')) {
    const N = 4, SP = 300, V = 12.5, C = 60, G = 30;
    function draw() {
      const off = +$('gwOff').value, talk = $('gwTalk').checked;
      const offs = [0, 1, 2, 3].map(i => talk ? (i * SP / V) % C : (i * off) % C);
      const { c, W, H } = canvas($('gwCv')); c.clearRect(0, 0, W, H);
      const L = 60, T = 10, B = 30, TT = 240, X = t => L + (W - L - 10) * t / TT, Y = d => H - B - (H - T - B) * d / (SP * (N - 1));
      c.font = '12px Barlow, sans-serif';
      for (let i = 0; i < N; i++) {
        const y = Y(i * SP);
        c.fillStyle = tk('--muted'); c.fillText('J' + (i + 1), 8, y + 4);
        for (let t0 = -C; t0 < TT; t0 += C) {
          const s = t0 + offs[i];
          c.fillStyle = '#1f9d55'; c.fillRect(X(Math.max(0, s)), y - 3, Math.max(0, X(Math.min(TT, s + G)) - X(Math.max(0, s))), 6);
          c.fillStyle = '#d23b2f'; c.fillRect(X(Math.max(0, s + G)), y - 3, Math.max(0, X(Math.min(TT, s + C)) - X(Math.max(0, s + G))), 6);
        }
      }
      // platoon trajectories released at J1 green start
      let stops = 0, cars = 0;
      for (let k = 0; k < 6; k++) {
        let t = offs[0] + 2 + k * 2.2, d = 0; c.strokeStyle = tk('--agent'); c.lineWidth = 1.6; c.beginPath(); c.moveTo(X(t), Y(0)); cars++;
        for (let i = 1; i < N; i++) {
          t += SP / V; d = i * SP;
          let ph = ((t - offs[i]) % C + C) % C;
          if (ph > G) { const wait = C - ph; c.lineTo(X(t), Y(d)); t += wait; stops++; }
          c.lineTo(X(t), Y(d));
        }
        c.stroke();
      }
      c.fillStyle = tk('--muted'); c.fillText('time (s) →', W - 80, H - 8);
      $('gwOut').innerHTML = `${cars} cars leave J1 together · stops on the way: <b>${stops}</b>` + (talk ? ' · offsets set by agents from the travel time (SP/V = 24 s)' : '');
    }
    bind('gwOff', v => v + ' s', draw); $('gwTalk').addEventListener('change', draw);
  }

  // ============================================================ E. GLOSA
  if ($('glCv')) {
    function draw() {
      const d = +$('glD').value, v0 = +$('glV').value / 3.6, tg = +$('glTg').value;
      const tFree = d / v0, arriveGreen = tFree >= tg;
      const adv = arriveGreen ? v0 : Math.max(5, d / tg);
      const canGlide = !arriveGreen && d / tg >= 5;
      const { c, W, H } = canvas($('glCv')); c.clearRect(0, 0, W, H);
      const TT = Math.max(tg + 15, 30), L = 50, B = 26, X = t => L + (W - L - 10) * t / TT, Y = x => H - B - (H - 20 - B) * x / (d + 40);
      c.fillStyle = '#d23b2f'; c.fillRect(X(0), Y(d) - 3, X(tg) - X(0), 6); c.fillStyle = '#1f9d55'; c.fillRect(X(tg), Y(d) - 3, X(TT) - X(tg), 6);
      c.fillStyle = tk('--muted'); c.font = '12px Barlow, sans-serif'; c.fillText('stop line', 4, Y(d) + 4); c.fillText('time (s) →', W - 70, H - 6);
      // human: drive at v0, stop at red, then accelerate
      c.lineWidth = 2.2; c.strokeStyle = tk('--stop'); c.beginPath(); c.moveTo(X(0), Y(0));
      if (arriveGreen) { c.lineTo(X(TT), Y(v0 * TT)); }
      else { c.lineTo(X(tFree), Y(d - 1)); c.lineTo(X(tg), Y(d - 1)); c.lineTo(X(TT), Y(d - 1 + v0 * 0.6 * (TT - tg))); }
      c.stroke();
      c.strokeStyle = tk('--agent'); c.setLineDash([6, 4]); c.beginPath(); c.moveTo(X(0), Y(0)); c.lineTo(X(TT), Y(adv * TT)); c.stroke(); c.setLineDash([]);
      const stopFuel = 15 * (v0 / 13.9) ** 2 + 0.3 * (arriveGreen ? 0 : tg - tFree);   // illustrative: ~15 ml to regain 50 km/h + ~0.3 ml/s idling
      $('glOut').innerHTML = arriveGreen ? `At ${f1(v0 * 3.6)} km/h the car reaches the line in ${f1(tFree)} s, after the light turns green: no advice needed.`
        : `Without advice the driver reaches the red line after ${f1(tFree)} s and waits ${f1(tg - tFree)} s (one full stop).<br>` +
        (canGlide ? `<b>GLOSA advice: ${f1(adv * 3.6)} km/h.</b> The car rolls up just as the light turns green: no stop, no idling, smoother traffic behind.` : `Advice would need under 18 km/h, which is not useful; the car stops.`) +
        `<br><span class="muted">Avoiding this stop saves roughly ${stopFuel.toFixed(0)} ml of fuel (illustrative: about 15 ml to regain 50 km/h plus idling). Across thousands of cars a day that adds up.</span>`;
    }
    bind('glD', v => v + ' m', draw); bind('glV', v => v + ' km/h', draw); bind('glTg', v => v + ' s', draw);
  }

  // ============================================================ F. ITS architecture
  if ($('itsBox')) {
    const L = {
      sense: ['Sensing', 'Loop detectors, video, radar and probe data from connected vehicles. The agent\'s eyes.'],
      comm: ['Communication', 'Fibre and cellular backhaul to the centre; V2X (DSRC or C-V2X) between signals and vehicles: SPaT and MAP messages out, CAV data in.'],
      edge: ['Edge controller', 'The signal cabinet at the junction. Runs the safety rules (minimum green, intergreen, conflict monitor) that no agent may override.'],
      agent: ['Agentic layer', 'Perceives, reasons, acts and talks to neighbouring agents. May run at the edge (fast) or in the cloud (more context).'],
      tmc: ['Traffic management centre', 'Operators, strategy, incident management and oversight of the agents: the human in the loop.'],
      users: ['Road users and vehicles', 'Drivers, pedestrians, buses, emergency vehicles, CAVs following speed advice (GLOSA).'],
    };
    document.querySelectorAll('[data-its]').forEach(el => el.addEventListener('click', () => {
      document.querySelectorAll('[data-its]').forEach(x => x.setAttribute('aria-pressed', x === el));
      const [t, d] = L[el.dataset.its]; $('itsBox').innerHTML = `<b>${t}.</b> ${d}`;
    }));
  }

  // ============================================================ G. CAV visibility
  if ($('cvCv')) {
    let seed = 3;
    function draw() {
      const p = +$('cvP').value / 100;
      let s = seed; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const N = 30, truth = Math.round(8 + R() * 14); const cars = [];
      for (let i = 0; i < N; i++) cars.push({ q: i < truth, cav: R() < p });
      const seen = cars.filter(c => c.q && c.cav).length, est = p > 0 ? seen / p : 0;
      const { c, W, H } = canvas($('cvCv')); c.clearRect(0, 0, W, H);
      c.fillStyle = tk('--road'); c.fillRect(0, H / 2 - 16, W, 32);
      const w = (W - 60) / N;
      cars.forEach((v, i) => {
        const x = W - 40 - (i + 1) * w; c.fillStyle = v.cav ? tk('--car-alt') : tk('--car'); c.globalAlpha = v.cav ? 1 : 0.35;
        c.fillRect(x, H / 2 - 7, w - 4, 14); c.globalAlpha = 1;
      });
      c.fillStyle = '#d23b2f'; c.fillRect(W - 36, H / 2 - 20, 6, 40);
      c.fillStyle = tk('--muted'); c.font = '12px Barlow, sans-serif'; c.fillText('stop line', W - 70, H / 2 - 24);
      $('cvOut').innerHTML = `true queue <b>${truth}</b> · connected cars in it <b>${seen}</b> · estimate = ${seen} ÷ ${p.toFixed(2)} = <b>${p ? est.toFixed(1) : '—'}</b>` +
        (p ? ` · error ${Math.abs(est - truth).toFixed(1)} vehicles` : ' · with no connected cars the agent is blind');
    }
    bind('cvP', v => v + ' %', draw); $('cvNew').onclick = () => { seed = (seed * 7 + 11) % 99991; draw(); };
  }
  addEventListener('themechange', () => document.querySelectorAll('input[type=range]').forEach(i => i.dispatchEvent(new Event('input'))));
})();
