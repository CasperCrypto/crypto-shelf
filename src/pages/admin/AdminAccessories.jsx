import React, { useState } from 'react';
import { useAppStore } from '../../AppContext';
import { Plus, Trash2, Edit } from 'lucide-react';
import './AdminAccessories.css';

const AdminAccessories = () => {
    const { accessories, addAccessory, deleteAccessory } = useAppStore();
    const [showForm, setShowForm] = useState(false);
    const [newAcc, setNewAcc] = useState({ name: '', category: 'CRYPTO', rarity: 'Common', image: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        addAccessory({ ...newAcc, isActive: true });
        setNewAcc({ name: '', category: 'CRYPTO', rarity: 'Common', image: '' });
        setShowForm(false);
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
                    <input
                        placeholder="Item Name"
                        value={newAcc.name}
                        onChange={e => setNewAcc({ ...newAcc, name: e.target.value })}
                        required
                    />
                    <select
                        value={newAcc.category}
                        onChange={e => setNewAcc({ ...newAcc, category: e.target.value })}
                    >
                        <option value="CRYPTO">Crypto</option>
                        <option value="MEME">Meme</option>
                        <option value="TOY">Toy</option>
                        <option value="PHOTO_FRAME">Photo Frame</option>
                    </select>
                    <select
                        value={newAcc.rarity}
                        onChange={e => setNewAcc({ ...newAcc, rarity: e.target.value })}
                    >
                        <option value="Common">Common</option>
                        <option value="Rare">Rare</option>
                        <option value="Legendary">Legendary</option>
                    </select>
                    <input
                        placeholder="Image URL"
                        value={newAcc.image}
                        onChange={e => setNewAcc({ ...newAcc, image: e.target.value })}
                        required
                    />
                    <button type="submit" className="btn-primary">Add Accessory</button>
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
                            <td><img src={acc.image} alt={acc.name} className="table-img" /></td>
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
