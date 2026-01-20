import React from 'react';
import ShelfSlot from './ShelfSlot';
import './ShelfCabinet.css';

const ShelfCabinet = ({ shelf, items, accessories, onSlotClick, readOnly = false }) => {
    const findItem = (itemId) => accessories.find(a => a.id === itemId);

    const cabinetStyle = {
        '--theme-bg': shelf.theme?.page_background || shelf.theme?.value || 'var(--grad-sky)',
        '--theme-img': shelf.theme?.type === 'IMAGE' ? `url(${shelf.theme.imageUrl})` : 'none',
        '--frame-img': shelf.theme?.frame_image_url ? `url(${shelf.theme.frame_image_url})` : 'none',
        '--frame-color': shelf.shelfColor || shelf.theme?.frame_color || 'var(--cabinet-wood)'
    };

    return (
        <div className="shelf-cabinet-container" style={cabinetStyle}>
            <div className="shelf-background" />

            <div className={`cabinet-frame ${shelf.theme?.frame_image_url ? 'has-custom-frame' : ''}`} style={{ borderColor: 'var(--frame-color)' }}>

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
