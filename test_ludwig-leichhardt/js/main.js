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

})();
