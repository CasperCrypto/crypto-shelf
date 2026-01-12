export const INITIAL_ACCESSORIES = [
  // Crypto
  { id: 'btc', name: 'Golden BTC', category: 'CRYPTO', rarity: 'Legendary', image: 'https://cdn-icons-png.flaticon.com/512/5968/5968260.png', isActive: true },
  { id: 'eth', name: 'Crystal ETH', category: 'CRYPTO', rarity: 'Rare', image: 'https://cdn-icons-png.flaticon.com/512/7016/7016531.png', isActive: true },
  { id: 'sol', name: 'Fast SOL', category: 'CRYPTO', rarity: 'Common', image: 'https://cryptologos.cc/logos/solana-sol-logo.png', isActive: true },
  { id: 'ledger', name: 'Secure Vault', category: 'CRYPTO', rarity: 'Rare', image: 'https://cdn-icons-png.flaticon.com/512/2091/2091665.png', isActive: true },

  // Memes
  { id: 'pepe', name: 'Green Froggy', category: 'MEME', rarity: 'Rare', image: 'https://cdn-icons-png.flaticon.com/512/3595/3595455.png', isActive: true },
  { id: 'doge', name: 'Shiba Toy', category: 'MEME', rarity: 'Common', image: 'https://cdn-icons-png.flaticon.com/512/3595/3595493.png', isActive: true },
  { id: 'penguin', name: 'Cool Penguin', category: 'MEME', rarity: 'Legendary', image: 'https://cdn-icons-png.flaticon.com/512/3595/3595452.png', isActive: true },

  // Toys
  { id: 'arcade', name: 'Mini Arcade', category: 'TOY', rarity: 'Rare', image: 'https://cdn-icons-png.flaticon.com/512/1006/1006272.png', isActive: true },
  { id: 'robot', name: 'Bot Buddy', category: 'TOY', rarity: 'Common', image: 'https://cdn-icons-png.flaticon.com/512/1006/1006296.png', isActive: true },

  // Photo Frame
  { id: 'photo-frame', name: 'Classic Frame', category: 'PHOTO_FRAME', rarity: 'Rare', image: 'https://cdn-icons-png.flaticon.com/512/1375/1375106.png', isActive: true, isPhotoFrame: true },
];

export const INITIAL_THEMES = [
  { id: 'dawn', name: 'Early Morning', type: 'GRADIENT', value: 'var(--grad-morning)', frameColor: '#8B5E3C', isActive: true },
  { id: 'sky', name: 'Blue Sky', type: 'GRADIENT', value: 'var(--grad-sky)', frameColor: '#5D4037', isActive: true },
  { id: 'mint', name: 'Fresh Mint', type: 'GRADIENT', value: 'var(--grad-mint)', frameColor: '#4E342E', isActive: true },
  { id: 'sunset', name: 'Sunset Glow', type: 'GRADIENT', value: 'var(--grad-sunset)', frameColor: '#3E2723', isActive: true },
];

export const MOCK_USERS = [
  { id: 'u1', handle: 'cryptoking', displayName: 'Crypto King', avatar: 'https://i.pravatar.cc/150?u=u1', role: 'admin' },
  { id: 'u2', handle: 'memelord', displayName: 'Meme Lord', avatar: 'https://i.pravatar.cc/150?u=u2', role: 'user' },
];

export const MOCK_SHELVES = [
  {
    id: 's1',
    userId: 'u1',
    themeId: 'dawn',
    slots: [
      { index: 0, itemId: 'btc' },
      { index: 1, itemId: 'eth' },
      { index: 2, itemId: 'arcade' },
      { index: 3, itemId: null },
      { index: 4, itemId: 'penguin' },
      { index: 5, itemId: null },
      { index: 6, itemId: null },
      { index: 7, itemId: null },
    ],
    isFeatured: true,
    reactions: { FIRE: 12, DIAMOND: 5, FUNNY: 2, EYES: 8, BRAIN: 1 }
  },
  {
    id: 's2',
    userId: 'u2',
    themeId: 'sky',
    slots: [
      { index: 0, itemId: 'pepe' },
      { index: 1, itemId: 'doge' },
      { index: 2, itemId: 'robot' },
      { index: 3, itemId: null },
      { index: 4, itemId: null },
      { index: 5, itemId: null },
      { index: 6, itemId: null },
      { index: 7, itemId: null },
    ],
    isFeatured: false,
    reactions: { FIRE: 3, DIAMOND: 1, FUNNY: 10, EYES: 2, BRAIN: 0 }
  }
];
