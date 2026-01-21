import React from 'react';
import ShelfSlot from './ShelfSlot';
import './ShelfCabinet.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const ShelfCabinet = ({ shelf, items, accessories, onSlotClick, readOnly = false }) => {
    const findItem = (itemId) => accessories.find(a => a.id === itemId);

    const defaultSkin = {
        'id': 'classic',
        'name': 'Classic',
        'frameColor': '#8B5E3C'
    };

    const resolveImg = (item) => {
        if (!item) return '';
        // Prioritize local assets for game designer skins
        const localSkins = {
            'classic': '/assets/skins/wood_shelf.png',
            'gold': '/assets/skins/gold_shelf.png',
            'pink': '/assets/skins/pink_shelf.png',
            'mystic': '/assets/skins/mystic_shelf.png',
            'diamond': '/assets/skins/ice_shelf.jpg'
        };

        if (localSkins[item.id]) return localSkins[item.id];

        const imgUrl = item.imageUrl || item.image_url || '';
        const imgPath = item.imagePath || item.image_path || '';

        if (imgUrl) {
            return imgUrl.replace('jylfjrjrvpuxyqyqyqyq', 'jylfjrjrvpuxyqyqyq');
        }
        if (imgPath && supabaseUrl) {
            return `${supabaseUrl}/storage/v1/object/public/${imgPath}`;
        }
        // Fallback for relative paths already in path format
        if (imgPath && (imgPath.startsWith('assets/') || imgPath.startsWith('/assets/'))) {
            return imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
        }
        return '';
    };



    const skin = shelf.skin || defaultSkin;
    const skinUrl = resolveImg(skin);
    const skinId = skin.id || '';

    const cabinetStyle = {
        '--theme-bg': shelf.theme?.pageBackground || shelf.theme?.page_background || shelf.theme?.value || 'var(--grad-sky)',
        '--theme-img': shelf.theme?.type === 'IMAGE' ? `url(${resolveImg(shelf.theme)})` : 'none',
        '--frame-img': skinUrl ? `url(${skinUrl})` : 'none',
        '--frame-color': shelf.shelfColor || skin.frameColor || skin.frame_color || 'var(--cabinet-wood)'
    };


    const SLOT_STRUCTURE = [3, 4, 4, 4]; // 15 slots
    let slotOffset = 0;

    // Determine cabinet classes
    let cabinetClasses = 'cabinet-frame';

    if (skinUrl) {
        cabinetClasses += ' has-custom-frame';
        // DO NOT add any name-based CSS fallbacks here. 
        // This prevents gradients from bleeding through transparent PNGs.
    } else {
        // Fallbacks for DB records that might not have images yet
        if (skinId.includes('gold')) cabinetClasses += ' skin-gold';
        else if (skinId.includes('diamond')) cabinetClasses += ' skin-crystal'; // Map diamond to crystal CSS for now
        else if (skinId.includes('mystic')) cabinetClasses += ' skin-mystic';
        else if (skinId.includes('pink')) cabinetClasses += ' skin-pink';
    }

    return (
        <div className="shelf-cabinet-container" style={cabinetStyle}>
            <div className="shelf-background" />

            <div className={cabinetClasses} style={{ borderColor: 'var(--frame-color)' }}>

                <div className="rows-container">
                    {SLOT_STRUCTURE.map((count, rowIdx) => {
                        const rowStart = slotOffset;
                        slotOffset += count;
                        return (
                            <div key={rowIdx} className={`shelf-row row-${rowIdx + 1}`}>
                                {Array.from({ length: count }).map((_, i) => {
                                    const idx = rowStart + i;
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
