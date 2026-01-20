import React, { useState, useEffect } from 'react';
import { EyeOff, Eye, ShieldAlert } from 'lucide-react';
import { getAllProfiles, updateProfile } from '../../services/profileApi';
import './AdminModeration.css';

const AdminModeration = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        const data = await getAllProfiles();
        setProfiles(data);
        setLoading(false);
    };

    const handleToggleHidden = async (userId, currentStatus) => {
        const newStatus = !currentStatus;

        // Optimistic update
        setProfiles(prev => prev.map(p => p.id === userId ? { ...p, is_hidden: newStatus } : p));

        await updateProfile(userId, { is_hidden: newStatus });
    };

    if (loading) return <div className="admin-loading">Loading profiles...</div>;

    return (
        <div className="admin-moderation">
            <div className="admin-section-header">
                <h2>User Moderation</h2>
                <p>Hide unwanted users from Explore and Rankings</p>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User Profile</th>
                        <th>Handle</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {profiles.map(profile => (
                        <tr key={profile.id} className={profile.is_hidden ? 'hidden-row' : ''}>
                            <td className="profile-cell">
                                <img src={profile.avatar_url || 'https://via.placeholder.com/40'} alt="" className="admin-avatar" />
                                <span>{profile.id.substring(0, 8)}...</span>
                            </td>
                            <td>@{profile.handle || 'Guest'}</td>
                            <td>
                                {profile.is_hidden ? (
                                    <span className="status-badge hidden">HIDDEN</span>
                                ) : (
                                    <span className="status-badge active">PUBLIC</span>
                                )}
                            </td>
                            <td>
                                <div className="table-actions">
                                    <button
                                        className={`mod-btn ${profile.is_hidden ? 'reveal' : 'hide'}`}
                                        onClick={() => handleToggleHidden(profile.id, profile.is_hidden)}
                                        title={profile.is_hidden ? 'Make Public' : 'Hide from Public'}
                                    >
                                        {profile.is_hidden ? <Eye size={18} /> : <EyeOff size={18} />}
                                        <span>{profile.is_hidden ? 'Show' : 'Hide'}</span>
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
