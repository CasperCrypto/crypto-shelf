import React, { useState, useEffect } from 'react';
import { getAllShelves, updateShelfStatus } from '../../services/shelfApi';
import { Star, ExternalLink, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import './AdminFeatured.css';

const AdminFeatured = () => {
    const [shelves, setShelves] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadShelves = async () => {
        setLoading(true);
        const data = await getAllShelves();
        setShelves(data);
        setLoading(false);
    };

    useEffect(() => {
        loadShelves();
    }, []);

    const toggleFeatured = async (shelf) => {
        const newValue = !shelf.isFeatured;

        // Optimistic update
        setShelves(current =>
            current.map(s => s.id === shelf.id ? { ...s, isFeatured: newValue } : s)
        );

        await updateShelfStatus(shelf.id, { is_featured: newValue });
    };

    if (loading) return <div className="loading-state"><Loader className="spin" /> Loading shelves...</div>;

    return (
        <div className="admin-featured">
            <div className="admin-section-header">
                <h2>Featured Shelves</h2>
                <div className="stats">
                    <span>Total Shelves: {shelves.length}</span>
                    <span>Featured: {shelves.filter(s => s.isFeatured).length}</span>
                </div>
            </div>

            <div className="shelves-list">
                {shelves.map(shelf => (
                    <div key={shelf.id} className={`shelf-row ${shelf.isFeatured ? 'featured' : ''}`}>
                        <div className="shelf-info">
                            <div className="user-avatar">
                                <img
                                    src={shelf.user.avatar || 'https://placehold.co/40x40'}
                                    alt={shelf.user.handle}
                                    onError={e => e.target.src = 'https://placehold.co/40x40'}
                                />
                            </div>
                            <div className="details">
                                <h4>{shelf.user.handle} {shelf.user.isVerified && <span className="verified-badge">✓</span>}</h4>
                                <span className="sub-text">Theme: {shelf.themeId} | Skin: {shelf.skinId} | Reactions: {shelf.totalReactions}</span>
                            </div>
                        </div>

                        <div className="actions">
                            <Link to={`/shelf/${shelf.id}`} target="_blank" className="view-link">
                                <ExternalLink size={16} /> View
                            </Link>

                            <button
                                className={`feature-btn ${shelf.isFeatured ? 'active' : ''}`}
                                onClick={() => toggleFeatured(shelf)}
                            >
                                <Star size={16} fill={shelf.isFeatured ? "currentColor" : "none"} />
                                {shelf.isFeatured ? 'Featured' : 'Feature'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminFeatured;
