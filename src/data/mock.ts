import { NavLink, Review } from "@/types";

export const NAV_LINKS: NavLink[] = [
  { label: "INICI", href: "/" },
  { label: "EN QUÈ EM CENTRO", href: "/#focus" },
  { label: "ESDEVENIMENTS", href: "/esdeveniments" },
  { label: "GALERIA", href: "/galeria" },
  { label: "OPINIONS", href: "/#opinions" },
  { label: "PREUS", href: "/preus" },
];

export const STATS = [
  { value: "10+", label: "EVENTS COMPLETATS" },
  { value: "4K", label: "SEGUIDORS" },
  { value: "100%", label: "SATISFACCIÓ" },
  { value: "+10M", label: "VISUALITZACIONS" },
];

export const EVENTS = [
  {
    id: "evt-1",
    name: "CARNAVAL 2026",
    description: "Una nit inoblidable a la NAUB1 de Granollers. Èxit total de públic i energia!",
    image: "/Fotos/eventos/carnaval-2026/dj-posaxa-carnaval-2026-festa-0058.jpg",
  },
  {
    id: "evt-2",
    name: "FESTA MAJOR 2025",
    description: "Disco Inferno XS: l'espectacle que va marcar l'estiu a Granollers.",
    image: "/Fotos/eventos/disco-inferno-xs-2025/dj-posaxa-disco-inferno-pnc-1.jpg",
  },
  {
    id: "evt-3",
    name: "GRA JOVE",
    description: "Actuació destacada al MusiKnviu. Energia jove i talent emergent.",
    image: "/Fotos/dj-posaxa-sessio-inici-2.jpg",
  },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "CONTACTA",
    desc: "Explica'm la teva idea. Parlem del tipus d'esdeveniment, data i les teves preferències musicals.",
  },
  {
    step: "02",
    title: "PLANIFICACIÓ",
    desc: "Dissenyem la playlist i l'estructura de la sessió. Tot personalitzat al 100% per tu.",
  },
  {
    step: "03",
    title: "LA FESTA",
    desc: "Gaudeix sense preocupacions. Jo m'encarrego de la música, l'animació i que tothom balli.",
  },
];

export const REVIEWS: Review[] = [
  {
    text: "Va ser una nit increïble. El DJ va saber llegir el públic perfectament i no vam parar de ballar!",
    author: "Albert P",
  },
];

export const GALLERY_IMAGES = [
  "/Fotos/eventos/carnaval-2026/dj-posaxa-carnaval-2026-festa-0058.jpg",
  "/Fotos/eventos/disco-inferno-xs-2025/dj-posaxa-disco-inferno-pnc-1.jpg",
  "/Fotos/eventos/carnaval-2026/dj-posaxa-carnaval-2026-festa-0037.jpg",
  "/Fotos/eventos/disco-inferno-xs-2025/dj-posaxa-disco-inferno-pnc-4.jpg",
  "/Fotos/eventos/carnaval-2026/dj-posaxa-carnaval-2026-festa-0064.jpg",
  "/Fotos/eventos/disco-inferno-xs-2025/dj-posaxa-disco-inferno-pnc-2.jpg",
  "/Fotos/eventos/carnaval-2026/dj-posaxa-carnaval-2026-festa-0001.jpg",
  "/Fotos/eventos/disco-inferno-xs-2025/dj-posaxa-disco-inferno-pnc-8.jpg",
];
