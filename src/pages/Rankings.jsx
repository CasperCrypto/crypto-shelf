import React, { useState } from 'react';
import { useAppStore } from '../AppContext';
import { Trophy, Medal, Star } from 'lucide-react';
import './Rankings.css';

const Rankings = () => {
    const { shelves, reactions } = useAppStore();
    const [tab, setTab] = useState('WEEKLY');

    const getScore = (shelfId) => reactions.filter(r => r.shelfId === shelfId).length;

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

            <div className="rankings-list">
                {sortedShelves.map((shelf, idx) => {
                    const shelfReactions = reactions.filter(r => r.shelfId === shelf.id);
                    const counts = { FIRE: 0, DIAMOND: 0, FUNNY: 0, EYES: 0, BRAIN: 0 };
                    shelfReactions.forEach(r => counts[r.type]++);

                    return (
                        <div key={shelf.id} className={`ranking-item rank-${idx + 1}`}>
                            <div className="rank-number">
                                {idx === 0 ? <Trophy color="#FFC947" size={32} /> : idx === 1 ? <Medal color="#C0C0C0" size={28} /> : idx === 2 ? <Medal color="#CD7F32" size={24} /> : idx + 1}
                            </div>
                            <img src={shelf.user?.avatar} alt={shelf.user?.handle} className="rank-avatar" />
                            <div className="rank-info">
                                <h3>{shelf.user?.displayName}</h3>
                                <span>@{shelf.user?.handle}</span>
                            </div>
                            <div className="rank-stats">
                                <div className="stat">
                                    <Star size={16} fill="var(--color-accent)" stroke="var(--color-accent)" />
                                    <span>{shelfReactions.length}</span>
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
