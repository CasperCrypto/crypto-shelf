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
        imageUrl: ''
    });

    const handleAdd = () => {
        if (!newTheme.name || (!newTheme.value && !newTheme.imageUrl)) return;
        addTheme(newTheme);
        setNewTheme({ name: '', type: 'GRADIENT', value: '', frameColor: '#5D4037', pageBackground: '#f5f5f5', imageUrl: '' });
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
                            <label>Type</label>
                            <select value={newTheme.type} onChange={e => setNewTheme({ ...newTheme, type: e.target.value })}>
                                <option value="GRADIENT">Colors / Gradient</option>
                                <option value="IMAGE">Graphic / Image</option>
                            </select>
                        </div>
                        {newTheme.type === 'GRADIENT' ? (
                            <div className="form-group">
                                <label>Gradient/Color Value</label>
                                <input
                                    type="text"
                                    value={newTheme.value}
                                    onChange={e => setNewTheme({ ...newTheme, value: e.target.value })}
                                    placeholder="linear-gradient(...)"
                                />
                            </div>
                        ) : (
                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="text"
                                    value={newTheme.imageUrl}
                                    onChange={e => setNewTheme({ ...newTheme, imageUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label>Frame Color</label>
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
                                backgroundColor: theme.type === 'GRADIENT' ? theme.value : 'transparent'
                            }}
                        >
                            {theme.type === 'IMAGE' ? <ImageIcon size={20} /> : <Palette size={20} />}
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
