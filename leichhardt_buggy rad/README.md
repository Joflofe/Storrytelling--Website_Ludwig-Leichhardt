# 🗺️ Leichhardt – Cinematic Scrollytelling

Offline-fähige Scrollytelling-Webseite für die Ludwig-Leichhardt-Expedition (1844–1845).

---

## 📁 Projektstruktur

```
leichhardt/
├── index.html              ← Einstiegspunkt
├── README.md
│
├── css/
│   └── style.css           ← Alle Stile (Cinematic Dark Theme)
│
├── data/
│   ├── chapters.js         ← KAPITEL-DATEN – hier editieren!
│   └── route.geojson       ← Routenpunkte der Expedition
│
└── js/
    ├── map.js              ← MapLibre-Controller (Kamera, Route)
    ├── scroll.js           ← IntersectionObserver-Scroll-Logik
    └── main.js             ← App-Initialisierung
```

---

## 🚀 Starten

### Option 1: Lokaler Python-Server (empfohlen)
```bash
# Im Projektordner:
python3 -m http.server 8080
# Dann: http://localhost:8080
```

### Option 2: Direkt im Browser
Einfach `index.html` im Browser öffnen. Achtung: GeoJSON-Fetch schlägt ohne Server fehl (CORS), Fallback-Daten werden verwendet.

### Option 3: Raspberry Pi Kiosk-Modus
```bash
# Chromium im Kiosk-Modus starten:
chromium-browser --kiosk --noerrdialogs \
  --disable-infobars --incognito \
  http://localhost:8080
```

---

## 📝 Kapitel hinzufügen/editieren

Öffne `data/chapters.js` – keine Logik-Kenntnisse nötig:

```javascript
{
  id: "mein-kapitel",           // Einzigartiger Bezeichner
  title: "Mein Kapitel-Titel",
  subtitle: "Ort, Datum",
  body: `Fließtext des Kapitels...`,
  quote: "„Zitat..."",           // optional, null für keins
  quoteAuthor: "— Quelle",
  camera: {
    center: [LÄNGENGRAD, BREITENGRAD],  // [lon, lat]
    zoom: 6.5,         // 3=weit, 12=nah
    pitch: 45,         // 0=senkrecht, 60=flach
    bearing: 0         // Rotation in Grad
  },
  routeProgress: 0.5   // 0.0 = Start, 1.0 = Ende
}
```

---

## 🗺️ Offline-Karte einrichten

Für echten Offline-Betrieb auf dem Raspberry Pi:

### Schritt 1: MapLibre lokal speichern
```bash
# Im leichhardt/ Ordner:
mkdir -p vendor/maplibre
cd vendor/maplibre
curl -O https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js
curl -O https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css
```

### Schritt 2: index.html anpassen
```html
<!-- Statt CDN: -->
<link rel="stylesheet" href="vendor/maplibre/maplibre-gl.css" />
<script src="vendor/maplibre/maplibre-gl.js"></script>
```

### Schritt 3: Offline-Kartenstil + Tiles
Optionen für offline Kartenmaterial (kostenlos):
- **maptiler-basic-gl-style** (Community Edition): https://github.com/openmaptiles/maptiler-basic-gl-style
- **Versatiles**: https://versatiles.org – komplette Offline-Tile-Lösung
- **TileServer GL**: Lokal-Server für MBTiles
  ```bash
  npm install -g tileserver-gl
  # Australia MBTiles von: https://download.geofabrik.de/australia-oceania.html
  tileserver-gl --mbtiles australia.mbtiles --port 8081
  ```
- Dann `MAP_CONFIG.style` in `data/chapters.js` auf lokalen Server zeigen

### Schritt 4: Fonts lokal (optional)
```css
/* In css/style.css, @import ersetzen durch: */
@font-face {
  font-family: 'Cinzel';
  src: url('../fonts/Cinzel-Regular.woff2') format('woff2');
}
/* Fonts von Google Fonts herunterladen: fonts.google.com */
```

---

## ⌨️ Tastatursteuerung

| Taste | Aktion |
|-------|--------|
| `↓` / `PageDown` / `J` | Nächstes Kapitel |
| `↑` / `PageUp` / `K` | Vorheriges Kapitel |
| `Home` | Zum Anfang |
| `End` | Zum Ende |

---

## 🔧 Performance-Tipps für Raspberry Pi

In `data/chapters.js`:
- `MAP_CONFIG` → `antialias: false` (bereits gesetzt)
- `TRANSITION.cameraFly` auf `1500` reduzieren für schnellere Übergänge
- Weniger Kapitel = bessere Performance
- Chromium-Flag `--disable-gpu` ausprobieren falls Darstellungsfehler

---

## 🧩 Erweiterungsmöglichkeiten

- **Bilder**: `chapter.image: "img/kapitel1.jpg"` hinzufügen, in `scroll.js` rendern
- **Sound**: `chapter.audio: "audio/ambient.mp3"` + Web Audio API in `main.js`
- **Animierte Marker**: MapLibre Marker-API in `map.js`
- **Zeitstrahl**: Horizontale Scroll-Sektion als separates Modul
- **Touch-Gesten**: Hammer.js für mobile Swipe-Navigation
- **Fullscreen**: Chromium-Kiosk-Modus nutzt Vollbild automatisch

---

## 🛠️ Technologie-Stack

| Tool | Version | Lizenz |
|------|---------|--------|
| MapLibre GL JS | 4.7.1 | BSD-3-Clause ✅ |
| Vanilla JS/CSS/HTML | – | – |
| IntersectionObserver API | Browser-nativ | – |
| GeoJSON | RFC 7946 | – |
| Google Fonts (Cinzel, Playfair, Garamond) | – | OFL ✅ |

Keine proprietären APIs. Keine Kosten. Keine Cloud-Abhängigkeiten (nach Offline-Setup).
