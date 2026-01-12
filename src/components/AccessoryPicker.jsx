import React, { useState } from 'react';
import { X } from 'lucide-react';
import './AccessoryPicker.css';

const AccessoryPicker = ({ isOpen, onClose, accessories, onSelect }) => {
    const [activeTab, setActiveTab] = useState('CRYPTO');
    const categories = ['CRYPTO', 'MEME', 'TOY', 'PHOTO_FRAME'];

    if (!isOpen) return null;

    return (
        <div className="picker-overlay" onClick={onClose}>
            <div className="picker-drawer animate-pop" onClick={e => e.stopPropagation()}>
                <div className="picker-header">
                    <h3>Choose Accessory</h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <div className="picker-tabs">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={activeTab === cat ? 'active' : ''}
                            onClick={() => setActiveTab(cat)}
                        >
                            {cat.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="picker-grid">
                    <div className="accessory-card none" onClick={() => onSelect(null)}>
                        <div className="image-placeholder"><X size={24} /></div>
                        <span>Remove</span>
                    </div>
                    {accessories.filter(a => a.category === activeTab && a.isActive).map(item => (
                        <div key={item.id} className="accessory-card" onClick={() => onSelect(item)}>
                            <div className="image-wrapper">
                                <img src={item.image} alt={item.name} />
                                <div className={`rarity-tag ${item.rarity.toLowerCase()}`}>{item.rarity}</div>
                            </div>
                            <span>{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AccessoryPicker;
