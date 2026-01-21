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
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const { uploadSkinImage } = await import('../../services/shelfApi');
            const path = await uploadSkinImage(file);
            if (path) {
                setNewSkin({ ...newSkin, imagePath: path });
            } else {
                alert("Upload failed. Check console.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleAdd = () => {
        if (!newSkin.name) {
            alert("Name is required");
            return;
        }
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
                            <label>Upload Skin Image (PNG/JPG)</label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                                {uploading && <span>Uploading...</span>}
                            </div>
                            {newSkin.imagePath && <small className="success-text">✓ Image uploaded: {newSkin.imagePath}</small>}
                        </div>

                        <div className="form-group span-2">
                            <label>OR External URL (Optional)</label>
                            <input
                                id="skin-url"
                                name="imageUrl"
                                type="text"
                                value={newSkin.imageUrl}
                                onChange={e => setNewSkin({ ...newSkin, imageUrl: e.target.value })}
                                placeholder="https://..."
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
                    <button className="submit-btn" onClick={handleAdd} disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Save Skin'}
                    </button>
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
