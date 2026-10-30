/* Go 3: research landscape, gap explorer, our experiments, reference browser,
   future architecture and a research-question builder. */
(function () {
  const $ = id => document.getElementById(id);
  const R = window.RESULTS || {};
  const REFS = R.references || [];
  const refLink = id => { const r = REFS.find(x => x.id === id); return r ? `<a href="#ref-${id}" title="${r.title.replace(/"/g, '&quot;')}">${r.authors.split(',')[0].split(' ').slice(-1)[0]} ${r.year}</a>` : id; };
  const cite = ids => ids.map(refLink).join('; ');

  // ------------------------------------------------------------ gap explorer
  const GAPS = [
    { k: 'sim2real', t: 'Sim-to-real transfer', why: 'Almost every RL and LLM controller is tested only in simulators; a policy that fails in the field costs real delay and risk.', ev: ['rafi2026sim2signal', 'kwesiga2026robustness', 'stern2024mndot'], fix: 'Grounded action transformation, LLM-informed dynamics, gap-decomposed benchmarks, hardware-in-the-loop staging.', fixRefs: ['da2023ugat', 'da2024promptgat', 'muller2021lemgorl'], ours: null },
    { k: 'safety', t: 'Safety and guardrails', why: 'Minimum greens, intergreens and conflict rules are non-negotiable; learning and language models do not respect them by default.', ev: ['du2023safelight', 'muller2021lemgorl'], fix: 'Shielded or residual RL, a rule-enforcing logic layer outside the agent, meta-controllers that check compliance.', fixRefs: ['du2023safelight', 'wang2025vlmlight'], ours: 'r2' },
    { k: 'halluc', t: 'Hallucination in LLM controllers', why: 'An LLM can answer with an invalid phase or a confident but wrong reason, and its latency is unbounded.', ev: ['karim2025llmsafety', 'nie2025llm4tr', 'guo2025heraldlight'], fix: 'LLM critic or auditor over a base policy, action masking to legal phases, domain fine-tuning.', fixRefs: ['guo2025heraldlight', 'pang2024illmtsc', 'lai2025llmlight'], ours: 'r2' },
    { k: 'explain', t: 'Explainability', why: 'Operators and regulators must understand why a phase was chosen before approving a controller.', ev: ['ault2020interpretable', 'lai2025llmlight'], fix: 'Interpretable policy classes; natural-language rationales checked for faithfulness (open problem).', fixRefs: ['ault2020interpretable'], ours: null },
    { k: 'robust', t: 'Sensor faults and communication delay', why: 'Detectors fail and V2X links drop packets; most benchmarks assume perfect observation and messaging.', ev: ['ault2021resco', 'wang2024lalight', 'pang2024illmtsc'], fix: 'Imputation of missing states, LLM correction of RL actions, training on diverse conditions.', fixRefs: ['mei2023missingdata', 'pang2024illmtsc'], ours: 'r1' },
    { k: 'scale', t: 'Scalability and latency', why: 'Cities have thousands of signals and decisions run every few seconds; LLM reasoning per junction per step is expensive.', ev: ['chen2020mplight', 'yuan2026collmlight', 'wang2025vlmlight'], fix: 'Decentralisation and parameter sharing, fast/slow dual paths, lightweight fine-tuned models.', fixRefs: ['chen2020mplight', 'wang2025vlmlight'], ours: null },
    { k: 'equity', t: 'Fairness and equity', why: 'Throughput-optimal control can starve side streets, pedestrians and transit riders.', ev: ['zhang2026equity', 'levin2023mpreview'], fix: 'People-centric rewards, constrained multi-objective control, formal maximum-wait bounds.', fixRefs: ['zhang2026equity'], ours: 'r4' },
    { k: 'mixed', t: 'Mixed autonomy and V2X dependence', why: 'Benefits depend on how many vehicles are connected; at low penetration they often match the status quo.', ev: ['feng2015cvasc', 'jayawardana2022ecodriving'], fix: 'Estimate unequipped vehicles, joint signal-CAV control, partial-control multi-agent RL, GLOSA.', fixRefs: ['feng2015cvasc', 'zhang2024rlcavsurvey', 'yan2021mixedautonomy'], ours: 'r3' },
    { k: 'predict', t: 'Adaptivity vs predictability', why: 'Eco-driving needs to know when the light changes; a fully adaptive agent cannot promise that.', ev: ['jayawardana2022ecodriving', 'lebre2015glosa'], fix: 'Commitment horizons, probabilistic SPaT, joint signal and speed-advice optimisation.', fixRefs: ['guo2019cavsurvey'], ours: 'r5' },
    { k: 'bench', t: 'Data and benchmark limits', why: 'Results rest on a few datasets and simulator settings, making comparison and reproduction hard.', ev: ['mei2023libsignal', 'ault2021resco', 'rafi2026sim2signal'], fix: 'Shared protocols across simulators, realistic phasing, gap-decomposed benchmarks.', fixRefs: ['mei2023libsignal', 'kwesiga2026robustness'], ours: null },
    { k: 'human', t: 'Human factors and regulation', why: 'Advice compliance, operator trust and certification decide whether anything is deployed.', ev: ['muller2021lemgorl', 'karim2025llmsafety'], fix: 'Operator-facing conversational agents, certification-oriented logic layers; under-researched.', fixRefs: ['zhang2024trafficgpt', 'da2024openti'], ours: null },
  ];
  if ($('gapList')) {
    const show = k => {
      const g = GAPS.find(x => x.k === k);
      document.querySelectorAll('#gapList button').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === k));
      $('gapCard').innerHTML = `<h4 style="margin-top:0">${g.t}</h4><p><b>Why it matters.</b> ${g.why}</p><p><b>Evidence.</b> ${cite(g.ev)}</p>
        <p><b>Promising directions.</b> ${g.fix} <span class="muted">(${cite(g.fixRefs)})</span></p>` +
        (g.ours ? `<p class="callout" style="margin-bottom:0"><b>Try it in this lab:</b> experiment <a href="#${g.ours}">${g.ours.toUpperCase()}</a> below reproduces a small version of this gap in SUMO.</p>` : '<p class="muted" style="margin-bottom:0">No experiment in this lab yet: a good project topic.</p>');
    };
    $('gapList').innerHTML = GAPS.map(g => `<button type="button" data-k="${g.k}">${g.t}${g.ours ? ' ●' : ''}</button>`).join('');
    $('gapList').querySelectorAll('button').forEach(b => b.addEventListener('click', () => show(b.dataset.k)));
    show('safety');
  }

  // ------------------------------------------------------------ experiment charts
  function chart(cv, xs, series, xlabel, o = {}) {
    if (o.zoom) { const all = series.flatMap(s => s.data); const lo = Math.min(...all), hi = Math.max(...all); o = Object.assign({ ymin: Math.floor(lo - (hi - lo) * 0.25 - 0.5), ymax: Math.ceil(hi + (hi - lo) * 0.25 + 0.5) }, o); }
    lineChart($(cv), series.map(s => ({ color: s.color, data: s.data, width: 2.4 })), Object.assign({ xlabel }, o));
    const leg = $(cv + 'Leg');
    if (leg) leg.innerHTML = series.map(s => `<span><i style="background:${s.color.startsWith('--') ? `var(${s.color})` : s.color}"></i>${s.name}</span>`).join('') + `<span class="muted">x: ${xs.join(' · ')}</span>`;
  }
  function draw() {
    const r1 = R.go3_r1;
    if (r1 && $('r1Cv')) {
      const lat = r1.filter(r => r.loss === 0 && r.latency !== null), base = r1[0].delay;
      const mode = $('r1Mode').value;
      if (mode === 'lat') chart('r1Cv', lat.map(r => r.latency + ' s'), [{ name: 'talking agents', color: '--agent', data: lat.map(r => r.delay) }, { name: 'no messages', color: '--muted', data: lat.map(() => base) }], 'message latency', { zoom: true });
      else { const L = [lat[0]].concat(r1.filter(r => r.loss > 0)); chart('r1Cv', L.map(r => Math.round(r.loss * 100) + '%'), [{ name: 'talking agents', color: '--agent', data: L.map(r => r.delay) }, { name: 'no messages', color: '--muted', data: L.map(() => base) }], 'messages lost', { zoom: true }); }
    }
    const r2 = R.go3_r2;
    if (r2 && $('r2Cv')) {
      const f = $('r2Mode').value, on = r2.filter(r => r.shield), off = r2.filter(r => !r.shield);
      chart('r2Cv', on.map(r => Math.round(r.h * 100) + '%'), [{ name: 'with shield', color: '--go', data: on.map(r => r[f]) }, { name: 'no shield', color: '--stop', data: off.map(r => r[f]) }], 'share of bad LLM answers');
    }
    const r3 = R.go3_r3;
    if (r3 && $('r3Cv')) chart('r3Cv', r3.map(r => Math.round(r.p * 100) + '%'), [{ name: 'loop detectors', color: '--muted', data: r3.map(r => r.loop.delay) }, { name: 'CAV data only', color: '--agent', data: r3.map(r => r.cav.delay) }], 'connected-vehicle penetration', { ymin: 0 });
    const r4 = R.go3_r4;
    if (r4 && $('r4Cv')) chart('r4Cv', r4.agent.map(r => r.w), [{ name: 'mean delay', color: '--agent', data: r4.agent.map(r => r.delay) }, { name: '95th-pct wait', color: '--amber', data: r4.agent.map(r => r.wait_p95) }, { name: 'longest wait', color: '--stop', data: r4.agent.map(r => r.wait_max) }], 'weight on the longest wait', { ymin: 0 });
    const r5 = R.go3_r5;
    if (r5 && $('r5Cv')) {
      const f = $('r5Mode').value;
      chart('r5Cv', r5.agent.map(r => r.H + ' s'), [{ name: 'agent + GLOSA', color: '--agent', data: r5.agent.map(r => r[f]) }, { name: 'fixed plan + GLOSA', color: '--muted', data: r5.agent.map(() => r5.fixed[f]) }], 'commitment horizon H', { zoom: true });
    }
  }
  ['r1Mode', 'r2Mode', 'r5Mode'].forEach(id => $(id) && $(id).addEventListener('change', draw));
  addEventListener('resize', () => setTimeout(draw, 100)); addEventListener('themechange', draw);
  document.addEventListener('DOMContentLoaded', draw); setTimeout(draw, 50);

  // ------------------------------------------------------------ findings in words (from the results)
  function texts() {
    const f = v => (+v).toFixed(1), set = (id, h) => { if ($(id)) $(id).innerHTML = h; };
    const r1 = R.go3_r1;
    if (r1) {
      const base = r1[0], L = r1.filter(r => r.loss === 0 && r.latency !== null), lost = r1.filter(r => r.loss > 0);
      set('r1Txt', `Without messages the corridor delay is <b>${f(base.delay)} s</b>; with instant messages <b>${f(L[0].delay)} s</b>. Latency up to ${L[L.length - 1].latency} s gives ${L.map(r => f(r.delay)).join(', ')} s, and 30-60 % loss gives ${lost.map(r => f(r.delay)).join(' and ')} s. On this short corridor the benefit of talking is small (under 1 s) and the latency and loss effects are within single-seed noise. That is itself a finding: before claiming that communication helps, or that it is fragile, test several seeds, longer corridors and heavier demand. The script is the starting point for that study.`);
    }
    const r2 = R.go3_r2;
    if (r2) {
      const on = r2.filter(r => r.shield), off = r2.filter(r => !r.shield), hi = on.length - 1;
      set('r2Txt', `With ${Math.round(on[hi].h * 100)} % bad answers the shielded agent keeps delay at <b>${f(on[hi].delay)} s</b> (longest wait ${f(on[hi].wait_max)} s); without the shield delay climbs to <b>${f(off[hi].delay)} s</b>, the longest wait to ${f(off[hi].wait_max)} s, and <b>${off[hi].violations}</b> unsafe commands reach the signal. Even a perfectly reliable model without a shield issues ${off[0].violations} rule-breaking commands (mostly switching before minimum green) and looks <em>faster</em> (${f(off[0].delay)} vs ${f(on[0].delay)} s): safety rules have a price, and comparisons must apply the same rules to every method.`);
    }
    const r3 = R.go3_r3;
    if (r3) set('r3Txt', `Seeing only connected vehicles, the agent stays close to the loop-detector version: at 10 % penetration delay is <b>${f(r3[0].cav.delay)} s</b> vs ${f(r3[0].loop.delay)} s with loops; at 100 % they are equal (${f(r3[r3.length - 1].cav.delay)} s). Scaling by penetration is noisy at low shares, which is where estimation of unequipped vehicles matters most. (Delay also falls as CAVs increase because they drive more smoothly.)`);
    const r4 = R.go3_r4;
    if (r4) { const a = r4.agent; set('r4Txt', `With no fairness weight the longest wait is <b>${f(a[0].wait_max)} s</b> at ${f(a[0].delay)} s mean delay. A small weight (0.15) cuts the longest wait to <b>${f(a[1].wait_max)} s</b> and even lowers mean delay (${f(a[1].delay)} s). Larger weights buy little more fairness for extra delay. Max-pressure, which ignores waits, lets one vehicle wait <b>${f(r4.max_pressure.wait_max)} s</b>.`); }
    const r5 = R.go3_r5;
    if (r5) { const a = r5.agent, ms = a.reduce((m, r) => r.stops < m.stops ? r : m, a[0]), L = a[a.length - 1]; set('r5Txt', `Fully adaptive (H = 0): delay <b>${f(a[0].delay)} s</b>, CO2 ${f(a[0].co2_g)} g, ${a[0].stops.toFixed(2)} stops. Committing ${ms.H} s ahead gives the fewest stops (${ms.stops.toFixed(2)}), because more connected cars get usable advice, but delay rises to ${f(ms.delay)} s and CO2 to ${f(ms.co2_g)} g; at H = ${L.H} s delay reaches ${f(L.delay)} s. The fixed plan with GLOSA: ${f(r5.fixed.delay)} s, ${f(r5.fixed.co2_g)} g. In our implementation, the lost adaptivity costs more than eco-driving saves: predictability without losing adaptivity (probabilistic SPaT, joint signal and speed optimisation) is an open problem.`); }
  }
  document.addEventListener('DOMContentLoaded', texts); setTimeout(texts, 60);

  // ------------------------------------------------------------ references
  if ($('refList')) {
    const TOP = { 'llm-agentic-tsc': 'LLM & agentic', 'drl-marl-baselines': 'Deep RL / MARL', 'benchmarks-platforms': 'Simulators & benchmarks', 'max-pressure': 'Max-pressure', 'cav-v2x': 'CAV, eco-driving, V2X', 'gaps-evidence': 'Gap evidence', 'surveys-future': 'Surveys & roadmaps' };
    let topic = 'all';
    const render = () => {
      const q = ($('refQ').value || '').toLowerCase();
      const rows = REFS.filter(r => (topic === 'all' || r.topic === topic) && (r.title + r.authors + r.contribution).toLowerCase().includes(q));
      $('refList').innerHTML = rows.map(r => `<li id="ref-${r.id}" style="margin-top:.6rem"><b>${r.title}</b><br><span class="muted">${r.authors} (${r.year}). ${r.venue}.</span> <a href="${r.url}" target="_blank" rel="noopener">link</a><br><span style="font-size:.93rem">${r.contribution}</span></li>`).join('') || '<li class="muted">No match.</li>';
      $('refCount').textContent = `${rows.length} of ${REFS.length}`;
    };
    $('refTopics').innerHTML = `<button type="button" data-t="all" aria-pressed="true">All</button>` + Object.entries(TOP).map(([k, v]) => `<button type="button" data-t="${k}">${v}</button>`).join('');
    $('refTopics').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { topic = b.dataset.t; $('refTopics').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); render(); }));
    $('refQ').addEventListener('input', render); render();
  }

  // ------------------------------------------------------------ future architecture
  if ($('futBox')) {
    const F = {
      base: ['Fast base policy', 'Max-pressure, actuated logic or a small RL policy decides every few seconds. Cheap, stable, already proven.'],
      llm: ['Slow reasoning agent', 'An LLM is consulted only for unusual cases (incidents, emergencies, special events) or to audit the base policy, as in VLMLight and iLLM-TSC.'],
      critic: ['Critic and verifier', 'A second model or a rule checker reviews every proposal for invalid or hallucinated actions before it is used (HeraldLight).'],
      shield: ['Formal safety shield', 'Hard constraints in the signal cabinet: minimum green, intergreen, pedestrian times, conflict monitor. Never bypassed.'],
      twin: ['Digital twin', 'A calibrated simulation of the corridor where new policies run in shadow mode before going live, and where sim-to-real gaps are measured.'],
      v2x: ['V2X and CAVs', 'SPaT with commitment windows for eco-driving; CAV trajectories as a sensor; cooperative platoons.'],
      human: ['Operator in the loop', 'Engineers state goals in plain language, approve autonomy levels and read the agents\' explanations.'],
    };
    document.querySelectorAll('[data-fut]').forEach(el => el.addEventListener('click', () => {
      document.querySelectorAll('[data-fut]').forEach(x => x.setAttribute('aria-pressed', x === el));
      const [t, d] = F[el.dataset.fut]; $('futBox').innerHTML = `<b>${t}.</b> ${d}`;
    }));
  }

  // ------------------------------------------------------------ research-question builder
  if ($('rqGo')) {
    $('rqGo').onclick = () => {
      const g = $('rqGap').value, m = $('rqMethod').value, s = $('rqSet').value, k = $('rqMetric').value;
      $('rqOut').innerHTML = `<b>Research question.</b> To what extent can <i>${m}</i> address <i>${g}</i> in <i>${s}</i>, measured by <i>${k}</i>, compared with actuated control and max-pressure?<br>
        <b>Minimum viable study.</b> Start from <code>sumo/go3/</code>: copy the closest experiment, add your method as a controller or tool, run at least 3 seeds, report mean and spread, and include one stress test (faults, latency or demand shift).<br>
        <b>Threats to validity.</b> Single simulator, synthetic demand, perfect compliance of connected vehicles, and tuning only on the test scenario.`;
    };
  }
})();
