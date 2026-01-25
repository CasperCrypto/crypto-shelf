import { useState, useEffect } from 'react';
import { INITIAL_ACCESSORIES, INITIAL_THEMES, INITIAL_SKINS } from './initialData';
import {
    getAccessories,
    getThemes,
    getSkins,
    saveTheme,
    deleteThemeFromDB,
    saveSkin,
    deleteSkinFromDB,
    getAllShelves
} from '../services/shelfApi';
import { supabase } from '../lib/supabaseClient';

export const useStore = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [accessories, setAccessories] = useState(INITIAL_ACCESSORIES);
    const [themes, setThemes] = useState(INITIAL_THEMES);
    const [skins, setSkins] = useState(INITIAL_SKINS);
    const [shelves, setShelves] = useState([]);
    const [reactions, setReactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all data from Supabase on mount
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);

                // Fetch accessories, themes, skins
                const [accData, themeData, skinData] = await Promise.all([
                    getAccessories(),
                    getThemes(),
                    getSkins()
                ]);

                // Set accessories with fallback
                if (accData && accData.length > 0) {
                    const mappedAccs = accData.filter(Boolean).map(acc => ({
                        ...acc,
                        image: acc.image_url || acc.image || ''
                    }));
                    setAccessories(mappedAccs);
                } else {
                    console.warn("No accessories in DB, using defaults");
                    setAccessories(INITIAL_ACCESSORIES);
                }

                // Set themes with fallback
                if (themeData && themeData.length > 0) {
                    setThemes(themeData.filter(Boolean));
                } else {
                    setThemes(INITIAL_THEMES);
                }

                // Merge skins
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

                // Fetch all shelves from Supabase
                const shelvesData = await getAllShelves();
                setShelves(shelvesData || []);

                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setAccessories(INITIAL_ACCESSORIES);
                setThemes(INITIAL_THEMES);
                setSkins(INITIAL_SKINS);
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Subscribe to real-time reaction updates
    useEffect(() => {
        if (!supabase) return;

        const channel = supabase
            .channel('reactions_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'reactions' },
                (payload) => {
                    console.log('Reaction change:', payload);
                    // Refetch shelves to update reaction counts
                    getAllShelves().then(data => setShelves(data || []));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Auth logic handled by Privy in App.jsx
    const logout = () => setCurrentUser(null);

    // Shelf logic - now fully Supabase-backed
    const saveShelf = async (shelfData) => {
        // Optimistic update
        setShelves(prev => {
            const index = prev.findIndex(s => s.id === shelfData.id);
            if (index > -1) {
                const next = [...prev];
                next[index] = { ...next[index], ...shelfData };
                return next;
            }
            return [...prev, shelfData];
        });

        // Note: Actual save happens in ShelfBuilder via saveShelfForUser
    };

    // Reaction logic - no longer using localStorage
    const addOrToggleReaction = async ({ shelfId, type }) => {
        if (!currentUser) return;

        // This will be handled by shelfApi.js saveReaction
        // which updates the database directly
    };

    const getReactionsForShelf = (shelfId) => {
        const shelf = shelves.find(s => s.id === shelfId);
        return shelf?.reactions || {};
    };

    const getUserReactionsForShelf = (shelfId) => {
        if (!currentUser) return [];
        // This would need to query reactions table
        return [];
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
        reactions, addOrToggleReaction, getReactionsForShelf, getUserReactionsForShelf,
        isLoading
    };
};
