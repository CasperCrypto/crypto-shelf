import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../main';
import { INITIAL_ACCESSORIES, INITIAL_THEMES } from '../store/initialData';
import ShelfCabinet from '../components/ShelfCabinet';
import { LayoutGrid, Sparkles, Send } from 'lucide-react';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();
    const { currentUser, loginWithX, accessories } = useAppStore();

    useEffect(() => {
        if (currentUser) {
            navigate('/explore');
        }
    }, [currentUser, navigate]);

    const handleLogin = () => {
        loginWithX();
        navigate('/shelf/me');
    };

    const heroShelf = {
        id: 'hero',
        themeId: 'dawn',
        theme: INITIAL_THEMES[0],
        slots: [
            { index: 0, itemId: 'btc' },
            { index: 1, itemId: 'eth' },
            { index: 2, itemId: 'arcade' },
            { index: 4, itemId: 'penguin' },
            { index: 7, itemId: 'photo-frame' },
        ],
        shelfColor: '#8B5E3C'
    };

    return (
        <div className="landing-page container">
            <header className="hero">
                <div className="hero-content">
                    <div className="logo-badge">💎 Crypto Shelf</div>
                    <h1>Build Your <br /><span>Visual Identity</span></h1>
                    <p>Collect, display, and share who you are in Web3. The ultimate digital collectible shelf.</p>

                    <div className="hero-actions">
                        <button className="btn-primary btn-full-mobile" onClick={handleLogin}>Login with X</button>
                        <button className="btn-secondary btn-full-mobile" onClick={() => navigate('/explore')}>Explore Shelves</button>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="hero-shelf-wrapper">
                        <ShelfCabinet
                            shelf={heroShelf}
                            accessories={accessories || INITIAL_ACCESSORIES}
                            readOnly={true}
                        />
                    </div>
                </div>
            </header>

            <section className="how-it-works">
                <h2 className="section-title">How it Works</h2>
                <div className="responsive-grid">
                    <div className="step-card">
                        <div className="step-icon"><LayoutGrid size={32} /></div>
                        <h3>Collect</h3>
                        <p>Unlock rare crypto icons, memes, and limited edition toys.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon"><Sparkles size={32} /></div>
                        <h3>Build</h3>
                        <p>Design your 2x4 display cabinet with custom themes and skins.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon"><Send size={32} /></div>
                        <h3>Show</h3>
                        <p>Share your profile and climb the rankings based on reactions.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
