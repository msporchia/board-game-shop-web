import type { Product } from '../../src/contracts/products.ts';

/** Small catalog shaped exactly like the BFF contract; tests slice/override as needed. */
export const products: Product[] = [
  {
    id: 101,
    name: 'Azul',
    description:
      'Azul è un gioco astratto di piazzamento tessere ispirato agli azulejos portoghesi: ' +
      'i giocatori decorano le pareti del palazzo reale di Evora componendo mosaici colorati.',
    tags: ['astratto', 'piazzamento tessere'],
    authors: 'Michael Kiesling',
    players: [2, 3, 4],
    playersDisplay: '2-4',
    durationMin: 45,
    ageMin: 8,
    complexity: 'Facile (2)',
    complexityLevel: 2,
    year: 2017,
    rating: 8.3,
    isExpansion: false,
    category: 'Giochi da tavolo > Astratti',
    brand: 'Next Move Games',
    image: null,
    priceCents: 3490,
  },
  {
    id: 102,
    name: 'Gloomhaven',
    description:
      'Gloomhaven è un dungeon crawler cooperativo a campagna: una squadra di mercenari ' +
      'esplora scenari legati da una trama persistente, con combattimenti guidati dalle carte.',
    tags: ['cooperativo', 'dungeon crawler', 'campagna'],
    authors: 'Isaac Childres',
    players: [1, 2, 3, 4],
    playersDisplay: '1-4',
    durationMin: 120,
    ageMin: 14,
    complexity: 'Difficile (4)',
    complexityLevel: 4,
    year: 2017,
    rating: 8.9,
    isExpansion: false,
    category: 'Giochi da tavolo > Giochi di Avventura',
    brand: 'Cephalofair Games',
    image: 'https://images.example.test/gloomhaven.jpg',
    priceCents: 13990,
  },
];
