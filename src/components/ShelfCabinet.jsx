import React from 'react';
import ShelfSlot from './ShelfSlot';
import './ShelfCabinet.css';

const ShelfCabinet = ({ shelf, items, accessories, onSlotClick, readOnly = false }) => {
    const findItem = (itemId) => accessories.find(a => a.id === itemId);

    const cabinetStyle = {
        '--theme-bg': shelf.theme?.type === 'IMAGE' ? 'transparent' : (shelf.theme?.value || 'var(--grad-sky)'),
        '--theme-img': shelf.theme?.type === 'IMAGE' ? `url(${shelf.theme.imageUrl})` : 'none'
    };

    return (
        <div className="shelf-cabinet-container" style={cabinetStyle}>
            <div className="shelf-background" />

            <div className="cabinet-frame" style={{ borderColor: shelf.shelfColor || 'var(--cabinet-wood)' }}>
                <div className="grid-2x4">
                    {Array.from({ length: 8 }).map((_, idx) => {
                        const slot = shelf.slots?.find(s => s.index === idx);
                        const item = slot ? findItem(slot.itemId) : null;

                        return (
                            <ShelfSlot
                                key={idx}
                                item={item}
                                index={idx}
                                onClick={readOnly ? null : () => onSlotClick(idx)}
                                readOnly={readOnly}
                            />
                        );
                    })}
                </div>
            </div>

            {shelf.user && (
                <div className="shelf-owner-badge">
                    <img src={shelf.user.avatar} alt={shelf.user.handle} />
                    <span>@{shelf.user.handle}</span>
                </div>
            )}
        </div>
    );
};

export default ShelfCabinet;
