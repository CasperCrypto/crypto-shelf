import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Star } from 'lucide-react';
import UserIdentity from '../components/UserIdentity';
import { getAllShelves } from '../services/shelfApi';
import './Rankings.css';

const Rankings = () => {
    const [communityShelves, setCommunityShelves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('WEEKLY');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true);
            const shelves = await getAllShelves();
            // Sort by total reactions
            const sorted = shelves.sort((a, b) => b.totalReactions - a.totalReactions);
            setCommunityShelves(sorted);
            setLoading(false);
        };
        fetchRankings();
    }, []);

    if (loading) return <div className="loading-container">Loading leaderboard...</div>;

    return (
        <div className="rankings-page container">
            <header className="rankings-header">
                <h1>Leaderboard</h1>
                <p>Most impactful shelves of the season</p>
            </header>

            <div className="rankings-tabs">
                <button className={tab === 'WEEKLY' ? 'active' : ''} onClick={() => setTab('WEEKLY')}>Active Creators</button>
            </div>

            <div className="rankings-list">
                {communityShelves.map((shelf, idx) => {
                    return (
                        <div
                            key={shelf.id}
                            className={`ranking-item rank-${idx + 1}`}
                            onClick={() => navigate(`/shelf/${shelf.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="rank-number">
                                {idx === 0 ? <Trophy color="#FFC947" size={32} /> :
                                    idx === 1 ? <Medal color="#C0C0C0" size={28} /> :
                                        idx === 2 ? <Medal color="#CD7F32" size={24} /> :
                                            idx + 1}
                            </div>
                            <UserIdentity
                                handle={shelf.user?.handle}
                                avatar={shelf.user?.avatar}
                                twitterHandle={shelf.user?.twitterHandle}
                                isVerified={shelf.user?.isVerified}
                                size="md"
                            />
                            <div className="rank-stats">
                                <div className="stat">
                                    <Star size={16} fill="var(--color-accent)" stroke="var(--color-accent)" />
                                    <span>{shelf.totalReactions || 0}</span>
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
