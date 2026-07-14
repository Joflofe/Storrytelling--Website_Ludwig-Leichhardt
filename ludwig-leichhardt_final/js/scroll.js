// scroll.js - IntersectionObserver Scroll-Logik
const ScrollController = (() => {
  let activeChapterIndex = -1;
function buildChapterPanels() {
    const container = document.getElementById('story-steps');
    if (!container) return;
    CHAPTERS.forEach((chapter, index) => {
      const step = document.createElement('div');
      step.className = 'story-step';
      step.dataset.chapterIndex = index;
      const panel = document.createElement('div');
      
      // NEU: Wenn ein Bild existiert, bekommt das Panel eine extra CSS-Klasse
      panel.className = 'chapter-panel' + (chapter.picture ? ' has-media' : '');
      panel.id = 'panel-' + chapter.id;
      
      panel.innerHTML = _buildPanelHTML(chapter, index);
      step.appendChild(panel);
      container.appendChild(step);
    });
  }

  function _buildPanelHTML(chapter, index) {
    const dots = CHAPTERS.map((_, i) =>
      '<div class="progress-dot' + (i === index ? ' active' : '') + '"></div>'
    ).join('');
    const quote = chapter.quote ? (
      '<blockquote class="chapter-quote"><p>' + chapter.quote + '</p>' +
      '<cite>' + (chapter.quoteAuthor || '') + '</cite></blockquote>'
    ) : '';

    // Bild-Container (falls ein Bild da ist)
    const media = chapter.picture ? 
      '<div class="chapter-media"><img src="' + chapter.picture.src + '" class="chapter-picture" alt="' + chapter.title + '"></div>' 
      : '';

    // Text-Container
    const textContent = '<div class="chapter-text">' +
      '<div class="chapter-number">' + STATION_LABEL + ' ' + String(index+1).padStart(2,'0') +
      ' / ' + String(CHAPTERS.length).padStart(2,'0') + '</div>' +
      '<h2 class="chapter-title">' + chapter.title + '</h2>' +
      '<div class="chapter-subtitle">' + chapter.subtitle + '</div>' +
      '<p class="chapter-body">' + chapter.body + '</p>' +
      quote +
      '<div class="progress-indicator">' + dots + '</div>' +
    '</div>';

    // Reihenfolge: Erst der Text (wird links angezeigt), dann das Bild (rechts)
    return textContent + media;
  }

  function buildNavigation() {
    const nav = document.getElementById('chapter-nav');
    if (!nav) return;
    CHAPTERS.forEach((chapter, index) => {
      const dot = document.createElement('div');
      dot.className = 'nav-dot';
      dot.title = chapter.title;
      dot.addEventListener('click', () => goToChapter(index));
      nav.appendChild(dot);
    });
  }

  function initObservers() {
    const panels = document.querySelectorAll('.chapter-panel');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const panel = entry.target;
        const step = panel.closest('.story-step');
        const index = parseInt(step?.dataset?.chapterIndex ?? -1);
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          panel.classList.add('is-active');
          if (index !== activeChapterIndex && index >= 0) _activateChapter(index);
        } else if (!entry.isIntersecting) {
          panel.classList.remove('is-active');
        }
      });
    }, { rootMargin: '-15% 0px -15% 0px', threshold: [0, 0.25, 0.5] });
    panels.forEach(p => observer.observe(p));
  }

  function _activateChapter(index) {
    activeChapterIndex = index;
    const chapter = CHAPTERS[index];
    document.querySelectorAll('.nav-dot').forEach((dot, i) => dot.classList.toggle('active', i === index));
    MapController.flyToChapter(chapter.camera);
    _animateRouteProgress(chapter.routeProgress);
    _showLocationBadge(chapter.subtitle);
    document.dispatchEvent(new CustomEvent('chapterChange', { detail: { index, chapter } }));
  }

  let rafId = null, fromProg = 0;
  function _animateRouteProgress(target) {
    if (rafId) cancelAnimationFrame(rafId);
    const start = fromProg;
    let t0 = null;
    const dur = TRANSITION.routeDraw;
    function tick(ts) {
      if (!t0) t0 = ts;
      const t = Math.min((ts - t0) / dur, 1);
      const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      const cur = start + (target - start) * e;
      MapController.setRouteProgress(cur);
      fromProg = cur;
      if (t < 1) rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  let badgeTimer = null;
  function _showLocationBadge(text) {
    const badge = document.getElementById('location-badge');
    if (!badge) return;
    badge.textContent = text;
    badge.classList.add('visible');
    if (badgeTimer) clearTimeout(badgeTimer);
    badgeTimer = setTimeout(() => badge.classList.remove('visible'), 2800);
  }

  function initScrollEffects() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const sy = window.scrollY;
        const hero = document.getElementById('hero');
        const animationSection = document.querySelector('.animation-section');
        const lottieContainer = document.querySelector('.animation-flex-container');

        if (hero && sy < hero.offsetHeight) {
          hero.style.transform = 'translateY(' + (sy * 0.28) + 'px)';
          hero.style.opacity = Math.max(0, 1 - (sy / hero.offsetHeight) * 1.1);
        }

        if (animationSection || lottieContainer) {
          const opacity = Math.max(0, 1 - (sy / Math.max(1, hero?.offsetHeight || 1)) * 2.8);
          if (animationSection) animationSection.style.opacity = opacity;
          if (lottieContainer) lottieContainer.style.opacity = opacity;
        }

        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }

  function init() {
    buildChapterPanels();
    buildNavigation();
    initObservers();
    initScrollEffects();
  }

  function goToChapter(index) {
    const steps = document.querySelectorAll('.story-step');
    if (steps[index]) steps[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return { init, goToChapter };
})();
