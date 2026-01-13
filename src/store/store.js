import { useState, useEffect } from 'react';
import { INITIAL_ACCESSORIES, INITIAL_THEMES, MOCK_SHELVES, MOCK_USERS } from './initialData';
import { supabase } from '../lib/supabaseClient';

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
    const [accessories, setAccessories] = useState(load('accessories', INITIAL_ACCESSORIES));
    const [themes, setThemes] = useState(load('themes', INITIAL_THEMES));
    const [shelves, setShelves] = useState(load('shelves', MOCK_SHELVES));
    const [reactions, setReactions] = useState(load('reactions', []));

    // Persistence
    useEffect(() => save('accessories', accessories), [accessories]);
    useEffect(() => save('themes', themes), [themes]);
    useEffect(() => save('shelves', shelves), [shelves]);
    useEffect(() => save('reactions', reactions), [reactions]);
    // Removed manual cryptoShelfUser persistence in favor of Supabase

    // Auth logic
    const mapUser = (user) => {
        const email = user.email;
        const descriptor = user.user_metadata?.preferred_username || (email ? email.split("@")[0] : "anon");
        const handle = descriptor.startsWith("@") ? descriptor : "@" + descriptor;

        return {
            id: user.id,
            email: email,
            handle: handle,
            username: descriptor.replace("@", ""),
            avatar: user.user_metadata?.avatar_url || null,
            role: handle === "@hermes" ? 'admin' : 'user'
        };
    };

    const initAuthListener = async () => {
        if (!supabase) {
            console.warn("Supabase auth disabled: keys missing");
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setCurrentUser(mapUser(user));
        } else {
            setCurrentUser(null);
        }

        supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setCurrentUser(mapUser(session.user));
            } else {
                setCurrentUser(null);
            }
        });
    };

    const loginWithGoogle = async () => {
        if (!supabase) return alert("Auth disabled: Missing environment variables");
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
    };

    const loginWithX = async () => {
        if (!supabase) return alert("Auth disabled: Missing environment variables");
        await supabase.auth.signInWithOAuth({
            provider: 'twitter',
            options: { redirectTo: window.location.origin }
        });
    };

    const loginWithEmail = async (email) => {
        if (!supabase) return alert("Auth disabled: Missing environment variables");
        await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin }
        });
    };

    const logout = async () => {
        if (!supabase) {
            setCurrentUser(null);
            return;
        }
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

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

    const addTheme = (theme) => setThemes(prev => [...prev, { ...theme, id: Date.now().toString() }]);
    const updateTheme = (id, patch) => setThemes(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    const deleteTheme = (id) => setThemes(prev => prev.filter(t => t.id !== id));

    const toggleShelfStatus = (id, field) => setShelves(prev => prev.map(s => s.id === id ? { ...s, [field]: !s[field] } : s));

    return {
        currentUser, initAuthListener, loginWithGoogle, loginWithX, loginWithEmail, logout,
        accessories, addAccessory, updateAccessory, deleteAccessory,
        themes, addTheme, updateTheme, deleteTheme,
        shelves, saveShelf, toggleShelfStatus,
        reactions, addOrToggleReaction, getReactionsForShelf, getUserReactionsForShelf
    };
};
