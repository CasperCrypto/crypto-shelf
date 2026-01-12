import React, { useState } from 'react';
import { useAppStore } from '../main';
import { Trophy, Medal, Star } from 'lucide-react';
import ShelfCabinet from '../components/ShelfCabinet';
import './Rankings.css';

const Rankings = () => {
    const { shelves, accessories, themes, reactions } = useAppStore();
    const [tab, setTab] = useState('WEEKLY');

    const getScore = (shelfId) => reactions.filter(r => r.shelfId === shelfId).length;
    const getTheme = (id) => themes.find(t => t.id === id);

    const sortedShelves = [...shelves].sort((a, b) => getScore(b.id) - getScore(a.id));

    return (
        <div className="rankings-page container">
            <header className="rankings-header">
                <h1>Leaderboard</h1>
                <p>Most impactful shelves of the season</p>
            </header>

            <div className="rankings-tabs">
                <button className={tab === 'WEEKLY' ? 'active' : ''} onClick={() => setTab('WEEKLY')}>This Week</button>
                <button className={tab === 'ALL_TIME' ? 'active' : ''} onClick={() => setTab('ALL_TIME')}>All Time</button>
            </div>

            <div className="rankings-grid responsive-grid">
                {sortedShelves.map((shelf, idx) => {
                    const score = getScore(shelf.id);
                    const shelfWithTheme = { ...shelf, theme: getTheme(shelf.themeId) };

                    return (
                        <div key={shelf.id} className={`ranking-card rank-${idx + 1}`}>
                            <div className="rank-badge">
                                {idx === 0 ? <Trophy size={20} /> : idx === 1 ? <Medal size={20} /> : idx === 2 ? <Medal size={20} /> : `#${idx + 1}`}
                            </div>

                            <div className="rank-user">
                                <img src={shelf.user?.avatar} alt={shelf.user?.handle} />
                                <div className="user-text">
                                    <h3>{shelf.user?.displayName}</h3>
                                    <span>@{shelf.user?.handle}</span>
                                </div>
                            </div>

                            <div className="rank-preview">
                                <ShelfCabinet
                                    shelf={shelfWithTheme}
                                    accessories={accessories}
                                    readOnly={true}
                                />
                            </div>

                            <div className="rank-footer">
                                <div className="score-badge">
                                    <Star size={18} fill="var(--color-accent)" stroke="var(--color-accent)" />
                                    <span>{score} pts</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Rankings;
