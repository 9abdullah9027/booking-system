import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const userRole = localStorage.getItem('user_role')?.replace('_', ' ').toUpperCase();
    const [stats, setStats] = useState({
        check_ins_today: 0,
        check_outs_today: 0,
        active_bookings: 0, // Currently Checked In
        total_revenue: "0.00",
        rooms_total: 0,
        rooms_dirty: 0,
        rooms_maint: 0
    });
    
    // Extra state for "Recent Bookings" List
    const [recent, setRecent] = useState([]);

    const API_BASE = "http://localhost/booking-system/backend/";
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchStats();
        fetchRecentBookings();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get(API_BASE + 'dashboard.php', config);
            setStats(res.data);
        } catch (e) { console.error("Stats Error:", e); }
    };

    const fetchRecentBookings = async () => {
        try {
            // Reusing existing bookings endpoint, but we will slice it in UI
            const res = await axios.get(API_BASE + 'bookings.php', config);
            if(Array.isArray(res.data)) {
                // Get top 5 recent
                setRecent(res.data.slice(0, 5));
            }
        } catch(e) { console.error(e); }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', width: '100%', padding: '20px' }}>
                <header style={styles.header}>
                    <div>
                        <h2>Dashboard</h2>
                        <span style={{color: '#777'}}>Overview for {new Date().toLocaleDateString()}</span>
                    </div>
                    <span style={styles.badge}>{userRole}</span>
                </header>

                {/* --- STATS GRID --- */}
                <div style={styles.statsGrid}>
                    <div style={{...styles.card, borderLeft: '4px solid #007bff'}}>
                        <h3>Check-Ins Today</h3>
                        <p style={{...styles.number, color: '#007bff'}}>{stats.check_ins_today}</p>
                    </div>
                    <div style={{...styles.card, borderLeft: '4px solid #6c757d'}}>
                        <h3>Check-Outs Today</h3>
                        <p style={{...styles.number, color: '#6c757d'}}>{stats.check_outs_today}</p>
                    </div>
                    <div style={{...styles.card, borderLeft: '4px solid #28a745'}}>
                        <h3>Current Guests</h3>
                        <p style={{...styles.number, color: '#28a745'}}>{stats.active_bookings}</p>
                    </div>
                    <div style={{...styles.card, borderLeft: '4px solid #fd7e14'}}>
                        <h3>Revenue (Month)</h3>
                        <p style={{...styles.number, color: '#fd7e14'}}>${stats.total_revenue}</p>
                    </div>
                </div>

                {/* --- ROOM STATUS SUMMARY --- */}
                <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                    <div style={{flex: 1, ...styles.card, padding:'15px', flexDirection:'row', justifyContent:'space-around'}}>
                         <div style={{textAlign:'center'}}>
                            <h4 style={{margin:0}}>Total Rooms</h4>
                            <span style={{fontSize:'20px', fontWeight:'bold'}}>{stats.rooms_total}</span>
                         </div>
                         <div style={{borderLeft:'1px solid #ddd'}}></div>
                         <div style={{textAlign:'center'}}>
                            <h4 style={{margin:0, color: '#dc3545'}}>Dirty</h4>
                            <span style={{fontSize:'20px', fontWeight:'bold', color: '#dc3545'}}>{stats.rooms_dirty}</span>
                         </div>
                         <div style={{borderLeft:'1px solid #ddd'}}></div>
                         <div style={{textAlign:'center'}}>
                            <h4 style={{margin:0, color: '#e0a800'}}>Maint.</h4>
                            <span style={{fontSize:'20px', fontWeight:'bold', color: '#e0a800'}}>{stats.rooms_maint}</span>
                         </div>
                    </div>
                </div>

              
                <div style={styles.section}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                        <h3>Recent Bookings</h3>
                        <Link to="/bookings" style={{textDecoration:'none', color:'#007bff', fontSize:'14px'}}>View All →</Link>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize:'14px' }}>
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th style={styles.th}>Guest</th>
                                <th style={styles.th}>Unit</th>
                                <th style={styles.th}>In / Out</th>
                                <th style={styles.th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.map(b => (
                                <tr key={b.id} style={{borderBottom: '1px solid #eee'}}>
                                    <td style={styles.td}>{b.guest_name}</td>
                                    <td style={styles.td}>{b.unit_name}</td>
                                    <td style={styles.td}>{b.check_in_date.substring(5)} / {b.check_out_date.substring(5)}</td>
                                    <td style={styles.td}>{b.status}</td>
                                </tr>
                            ))}
                            {recent.length === 0 && <tr><td colSpan="4" style={styles.td}>No activity.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '10px', borderBottom: '1px solid #eee' },
    badge: { background: '#343a40', color: 'white', padding: '5px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    card: { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column' },
    number: { fontSize: '28px', fontWeight: 'bold', marginTop: '10px', marginBottom: 0 },
    section: { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    th: { textAlign: 'left', padding: '10px', color:'#666', borderBottom:'1px solid #ddd' },
    td: { padding: '10px' }
};

export default Dashboard;