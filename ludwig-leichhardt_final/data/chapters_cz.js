const STATION_LABEL = "Stanice";

const CHAPTERS = [
  {
    id: "start",
    // picture: { src: "pictures/Landschaft.jpg" },
    title: "Cesta začíná",
    subtitle: "1. října 1844 – Darling Downs",
    body: "Expedice do Port Essingtonu začala na farmě Jimbour (Darling Downs) západně od Brisbane. Desetičlennou skupinu tvořili kromě Leichhardta také Calvert, Gilbert, Murphy, Phillips, Roper, domorodci Charles Fisher a Harry Brown a zpočátku také Hodgson a Afroameričan Caleb. Jejich výbavu tvořilo 17 koní, 16 volů jako tažná a užitková zvířata a smečka psů.",
    camera: { center: [152.93, -27.94], zoom: 5.8, pitch: 45, bearing: -5 },
    pointId: "p0",
    routeProgress: 0.0
  },
  {
    id: "carpentaria",
    title: "Carpentarský záliv",
    subtitle: "5. července 1845",
    body: "Po devíti měsících pochodu neznámým terénem poloostrova Cape York dorazila expedice v červenci 1845 k Carpentarskému zálivu. Cesta byla poznamenána extrémními neúspěchy: v lednu Leichhardt a Calvert jen těsně unikli smrti žízní a v červnu si noční přepadení vyžádalo život Gilberta, zatímco Roper a Calvert byli zraněni. Když se v říjnu navíc utopily tři koně, musel Leichhardt vzdát velkou část své sbírky.",
    camera: { center: [142.03, -15.98], zoom: 6.5, pitch: 50, bearing: 10 },
    pointId: "p1",
    routeProgress: 0.46
  },
  {
    id: "roper",
    title: "Řeka Roper",
    subtitle: "listopad 1845",
    body: "Cesta vedla přes skalnatou náhorní plošinu a hlubokými roklemi k řece Roper. S omezenými zásobami jídla byli lidé i zvířata vyčerpaní až na samou hranici svých sil, ale cíl, Port Essington, se blížil.",
    camera: { center: [132.98, -15.56], zoom: 6.8, pitch: 55, bearing: -10 },
    pointId: "p2",
    routeProgress: 0.86
  },
  {
    id: "essington",
    title: "Port Essington",
    subtitle: "17. prosince 1845",
    body: "Po 14 měsících a 4 800 kilometrech expedice konečně dorazila ke svému cíli, vojenské posádce Victoria v Port Essingtonu. Následovala 17. ledna 1846 zpáteční cesta na plachetnici Heroine. Když muži 25. března dorazili do Sydney, oslavoval se Leichhardtův triumf &ndash; nadchl publikum svými přednáškami a začal s vypracováním mapy své expedice.",
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
