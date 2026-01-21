import { useState, useEffect } from 'react';
import { INITIAL_ACCESSORIES, INITIAL_THEMES, INITIAL_SKINS, MOCK_SHELVES, MOCK_USERS } from './initialData';
import { getAccessories, getThemes, getSkins, saveTheme, deleteThemeFromDB, saveSkin, deleteSkinFromDB } from '../services/shelfApi';



// Helper to load from localStorage
const load = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
};

// Helper to save to localStorage
const save = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const useStore = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [accessories, setAccessories] = useState(INITIAL_ACCESSORIES);
    const [themes, setThemes] = useState(INITIAL_THEMES);
    const [skins, setSkins] = useState(INITIAL_SKINS);
    const [shelves, setShelves] = useState(load('shelves', MOCK_SHELVES));

    const [reactions, setReactions] = useState(load('reactions', []));

    // Fetch dynamic assets from Supabase on mount
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const [accData, themeData, skinData] = await Promise.all([
                    getAccessories(),
                    getThemes(),
                    getSkins()
                ]);

                if (accData && accData.length > 0) {
                    const mappedAccs = accData.filter(Boolean).map(acc => ({
                        ...acc,
                        image: acc.image_url || acc.image || '' // Ensure image field exists
                    }));
                    setAccessories(mappedAccs);
                } else {
                    console.warn("No accessories found in DB (or empty), forcing defaults");
                    setAccessories(INITIAL_ACCESSORIES);
                }

                if (themeData && themeData.length > 0) setThemes(themeData.filter(Boolean));

                // Merge local INITIAL_SKINS with DB skins
                setSkins(prev => {
                    const combined = [...INITIAL_SKINS];
                    if (skinData && skinData.length > 0) {
                        skinData.filter(Boolean).forEach(dbSkin => {
                            const index = combined.findIndex(s => s.id === dbSkin.id);
                            const mappedDbSkin = {
                                ...dbSkin,
                                imagePath: dbSkin.image_path || dbSkin.imagePath || ''
                            };
                            if (index > -1) {
                                // Overwrite local with DB if DB has image
                                if (mappedDbSkin.imagePath || mappedDbSkin.image_url) {
                                    combined[index] = { ...combined[index], ...mappedDbSkin };
                                }
                            } else {
                                combined.push(mappedDbSkin);
                            }
                        });
                    }
                    return combined;
                });
            } catch (err) {
                console.error("Failed to fetch assets, using defaults:", err);
                setAccessories(INITIAL_ACCESSORIES);
                setSkins(INITIAL_SKINS);
            }
        };
        fetchAssets();
    }, []);


    // Persistence only for local/state-heavy items
    useEffect(() => save('shelves', shelves), [shelves]);
    useEffect(() => save('reactions', reactions), [reactions]);


    // Auth logic handled by Privy in App.jsx, store just holds state
    const logout = () => setCurrentUser(null);

    // Shelf logic
    const saveShelf = (shelfData) => {
        setShelves(prev => {
            const index = prev.findIndex(s => s.id === shelfData.id);
            if (index > -1) {
                const next = [...prev];
                next[index] = { ...next[index], ...shelfData };
                return next;
            }
            return [...prev, shelfData];
        });
    };

    // Reaction logic
    const addOrToggleReaction = ({ shelfId, type }) => {
        if (!currentUser) return;

        setReactions(prev => {
            const existingIndex = prev.findIndex(
                r => r.shelfId === shelfId && r.userId === currentUser.id && r.type === type
            );

            if (existingIndex > -1) {
                // Remove (toggle off)
                return prev.filter((_, i) => i !== existingIndex);
            } else {
                // Add new
                const newReaction = {
                    id: Date.now().toString(),
                    shelfId,
                    userId: currentUser.id,
                    type,
                    createdAt: new Date().toISOString()
                };
                return [...prev, newReaction];
            }
        });
    };

    const getReactionsForShelf = (shelfId) => {
        const shelfReactions = reactions.filter(r => r.shelfId === shelfId);
        const counts = { FIRE: 0, DIAMOND: 0, FUNNY: 0, EYES: 0, BRAIN: 0 };
        shelfReactions.forEach(r => counts[r.type]++);
        return counts;
    };

    const getUserReactionsForShelf = (shelfId) => {
        if (!currentUser) return [];
        return reactions
            .filter(r => r.shelfId === shelfId && r.userId === currentUser.id)
            .map(r => r.type);
    };

    // Admin logic
    const addAccessory = (acc) => setAccessories(prev => [...prev, { ...acc, id: Date.now().toString() }]);
    const updateAccessory = (acc) => setAccessories(prev => prev.map(a => a.id === acc.id ? acc : a));
    const deleteAccessory = (id) => setAccessories(prev => prev.filter(a => a.id !== id));

    const addTheme = async (theme) => {
        setThemes(prev => [...prev, { ...theme, id: Date.now().toString() }]);
        await saveTheme(theme);
    };
    const updateTheme = (id, patch) => setThemes(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    const deleteTheme = async (id) => {
        setThemes(prev => prev.filter(t => t.id !== id));
        await deleteThemeFromDB(id);
    };

    const addSkin = async (skin) => {
        const id = skin.id || skin.name.toLowerCase().replace(/\s+/g, '_');
        setSkins(prev => [...prev, { ...skin, id }]);
        await saveSkin(skin);
    };

    const deleteSkin = async (id) => {
        setSkins(prev => prev.filter(s => s.id !== id));
        await deleteSkinFromDB(id);
    };



    const toggleShelfStatus = (id, field) => setShelves(prev => prev.map(s => s.id === id ? { ...s, [field]: !s[field] } : s));

    return {
        currentUser, setCurrentUser, logout,
        accessories, addAccessory, updateAccessory, deleteAccessory,
        themes, addTheme, updateTheme, deleteTheme,
        skins, addSkin, deleteSkin, setSkins,

        shelves, saveShelf, toggleShelfStatus,
        reactions, addOrToggleReaction, getReactionsForShelf, getUserReactionsForShelf
    };

};
