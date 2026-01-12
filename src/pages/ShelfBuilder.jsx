import React, { useState, useEffect } from 'react';
import { useAppStore } from '../main';
import ShelfCabinet from '../components/ShelfCabinet';
import AccessoryPicker from '../components/AccessoryPicker';
import { Save, Palette, Image as ImageIcon, Sparkles } from 'lucide-react';
import './ShelfBuilder.css';

const ShelfBuilder = () => {
    const { currentUser, accessories, themes, shelves, saveShelf } = useAppStore();
    const [myShelf, setMyShelf] = useState(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        if (currentUser) {
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
    }, [currentUser, shelves]);

    if (!myShelf) return <div className="loading">Loading your shelf...</div>;

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

    const currentTheme = themes.find(t => t.id === myShelf.themeId);

    return (
        <div className="builder-page container">
            <header className="builder-header">
                <div className="user-info">
                    <img src={currentUser.avatar} alt={currentUser.handle} className="avatar" />
                    <div>
                        <h1>My Shelf</h1>
                        <p>Customize your 2x4 identity grid</p>
                    </div>
                </div>
                <button className="btn-save" onClick={() => saveShelf(myShelf)}>
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

                    <section className="control-section">
                        <h3><ImageIcon size={20} /> Slot Management</h3>
                        <p>Click any slot in the cabinet to swap accessories.</p>
                        <div className="slot-indicators">
                            {myShelf.slots.map((s, i) => (
                                <div key={i} className={`slot-dot ${s.itemId ? 'filled' : ''}`} />
                            ))}
                        </div>
                    </section>

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
        </div>
    );
};

export default ShelfBuilder;
