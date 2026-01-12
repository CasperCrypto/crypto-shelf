import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, Palette, ShieldCheck, ChevronRight } from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname.includes(path);

    return (
        <div className="admin-page container">
            <header className="admin-header">
                <h1><ShieldCheck size={32} /> Admin Control</h1>
                <p>Manage the shelf ecosystem</p>
            </header>

            <div className="admin-container">
                <aside className="admin-sidebar">
                    <Link to="/admin/accessories" className={isActive('accessories') ? 'active' : ''}>
                        <Package size={20} /> Accessories <ChevronRight size={16} className="arrow" />
                    </Link>
                    <Link to="/admin/themes" className={isActive('themes') ? 'active' : ''}>
                        <Palette size={20} /> Themes <ChevronRight size={16} className="arrow" />
                    </Link>
                    <Link to="/admin/moderation" className={isActive('moderation') ? 'active' : ''}>
                        <ShieldCheck size={20} /> Moderation <ChevronRight size={16} className="arrow" />
                    </Link>
                </aside>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
