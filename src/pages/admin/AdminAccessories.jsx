import React, { useState } from 'react';
import { useAppStore } from '../../main';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import './AdminAccessories.css';

const AdminAccessories = () => {
    const { accessories, addAccessory, updateAccessory, deleteAccessory } = useAppStore();
    const [showModal, setShowModal] = useState(false);
    const [editingAcc, setEditingAcc] = useState(null);
    const [formData, setFormData] = useState({ name: '', category: 'CRYPTO', rarity: 'Common', image: '', isActive: true });

    const openModal = (acc = null) => {
        if (acc) {
            setEditingAcc(acc);
            setFormData({ ...acc });
        } else {
            setEditingAcc(null);
            setFormData({ name: '', category: 'CRYPTO', rarity: 'Common', image: '', isActive: true });
        }
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAcc) {
            updateAccessory(editingAcc.id, formData);
        } else {
            addAccessory(formData);
        }
        setShowModal(false);
    };

    return (
        <div className="admin-accessories">
            <div className="admin-section-header">
                <h2>Manage Accessories</h2>
                <button className="btn-add" onClick={() => openModal()}>
                    <Plus size={20} /> Add Accessory
                </button>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Icon</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Rarity</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accessories.map(acc => (
                            <tr key={acc.id}>
                                <td><img src={acc.image} alt={acc.name} className="table-img" /></td>
                                <td><strong>{acc.name}</strong></td>
                                <td><span className="badge">{acc.category}</span></td>
                                <td><span className={`rarity-tag-small ${acc.rarity.toLowerCase()}`}>{acc.rarity}</span></td>
                                <td>
                                    <span className={`status-dot ${acc.isActive ? 'active' : ''}`}></span>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <button onClick={() => openModal(acc)} className="edit-btn"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteAccessory(acc.id)} className="delete-btn"><Trash2 size={16} /></button>
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
                            <h3>{editingAcc ? 'Edit Accessory' : 'Add New Accessory'}</h3>
                            <button onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="form-group">
                                <label>Item Name</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="CRYPTO">Crypto</option>
                                    <option value="MEME">Meme</option>
                                    <option value="TOY">Toy</option>
                                    <option value="PHOTO_FRAME">Photo Frame</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Rarity</label>
                                <select value={formData.rarity} onChange={e => setFormData({ ...formData, rarity: e.target.value })}>
                                    <option value="Common">Common</option>
                                    <option value="Rare">Rare</option>
                                    <option value="Legendary">Legendary</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group row">
                                <label>Active Item</label>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            </div>

                            <div className="accessory-preview-box">
                                <div className="preview-label">Live Preview</div>
                                <img src={formData.image || 'https://via.placeholder.com/100'} alt="Preview" />
                            </div>

                            <button type="submit" className="btn-primary full-width">
                                {editingAcc ? 'Save Changes' : 'Create Accessory'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAccessories;
