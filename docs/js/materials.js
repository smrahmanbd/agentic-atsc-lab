/* Lecture / study-guide tabs: switch the embedded viewer between slides and guide. */
(function () {
  const tabs = document.querySelectorAll('.mat-tabs [data-mode]'), ifr = document.getElementById('matIframe'),
    box = document.getElementById('matFrame'), full = document.getElementById('matFull');
  if (!ifr) return;
  function pick(mode) {
    tabs.forEach(b => {
      const on = b.dataset.mode === mode;
      b.className = on ? 'btn' : 'btn ghost'; b.setAttribute('aria-selected', on);
      if (on) { ifr.src = b.dataset.src; full.href = b.dataset.src.replace('&embed=1', ''); }
    });
    if (mode === 'guide') { box.style.aspectRatio = 'auto'; box.style.height = '85vh'; }
    else { box.style.height = ''; box.style.aspectRatio = '16/10.6'; }
  }
  tabs.forEach(b => b.addEventListener('click', () => pick(b.dataset.mode)));
  document.querySelectorAll('[data-open]').forEach(a => a.addEventListener('click', () => pick(a.dataset.open)));
})();
