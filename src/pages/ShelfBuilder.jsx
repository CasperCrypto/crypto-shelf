import React, { useState, useEffect } from 'react';
import { useAppStore } from '../AppContext';
import ShelfCabinet from '../components/ShelfCabinet';
import AccessoryPicker from '../components/AccessoryPicker';
import EditProfileModal from '../components/EditProfileModal'; // NEW IMPORT
import DiscoverLibrary from '../components/DiscoverLibrary';

import { Save, Palette, Sparkles, Edit2 } from 'lucide-react'; // Added Edit2 icon
import { getShelfForUser, saveShelfForUser } from '../services/shelfApi';
import './ShelfBuilder.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
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





const ShelfBuilder = () => {
    const { currentUser, accessories, themes, skins, shelves, saveShelf } = useAppStore();

    const [myShelf, setMyShelf] = useState(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false); // New State
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ... (existing loadShelf logic) ...
        const loadShelf = async () => {
            if (currentUser) {
                setLoading(true);
                // Try fetching from Supabase first
                const { shelf: dbShelf, items: dbItems } = await getShelfForUser(currentUser.id);

                if (dbShelf) {
                    // Reconstruct shelf from DB data
                    const slots = Array.from({ length: 8 }).map((_, i) => {
                        const item = dbItems.find(item => item.slot_index === i);
                        return { index: i, itemId: item ? item.item_key : null };
                    });

                    setMyShelf({
                        id: dbShelf.id,
                        userId: currentUser.id,
                        themeId: dbShelf.theme_id || 'dawn',
                        skinId: dbShelf.skin_id || 'classic',


                        slots,
                        reactions: {},
                        user: currentUser
                    });
                } else {
                    // Fallback to local or default if no DB shelf yet
                    const existing = shelves.find(s => s.userId === currentUser.id);
                    if (existing) {
                        setMyShelf(existing);
                    } else {
                        const newShelf = {
                            id: `s-${currentUser.id}`,
                            userId: currentUser.id,
                            themeId: 'dawn',
                            skinId: 'classic',


                            slots: Array.from({ length: 8 }).map((_, i) => ({ index: i, itemId: null })),
                            reactions: {},
                            user: currentUser
                        };
                        setMyShelf(newShelf);
                    }
                }
                setLoading(false);
            }
        };

        loadShelf();
    }, [currentUser, shelves]);

    if (!myShelf || loading) return <div className="loading">Loading your shelf...</div>;

    const handleSlotClick = (index) => {
        setSelectedSlot(index);
        setPickerOpen(true);
    };

    const handleAccessorySelect = (item) => {
        if (item?.isPhotoFrame) {
            const hasPhotoFrame = myShelf.slots.some((s, idx) => {
                const acc = accessories.find(a => a.id === s.itemId);
                return acc?.isPhotoFrame && idx !== selectedSlot;
            });
            if (hasPhotoFrame) {
                alert("Only one Photo Frame is allowed per shelf!");
                return;
            }
        }
        const newSlots = [...myShelf.slots];
        newSlots[selectedSlot] = { ...newSlots[selectedSlot], itemId: item ? item.id : null };
        setMyShelf({ ...myShelf, slots: newSlots });
        setPickerOpen(false);
    };

    const changeTheme = (themeId) => {
        setMyShelf({ ...myShelf, themeId });
    };

    const changeSkin = (skinId) => {
        setMyShelf({ ...myShelf, skinId });
    };


    const randomizeShelf = () => {
        const randomSlots = Array.from({ length: 8 }).map((_, i) => {
            const activeAccs = accessories.filter(a => a.isActive && !a.isPhotoFrame);
            if (activeAccs.length === 0) return { index: i, itemId: null };

            const randomAcc = activeAccs[Math.floor(Math.random() * activeAccs.length)];
            return { index: i, itemId: Math.random() > 0.3 ? randomAcc.id : null };
        });
        setMyShelf({ ...myShelf, slots: randomSlots });
    };

    const handleSave = async () => {
        // Save locally to update UI immediately
        saveShelf(myShelf);
        // Persist to Supabase
        await saveShelfForUser(currentUser.id, {
            themeId: myShelf.themeId,
            skinId: myShelf.skinId,
            slots: myShelf.slots
        });

        alert("Shelf saved!");
    };

    const currentTheme = themes.find(t => t.id === myShelf.themeId);
    const currentSkin = skins.find(s => s.id === myShelf.skinId);

    // Dynamic background logic
    const pageBg = currentTheme?.pageBackground || '#FFF5EC';

    // console.log("Theme Debug:", { themeId: myShelf.themeId, currentTheme, pageBg });


    return (
        <div
            className="builder-page container"
            style={{
                background: '#FFF5EC', // Fixed brand background
                minHeight: 'calc(100vh - 80px)',
                borderRadius: '16px'
            }}
        >
            <header className="builder-header">
                <div className="user-info">
                    <img src={currentUser.avatar} alt={currentUser.handle} className="avatar" />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h1>My Shelf</h1>
                            <button
                                className="btn-edit-profile"
                                onClick={() => {
                                    console.log("Opening Edit Profile Modal");
                                    setProfileModalOpen(true);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    border: '1px solid #ccc',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}
                            >
                                <Edit2 size={14} /> Edit Profile
                            </button>
                        </div>
                        <p>Customize your 2x4 identity grid</p>

                    </div>
                </div>
                <button className="btn-save" onClick={handleSave}>
                    <Save size={20} /> Save Changes
                </button>
            </header>

            <div className="builder-layout">
                <div className="shelf-column">
                    <ShelfCabinet
                        shelf={{ ...myShelf, theme: currentTheme, skin: currentSkin }}
                        accessories={accessories}
                        onSlotClick={handleSlotClick}
                    />

                </div>

                <div className="controls-column">
                    <section className="control-section">
                        <h3><Palette size={20} /> 1. Choose Backdrop</h3>
                        <div className="theme-grid">
                            {themes.filter(Boolean).map(t => (
                                <button
                                    key={t.id}
                                    className={`theme-card ${myShelf.themeId === t.id ? 'active' : ''}`}
                                    onClick={() => changeTheme(t.id)}
                                    style={{
                                        background: t.type === 'IMAGE' ? `url(${resolveImg(t)}) center/cover` : t.value,
                                        backgroundColor: t.pageBackground || t.value
                                    }}

                                >
                                    <div className="theme-card-label">
                                        <span>{t.name}</span>
                                    </div>
                                </button>
                            ))}

                        </div>
                    </section>

                    <section className="control-section">
                        <h3><Sparkles size={20} /> 2. Choose Shelf Skin</h3>
                        <div className="theme-grid">
                            {skins.filter(Boolean).map(s => {
                                const isCss = s.id?.startsWith('css-');
                                const skinUrl = isCss ? '' : resolveImg(s);

                                return (
                                    <button
                                        key={s.id}
                                        className={`theme-card ${myShelf.skinId === s.id ? 'active' : ''}`}
                                        onClick={() => changeSkin(s.id)}
                                        style={{
                                            background: skinUrl ? `url(${skinUrl}) center/cover no-repeat` : s.frameColor,
                                            // Fallback color logic handled in CSS/Cabinet, here it's just for selection
                                        }}
                                    >
                                        {!isCss ? (
                                            <img src={resolveImg(s)} alt="" className="theme-card-frame" style={{ display: 'none' }} />
                                        ) : (
                                            <div className={`skin-preview-overlay ${s.id}`} style={{
                                                position: 'absolute',
                                                inset: 0,
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                borderRadius: '8px'
                                            }} />
                                        )}

                                        <div className="theme-card-label">
                                            <span>{s.name}</span>
                                        </div>
                                    </button>
                                );
                            })}

                        </div>
                    </section>


                    {/* REPLACED Slot Management with DiscoverLibrary */}
                    <DiscoverLibrary accessories={accessories} />

                    <button className="btn-randomize" onClick={randomizeShelf}>
                        <Sparkles size={20} /> Randomize Items
                    </button>
                </div>
            </div>

            <AccessoryPicker
                isOpen={pickerOpen}
                onClose={() => setPickerOpen(false)}
                accessories={accessories}
                onSelect={handleAccessorySelect}
            />

            <EditProfileModal
                isOpen={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
            />
        </div>
    );
};

export default ShelfBuilder;
