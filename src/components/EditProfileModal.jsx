import React, { useState } from 'react';
import { useAppStore } from '../AppContext';
import { usePrivy } from '@privy-io/react-auth';
import { X, Save, Link as LinkIcon, Twitter } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './EditProfileModal.css';

const EditProfileModal = ({ isOpen, onClose }) => {
    const { currentUser, setCurrentUser } = useAppStore();
    const { linkTwitter, user: privyUser } = usePrivy();
    const [handle, setHandle] = useState(currentUser?.handle?.replace(/^@/, '') || '');
    const [avatar, setAvatar] = useState(currentUser?.avatar || '');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !currentUser) return null;

    const handleSave = async () => {
        setLoading(true);
        const newHandle = handle.startsWith('@') ? handle : `@${handle}`;

        // 1. Update Supabase
        const { error } = await supabase
            .from('profiles')
            .update({
                handle: newHandle,
                avatar_url: avatar,
                updated_at: new Date().toISOString()
            })
            .eq('id', currentUser.id);

        if (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
            setLoading(false);
            return;
        }

        // 2. Update Local State
        setCurrentUser({
            ...currentUser,
            handle: newHandle,
            avatar: avatar
        });

        setLoading(false);
        onClose();
    };

    const isTwitterLinked = privyUser?.linkedAccounts?.some(acc => acc.type === 'twitter_oauth');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                <h2>Edit Profile</h2>

                <div className="form-group">
                    <label>Display Handle</label>
                    <div className="input-with-prefix">
                        <span className="prefix">@</span>
                        <input
                            type="text"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))} // Prevent user typing @
                            placeholder="username"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Avatar URL</label>
                    <input
                        type="text"
                        value={avatar || ''}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://imgur.com/..."
                    />
                    {avatar && (
                        <div className="avatar-preview-section">
                            <img src={avatar} alt="Preview" className="avatar-preview" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Linked Accounts</label>
                    {isTwitterLinked ? (
                        <div className="linked-badge success">
                            <Twitter size={16} /> Twitter Linked
                        </div>
                    ) : (
                        <button className="btn-secondary link-btn" onClick={linkTwitter}>
                            <LinkIcon size={16} /> Link Twitter / X
                        </button>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-save" onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
