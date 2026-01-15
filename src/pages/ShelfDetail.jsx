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

    useEffect(() => {
        const fetchShelf = async () => {
            setLoading(true);
            try {
                const data = await getShelfById(id);
                setShelf(data);
            } catch (error) {
                console.error("Failed to fetch shelf:", error);
                setShelf(null); // Ensure shelf is null if fetch fails
            } finally {
                setLoading(false);
            }
        };
        fetchShelf();
    }, [id]);

    if (loading) return <div className="loading">Loading shelf...</div>;
    if (!shelf) return <div className="loading">Shelf not found</div>;

    const theme = themes.find(t => t.id === shelf.themeId);

    return (
        <div className="detail-page container">
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
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
                <button className="share-btn">
                    <Share2 size={24} />
                </button>
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
