import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../AppContext';
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
    const {
        currentUser,
        addOrToggleReaction,
        getReactionsForShelf,
        getUserReactionsForShelf
    } = useAppStore();

    const reactions = getReactionsForShelf(shelfId);
    const userReactions = getUserReactionsForShelf(shelfId);

    const handleReact = (type) => {
        if (!currentUser) {
            alert("Please log in to react!");
            navigate('/');
            return;
        }
        addOrToggleReaction({ shelfId, type });
    };

    return (
        <div className="reaction-bar">
            {REACTION_TYPES.map(({ type, emoji }) => {
                const isActive = userReactions.includes(type);
                return (
                    <button
                        key={type}
                        className={`reaction-btn ${isActive ? 'active' : ''}`}
                        onClick={() => handleReact(type)}
                    >
                        <span className="emoji">{emoji}</span>
                        <span className="count">{reactions[type] || 0}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ReactionBar;
