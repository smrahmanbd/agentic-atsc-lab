/* Go 2 widgets: decision inspector, training curve, prompt + shield playground. */
(function () {
  const $ = id => document.getElementById(id);
  const R = window.RESULTS || {};

  // ---------------------------------------------------------- decision inspector (Lab 1)
  if ($('diList')) {
    const D = (R.go2_lab1_decisions || []);
    const render = () => {
      const only = $('diSw').checked;
      const rows = D.filter(d => !only || d.action === 'switch');
      $('diList').innerHTML = rows.map(d => `<div class="${d.action === 'switch' ? 'sw' : ''}">t=${d.t} ${d.jid} · ${d.action.toUpperCase()} · ${d.why}</div>`).join('') || '<div class="muted">Run go2/01_first_agent.py to create the log.</div>';
    };
    $('diSw').addEventListener('change', render); render();
  }

  // ---------------------------------------------------------- training curve (Lab 3)
  function curve() {
    const T = R.go2_lab3_training;
    if (!T || !$('qlCv')) return;
    lineChart($('qlCv'), [{ color: '--agent', data: T.map(t => t.delay), width: 2.4 }], { xlabel: `episode 1 → ${T.length} · mean delay (s/veh)`, ymin: 0 });
  }
  setTimeout(curve, 50); addEventListener('resize', () => setTimeout(curve, 100)); addEventListener('themechange', curve);

  // ---------------------------------------------------------- Lab 4 table
  if ($('l4Table') && R.go2_lab4) {
    const L = R.go2_lab4, f = v => (+v).toFixed(1);
    $('l4Table').innerHTML = '<table class="data"><tr><th>Controller</th><th>CAV share</th><th>CO2 (g)</th><th>Stops / veh</th><th>Delay (s)</th></tr>' +
      L.map(r => `<tr><td>${r.name}</td><td>${Math.round(r.penetration * 100)} %</td><td>${f(r.co2_g)}</td><td>${r.stops.toFixed(2)}</td><td>${f(r.delay)}</td></tr>`).join('') + '</table>';
    const fx = L.filter(r => r.name.startsWith('Fixed')), ag = L.filter(r => !r.name.startsWith('Fixed'));
    $('l4Txt').innerHTML = `With the fixed plan, stops fall from ${fx[0].stops.toFixed(2)} to ${fx[fx.length - 1].stops.toFixed(2)} per vehicle and CO2 from ${f(fx[0].co2_g)} to ${f(fx[fx.length - 1].co2_g)} g as connected vehicles go from 0 to 100 %: the plan is perfectly predictable. The committed agent has lower delay (${f(ag[ag.length - 1].delay)} vs ${f(fx[fx.length - 1].delay)} s at 100 %) but can only promise its next change 8 s ahead, so fewer cars get useful advice.`;
  }

  // ---------------------------------------------------------- prompt + shield playground (Lab 6)
  if ($('pgGo')) {
    const MING = 8, MAXG = 60;
    const run = () => {
      const o = { stage: $('pgStage').value, green_for: +$('pgG').value, queue_EW: +$('pgQE').value, queue_NS: +$('pgQN').value, wait_EW: +$('pgWE').value, wait_NS: +$('pgWN').value };
      const cap = +$('pgCap').value;
      $('pgPrompt').textContent = `You control one traffic signal with two stages, EW and NS.\nObservation: ${JSON.stringify(o)}\nGoals: minimise delay, never let anyone wait more than ${cap} s, serve buses/ambulances first, avoid sending cars into a full exit.\nReply with JSON only: {"action": "keep" | "switch", "reason": "<one sentence>"}`;
      let ans, err = null;
      try { ans = JSON.parse($('pgAns').value); } catch (e) { err = 'reply is not valid JSON'; }
      const other = o.stage === 'EW' ? 'NS' : 'EW';
      let verdict, final;
      if (err) { verdict = err; final = 'keep'; }
      else if (!['keep', 'switch'].includes(ans.action)) { verdict = `unknown action "${ans.action}"`; final = 'keep'; }
      else if (ans.action === 'switch' && o.green_for < MING) { verdict = `switch before minimum green (${o.green_for} < ${MING} s)`; final = 'keep'; }
      else if (ans.action === 'keep' && o.green_for >= MAXG && o['queue_' + other] > 0) { verdict = `maximum green ${MAXG} s reached`; final = 'switch'; }
      else if (ans.action === 'keep' && o['wait_' + other] > cap) { verdict = `fairness cap: someone on ${other} waited > ${cap} s`; final = 'switch'; }
      else { verdict = null; final = ans.action; }
      $('pgOut').innerHTML = verdict ? `<span style="color:var(--stop)"><b>Shield blocked:</b> ${verdict}.</span> Signal does: <b>${final}</b>.`
        : `<span style="color:var(--go)"><b>Shield passed.</b></span> Signal does: <b>${final}</b>${ans && ans.reason ? ` · reason given: “${ans.reason}”` : ''}`;
    };
    document.querySelectorAll('#pgPre button').forEach(b => b.addEventListener('click', () => { $('pgAns').value = b.dataset.a; run(); }));
    ['pgStage', 'pgG', 'pgQE', 'pgQN', 'pgWE', 'pgWN', 'pgCap', 'pgAns'].forEach(id => $(id).addEventListener('input', run));
    $('pgGo').onclick = run; run();
  }
})();
