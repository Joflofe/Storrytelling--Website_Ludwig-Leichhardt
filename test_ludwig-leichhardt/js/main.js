// main.js
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  function boot() {
    const loading = document.getElementById('loading');
    MapController.init(() => {
      ScrollController.init();
      MapController.jumpToChapter(CHAPTERS[0].camera);
      MapController.setRouteProgress(0);
      setTimeout(() => { if (loading) loading.classList.add('hidden'); }, 700);
    });
    _initKeyboard();
    _initWheel();
  }

  // ── Tastatur ──────────────────────────────────────────────────
  function _initKeyboard() {
    let cur = 0;
    document.addEventListener('keydown', e => {
      if (e.key==='ArrowDown'||e.key==='j'||e.key==='PageDown') {
        e.preventDefault(); cur = Math.min(cur+1, CHAPTERS.length-1);
        ScrollController.goToChapter(cur);
      } else if (e.key==='ArrowUp'||e.key==='k'||e.key==='PageUp') {
        e.preventDefault(); cur = Math.max(cur-1, 0);
        ScrollController.goToChapter(cur);
      } else if (e.key==='Home') {
        e.preventDefault(); cur=0; window.scrollTo({top:0, behavior:'smooth'});
      }
    });
    document.addEventListener('chapterChange', e => { cur = e.detail.index; });
  }

  // ── RAD-LOGIK ─────────────────────────────────────────────────
  function _initWheel() {
    const wheelContainer = document.getElementById('wheel-container');
    const wheelSvg       = document.getElementById('wheel-svg');
    const finale         = document.getElementById('finale');
    if (!wheelContainer || !wheelSvg || !finale) return;

    let svgRotation   = 0;
    let stepIndex     = 0;
    let totalSteps    = 87;
    let finaleVisible = false;
    let loopTriggered = false;

    // totalSteps aus GeoJSON holen
    fetch('./data/route.geojson')
      .then(r => r.json())
      .then(d => {
        const coords = d.features.find(f => f.id === 'route')?.geometry?.coordinates;
        if (coords) totalSteps = coords.length - 1;
      })
      .catch(() => {});

    // Nur Sichtbarkeit tracken – KEIN Scroll-Lock mehr
    const obs = new IntersectionObserver(entries => {
      finaleVisible = entries[0].isIntersecting;
      if (!finaleVisible) loopTriggered = false;
    }, { threshold: 0.15 });
    obs.observe(finale);

    // ── Delta verarbeiten ─────────────────────────────────────────
    function handleDelta(rawDelta) {
      if (rawDelta <= 0) return;

      // Route fertig → Loop auslösen
      if (stepIndex >= totalSteps) {
        if (!loopTriggered) {
          loopTriggered = true;
          _triggerLoop(wheelSvg, wheelContainer, () => {
            stepIndex = 0;
            svgRotation = 0;
            wheelSvg.style.transform = 'rotate(0deg)';
            wheelContainer.classList.remove('done');
            wheelContainer.style.filter = '';
            wheelContainer.dataset.lastChapter = '-1';
          });
        }
        return;
      }

      // Empfindlichkeit: Trackpad (~3-8 delta) vs Mausrad (~100)
      const sensitivity = rawDelta > 50 ? 3 : 15;
      const steps = Math.max(1, Math.round(rawDelta / sensitivity));
      stepIndex = Math.min(stepIndex + steps, totalSteps);

      // SVG drehen
      svgRotation += steps * 4.5;
      wheelSvg.style.transform = 'rotate(' + svgRotation + 'deg)';

      // Progress direkt setzen
      const progress = stepIndex / totalSteps;
      const glow = 4 + progress * 20;
      const alpha = 0.3 + progress * 0.6;
      wheelContainer.style.filter = 'drop-shadow(0 0 ' + glow + 'px rgba(255,107,53,' + alpha + '))';
      MapController.setRouteProgress(progress);

      // Kamera zu Station
      CHAPTERS.forEach((ch, i) => {
        const chStep = Math.round(ch.routeProgress * totalSteps);
        if (stepIndex >= chStep && stepIndex <= chStep + 2) {
          const last = parseInt(wheelContainer.dataset.lastChapter || '-1');
          if (last !== i) {
            wheelContainer.dataset.lastChapter = String(i);
            MapController.flyToChapter(ch.camera);
            _showBadge(ch.subtitle);
          }
        }
      });

      if (stepIndex >= totalSteps) wheelContainer.classList.add('done');
    }

    // ── Wheel-Event: nur auf dem Finale abfangen ──────────────────
    // Solange Route noch nicht fertig: Scroll-Event des Finale
    // abfangen damit die Seite nicht weiterscrollt (nichts mehr da).
    // Sobald fertig: normal scrollen lassen (für Loop-Trigger durch
    // normales Runterscrollen ist nichts unter dem Finale).
    finale.addEventListener('wheel', e => {
      if (!finaleVisible) return;

      if (stepIndex < totalSteps) {
        // Route noch nicht fertig → Event abfangen, Rad drehen
        e.preventDefault();
        handleDelta(e.deltaY);
      } else {
        // Route fertig → Loop triggern, aber Seite nicht einfrieren
        handleDelta(e.deltaY);
      }
    }, { passive: false });

    // ── Touch ─────────────────────────────────────────────────────
    let lastTouchY = 0;
    finale.addEventListener('touchstart', e => {
      lastTouchY = e.touches[0].clientY;
    }, { passive: true });

    finale.addEventListener('touchmove', e => {
      if (!finaleVisible) return;
      const dy = lastTouchY - e.touches[0].clientY;
      lastTouchY = e.touches[0].clientY;
      if (dy <= 0) return;
      if (stepIndex < totalSteps) {
        e.preventDefault();
        handleDelta(dy * 2);
      } else {
        handleDelta(dy * 2);
      }
    }, { passive: false });
  }

  function _showBadge(text) {
    const badge = document.getElementById('location-badge');
    if (!badge) return;
    badge.textContent = text;
    badge.classList.add('visible');
    clearTimeout(badge._timer);
    badge._timer = setTimeout(() => badge.classList.remove('visible'), 2500);
  }

  function _triggerLoop(wheelSvg, wheelContainer, onReset) {
    wheelContainer.style.filter = 'drop-shadow(0 0 30px rgba(255,107,53,1))';
    let rot = parseFloat(
      (wheelSvg.style.transform || 'rotate(0deg)').replace('rotate(','').replace('deg)','')
    ) || 0;
    let frames = 0;
    function spinFast() {
      rot += 16; frames++;
      wheelSvg.style.transform = 'rotate(' + rot + 'deg)';
      if (frames < 20) {
        requestAnimationFrame(spinFast);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          MapController.setRouteProgress(0);
          MapController.jumpToChapter(CHAPTERS[0].camera);
          onReset();
        }, 1200);
      }
    }
    requestAnimationFrame(spinFast);
  }

})();
