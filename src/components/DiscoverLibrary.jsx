import React from 'react';
import { Search } from 'lucide-react';
import './DiscoverLibrary.css';

const DiscoverLibrary = ({ accessories }) => {
    // Show maximum first 12 items
    const displayItems = accessories.slice(0, 12);

    return (
        <div className="discover-library">
            <h3><Search size={20} /> Items to Discover</h3>
            <div className="library-scroll-container">
                {displayItems.map((item) => (
                    <div
                        key={item.id}
                        className="library-item-card"
                        data-rarity={item.rarity}
                        title={item.name}
                    >
                        <img src={item.image} alt={item.name} className="library-item-image" />
                        <span className="library-item-name">{item.name}</span>
                        <span className="library-item-rarity-badge">{item.rarity}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiscoverLibrary;
