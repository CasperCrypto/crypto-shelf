import React from 'react';
import { Plus } from 'lucide-react';
import './ShelfSlot.css';

const ShelfSlot = ({ item, index, onClick, readOnly }) => {
    return (
        <div
            className={`shelf-slot ${!item ? 'empty' : 'filled'} ${readOnly ? 'read-only' : ''}`}
            onClick={onClick}
        >
            <div className="slot-inner">
                {item ? (
                    <img src={item.image} alt={item.name} className="item-image animate-pop" />
                ) : (
                    !readOnly && <Plus size={24} className="plus-icon" />
                )}
            </div>
            <div className="slot-base" />
        </div>
    );
};

export default ShelfSlot;
