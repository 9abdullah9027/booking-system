import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('user_role'); // e.g., super_admin

    const handleLogout = () => {
        // Clear data and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        navigate('/');
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.logo}>Hotel PMS</div>
            
            <nav style={styles.nav}>
                <div style={styles.category}>Main</div>
                <Link to="/dashboard" style={styles.link}>Dashboard</Link>
                <Link to="/calendar" style={styles.link}>Calendar & View</Link>

                <div style={styles.category}>Management</div>
                <Link to="/bookings" style={styles.link}>Bookings</Link>
                {/* Only Admin sees Properties */}
                {role === 'super_admin' && (
                    <Link to="/properties" style={styles.link}>Properties & Units</Link>
                )}
                
                <div style={styles.category}>Operations</div>
                <Link to="/guests" style={styles.link}>Guests (Check-in/out)</Link>
                <Link to="/housekeeping" style={styles.link}>Housekeeping</Link>

                {role === 'super_admin' && (
                    <>
                    <div style={styles.category}>Admin</div>
                    <Link to="/users" style={styles.link}>Users & Roles</Link>
                    <Link to="/reports" style={styles.link}>Reports</Link>
                    </>
                )}
            </nav>

            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
    );
};

// Basic Styles - we will make this prettier later or match your Figma
const styles = {
    sidebar: { width: '250px', height: '100vh', background: '#2c3e50', color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0 },
    logo: { padding: '20px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid #34495e', textAlign: 'center' },
    nav: { flex: 1, padding: '10px' },
    category: { color: '#95a5a6', fontSize: '12px', marginTop: '15px', marginBottom: '5px', textTransform: 'uppercase' },
    link: { display: 'block', padding: '10px 15px', color: '#ecf0f1', textDecoration: 'none', marginBottom: '5px', borderRadius: '4px' },
    logoutBtn: { padding: '15px', background: '#c0392b', color: 'white', border: 'none', cursor: 'pointer', textAlign: 'center' }
};

export default Sidebar;