import React, { useState } from 'react';
import { useAppStore } from '../../AppContext';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import './AdminSkins.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const resolveImg = (item) => {
    if (!item) return '';
    if (item.imageUrl) return item.imageUrl;
    if (item.imagePath && supabaseUrl) {
        return `${supabaseUrl}/storage/v1/object/public/${item.imagePath}`;
    }
    return '';
};


const AdminSkins = () => {
    const { skins, addSkin, deleteSkin } = useAppStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newSkin, setNewSkin] = useState({
        name: '',
        imageUrl: '',
        imagePath: '',
        frameColor: '#8B5E3C'
    });


    const handleAdd = () => {
        if (!newSkin.name || !newSkin.imageUrl) return;
        addSkin(newSkin);
        setNewSkin({ name: '', imageUrl: '', imagePath: '', frameColor: '#8B5E3C' });

        setIsAdding(false);
    };

    return (
        <div className="admin-skins">
            <div className="admin-section-header">
                <h2>Manage Shelf Skins</h2>
                <button className="add-btn" onClick={() => setIsAdding(!isAdding)}>
                    <Plus size={18} />
                    <span>{isAdding ? 'Cancel' : 'Add New Skin'}</span>
                </button>
            </div>

            {isAdding && (
                <div className="admin-form-card">
                    <h3>New Skin Configuration</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Skin Name</label>
                            <input
                                id="skin-name"
                                name="name"
                                type="text"
                                value={newSkin.name}
                                onChange={e => setNewSkin({ ...newSkin, name: e.target.value })}
                                placeholder="e.g. Cyber Metal"
                            />

                        </div>
                        <div className="form-group span-2">
                            <label>Background Image Path (assets/skins/...)</label>
                            <input
                                id="skin-path"
                                name="imagePath"
                                type="text"
                                value={newSkin.imagePath}
                                onChange={e => setNewSkin({ ...newSkin, imagePath: e.target.value })}
                                placeholder="assets/skins/my_shelf.jpg"
                            />
                        </div>
                        <div className="form-group span-2">
                            <label>OR Full URL Fallback</label>
                            <input
                                id="skin-url"
                                name="imageUrl"
                                type="text"
                                value={newSkin.imageUrl}
                                onChange={e => setNewSkin({ ...newSkin, imageUrl: e.target.value })}
                                placeholder="https://... (Designer JPG)"
                            />
                        </div>

                        <div className="form-group">
                            <label>Accent Color</label>
                            <input
                                type="color"
                                value={newSkin.frameColor}
                                onChange={e => setNewSkin({ ...newSkin, frameColor: e.target.value })}
                            />
                        </div>
                    </div>
                    <button className="submit-btn" onClick={handleAdd}>Save Skin</button>
                </div>
            )}

            <div className="skins-grid">
                {skins.map(skin => (
                    <div key={skin.id} className="skin-card">
                        <div
                            className="skin-preview"
                            style={{
                                backgroundImage: `url(${resolveImg(skin)})`,
                                backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                backgroundColor: '#f5f5f5'
                            }}

                        >
                            <Sparkles size={20} className="type-icon" />
                        </div>

                        <div className="skin-info">
                            <h3>{skin.name}</h3>
                            <button className="delete-btn" onClick={() => deleteSkin(skin.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSkins;
