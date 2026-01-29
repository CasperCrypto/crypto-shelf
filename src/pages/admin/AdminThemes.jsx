import React, { useState } from 'react';
import { useAppStore } from '../../AppContext';
import { Plus, Trash2, Image as ImageIcon, Palette, Upload, Loader } from 'lucide-react';
import { uploadThemeImage } from '../../services/shelfApi';
import './AdminThemes.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const resolveImg = (item) => {
    if (!item) return '';
    if (item.imageUrl) return item.imageUrl;
    if (item.imagePath && supabaseUrl) {
        return `${supabaseUrl}/storage/v1/object/public/assets/${item.imagePath}`;
    }
    return '';
};


const AdminThemes = () => {
    const { themes, addTheme, deleteTheme } = useAppStore();
    const [isAdding, setIsAdding] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [newTheme, setNewTheme] = useState({
        name: '',
        type: 'GRADIENT',
        value: '',
        pageBackground: '#f5f5f5',
        imageUrl: '',
        imagePath: ''
    });


    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const path = await uploadThemeImage(file);
            if (path) {
                setNewTheme(prev => ({
                    ...prev,
                    imagePath: path,
                    imageUrl: '',
                    value: '' // Reset value if image upload
                }));
            } else {
                alert("Upload failed");
            }
        } catch (err) {
            console.error("Upload error", err);
        } finally {
            setUploading(false);
        }
    };

    const handleAdd = async () => {
        if (!newTheme.name) return;
        setSubmitting(true);
        try {
            await addTheme(newTheme);
            setNewTheme({ name: '', type: 'GRADIENT', value: '', pageBackground: '#f5f5f5', imageUrl: '', imagePath: '' });
            setIsAdding(false);
        } catch (err) {
            console.error(err);
        }
        setSubmitting(false);
    };

    return (
        <div className="admin-themes">
            <div className="admin-section-header">
                <h2>Manage Themes</h2>
                <button className="add-btn" onClick={() => setIsAdding(!isAdding)}>
                    <Plus size={18} />
                    <span>{isAdding ? 'Cancel' : 'Add New Theme'}</span>
                </button>
            </div>

            {isAdding && (
                <div className="admin-form-card">
                    <h3>New Theme Configuration</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Display Name</label>
                            <input
                                id="theme-name"
                                name="name"
                                type="text"
                                value={newTheme.name}
                                onChange={e => setNewTheme({ ...newTheme, name: e.target.value })}
                                placeholder="e.g. Neon Cyber"
                            />

                        </div>
                        <div className="form-group">
                            <label>Background Type</label>
                            <select id="theme-type" name="type" value={newTheme.type} onChange={e => setNewTheme({ ...newTheme, type: e.target.value })}>

                                <option value="GRADIENT">Gradient/Solid</option>
                                <option value="IMAGE">Full Graphic BG</option>
                            </select>
                        </div>

                        {newTheme.type === 'IMAGE' ? (
                            <div className="form-group">
                                <label>Upload Background Image</label>
                                <div className="image-upload-container">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        id="theme-img-upload"
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <label htmlFor="theme-img-upload" className="btn-upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#eef', borderRadius: '8px', border: '1px solid #ddd' }}>
                                            {uploading ? <Loader size={16} className="spin" /> : <Upload size={16} />}
                                            {uploading ? 'Uploading...' : 'Upload Image'}
                                        </label>
                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>OR URL</span>
                                        <input
                                            type="text"
                                            value={newTheme.imageUrl}
                                            onChange={e => setNewTheme({ ...newTheme, imageUrl: e.target.value, imagePath: '' })}
                                            placeholder="https://..."
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                    {newTheme.imagePath && (
                                        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'green' }}>
                                            Uploaded: {newTheme.imagePath}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label>Gradient Value (CSS)</label>
                                <input
                                    type="text"
                                    value={newTheme.value}
                                    onChange={e => setNewTheme({ ...newTheme, value: e.target.value })}
                                    placeholder="linear-gradient(...)"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Page BG Color (Fallback)</label>
                            <input
                                type="color"
                                value={newTheme.pageBackground}
                                onChange={e => setNewTheme({ ...newTheme, pageBackground: e.target.value })}
                            />
                        </div>
                    </div>
                    <button className="submit-btn" onClick={handleAdd} disabled={submitting || uploading}>
                        {submitting ? 'Saving...' : 'Save Theme'}
                    </button>
                </div>
            )}

            <div className="themes-grid">
                {themes.map(theme => (
                    <div key={theme.id} className="theme-card">
                        <div
                            className="theme-preview"
                            style={{
                                background: theme.type === 'IMAGE' ? `url(${resolveImg(theme)}) center/cover` : theme.value,
                                backgroundColor: theme.pageBackground || theme.value
                            }}

                        >
                            {theme.type === 'IMAGE' ? <ImageIcon size={20} className="type-icon" /> : <Palette size={20} className="type-icon" />}
                        </div>

                        <div className="theme-info">
                            <h3>{theme.name}</h3>
                            <button className="delete-btn" onClick={() => deleteTheme(theme.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminThemes;
