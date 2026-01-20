import React, { useState } from 'react';
import { useAppStore } from '../../AppContext';
import { Plus, Trash2, Image as ImageIcon, Palette } from 'lucide-react';
import './AdminThemes.css';

const AdminThemes = () => {
    const { themes, addTheme, deleteTheme } = useAppStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newTheme, setNewTheme] = useState({
        name: '',
        type: 'GRADIENT',
        value: '',
        frameColor: '#5D4037',
        pageBackground: '#f5f5f5',
        imageUrl: '',
        frameImageUrl: ''
    });

    const handleAdd = () => {
        if (!newTheme.name) return;
        addTheme(newTheme);
        setNewTheme({ name: '', type: 'GRADIENT', value: '', frameColor: '#5D4037', pageBackground: '#f5f5f5', imageUrl: '', frameImageUrl: '' });
        setIsAdding(false);
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
                                type="text"
                                value={newTheme.name}
                                onChange={e => setNewTheme({ ...newTheme, name: e.target.value })}
                                placeholder="e.g. Neon Cyber"
                            />
                        </div>
                        <div className="form-group">
                            <label>Background Type</label>
                            <select value={newTheme.type} onChange={e => setNewTheme({ ...newTheme, type: e.target.value })}>
                                <option value="GRADIENT">Gradient/Solid</option>
                                <option value="IMAGE">Full Graphic BG</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Background Value (Color/URL)</label>
                            <input
                                type="text"
                                value={newTheme.type === 'IMAGE' ? newTheme.imageUrl : newTheme.value}
                                onChange={e => setNewTheme({
                                    ...newTheme,
                                    [newTheme.type === 'IMAGE' ? 'imageUrl' : 'value']: e.target.value
                                })}
                                placeholder={newTheme.type === 'IMAGE' ? "https://..." : "linear-gradient(...)"}
                            />
                        </div>
                        <div className="form-group">
                            <label>Page BG Color (Fallback)</label>
                            <input
                                type="color"
                                value={newTheme.pageBackground}
                                onChange={e => setNewTheme({ ...newTheme, pageBackground: e.target.value })}
                            />
                        </div>
                        <div className="form-group span-2">
                            <label>Shelf Frame Image URL (Premium Skins)</label>
                            <input
                                type="text"
                                value={newTheme.frameImageUrl}
                                onChange={e => setNewTheme({ ...newTheme, frameImageUrl: e.target.value })}
                                placeholder="https://... (e.g. Wood Classic image)"
                            />
                        </div>
                        <div className="form-group">
                            <label>Frame Accent Color</label>
                            <input
                                type="color"
                                value={newTheme.frameColor}
                                onChange={e => setNewTheme({ ...newTheme, frameColor: e.target.value })}
                            />
                        </div>
                    </div>
                    <button className="submit-btn" onClick={handleAdd}>Save Theme</button>
                </div>
            )}

            <div className="themes-grid">
                {themes.map(theme => (
                    <div key={theme.id} className="theme-card">
                        <div
                            className="theme-preview"
                            style={{
                                background: theme.type === 'IMAGE' ? `url(${theme.imageUrl}) center/cover` : theme.value,
                                backgroundColor: theme.pageBackground || theme.value,
                                border: theme.frameImageUrl ? 'none' : `3px solid ${theme.frameColor}`
                            }}
                        >
                            {theme.frameImageUrl && (
                                <img src={theme.frameImageUrl} alt="" className="frame-preview-img" />
                            )}
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
