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
    getAllShelves,
    saveAccessory,
    deleteAccessoryFromDB
} from '../services/shelfApi';
import { supabase } from '../lib/supabaseClient';

export const useStore = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [accessories, setAccessories] = useState(INITIAL_ACCESSORIES);
    const [themes, setThemes] = useState(INITIAL_THEMES);
    const [skins, setSkins] = useState(INITIAL_SKINS);
    const [shelves, setShelves] = useState([]);
    const [reactions, setReactions] = useState([]); // Kept for API compatibility, though mainly handled via shelves.reactions
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
                    // Mapping is handled in getAccessories now
                    setAccessories(accData);
                } else {
                    console.warn("No accessories in DB, using defaults");
                    setAccessories(INITIAL_ACCESSORIES);
                }

                // Set themes with fallback
                if (themeData && themeData.length > 0) {
                    // Filter out any potential nulls
                    setThemes(themeData.filter(Boolean));
                } else {
                    setThemes(INITIAL_THEMES);
                }

                // Merge skins
                setSkins(() => {
                    const combined = [...INITIAL_SKINS];
                    if (skinData && skinData.length > 0) {
                        skinData.filter(Boolean).forEach(dbSkin => {
                            const index = combined.findIndex(s => s.id === dbSkin.id);
                            const mappedDbSkin = {
                                ...dbSkin,
                                imagePath: dbSkin.imagePath || dbSkin.image_path || ''
                            };
                            if (index > -1) {
                                // Update existing local skin with DB data if available
                                if (mappedDbSkin.imagePath || mappedDbSkin.imageUrl) {
                                    combined[index] = { ...combined[index], ...mappedDbSkin };
                                }
                            } else {
                                // Add new DB skin
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

    // Auth logic handled by Privy in App.jsx but we keep simple state here
    const logout = () => setCurrentUser(null);

    // Shelf logic
    const saveShelf = async (shelfData) => {
        // Optimistic update for UI smoothness
        setShelves(prev => {
            const index = prev.findIndex(s => s.id === shelfData.id);
            if (index > -1) {
                const next = [...prev];
                next[index] = { ...next[index], ...shelfData };
                return next;
            }
            return [...prev, shelfData];
        });
        // Note: Actual persistence happens in ShelfBuilder via saveShelfForUser which calls API directly.
        // store updates are for local reflection.
    };

    const toggleShelfStatus = (id, field) => setShelves(prev => prev.map(s => s.id === id ? { ...s, [field]: !s[field] } : s));

    // Reaction stub functions (since logic moved to direct API mostly, but keeping for compatibility)
    const addOrToggleReaction = async () => {
        // Logic handled in component calling saveReaction
    };
    const getReactionsForShelf = (shelfId) => {
        const shelf = shelves.find(s => s.id === shelfId);
        return shelf?.reactions || {};
    };
    const getUserReactionsForShelf = () => []; // Placeholder

    // Admin logic - Persistence
    const addAccessory = async (acc) => {
        const newAcc = { ...acc, id: Date.now().toString() };
        setAccessories(prev => [...prev, newAcc]);
        await saveAccessory(newAcc);
    };
    const updateAccessory = async (acc) => {
        setAccessories(prev => prev.map(a => a.id === acc.id ? acc : a));
        await saveAccessory(acc);
    };
    const deleteAccessory = async (id) => {
        setAccessories(prev => prev.filter(a => a.id !== id));
        await deleteAccessoryFromDB(id);
    };

    const addTheme = async (theme) => {
        const newTheme = { ...theme, id: Date.now().toString() };
        setThemes(prev => [...prev, newTheme]);
        await saveTheme(newTheme);
    };
    const updateTheme = async (id, patch) => {
        setThemes(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
        // Note: Full update might be needed for DB save, currently simplified
    };
    const deleteTheme = async (id) => {
        setThemes(prev => prev.filter(t => t.id !== id));
        await deleteThemeFromDB(id);
    };

    const addSkin = async (skin) => {
        const id = skin.id || skin.name.toLowerCase().replace(/\s+/g, '_');
        const newSkin = { ...skin, id };
        setSkins(prev => [...prev, newSkin]);
        await saveSkin(newSkin);
    };

    const deleteSkin = async (id) => {
        setSkins(prev => prev.filter(s => s.id !== id));
        await deleteSkinFromDB(id);
    };


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
