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

    useEffect(() => {
        const fetchReactions = async () => {
            if (!shelfId) return;
            const data = await getReactionsFromApi(shelfId);
            const newCounts = { FIRE: 0, DIAMOND: 0, FUNNY: 0, EYES: 0, BRAIN: 0 };
            data.forEach(r => {
                if (newCounts[r.type] !== undefined) {
                    newCounts[r.type]++;
                }
            });
            setCounts(newCounts);
        };
        fetchReactions();
    }, [shelfId]);

    const handleReact = async (type) => {
        if (!currentUser) {
            alert("Please log in to react!");
            navigate('/');
            return;
        }

        // Optimistic UI update
        setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));

        // Save to DB
        await saveReaction(shelfId, currentUser.id, type);
    };

    return (
        <div className="reaction-bar">
            {REACTION_TYPES.map(({ type, emoji }) => {
                return (
                    <button
                        key={type}
                        className="reaction-btn"
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
