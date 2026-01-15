import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../AppContext';
import ShelfCabinet from '../components/ShelfCabinet';
import ReactionBar from '../components/ReactionBar';
import { ArrowLeft, Share2 } from 'lucide-react';
import './ShelfDetail.css';

const ShelfDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { shelves, accessories, themes, addReaction } = useAppStore();

    const shelf = shelves.find(s => s.id === id);
    const theme = shelf ? themes.find(t => t.id === shelf.themeId) : null;

    if (!shelf) return <div className="loading">Shelf not found</div>;

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
