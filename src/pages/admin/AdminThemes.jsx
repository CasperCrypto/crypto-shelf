import React, { useState } from 'react';
import { useAppStore } from '../../AppContext';
import { Plus, Trash2, Image as ImageIcon, Palette } from 'lucide-react';
import './AdminThemes.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const resolveImg = (item) => {
    if (!item) return '';
    if (item.imageUrl) return item.imageUrl;
    if (item.imagePath && supabaseUrl) {
        return `${supabaseUrl}/storage/v1/object/public/${item.imagePath}`;
    }
    return '';
};


const AdminThemes = () => {
    const { themes, addTheme, deleteTheme } = useAppStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newTheme, setNewTheme] = useState({
        name: '',
        type: 'GRADIENT',
        value: '',
        pageBackground: '#f5f5f5',
        imageUrl: '',
        imagePath: ''
    });


    const handleAdd = () => {
        if (!newTheme.name) return;
        addTheme(newTheme);
        setNewTheme({ name: '', type: 'GRADIENT', value: '', pageBackground: '#f5f5f5', imageUrl: '', imagePath: '' });

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
                        <div className="form-group">
                            <label>Background Value (Color/Path/URL)</label>
                            <input
                                type="text"
                                value={newTheme.type === 'IMAGE' ? (newTheme.imagePath || newTheme.imageUrl) : newTheme.value}
                                onChange={e => setNewTheme({
                                    ...newTheme,
                                    [newTheme.type === 'IMAGE' ? (e.target.value.includes('/') ? 'imagePath' : 'imageUrl') : 'value']: e.target.value
                                })}
                                placeholder={newTheme.type === 'IMAGE' ? "assets/themes/bg.jpg or https://..." : "linear-gradient(...)"}
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
