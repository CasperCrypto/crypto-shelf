import React from 'react';
import { Twitter, CheckCircle2 } from 'lucide-react';
import './UserIdentity.css';

const UserIdentity = ({
    handle,
    avatar,
    twitterHandle,
    isVerified,
    size = 'md',
    showTwitter = true,
    showVerified = true
}) => {
    const safeHandle = handle?.replace(/^@/, '') || 'anon';
    const displayAvatar = avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

    const visitTwitter = (e) => {
        if (!twitterHandle) return;
        e.stopPropagation();
        window.open(`https://x.com/${twitterHandle.replace(/^@/, '')}`, '_blank');
    };

    return (
        <div className={`user-identity size-${size}`}>
            <div className="avatar-container">
                <img src={displayAvatar} alt={safeHandle} className="identity-avatar" />
                {showVerified && isVerified && (
                    <div className="verified-badge-mini">
                        <CheckCircle2 size={12} fill="#676FFF" color="white" />
                    </div>
                )}
            </div>

            <div className="identity-info">
                <div className="handle-row" onClick={twitterHandle ? visitTwitter : undefined}>
                    <span className="identity-handle">@{safeHandle}</span>
                    {showVerified && isVerified && (
                        <CheckCircle2 size={14} className="verified-icon" fill="#676FFF" color="white" />
                    )}
                </div>

                {showTwitter && twitterHandle && (
                    <button className="twitter-link-small" onClick={visitTwitter}>
                        <Twitter size={12} />
                        <span>@{twitterHandle.replace(/^@/, '')}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default UserIdentity;
