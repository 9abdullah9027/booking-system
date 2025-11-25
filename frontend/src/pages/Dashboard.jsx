import React from 'react';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
    // Basic Mock Data for view only
    const userRole = localStorage.getItem('user_role');

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', width: '100%', padding: '20px' }}>
                <header style={styles.header}>
                    <h2>Overview</h2>
                    <span>Welcome, {userRole}</span>
                </header>

                {/* Dashboard Widgets (PDF Item M) */}
                <div style={styles.statsGrid}>
                    <div style={styles.card}>
                        <h3>Check-Ins Today</h3>
                        <p style={styles.number}>4</p>
                    </div>
                    <div style={styles.card}>
                        <h3>Check-Outs Today</h3>
                        <p style={styles.number}>2</p>
                    </div>
                    <div style={styles.card}>
                        <h3>Available Units</h3>
                        <p style={styles.number}>8</p>
                    </div>
                    <div style={styles.card}>
                        <h3>Pending Bookings</h3>
                        <p style={styles.number}>3</p>
                    </div>
                </div>

                <div style={styles.section}>
                    <h3>Recent Activity</h3>
                    <p style={{color: '#666'}}>No recent activity found.</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ddd' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    card: { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center' },
    number: { fontSize: '24px', fontWeight: 'bold', color: '#007BFF', marginTop: '10px' },
    section: { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }
};

export default Dashboard;