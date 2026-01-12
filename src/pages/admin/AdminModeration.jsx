import React from 'react';
import { useAppStore } from '../../main';
import { EyeOff, Star } from 'lucide-react';
import './AdminModeration.css';

const AdminModeration = () => {
    const { shelves, toggleShelfStatus } = useAppStore();

    return (
        <div className="admin-moderation">
            <div className="admin-section-header">
                <h2>Shelf Moderation</h2>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Handle</th>
                        <th>Featured</th>
                        <th>Hidden</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {shelves.map(shelf => (
                        <tr key={shelf.id}>
                            <td><strong>{shelf.user?.displayName}</strong></td>
                            <td>@{shelf.user?.handle}</td>
                            <td>{shelf.isFeatured ? '✅' : '❌'}</td>
                            <td>{shelf.isHidden ? '✅' : '❌'}</td>
                            <td>
                                <div className="table-actions">
                                    <button onClick={() => toggleShelfStatus(shelf.id, 'isFeatured')} title="Toggle Featured">
                                        <Star size={16} fill={shelf.isFeatured ? 'var(--color-accent)' : 'none'} />
                                    </button>
                                    <button onClick={() => toggleShelfStatus(shelf.id, 'isHidden')} title="Toggle Hidden">
                                        <EyeOff size={16} color={shelf.isHidden ? 'red' : 'gray'} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminModeration;
