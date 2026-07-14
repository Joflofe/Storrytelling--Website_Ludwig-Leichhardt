// map.js
const MapController = (() => {
  let map = null;
  let routeCoordinates = [];
  let isReady = false;
  let pendingCamera = null;

  function init(onReady) {
    map = new maplibregl.Map({
      container: 'map',
      style: MAP_CONFIG.style,
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      pitch: MAP_CONFIG.pitch,
      bearing: MAP_CONFIG.bearing,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      attributionControl: { compact: true },
      antialias: false,
      fadeDuration: 200,
      interactive: false,
      scrollZoom: false,
      boxZoom: false,
      dragRotate: false,
      dragPan: false,
      keyboard: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      touchPitch: false
    });

    map.on('load', () => {
      isReady = true;
      _loadRoute();
      _styleMap();
      if (pendingCamera) { flyToChapter(pendingCamera, 0); pendingCamera = null; }
      if (onReady) onReady();
    });

    map.on('error', e => console.warn('Map:', e.error?.message || e));
    return map;
  }

  async function _loadRoute() {
    try {
      const r = await fetch('./data/route.geojson');
      if (!r.ok) throw new Error('404');
      const geojson = await r.json();
      const feat = geojson.features.find(f => f.id === 'route');
      if (feat) routeCoordinates = feat.geometry.coordinates;
      _addSources(geojson);
      _addLayers();
    } catch (e) {
      console.warn('GeoJSON Fehler:', e);
      _fallback();
    }
  }

  function _addSources(geojson) {
    map.addSource('route-animated', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
    });
    map.addSource('route-full', {
      type: 'geojson',
      data: geojson.features.find(f => f.id === 'route')
    });
    map.addSource('points', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: geojson.features.filter(f => f.geometry.type === 'Point')
      }
    });
    map.addSource('active-point', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
  }

  function _addLayers() {
    // Gedaempfte Vollroute (Hintergrund)
    map.addLayer({
      id: 'route-bg',
      type: 'line',
      source: 'route-full',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': 1, 'line-opacity': 0.12 }
    });
    // Glow
    map.addLayer({
      id: 'route-glow',
      type: 'line',
      source: 'route-animated',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ROUTE_STYLE.glowColor,
        'line-width': ROUTE_STYLE.glowWidth,
        'line-opacity': ROUTE_STYLE.glowOpacity,
        'line-blur': 4
      }
    });
    // Hauptlinie
    map.addLayer({
      id: 'route-main',
      type: 'line',
      source: 'route-animated',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ROUTE_STYLE.lineColor,
        'line-width': ROUTE_STYLE.lineWidth,
        'line-opacity': ROUTE_STYLE.lineOpacity
      }
    });
    // Alle Punkte
    map.addLayer({
      id: 'points-ring',
      type: 'circle',
      source: 'points',
      paint: {
        'circle-radius': 8,
        'circle-color': 'transparent',
        'circle-stroke-color': '#FFD080',
        'circle-stroke-width': 1.5,
        'circle-opacity': 0.7
      }
    });
    map.addLayer({
      id: 'points-dot',
      type: 'circle',
      source: 'points',
      paint: {
        'circle-radius': 4,
        'circle-color': '#FF6B35',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1
      }
    });
    // Aktiver Punkt
    map.addLayer({
      id: 'active-ring',
      type: 'circle',
      source: 'active-point',
      paint: {
        'circle-radius': 16,
        'circle-color': 'transparent',
        'circle-stroke-color': '#FF6B35',
        'circle-stroke-width': 2,
        'circle-opacity': 0.95
      }
    });
    map.addLayer({
      id: 'active-dot',
      type: 'circle',
      source: 'active-point',
      paint: {
        'circle-radius': 6,
        'circle-color': '#FF6B35',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.5
      }
    });
  }

  // Satellit: CSS-Filter fuer leichte Sepia-Tonung
  function _styleMap() {
    const canvas = map.getCanvas();
    if (canvas) canvas.style.filter = 'sepia(20%) brightness(0.85) contrast(1.08)';
  }

  function _fallback() {
    routeCoordinates = [
      [151.85,-27.55],[149.0,-23.0],[145.0,-16.0],
      [141.58,-11.58],[135.0,-12.0],[132.15,-11.02]
    ];
    if (!map.getSource('route-animated')) {
      map.addSource('route-animated', { type:'geojson', data:{type:'Feature',geometry:{type:'LineString',coordinates:[]}} });
      map.addSource('route-full',     { type:'geojson', data:{type:'Feature',geometry:{type:'LineString',coordinates:routeCoordinates}} });
      map.addSource('points',         { type:'geojson', data:{type:'FeatureCollection',features:[]} });
      map.addSource('active-point',   { type:'geojson', data:{type:'FeatureCollection',features:[]} });
      _addLayers();
    }
  }

  // DIREKT – kein Tween, kein requestAnimationFrame
  function setRouteProgress(progress) {
    if (!isReady || !map.getSource('route-animated')) return;
    if (routeCoordinates.length < 2) return;

    progress = Math.max(0, Math.min(1, progress));
    const total = routeCoordinates.length;
    const targetIdx = progress * (total - 1);
    const floor = Math.floor(targetIdx);

    // Bis zum aktuellen Index + letzter Teilpunkt
    const coords = routeCoordinates.slice(0, floor + 1);
    const frac = targetIdx - floor;
    if (floor < total - 1 && frac > 0.01) {
      const a = routeCoordinates[floor], b = routeCoordinates[floor + 1];
      coords.push([a[0] + (b[0]-a[0])*frac, a[1] + (b[1]-a[1])*frac]);
    }

    if (coords.length >= 2) {
      map.getSource('route-animated').setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords }
      });
    }

    // Progress-Bar
    const fill = document.getElementById('route-progress-fill');
    if (fill) fill.style.width = (progress * 100) + '%';

    // Aktiven Punkt hervorheben
    _updateActivePoint(progress);
  }

  function _updateActivePoint(progress) {
    if (!map.getSource('active-point')) return;
    let bestChapter = null;
    CHAPTERS.forEach(ch => {
      if (ch.routeProgress <= progress + 0.02) bestChapter = ch;
    });
    if (!bestChapter || !bestChapter.pointId) {
      map.getSource('active-point').setData({ type:'FeatureCollection', features:[] });
      return;
    }
    const src = map.getSource('points');
    if (!src || !src._data || !src._data.features) return;
    const feat = src._data.features.find(f =>
      f.properties && f.properties.chapterIndex === CHAPTERS.indexOf(bestChapter)
    );
    if (feat) {
      map.getSource('active-point').setData({ type:'FeatureCollection', features:[feat] });
    }
  }

  function flyToChapter(camera, duration) {
    if (!isReady) { pendingCamera = camera; return; }
    map.flyTo({
      center: camera.center, zoom: camera.zoom,
      pitch: camera.pitch || 0, bearing: camera.bearing || 0,
      duration: duration !== undefined ? duration : TRANSITION.cameraFly,
      essential: true,
      easing: t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t
    });
  }

  function jumpToChapter(camera) {
    if (!isReady) { pendingCamera = camera; return; }
    map.jumpTo({
      center: camera.center, zoom: camera.zoom,
      pitch: camera.pitch || 0, bearing: camera.bearing || 0
    });
  }

  return { init, flyToChapter, jumpToChapter, setRouteProgress };
})();
