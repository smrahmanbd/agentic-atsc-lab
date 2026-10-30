/* A small, honest junction simulator for the browser.
   Four approaches (W, E, N, S), one lane each, two stages: EW and NS.
   Controllers: fixed, actuated, agent (perceive -> reason -> act).
   The same model runs headless (for races) or drawn on a canvas. */
(function (g) {
  const STOP = 120, LEN = 220, VMAX = 13, GAP = 7, YELLOW = 3, ALLRED = 1, MING = 8, MAXG = 60;
  const DIRS = ['W', 'E', 'N', 'S'], STAGE_OF = { W: 'EW', E: 'EW', N: 'NS', S: 'NS' };

  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  class Junction {
    constructor(o = {}) {
      this.rand = rng(o.seed || 7);
      this.demand = Object.assign({ EW: 600, NS: 300 }, o.demand || {});
      this.cavShare = o.cavShare || 0;
      this.lanes = { W: [], E: [], N: [], S: [] };
      this.t = 0; this.stage = 'EW'; this.phase = 'green'; this.since = 0; this.greenSince = 0; this.target = null;
      this.done = []; this.switches = 0; this.nextId = 1;
    }
    // ---------- perception tools (what an agent may call) ----------
    queue(stage) { return DIRS.filter(d => STAGE_OF[d] === stage).reduce((s, d) => s + this.lanes[d].filter(v => v.v < 0.5 && v.x > STOP - 90).length, 0); }
    arriving(stage) { return DIRS.filter(d => STAGE_OF[d] === stage).reduce((s, d) => s + this.lanes[d].filter(v => v.v >= 0.5 && v.x > STOP - 60 && v.x < STOP).length, 0); }
    maxWait(stage) { let w = 0; DIRS.filter(d => STAGE_OF[d] === stage).forEach(d => this.lanes[d].forEach(v => { if (v.x < STOP) w = Math.max(w, v.wait); })); return w; }
    cavQueue(stage, p) { if (!p) return 0; return DIRS.filter(d => STAGE_OF[d] === stage).reduce((s, d) => s + this.lanes[d].filter(v => v.cav && v.v < 0.5 && v.x > STOP - 90).length, 0) / p; }
    greenFor() { return this.phase === 'green' ? this.t - this.greenSince : 0; }
    request(stage) {
      if (this.phase !== 'green' || stage === this.stage) return false;
      this.target = stage; this.phase = 'yellow'; this.since = this.t; this.switches++; return true;
    }
    signalFor(d) {
      if (STAGE_OF[d] !== this.stage) return 'red';
      return this.phase === 'green' ? 'green' : this.phase === 'yellow' ? 'yellow' : 'red';
    }
    step(dt = 1) {
      this.t += dt;
      if (this.phase === 'yellow' && this.t - this.since >= YELLOW) { this.phase = 'allred'; this.since = this.t; }
      else if (this.phase === 'allred' && this.t - this.since >= ALLRED) { this.stage = this.target; this.phase = 'green'; this.since = this.greenSince = this.t; }
      // arrivals (Poisson, per approach)
      DIRS.forEach(d => {
        const rate = this.demand[STAGE_OF[d]] / 3600 * dt;
        if (this.rand() < rate) {
          const L = this.lanes[d], last = L[L.length - 1];
          if (!last || last.x > GAP + 2) L.push({ id: this.nextId++, x: 0, v: VMAX * 0.8, wait: 0, t0: this.t, stops: 0, moving: true, cav: this.rand() < this.cavShare });
        }
      });
      // car-following toward the stop line
      DIRS.forEach(d => {
        const L = this.lanes[d], sig = this.signalFor(d);
        for (let i = 0; i < L.length; i++) {
          const v = L[i], lead = L[i - 1];
          let limit = Infinity;
          if (lead) limit = lead.x - GAP - v.x;
          if (v.x < STOP && sig !== 'green') {
            const toStop = STOP - 1 - v.x;
            if (!(sig === 'yellow' && toStop < 6)) limit = Math.min(limit, toStop);
          }
          let target = Math.min(VMAX, Math.max(0, limit) / 1.2);
          if (v.advice && v.x < STOP) target = Math.min(target, v.advice);
          const nv = Math.max(0, Math.min(v.v + 2.6 * dt, target));
          if (v.moving && nv < 0.5) { v.stops++; v.moving = false; } else if (nv >= 2) v.moving = true;
          v.v = nv; v.x += nv * dt;
          if (nv < 0.5) v.wait += dt;
        }
        while (L.length && L[0].x > LEN) { const v = L.shift(); this.done.push({ tt: this.t - v.t0, wait: v.wait, stops: v.stops, cav: v.cav }); }
      });
    }
    stats() {
      const D = this.done, n = D.length || 1;
      const free = LEN / VMAX;
      return { n: D.length, delay: D.reduce((s, v) => s + Math.max(0, v.tt - free), 0) / n, stops: D.reduce((s, v) => s + v.stops, 0) / n, maxWait: D.reduce((m, v) => Math.max(m, v.wait), 0) };
    }
  }

  // ---------------------------------------------------------- controllers
  const Fixed = (cycle = 60, ewShare = 0.6) => ({
    name: 'Fixed time', step(J) {
      const tc = J.t % cycle, gEW = ewShare * (cycle - 8);
      const want = tc < gEW + 4 ? 'EW' : 'NS';
      if (J.phase === 'green' && want !== J.stage) J.request(want);
    },
    spat(J) { const tc = J.t % cycle, gEW = ewShare * (cycle - 8); return J.phase !== 'green' ? null : J.stage === 'EW' ? gEW + 4 - tc : cycle - tc; },
  });
  const Actuated = () => ({
    name: 'Actuated', step(J) {
      if (J.phase !== 'green' || J.greenFor() < MING) return;
      const o = J.stage === 'EW' ? 'NS' : 'EW';
      if (J.queue(o) + J.arriving(o) === 0) return;
      if (J.greenFor() >= 45 || J.arriving(J.stage) === 0) J.request(o);
    }, spat: () => null,
  });
  /* The agent: goals as weights, tools as perception, a shield for hard rules. */
  function Agent(goals = {}) {
    const G = Object.assign({ queue: 1, arrive: 0.7, wait: 0.15, hysteresis: 2, cap: 90, perception: 'loops', pen: 1 }, goals);
    const ag = { name: 'Agent', G, log: [], last: null };
    ag.perceive = J => {
      const q = s => G.perception === 'cav' ? J.cavQueue(s, G.pen) : J.queue(s);
      return { t: J.t, stage: J.stage, green: J.greenFor(), qEW: q('EW'), qNS: q('NS'), aEW: J.arriving('EW'), aNS: J.arriving('NS'), wEW: J.maxWait('EW'), wNS: J.maxWait('NS') };
    };
    ag.score = (o, s) => G.queue * o['q' + s] + G.arrive * o['a' + s] + G.wait * o['w' + s];
    ag.reason = o => {
      const cur = o.stage, oth = cur === 'EW' ? 'NS' : 'EW', sc = ag.score(o, cur), so = ag.score(o, oth);
      const act = so > sc + G.hysteresis ? 'switch' : 'keep';
      const why = act === 'switch' ? `switch to ${oth}: ${so.toFixed(1)} > ${sc.toFixed(1)} + ${G.hysteresis} (queue ${o['q' + oth].toFixed(0)}, longest wait ${o['w' + oth].toFixed(0)} s)`
        : `keep ${cur}: ${sc.toFixed(1)} vs ${so.toFixed(1)}`;
      return { act, why, sc, so };
    };
    ag.shield = (J, act, o) => {
      const oth = o.stage === 'EW' ? 'NS' : 'EW';
      if (act === 'switch' && o.green < MING) return ['keep', `min green ${MING} s`];
      if (act === 'keep' && o.green >= MAXG && o['q' + oth] > 0) return ['switch', `max green ${MAXG} s`];
      if (act === 'keep' && o['w' + oth] > G.cap) return ['switch', `fairness cap ${G.cap} s`];
      return [act, null];
    };
    ag.step = J => {
      if (J.phase !== 'green' || J.t % 2) return;
      const o = ag.perceive(J), r = ag.reason(o), [safe, block] = ag.shield(J, r.act, o);
      ag.last = { o, r, safe, block };
      if (safe === 'switch') J.request(o.stage === 'EW' ? 'NS' : 'EW');
      if (safe === 'switch' || block || J.t % 10 === 0) ag.log.unshift({ t: J.t, act: safe, why: r.why + (block ? ` [shield: ${block}]` : ''), blocked: !!block });
      if (ag.log.length > 60) ag.log.pop();
    };
    ag.spat = () => null;
    return ag;
  }

  function race(makeCtrl, o = {}) {
    const J = new Junction(o), C = makeCtrl(), T = o.seconds || 1800;
    for (let i = 0; i < T; i++) { J.step(1); C.step(J); }
    return J.stats();
  }

  // ---------------------------------------------------------- drawing
  function draw(cv, J, extra = {}) {
    const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)) { cv.width = r.width * dpr; cv.height = r.height * dpr; }
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = r.width, H = r.height, cx = W / 2, cy = H / 2, s = Math.min(W, H) / (2 * STOP + 40), rw = 26;
    const tk = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    c.fillStyle = tk('--road-verge'); c.fillRect(0, 0, W, H);
    c.fillStyle = tk('--road'); c.fillRect(0, cy - rw, W, 2 * rw); c.fillRect(cx - rw, 0, 2 * rw, H);
    c.strokeStyle = tk('--marking'); c.setLineDash([10, 10]); c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, cy); c.lineTo(cx - rw, cy); c.moveTo(cx + rw, cy); c.lineTo(W, cy); c.moveTo(cx, 0); c.lineTo(cx, cy - rw); c.moveTo(cx, cy + rw); c.lineTo(cx, H); c.stroke(); c.setLineDash([]);
    // approach geometry: x along approach -> screen
    const P = {
      W: x => [cx - rw - (STOP - x) * s, cy + rw / 2, 0], E: x => [cx + rw + (STOP - x) * s, cy - rw / 2, Math.PI],
      N: x => [cx - rw / 2, cy - rw - (STOP - x) * s, Math.PI / 2], S: x => [cx + rw / 2, cy + rw + (STOP - x) * s, -Math.PI / 2],
    };
    const sigCol = { green: '#1f9d55', yellow: '#d99a00', red: '#d23b2f' };
    DIRS.forEach(d => {
      const [x0, y0] = P[d](STOP + 2);
      c.fillStyle = sigCol[J.signalFor(d)]; c.beginPath(); c.arc(x0 + (d === 'W' ? -6 : d === 'E' ? 6 : 0) + (d === 'N' ? -16 : d === 'S' ? 16 : 0), y0 + (d === 'N' ? -6 : d === 'S' ? 6 : 0) + (d === 'W' ? 16 : d === 'E' ? -16 : 0), 6, 0, 7); c.fill();
      J.lanes[d].forEach(v => {
        let x = v.x; if (x > STOP) x = STOP + (x - STOP) * 0.999;
        const [px, py, a] = x <= STOP ? P[d](x) : (() => {
          const k = (x - STOP) * s;
          return d === 'W' ? [cx - rw + k, cy + rw / 2, 0] : d === 'E' ? [cx + rw - k, cy - rw / 2, Math.PI] : d === 'N' ? [cx - rw / 2, cy - rw + k, Math.PI / 2] : [cx + rw / 2, cy + rw - k, -Math.PI / 2];
        })();
        if (px < -20 || px > W + 20 || py < -20 || py > H + 20) return;
        c.save(); c.translate(px, py); c.rotate(a);
        c.fillStyle = v.cav ? tk('--car-alt') : (v.v < 0.5 ? tk('--stop') : tk('--car'));
        c.fillRect(-9, -4.5, 9, 9); c.restore();
      });
    });
    c.fillStyle = tk('--muted'); c.font = '12px Barlow, sans-serif';
    c.fillText(`t = ${J.t.toFixed(0)} s · ${J.stage} ${J.phase}${J.phase === 'green' ? ' for ' + J.greenFor().toFixed(0) + ' s' : ''}`, 8, 16);
    if (extra.label) c.fillText(extra.label, 8, H - 8);
  }

  g.ATSC = { Junction, Fixed, Actuated, Agent, race, draw, MING, MAXG, STOP };
})(window);
