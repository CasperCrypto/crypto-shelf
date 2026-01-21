import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../AppContext';
import ShelfCabinet from '../components/ShelfCabinet';
import { Search, Flame, Clock, Star } from 'lucide-react';
import { getAllShelves } from '../services/shelfApi';
import UserIdentity from '../components/UserIdentity';
import './Explore.css';

const Explore = () => {
    const { accessories, themes, skins, reactions } = useAppStore();

    const [dbShelves, setDbShelves] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('NEW'); // Default to NEW since that's what we sort by in DB

    useEffect(() => {
        const fetchShelves = async () => {
            setLoading(true);
            const shelves = await getAllShelves();
            setDbShelves(shelves);
            setLoading(false);
        };
        fetchShelves();
    }, []);

    const getTheme = (id) => themes.find(t => t.id === id);
    const getSkin = (id) => skins.find(s => s.id === id);

    const getReactionCount = (shelfId) => reactions.filter(r => r.shelfId === shelfId).length;

    // Filter logic (Client side for now)
    const filteredShelves = dbShelves.filter(shelf => {
        // Simple client side filter
        // In real app, you might query DB differently
        return true;
    });

    if (loading) return <div className="loading-container">Loading community shelves...</div>;

    return (
        <div className="explore-page container">
            <header className="explore-header">
                <h1>Explore Shelves</h1>
                <div className="search-bar">
                    <Search size={20} />
                    <input type="text" placeholder="Search usernames..." />
                </div>
            </header>

            <div className="filter-tabs">
                <button className={filter === 'TOP' ? 'active' : ''} onClick={() => setFilter('TOP')}>
                    <Flame size={18} /> Top Weekly
                </button>
                <button className={filter === 'NEW' ? 'active' : ''} onClick={() => setFilter('NEW')}>
                    <Clock size={18} /> Newest
                </button>
                <button className={filter === 'FEATURED' ? 'active' : ''} onClick={() => setFilter('FEATURED')}>
                    <Star size={18} /> Featured
                </button>
            </div>

            <div className="shelves-grid">
                {dbShelves.filter(s => s && s.id).map(shelf => (
                    <div key={shelf.id} className="shelf-card" onClick={() => navigate(`/shelf/${shelf.id}`)}>

                        <div className="shelf-user-header">
                            <UserIdentity
                                handle={shelf.user?.handle}
                                avatar={shelf.user?.avatar}
                                twitterHandle={shelf.user?.twitterHandle}
                                isVerified={shelf.user?.isVerified}
                                size="sm"
                            />
                        </div>
                        <div className="shelf-preview-mini">
                            <ShelfCabinet
                                shelf={{
                                    ...shelf,
                                    theme: getTheme(shelf.themeId),
                                    skin: getSkin(shelf.skinId)
                                }}

                                accessories={accessories}
                                readOnly={true}
                            />
                        </div>
                        <div className="shelf-card-info">
                            <div className="reactions-summary">
                                <div className="reaction-stat">
                                    <Flame size={14} fill="var(--color-accent)" stroke="var(--color-accent)" />
                                    <span>{shelf.totalReactions || 0} Total Reactions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}



            </div>
        </div>
    );
};

export default Explore;
