import { type ProductDetail, type ProductSummary } from '../../src/api/products.ts';

/** Small catalog shaped exactly like the BFF contract; tests slice/override as needed. */
export const productDetails: ProductDetail[] = [
  {
    id_product: 101,
    name: 'Azul',
    image: null,
    players_display: '2-4',
    duration_min: 45,
    complexity: 'Facile (2)',
    complexity_level: 2,
    internal_rating: 8.3,
    categoria: 'Giochi da tavolo > Astratti',
    marca: 'Next Move Games',
    description:
      'Azul è un gioco astratto di piazzamento tessere ispirato agli azulejos portoghesi: ' +
      'i giocatori decorano le pareti del palazzo reale di Evora componendo mosaici colorati.',
    tags: ['astratto', 'piazzamento tessere'],
    players: [2, 3, 4],
    age_min: 8,
    year: 2017,
    autori: 'Michael Kiesling',
    is_expansion: false,
  },
  {
    id_product: 102,
    name: 'Gloomhaven',
    image: 'https://images.example.test/gloomhaven.jpg',
    players_display: '1-4',
    duration_min: 120,
    complexity: 'Difficile (4)',
    complexity_level: 4,
    internal_rating: 8.9,
    categoria: 'Giochi da tavolo > Giochi di Avventura',
    marca: 'Cephalofair Games',
    description:
      'Gloomhaven è un dungeon crawler cooperativo a campagna: una squadra di mercenari ' +
      'esplora scenari legati da una trama persistente, con combattimenti guidati dalle carte.',
    tags: ['cooperativo', 'dungeon crawler', 'campagna'],
    players: [1, 2, 3, 4],
    age_min: 14,
    year: 2017,
    autori: 'Isaac Childres',
    is_expansion: false,
  },
];

export const productSummaries: ProductSummary[] = productDetails.map((product) => ({
  id_product: product.id_product,
  name: product.name,
  image: product.image,
  players_display: product.players_display,
  duration_min: product.duration_min,
  complexity: product.complexity,
  complexity_level: product.complexity_level,
  internal_rating: product.internal_rating,
  categoria: product.categoria,
  marca: product.marca,
}));
