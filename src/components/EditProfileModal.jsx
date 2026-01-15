import React, { useState, useRef } from 'react';
import { useAppStore } from '../AppContext';
import { usePrivy } from '@privy-io/react-auth';
import { X, Save, Link as LinkIcon, Twitter, Upload, Camera, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './EditProfileModal.css';

const EditProfileModal = ({ isOpen, onClose }) => {
    const { currentUser, setCurrentUser } = useAppStore();
    const { linkTwitter, user: privyUser } = usePrivy();

    // State
    const [handle, setHandle] = useState(currentUser?.handle?.replace(/^@/, '') || '');
    const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen || !currentUser) return null;

    // Helper: Compress Image via Canvas
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 300; // Small, optimized size for avatars
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = MAX_WIDTH;
                    const height = img.height * scaleSize;

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', 0.7); // 70% quality JPEG
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);

            // 1. Compress
            const compressedBlob = await compressImage(file);
            const fileName = `${currentUser.id}-${Date.now()}.jpg`;

            // 2. Upload to Supabase 'avatars' bucket
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, compressedBlob, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            setAvatarPreview(publicUrl);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Make sure your 'avatars' storage bucket is public!");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const newHandle = handle.startsWith('@') ? handle : `@${handle}`;

        // 1. Update Supabase
        const { error } = await supabase
            .from('profiles')
            .update({
                handle: newHandle,
                avatar_url: avatarPreview, // Use the uploaded/preview URL
                updated_at: new Date().toISOString()
            })
            .eq('id', currentUser.id);

        if (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
            setIsSaving(false);
            return;
        }

        // 2. Update Local State
        setCurrentUser({
            ...currentUser,
            handle: newHandle,
            avatar: avatarPreview
        });

        setIsSaving(false);
        onClose();
    };

    const isTwitterLinked = privyUser?.linkedAccounts?.some(acc => acc.type === 'twitter_oauth');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content profile-modal glass-panel" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <p>Customize your identity on the shelf.</p>
                </div>

                <div className="modal-body">
                    {/* Avatar Upload Section */}
                    <div className="avatar-upload-section">
                        <div className="avatar-wrapper" onClick={() => fileInputRef.current.click()}>
                            <img
                                src={avatarPreview || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                                alt="Profile"
                                className="avatar-preview-large"
                            />
                            <div className="avatar-overlay">
                                {isUploading ? <Loader2 className="spin" /> : <Camera size={24} />}
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            hidden
                        />
                        <button className="btn-text" onClick={() => fileInputRef.current.click()}>
                            Change Profile Photo
                        </button>
                    </div>

                    {/* Handle Input */}
                    <div className="form-group">
                        <label>Display Handle</label>
                        <div className="input-with-prefix">
                            <span className="prefix">@</span>
                            <input
                                type="text"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))}
                                placeholder="username"
                                maxLength={20}
                            />
                        </div>
                    </div>

                    {/* Social Linking */}
                    <div className="form-group">
                        <label>Linked Accounts</label>
                        {isTwitterLinked ? (
                            <div className="linked-badge success">
                                <Twitter size={16} />
                                <span>Twitter Connected</span>
                            </div>
                        ) : (
                            <button className="btn-social-link twitter" onClick={linkTwitter}>
                                <Twitter size={18} /> Connect Twitter / X
                            </button>
                        )}
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn-primary-save" onClick={handleSave} disabled={isSaving || isUploading}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
