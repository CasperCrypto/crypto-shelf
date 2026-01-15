import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../AppContext';
import { saveReaction, getReactionsForShelf as getReactionsFromApi } from '../services/shelfApi';
import './ReactionBar.css';

const REACTION_TYPES = [
    { type: 'FIRE', emoji: '🔥' },
    { type: 'DIAMOND', emoji: '💎' },
    { type: 'FUNNY', emoji: '😂' },
    { type: 'EYES', emoji: '👀' },
    { type: 'BRAIN', emoji: '🧠' },
];

const ReactionBar = ({ shelfId }) => {
    const navigate = useNavigate();
    const { currentUser } = useAppStore();
    const [counts, setCounts] = useState({ FIRE: 0, DIAMOND: 0, FUNNY: 0, EYES: 0, BRAIN: 0 });
    const [userReaction, setUserReaction] = useState(null);

    useEffect(() => {
        const fetchReactions = async () => {
            if (!shelfId) return;
            const data = await getReactionsFromApi(shelfId);
            const newCounts = { FIRE: 0, DIAMOND: 0, FUNNY: 0, EYES: 0, BRAIN: 0 };

            data.forEach(r => {
                if (newCounts[r.type] !== undefined) {
                    newCounts[r.type]++;
                }
                // Check if this is the current user's reaction
                if (currentUser && r.user_id === currentUser.id) {
                    setUserReaction(r.type);
                }
            });
            setCounts(newCounts);
        };
        fetchReactions();
    }, [shelfId, currentUser]);

    const handleReact = async (type) => {
        if (!currentUser) {
            alert("Please log in to react!");
            navigate('/');
            return;
        }

        const prevType = userReaction;

        // Optimistic UI update
        setCounts(prev => {
            const next = { ...prev };
            if (prevType === type) {
                // Toggling off
                next[type] = Math.max(0, next[type] - 1);
                setUserReaction(null);
            } else {
                // Changing or adding
                if (prevType) next[prevType] = Math.max(0, next[prevType] - 1);
                next[type]++;
                setUserReaction(type);
            }
            return next;
        });

        // Save to DB
        await saveReaction(shelfId, currentUser.id, type);
    };

    return (
        <div className="reaction-bar">
            {REACTION_TYPES.map(({ type, emoji }) => {
                const isActive = userReaction === type;
                return (
                    <button
                        key={type}
                        className={`reaction-btn ${isActive ? 'active' : ''}`}
                        onClick={() => handleReact(type)}
                    >
                        <span className="emoji">{emoji}</span>
                        <span className="count">{counts[type] || 0}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ReactionBar;
