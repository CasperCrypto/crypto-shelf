import React, { useState, useMemo } from 'react';
import { Search, Filter, Box } from 'lucide-react';
import './DiscoverLibrary.css';

const DiscoverLibrary = ({ accessories }) => {
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['ALL', 'CRYPTO', 'MEME', 'TOY', 'PHOTO_FRAME'];

    const filteredItems = useMemo(() => {
        return accessories.filter(item => {
            const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch && item.isActive; // Only show active items
        });
    }, [accessories, activeCategory, searchQuery]);

    return (
        <div className="discover-library">
            <div className="library-header">
                <h3><Box size={20} /> Items Library</h3>
                <div className="search-bar">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="category-tabs">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <div className="library-grid-container">
                {filteredItems.length > 0 ? (
                    <div className="library-grid">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="library-item-card"
                                data-rarity={item.rarity}
                                title={item.name}
                            >
                                <div className="card-image-wrapper">
                                    <img src={item.image} alt={item.name} className="library-item-image" loading="lazy" />
                                </div>
                                <div className="card-info">
                                    <span className="library-item-name">{item.name}</span>
                                    <span className={`rarity-badge ${item.rarity.toLowerCase()}`}>{item.rarity}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Filter size={24} />
                        <p>No items found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscoverLibrary;
