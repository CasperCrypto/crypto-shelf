import React from 'react';
import { useAppStore } from '../../AppContext';
import './AdminThemes.css';

const AdminThemes = () => {
    const { themes } = useAppStore();

    return (
        <div className="admin-themes">
            <div className="admin-section-header">
                <h2>Manage Themes</h2>
            </div>
            <div className="themes-list">
                {themes.map(theme => (
                    <div key={theme.id} className="theme-item">
                        <div className="theme-preview" style={{ background: theme.bgValue }}></div>
                        <div className="theme-info">
                            <h3>{theme.name}</h3>
                            <span>{theme.bgValue}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminThemes;
