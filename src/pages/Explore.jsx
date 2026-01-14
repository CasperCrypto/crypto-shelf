import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../main';
import ShelfCabinet from '../components/ShelfCabinet';
import { Search, Flame, Clock, Star } from 'lucide-react';
import { getAllShelves } from '../services/shelfApi';
import './Explore.css';

const Explore = () => {
    const { accessories, themes, reactions } = useAppStore(); // Removed 'shelves' from store to use local state + DB
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
                {dbShelves.length === 0 ? (
                    <div className="empty-state">No shelves found. Be the first to build one!</div>
                ) : (
                    dbShelves.map(shelf => (
                        <div key={shelf.id} className="shelf-card" onClick={() => navigate(`/shelf/${shelf.id}`)}>
                            <div className="shelf-user-header">
                                <img src={shelf.user?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} alt="Avatar" className="user-avatar-mini" />
                                <span className="username">{shelf.user?.handle || 'Anon'}</span>
                            </div>
                            <div className="shelf-preview-mini">
                                <ShelfCabinet
                                    shelf={{ ...shelf, theme: getTheme(shelf.themeId) }}
                                    accessories={accessories}
                                    readOnly={true}
                                />
                            </div>
                            <div className="shelf-card-info">
                                <div className="reactions-summary">
                                    <span>🔥 {getReactionCount(shelf.id)}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Explore;
