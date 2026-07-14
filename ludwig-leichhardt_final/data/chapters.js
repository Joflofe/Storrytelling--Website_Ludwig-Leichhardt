const STATION_LABEL = "Station";

const CHAPTERS = [
  {
    id: "start",
    // picture: { src: "pictures/Landschaft.jpg" },
    title: "Die Reise beginnt",
    subtitle: "01. Oktober 1844 - Darling Downs",
    body: "Auf der Jimbour Station (Darling Downs) westlich von Brisbane nahm die Port-Essington-Expedition ihren Anfang. Die zehnköpfige Gruppe umfasste neben Leichhardt die Teilnehmer Calvert, Gilbert, Murphy, Phillips, Roper, die Aborigines Charles Fisher und Harry Brown sowie anfangs Hodgson und den Afroamerikaner Caleb. Ihr Marschgepäck bestand aus 17 Pferden, 16 Ochsen als Pack- und Nutztiere und einem Rudel Hunde.",
    camera: { center: [152.93, -27.94], zoom: 5.8, pitch: 45, bearing: -5 },
    pointId: "p0",
    routeProgress: 0.0
  },
  {
    id: "carpentaria",
    title: "Golf von Carpentaria",
    subtitle: "05. Juli 1845",
    body: "Nach neun Monaten Marsch durch unbekanntes Terrain der Cape-York-Halbinsel erreichte die Expedition im Juli 1845 den Golf von Carpentaria. Die Reise war von extremen Rückschlägen geprägt: Im Januar entgingen Leichhardt und Calvert nur knapp dem Verdursten, und im Juni forderte ein nächtlicher Überfall das Leben von Gilbert, während Roper und Calvert verletzt wurden. Als im Oktober auch noch drei Pferde ertranken, musste Leichhardt einen Großteil seiner Sammlung aufgeben.",
    camera: { center: [142.03, -15.98], zoom: 6.5, pitch: 50, bearing: 10 },
    pointId: "p1",
    routeProgress: 0.46
  },
  {
    id: "roper",
    title: "Roper River",
    subtitle: "November 1845",
    body: "Der Weg führte über felsiges Tafelland und durch tiefe Schluchten zum Roper River. Bei knapper Verpflegung waren Männer und Tiere bis aufs Äußerste erschöpft, doch das Ziel Port Essington rückte näher.",
    camera: { center: [132.98, -15.56], zoom: 6.8, pitch: 55, bearing: -10 },
    pointId: "p2",
    routeProgress: 0.86
  },
  {
    id: "essington",
    title: "Port Essington",
    subtitle: "17. Dezember 1845",
    body: "Nach 14 Monaten und 4.800 Kilometern erreichte die Expedition schließlich ihr Ziel, die militärische Garnison Victoria in Port Essington. Es folgte am 17. Januar 1846 die Rückreise auf dem Segelschiff Heroine. Als die Männer am 25. März in Sydney eintrafen, wurde Leichhardts Triumph gefeiert &ndash; er begeisterte das Publikum mit Vorträgen und begann mit der Ausarbeitung seiner Expeditionskarte.",
    camera: { center: [132.71, -11.67], zoom: 8.5, pitch: 40, bearing: 5 },
    pointId: "p3",
    routeProgress: 1.0
  }
];

var SATELLITE_STYLE = {
  version: 8,
  sources: {
    "protomaps": {
      type: "vector",
      url: "pmtiles://tiles/australien.pmtiles"
    }
  },
  layers: [
    // Hintergrund (Ozean)
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#2e64a1" }
    },
    // Land
    {
      id: "earth",
      type: "fill",
      source: "protomaps",
      "source-layer": "earth",
      paint: { "fill-color": "rgb(34, 58, 34)" }
    },
    
// Wald
{
  id: "landcover-forest",
  type: "fill",
  source: "protomaps",
  "source-layer": "landcover",
  filter: ["==", ["get", "kind"], "forest"],
  paint: { "fill-color": "#214821", "fill-opacity": 0.8 }
},
// Grasland
{
  id: "landcover-grass",
  type: "fill",
  source: "protomaps",
  "source-layer": "landcover",
  filter: ["any",
  ["==", ["get", "kind"], "grass"],
  ["==", ["get", "kind"], "scrub"],
  ["==", ["get", "kind"], "meadow"]
],
  paint: { "fill-color": "#3f6625", "fill-opacity": 0.7 }
},
// Wüste / Fels
{
  id: "landcover-desert",
  type: "fill",
  source: "protomaps",
  "source-layer": "landcover",
  filter: ["any",
  ["==", ["get", "kind"], "sand"],
  ["==", ["get", "kind"], "bare_rock"]
],
  paint: { "fill-color": "#6b4f2a", "fill-opacity": 0.7 }
},
// Feuchtgebiete
{
  id: "landcover-wetland",
  type: "fill",
  source: "protomaps",
  "source-layer": "landcover",
  filter: ["==", ["get", "kind"], "wetland"],
  paint: { "fill-color": "#2a4a3a", "fill-opacity": 0.7 }
},
// Schnee
{
  id: "landcover-snow",
  type: "fill",
  source: "protomaps",
  "source-layer": "landcover",
  filter: ["==", ["get", "kind"], "snow"],
  paint: { "fill-color": "#e8e8e8", "fill-opacity": 0.6 }
},
    
    // Wasser / Seen
    {
  id: "water",
  type: "fill",
  source: "protomaps",
  "source-layer": "water",
  minzoom: 0,
  maxzoom: 24,
  paint: { "fill-color": "#2e64a1" }
},
    // Flüsse
    {
  id: "rivers",
  type: "line",
  source: "protomaps",
  "source-layer": "waterway",
  minzoom: 0,
  maxzoom: 24,
  paint: {
    "line-color": "#1a3a5c",
    "line-width": 1.5,
    "line-opacity": 0.8
  }
},
    // Ländergrenzen
    {
      id: "borders",
      type: "line",
      source: "protomaps",
      "source-layer": "boundaries",
      filter: ["==", "kind", "country"],
      paint: {
        "line-color": "#8B7355",
        "line-width": 1.5,
        "line-dasharray": [4, 2],
        "line-opacity": 0.9
      }
    },
    // Bundesstaatsgrenzen Australien
    {
      id: "states",
      type: "line",
      source: "protomaps",
      "source-layer": "boundaries",
      filter: ["==", "kind", "region"],
      paint: {
        "line-color": "#5a4a3a",
        "line-width": 0.8,
        "line-dasharray": [3, 3],
        "line-opacity": 0.6
      }
    },
  ]
};

var MAP_CONFIG = {
  style: SATELLITE_STYLE,
  center: [144.0, -19.0],
  zoom: 4.8,
  pitch: 0,
  bearing: 0,
  minZoom: 3,
  maxZoom: 12
};

var ROUTE_STYLE = {
  lineColor: "#EB6000",
  lineWidth: 5,
  lineOpacity: 1.0,
};

var TRANSITION = {
  cameraFly: 1500,
  chapterFade: 600,
  routeDraw: 1500
};
