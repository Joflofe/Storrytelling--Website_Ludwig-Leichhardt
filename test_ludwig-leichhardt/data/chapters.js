const CHAPTERS = [
  {
    id: "start",
    title: "Die Reise beginnt",
    subtitle: "01. Oktober 1844 - Darling Downs",
    body: "Die Port-Essington-Expedition startet auf den Darling Downs (Jimbour Station) westlich von Brisbane. Die Gruppe besteht aus 10 Mann: Leichhardt, James Calvert, John Gilbert, John Murphy, William Phillips, John Roper, die Aborigines Charles Fisher und Harry Brown sowie anfangs C. P. Hodgson und der Afroamerikaner Caleb. Ausgestattet mit 17 Pferden, 16 Ochsen als Pack- und Schlachttiere und einem Rudel Hunde.",
    quote: "Wir brachen auf in ein Land, das kein Europaeer je betreten hatte.",
    quoteAuthor: "- Ludwig Leichhardt, Oktober 1844",
    camera: { center: [150.0, -24.0], zoom: 5.8, pitch: 45, bearing: -5 },
    pointId: "p0",
    routeProgress: 0.0
  },
  {
    id: "carpentaria",
    title: "Golf von Carpentaria",
    subtitle: "05. Juli 1845",
    body: "Nach neun Monaten Marsch durch unbekanntes Terrain - dem Burdekin und Lynd River folgend durch Cape York Peninsula - erreicht die Expedition den Golf von Carpentaria. Am 21. Oktober 1845 ertrinken 3 Pferde. Leichhardt muss einen Grossteil seiner Sammlung aufgeben.",
    quote: "Der Golf lag vor uns. Wir hatten es geschafft - doch der Weg war noch nicht zu Ende.",
    quoteAuthor: "- Ludwig Leichhardt, Juli 1845",
    camera: { center: [141.5, -12.5], zoom: 6.5, pitch: 50, bearing: 10 },
    pointId: "p1",
    routeProgress: 0.46
  },
  {
    id: "roper",
    title: "Roper River",
    subtitle: "November 1845",
    body: "Westwarts entlang der suedlichen Kuestenlinie des Golfs, dann durch felsiges Tafelland und tiefe Schluchten zum Roper River. Maenner und Tiere erschoepfen aufs Aeusserste. Die Verpflegung wird knapper. Doch Port Essington rueckt naeher.",
    quote: "Die Maenner gehen stumm. Kein Klagen mehr - nur noch vorwaerts.",
    quoteAuthor: "- James Calvert, Tagebuch November 1845",
    camera: { center: [134.0, -12.2], zoom: 6.8, pitch: 55, bearing: -10 },
    pointId: "p2",
    routeProgress: 0.69
  },
  {
    id: "essington",
    title: "Port Essington",
    subtitle: "17. Dezember 1845",
    body: "Ankunft in der militaerischen Garnison in Victoria, Port Essington. 14 Monate, 4.800 Kilometer. Am 17. Januar 1846 Rueckreise auf dem Segler Heroine. Am 25. Maerz 1846 Triumph in Sydney - Ehrungen, Vortraege und Ausarbeitung der Expeditionskarte.",
    quote: "Sydney empfing uns wie Helden. Wir waren nur muede Maenner.",
    quoteAuthor: "- John Roper, Maerz 1846",
    camera: { center: [131.9, -11.1], zoom: 8.5, pitch: 40, bearing: 5 },
    pointId: "p3",
    routeProgress: 1.0
  }
];

var SATELLITE_STYLE = {
  version: 8,
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Tiles Esri, Maxar, GeoEye",
      maxzoom: 18
    },
    "esri-labels": {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      maxzoom: 18
    }
  },
  layers: [
    { id: "satellite", type: "raster", source: "esri-satellite" },
    { id: "labels",    type: "raster", source: "esri-labels", paint: { "raster-opacity": 0.5 } }
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
  lineColor: "#FF6B35",
  lineWidth: 3.5,
  lineOpacity: 1.0,
  glowColor: "#FFD080",
  glowWidth: 12,
  glowOpacity: 0.45
};

var TRANSITION = {
  cameraFly: 1800,
  chapterFade: 500,
  routeDraw: 700
};
