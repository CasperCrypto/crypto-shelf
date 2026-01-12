import React, { useState } from 'react';
import { useAppStore } from '../../main';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import './AdminThemes.css';

const AdminThemes = () => {
    const { themes, addTheme, updateTheme, deleteTheme } = useAppStore();
    const [showModal, setShowModal] = useState(false);
    const [editingTheme, setEditingTheme] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'GRADIENT', value: '', frameColor: '', isActive: true });

    const openModal = (theme = null) => {
        if (theme) {
            setEditingTheme(theme);
            setFormData({ ...theme });
        } else {
            setEditingTheme(null);
            setFormData({ name: '', type: 'GRADIENT', value: '', frameColor: '', isActive: true });
        }
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTheme) {
            updateTheme(editingTheme.id, formData);
        } else {
            addTheme(formData);
        }
        setShowModal(false);
    };

    return (
        <div className="admin-themes">
            <div className="admin-section-header">
                <h2>Manage Themes</h2>
                <button className="btn-add" onClick={() => openModal()}>
                    <Plus size={20} /> Add Theme
                </button>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Preview</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {themes.map(theme => (
                            <tr key={theme.id}>
                                <td>
                                    <div
                                        className="theme-table-preview"
                                        style={theme.type === 'IMAGE' ? { backgroundImage: `url(${theme.value})` } : { background: theme.value }}
                                    ></div>
                                </td>
                                <td><strong>{theme.name}</strong></td>
                                <td><span className="badge">{theme.type}</span></td>
                                <td className="txt-muted truncate">{theme.value}</td>
                                <td>
                                    <span className={`status-dot ${theme.isActive ? 'active' : ''}`}></span>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <button onClick={() => openModal(theme)} className="edit-btn"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteTheme(theme.id)} className="delete-btn"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingTheme ? 'Edit Theme' : 'Add New Theme'}</h3>
                            <button onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="form-group">
                                <label>Theme Name</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Background Type</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="GRADIENT">Gradient</option>
                                    <option value="IMAGE">Image URL</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Background Value (CSS or URL)</label>
                                <input
                                    value={formData.value}
                                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Cabinet Frame Color</label>
                                <input
                                    type="color"
                                    value={formData.frameColor || '#8B5E3C'}
                                    onChange={e => setFormData({ ...formData, frameColor: e.target.value })}
                                />
                            </div>
                            <div className="form-group row">
                                <label>Active Theme</label>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            </div>

                            <div className="theme-preview-box" style={formData.type === 'IMAGE' ? { backgroundImage: `url(${formData.value})`, backgroundSize: 'cover' } : { background: formData.value }}>
                                <div className="preview-label">Live Preview</div>
                                <div className="preview-frame" style={{ borderColor: formData.frameColor }}></div>
                            </div>

                            <button type="submit" className="btn-primary full-width">
                                {editingTheme ? 'Save Changes' : 'Create Theme'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminThemes;
