import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../AppContext';
import ShelfCabinet from '../components/ShelfCabinet';
import ReactionBar from '../components/ReactionBar';
import UserIdentity from '../components/UserIdentity';
import { ArrowLeft, Share2 } from 'lucide-react';
import { getShelfById } from '../services/shelfApi';
import './ShelfDetail.css';

const ShelfDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { accessories, themes } = useAppStore();
    const [shelf, setShelf] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchShelf = async () => {
            setLoading(true);
            try {
                const data = await getShelfById(id);
                setShelf(data);
            } catch (error) {
                console.error("Failed to fetch shelf:", error);
                setShelf(null);
            } finally {
                setLoading(false);
            }
        };
        fetchShelf();
    }, [id]);

    const handleShareX = () => {
        const url = window.location.href;
        const text = `Check out my Crypto Shelf! 💎🔥 curated by @${shelf?.user?.handle || 'CryptoShelf'}`;
        const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(xUrl, '_blank');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="loading">Loading shelf...</div>;
    if (!shelf) return <div className="loading">Shelf not found</div>;

    const theme = themes.find(t => t.id === shelf.themeId);

    return (
        <div className="detail-page container">
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigate(-1)} title="Back">
                    <ArrowLeft size={24} />
                </button>
                <div className="owner-meta">
                    <UserIdentity
                        handle={shelf.user?.handle}
                        avatar={shelf.user?.avatar}
                        twitterHandle={shelf.user?.twitterHandle}
                        isVerified={shelf.user?.isVerified}
                        size="lg"
                        showTwitter={true}
                    />
                </div>
                <div className="detail-actions">
                    <button className="share-btn x-btn" onClick={handleShareX} title="Share on X">
                        <Share2 size={20} />
                        <span>Share on X</span>
                    </button>
                    <button className="share-btn copy-btn" onClick={handleCopyLink} title="Copy Link">
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
            </header>

            <div className="detail-hero">
                <ShelfCabinet
                    shelf={{ ...shelf, theme }}
                    accessories={accessories}
                    readOnly={true}
                />

                <div className="social-actions">
                    <h3>React to this shelf</h3>
                    <ReactionBar shelfId={shelf.id} />
                </div>
            </div>
        </div>
    );
};

export default ShelfDetail;
