import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../main';
import ShelfCabinet from '../components/ShelfCabinet';
import { Search, Flame, Clock, Star } from 'lucide-react';
import './Explore.css';

const Explore = () => {
    const { shelves, accessories, themes, reactions } = useAppStore();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('TOP');

    const getTheme = (id) => themes.find(t => t.id === id);
    const getReactionCount = (shelfId) => reactions.filter(r => r.shelfId === shelfId).length;

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

            <div className="shelves-grid responsive-grid">
                {shelves.map(shelf => (
                    <div key={shelf.id} className="shelf-card" onClick={() => navigate(`/shelf/${shelf.id}`)}>
                        <div className="shelf-card-header">
                            <img src={shelf.user?.avatar} alt={shelf.user?.handle} />
                            <div className="user-info">
                                <span className="display-name">{shelf.user?.displayName}</span>
                                <span className="handle">@{shelf.user?.handle}</span>
                            </div>
                        </div>
                        <div className="shelf-preview-mini">
                            <ShelfCabinet
                                shelf={{ ...shelf, theme: getTheme(shelf.themeId) }}
                                accessories={accessories}
                                readOnly={true}
                            />
                        </div>
                        <div className="shelf-card-footer">
                            <div className="reactions-summary">
                                <span>🔥 {getReactionCount(shelf.id)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Explore;
