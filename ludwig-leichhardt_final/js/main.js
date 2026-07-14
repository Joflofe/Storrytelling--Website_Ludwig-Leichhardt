// main.js
(function () {
  'use strict';

  // ── Inaktivitäts-Reset ────────────────────────────────────────
  // Nach X Minuten ohne Interaktion lädt die Seite neu und startet
  // wieder von oben (Hero-Section). X hier einstellen:
  const INACTIVITY_TIMEOUT_MINUTES = 0.05; // TEMP: verification only

  (function initInactivityReset() {
    const timeoutMs = INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;
    let inactivityTimer;

    function resetInactivityTimer() {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        window.location.reload();
      }, timeoutMs);
    }

    ['mousemove', 'mousedown', 'keydown', 'scroll', 'wheel', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, resetInactivityTimer, { passive: true });
    });

    resetInactivityTimer();
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

function boot() {
    const loading = document.getElementById('loading');
    MapController.init(() => {
      ScrollController.init();
      
      // 1. Die beiden Kamera-Zustände definieren
      const weltAnsicht = { 
        center: [133.0, -25.0], // Startpunkt: Weit weg (Australien)
        zoom: 3.8, 
        pitch: 0, 
        bearing: 0 
      };
      const zielAnsicht = CHAPTERS[0].camera; // Zielpunkt: Eng dran (Erstes Kapitel)

      // Sofort mit der weiten Ansicht starten
      MapController.jumpToChapter(weltAnsicht);
      MapController.setRouteProgress(0);
      
      setTimeout(() => { if (loading) loading.classList.add('hidden'); }, 700);
// 2. Live-Zoom an die Scrollbewegung des Hero-Screens koppeln
      const hero = document.getElementById('hero');
      if (hero) {
        window.addEventListener('scroll', () => {
          const sy = window.scrollY;
          const heroHeight = hero.offsetHeight;

          // --- TIMING EINSTELLUNGEN ---
          // Vorlaufzeit: Animation startet erst, wenn 25% des Hero-Screens weggescrollt sind.
          const startScroll = heroHeight * 0.75; 
          
          // Dauer: Animation endet erst, wenn der Scroll 120% der Hero-Höhe erreicht hat.
          // Das macht den Flug länger und entspannter.
          const endScroll = heroHeight * 1.2; 

          // 1. Linearen Fortschritt berechnen (zwischen 0.0 und 1.0 klammern)
          let p = 0;
          if (sy > startScroll) {
            p = Math.max(0, Math.min(1, (sy - startScroll) / (endScroll - startScroll)));
          }

          // 2. Ease-In-Out Kurve anwenden (sanfter Start, sanftes Bremsen)
          // Diese mathematische Formel biegt unsere lineare Linie (p) in eine sanfte S-Kurve (easeP)
          const easeP = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;

          // 3. Nur rendern, wenn wir uns im relevanten Scroll-Bereich befinden
          // (Wir geben 100px Puffer dazu, um sicherzustellen, dass die Endposition sauber erreicht wird)
          if (sy <= endScroll + 100) {
            const currentZoom    = weltAnsicht.zoom + easeP * (zielAnsicht.zoom - weltAnsicht.zoom);
            const currentLng     = weltAnsicht.center[0] + easeP * (zielAnsicht.center[0] - weltAnsicht.center[0]);
            const currentLat     = weltAnsicht.center[1] + easeP * (zielAnsicht.center[1] - weltAnsicht.center[1]);
            const currentPitch   = weltAnsicht.pitch + easeP * ((zielAnsicht.pitch || 0) - weltAnsicht.pitch);
            const currentBearing = weltAnsicht.bearing + easeP * ((zielAnsicht.bearing || 0) - weltAnsicht.bearing);

            // Karte fließend aktualisieren
            MapController.jumpToChapter({
              center: [currentLng, currentLat],
              zoom: currentZoom,
              pitch: currentPitch,
              bearing: currentBearing
            });
          }
        }, { passive: true });
      }
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
    let totalSteps    = 40;
    let finaleVisible = false;

    // totalSteps aus GeoJSON holen
    fetch('./data/route.geojson')
      .then(r => r.json())
      .then(d => {
        const coords = d.features.find(f => f.id === 'route')?.geometry?.coordinates;
        if (coords) totalSteps = coords.length - 1;
      })
      .catch(() => {});

    const obs = new IntersectionObserver(entries => {
      finaleVisible = entries[0].isIntersecting;
    }, { threshold: 0.15 });
    obs.observe(finale);

    // ── Delta verarbeiten ────────────────────────────────────────
    function handleDelta(rawDelta) {
      if (rawDelta <= 0 || stepIndex >= totalSteps) return;

      const sensitivity = rawDelta > 50 ? 1 : 5;
      const steps = Math.max(1, Math.round(rawDelta / sensitivity));
      stepIndex = Math.min(stepIndex + steps, totalSteps);

      svgRotation += steps * 4.5;
      wheelSvg.style.transform = 'rotate(' + svgRotation + 'deg)';

      const progress = stepIndex / totalSteps;
      const glow = 4 + progress * 20;
      const alpha = 0.3 + progress * 0.6;
      wheelContainer.style.filter = 'drop-shadow(0 0 ' + glow + 'px rgba(255,107,53,' + alpha + '))';
      MapController.setRouteProgress(progress);

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

    // ── Events ───────────────────────────────────────────────────
    finale.addEventListener('wheel', e => {
      if (!finaleVisible) return;
      if (stepIndex < totalSteps) {
        e.preventDefault();
        handleDelta(e.deltaY);
      }
      // Route fertig → Seite scrollt normal weiter (nichts zu tun)
    }, { passive: false });

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

})();
