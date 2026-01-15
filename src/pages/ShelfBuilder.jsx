import React, { useState, useEffect } from 'react';
import { useAppStore } from '../AppContext';
import ShelfCabinet from '../components/ShelfCabinet';
import AccessoryPicker from '../components/AccessoryPicker';
import EditProfileModal from '../components/EditProfileModal'; // NEW IMPORT

import { Save, Palette, Sparkles, Edit2 } from 'lucide-react'; // Added Edit2 icon
import { getShelfForUser, saveShelfForUser } from '../services/shelfApi';
import './ShelfBuilder.css';

const ShelfBuilder = () => {
    const { currentUser, accessories, themes, shelves, saveShelf } = useAppStore();
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

    const randomizeShelf = () => {
        const randomSlots = Array.from({ length: 8 }).map((_, i) => {
            const activeAccs = accessories.filter(a => a.isActive && !a.isPhotoFrame);
            const randomAcc = activeAccs[Math.floor(Math.random() * activeAccs.length)];
            return { index: i, itemId: Math.random() > 0.3 ? randomAcc.id : null };
        });
        setMyShelf({ ...myShelf, slots: randomSlots });
    };

    const handleSave = async () => {
        // Save locally to update UI immediately
        saveShelf(myShelf);
        // Persist to Supabase
        await saveShelfForUser(currentUser.id, { themeId: myShelf.themeId, slots: myShelf.slots });
        alert("Shelf saved!");
    };

    const currentTheme = themes.find(t => t.id === myShelf.themeId);

    // Dynamic background logic
    const pageBg = currentTheme?.pageBackground || '#FFF5EC';
    // console.log("Theme Debug:", { themeId: myShelf.themeId, currentTheme, pageBg });


    return (
        <div
            className="builder-page container"
            style={{
                background: pageBg,
                transition: 'background 220ms ease-out',
                minHeight: 'calc(100vh - 80px)', // ensure full height coverage
                borderRadius: '16px' // Optional polish so it looks like a contained app
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
                        shelf={{ ...myShelf, theme: currentTheme }}
                        accessories={accessories}
                        onSlotClick={handleSlotClick}
                    />
                </div>

                <div className="controls-column">
                    <section className="control-section">
                        <h3><Palette size={20} /> Select Theme</h3>
                        <div className="theme-grid">
                            {themes.map(t => (
                                <button
                                    key={t.id}
                                    className={`theme-card ${myShelf.themeId === t.id ? 'active' : ''}`}
                                    onClick={() => changeTheme(t.id)}
                                    style={{ background: t.bgValue }}
                                >
                                    <span>{t.name}</span>
                                </button>
                            ))}
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
