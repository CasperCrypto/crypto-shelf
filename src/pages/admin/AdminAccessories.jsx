import React, { useState } from 'react';
import { useAppStore } from '../../AppContext';
import { Plus, Trash2, Upload, Loader } from 'lucide-react';
import { uploadAccessoryImage } from '../../services/shelfApi'; // Import upload
import './AdminAccessories.css';

const AdminAccessories = () => {
    const { accessories, addAccessory, deleteAccessory } = useAppStore();
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newAcc, setNewAcc] = useState({ name: '', category: 'CRYPTO', rarity: 'Common', image: '' });

    // File upload state
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const path = await uploadAccessoryImage(file);
            if (path) {
                setNewAcc(prev => ({ ...prev, image: path })); // Store raw path
            } else {
                alert("Upload failed");
            }
        } catch (err) {
            console.error("Upload error", err);
            alert("Upload error");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addAccessory({
                ...newAcc,
                // Ensure field naming matches expectations if needed, but store handles mapping
                isActive: true
            });
            setNewAcc({ name: '', category: 'CRYPTO', rarity: 'Common', image: '' });
            setShowForm(false);
        } catch (err) {
            console.error(err);
        }
        setSubmitting(false);
    };

    return (
        <div className="admin-accessories">
            <div className="admin-section-header">
                <h2>Manage Accessories</h2>
                <button className="btn-add" onClick={() => setShowForm(!showForm)}>
                    <Plus size={20} /> Add New
                </button>
            </div>

            {showForm && (
                <form className="accessory-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            placeholder="Item Name"
                            value={newAcc.name}
                            onChange={e => setNewAcc({ ...newAcc, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={newAcc.category}
                            onChange={e => setNewAcc({ ...newAcc, category: e.target.value })}
                        >
                            <option value="CRYPTO">Crypto</option>
                            <option value="MEME">Meme</option>
                            <option value="TOY">Toy</option>
                            <option value="PHOTO_FRAME">Photo Frame</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Rarity</label>
                        <select
                            value={newAcc.rarity}
                            onChange={e => setNewAcc({ ...newAcc, rarity: e.target.value })}
                        >
                            <option value="Common">Common</option>
                            <option value="Rare">Rare</option>
                            <option value="Legendary">Legendary</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Image</label>
                        <div className="image-upload-container">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                id="acc-img-upload"
                                style={{ display: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <label htmlFor="acc-img-upload" className="btn-upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#eef', borderRadius: '8px' }}>
                                    {uploading ? <Loader size={16} className="spin" /> : <Upload size={16} />}
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                </label>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>OR</span>
                                <input
                                    placeholder="Image URL / Path"
                                    value={newAcc.image}
                                    onChange={e => setNewAcc({ ...newAcc, image: e.target.value })}
                                    required
                                    style={{ flex: 1 }}
                                />
                            </div>
                            {newAcc.image && (
                                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'green' }}>
                                    Selected: {newAcc.image}
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={submitting || uploading}>
                        {submitting ? 'Adding...' : 'Add Accessory'}
                    </button>
                </form>
            )}

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Icon</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Rarity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {accessories.map(acc => (
                        <tr key={acc.id}>
                            <td>
                                <img
                                    src={acc.image}
                                    alt={acc.name}
                                    className="table-img"
                                    onError={(e) => { e.target.src = 'https://placehold.co/40x40?text=?'; }}
                                />
                            </td>
                            <td><strong>{acc.name}</strong></td>
                            <td><span className="badge">{acc.category}</span></td>
                            <td><span className={`rarity-tag-small ${acc.rarity.toLowerCase()}`}>{acc.rarity}</span></td>
                            <td>
                                <div className="table-actions">
                                    <button onClick={() => deleteAccessory(acc.id)} className="delete-btn"><Trash2 size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminAccessories;
