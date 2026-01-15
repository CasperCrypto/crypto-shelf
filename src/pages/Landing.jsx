import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useAppStore } from '../AppContext';
import { INITIAL_ACCESSORIES } from '../store/initialData';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();
    const { currentUser } = useAppStore();
    const { login } = usePrivy();

    useEffect(() => {
        if (currentUser) {
            navigate('/explore');
        }
    }, [currentUser, navigate]);

    const handleLogin = () => {
        login();
    };

    return (
        <div className="landing-page">
            <header className="hero">
                <div className="hero-content">
                    <div className="logo-badge">💎 Crypto Shelf</div>
                    <h1>Build Your <br /><span>Visual Identity</span></h1>
                    <p>Collect, display, and share who you are in Web3. The ultimate digital collectible shelf.</p>

                    <div className="hero-actions">
                        <button className="btn-primary" onClick={handleLogin}>Login with X</button>
                        <button className="btn-secondary" onClick={() => navigate('/explore')}>Explore Shelves</button>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="preview-items">
                        {INITIAL_ACCESSORIES.slice(0, 6).map(acc => (
                            <div key={acc.id} className="preview-item">
                                <img src={acc.image} alt={acc.name} />
                            </div>
                        ))}
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Landing;
