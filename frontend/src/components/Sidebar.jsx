import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('user_role'); // e.g., super_admin

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.logo}>Hotel PMS</div>
            
            <nav style={styles.nav}>
                <div style={styles.category}>Main</div>
                
                {/* We use NavLink for automatic 'active' styling */}
                <NavLink to="/dashboard" style={({ isActive }) => isActive ? {...styles.link, ...styles.active} : styles.link}>
                    Dashboard
                </NavLink>
                
                <NavLink to="/calendar" style={({ isActive }) => isActive ? {...styles.link, ...styles.active} : styles.link}>
                    Calendar View
                </NavLink>

                <div style={styles.category}>Front Desk</div>
                <NavLink to="/bookings" style={({ isActive }) => isActive ? {...styles.link, ...styles.active} : styles.link}>
                    Reservations
                </NavLink>
                
                <NavLink to="/guests" style={({ isActive }) => isActive ? {...styles.link, ...styles.active} : styles.link}>
                    Guests (CRM)
                </NavLink>

                <div style={styles.category}>Operations</div>
                <NavLink to="/housekeeping" style={({ isActive }) => isActive ? {...styles.link, ...styles.active} : styles.link}>
                    Housekeeping
                </NavLink>
                
                {/* Admin Only Section */}
                {role === 'super_admin' && (
                    <>
                    <div style={styles.category}>Administration</div>
                    <NavLink to="/properties" style={({ isActive }) => isActive ? {...styles.link, ...styles.active} : styles.link}>
                         Properties
                    </NavLink>
                    <NavLink to="/properties/units" style={({ isActive }) => isActive ? {...styles.link, ...styles.active} : styles.link}>
                         Manage Rooms
                    </NavLink>
                    <NavLink to="/users" style={({ isActive }) => isActive ? {...styles.link, ...styles.active} : styles.link}>
                         Users & Roles
                    </NavLink>
                    </>
                )}
            </nav>

            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
    );
};

const styles = {
    sidebar: { width: '250px', height: '100vh', background: '#2c3e50', color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 1000 },
    logo: { padding: '20px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid #34495e', textAlign: 'center', background: '#1a252f' },
    nav: { flex: 1, padding: '15px', overflowY: 'auto' },
    category: { color: '#7f8c8d', fontSize: '11px', fontWeight:'bold', marginTop: '20px', marginBottom: '10px', textTransform: 'uppercase', paddingLeft: '10px' },
    link: { display: 'block', padding: '10px 15px', color: '#ecf0f1', textDecoration: 'none', marginBottom: '5px', borderRadius: '4px', fontSize: '14px', transition: 'background 0.2s' },
    active: { background: '#007BFF', color: 'white', fontWeight: '500', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' },
    logoutBtn: { padding: '15px', background: '#c0392b', color: 'white', border: 'none', cursor: 'pointer', textAlign: 'center', fontWeight:'bold', fontSize:'14px' }
};

export default Sidebar;