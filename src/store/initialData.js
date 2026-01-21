
export const INITIAL_ACCESSORIES = [
  // Crypto
  { id: 'btc', name: 'Golden BTC', category: 'CRYPTO', rarity: 'Legendary', image: 'https://cdn-icons-png.flaticon.com/512/5968/5968260.png', isActive: true },
  { id: 'eth', name: 'Crystal ETH', category: 'CRYPTO', rarity: 'Rare', image: 'https://cdn-icons-png.flaticon.com/512/7016/7016531.png', isActive: true },
  { id: 'sol', name: 'Fast SOL', category: 'CRYPTO', rarity: 'Common', image: 'https://cryptologos.cc/logos/solana-sol-logo.png', isActive: true },
  { id: 'ledger', name: 'Secure Vault', category: 'CRYPTO', rarity: 'Rare', image: 'https://cdn-icons-png.flaticon.com/512/2091/2091665.png', isActive: true },
  { id: 'usdc', name: 'USD Stable', category: 'CRYPTO', rarity: 'Common', image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', isActive: true },
  { id: 'bnb', name: 'Smart BNB', category: 'CRYPTO', rarity: 'Rare', image: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png', isActive: true },

  // Memes
  { id: 'pepe', name: 'Green Froggy', category: 'MEME', rarity: 'Rare', image: 'https://cdn-icons-png.flaticon.com/512/3595/3595455.png', isActive: true },
  { id: 'doge', name: 'Shiba Toy', category: 'MEME', rarity: 'Common', image: 'https://cdn-icons-png.flaticon.com/512/3595/3595493.png', isActive: true },
  { id: 'penguin', name: 'Cool Penguin', category: 'MEME', rarity: 'Legendary', image: 'https://cdn-icons-png.flaticon.com/512/3595/3595452.png', isActive: true },
  { id: 'wojak', name: 'Feels Guy', category: 'MEME', rarity: 'Common', image: 'https://cdn.pixabay.com/photo/2021/05/24/10/35/wojak-6278733_1280.png', isActive: true },
  { id: 'gigachad', name: 'Alpha Male', category: 'MEME', rarity: 'Legendary', image: 'https://w7.pngwing.com/pngs/434/491/png-transparent-gigachad-meme-thumbnail.png', isActive: true },

  // Toys
  { id: 'arcade', name: 'Mini Arcade', category: 'TOY', rarity: 'Rare', image: 'https://cdn-icons-png.flaticon.com/512/1006/1006272.png', isActive: true },
  { id: 'robot', name: 'Bot Buddy', category: 'TOY', rarity: 'Common', image: 'https://cdn-icons-png.flaticon.com/512/1006/1006296.png', isActive: true },

  // Photo Frame
  { id: 'photo-frame', name: 'Classic Frame', category: 'PHOTO_FRAME', rarity: 'Rare', image: 'https://cdn-icons-png.flaticon.com/512/1375/1375106.png', isActive: true, isPhotoFrame: true },
];

export const INITIAL_THEMES = [
  { id: 'dawn', name: 'Early Morning', type: 'GRADIENT', value: 'var(--grad-morning)', isActive: true, pageBackground: '#FFF5EC' },
  { id: 'sky', name: 'Blue Sky', type: 'GRADIENT', value: 'var(--grad-sky)', isActive: true, pageBackground: '#E3F2FD' },
  { id: 'mint', name: 'Fresh Mint', type: 'GRADIENT', value: 'var(--grad-mint)', isActive: true, pageBackground: '#E8F5E9' },
  { id: 'sunset', name: 'Sunset Glow', type: 'GRADIENT', value: 'var(--grad-sunset)', isActive: true, pageBackground: '#FFF3E0' },
  { id: 'night', name: 'Midnight', type: 'GRADIENT', value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', isActive: true, pageBackground: '#0f3460' },
];


export const INITIAL_SKINS = [
  { id: 'classic', name: 'Classic', imagePath: 'assets/skins/wood_shelf.png', frameColor: '#8B5E3C' },
  { id: 'gold', name: 'Gold', imagePath: 'assets/skins/gold_shelf.png', frameColor: '#D4AF37' },
  { id: 'pink', name: 'Pink', imagePath: 'assets/skins/pink_shelf.png', frameColor: '#F48FB1' },
  { id: 'mystic', name: 'Mystic', imagePath: 'assets/skins/ice_shelf.jpg', frameColor: '#2E7D32' },
  { id: 'diamond', name: 'Diamond', imagePath: 'assets/skins/mystic_shelf.png', frameColor: '#A5D6A7' },
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
    slots: Array.from({ length: 15 }).map((_, i) => ({
      index: i,
      itemId: i < 5 ? ['btc', 'eth', 'arcade', 'penguin', 'pepe'][i] : null
    })),
    isFeatured: true,
    skinId: 'classic_wood',
    reactions: { FIRE: 12, DIAMOND: 5, FUNNY: 2, EYES: 8, BRAIN: 1 }
  },
  {
    id: 's2',
    userId: 'u2',
    themeId: 'sky',
    skinId: 'classic_wood',
    slots: Array.from({ length: 15 }).map((_, i) => ({
      index: i,
      itemId: i < 3 ? ['pepe', 'doge', 'robot'][i] : null
    })),
    isFeatured: false,
    reactions: { FIRE: 3, DIAMOND: 1, FUNNY: 10, EYES: 2, BRAIN: 0 }
  }
];
