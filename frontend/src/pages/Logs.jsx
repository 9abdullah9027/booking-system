import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const API_BASE = "http://localhost/booking-system/backend/";
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get(API_BASE + 'logs.php', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLogs(res.data);
            } catch (e) { console.error(e); }
        };
        fetchLogs();
    }, []);

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', width: '100%', padding: '20px' }}>
                <header style={{marginBottom:'20px'}}>
                    <h2>Audit Logs</h2>
                    <p style={{color:'#666'}}>Tracking last 200 actions.</p>
                </header>

                <table style={{width:'100%', borderCollapse:'collapse', background:'white', fontSize:'13px'}}>
                    <thead style={{background:'#343a40', color:'white'}}>
                        <tr>
                            <th style={th}>Time</th>
                            <th style={th}>User</th>
                            <th style={th}>Action</th>
                            <th style={th}>Details</th>
                            <th style={th}>IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} style={{borderBottom:'1px solid #eee'}}>
                                <td style={td}>{log.created_at}</td>
                                <td style={td}><b>{log.user_name}</b></td>
                                <td style={td}>
                                    <span style={{...badge, background: getActionColor(log.action)}}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={td}>{log.details}</td>
                                <td style={td}><small>{log.ip_address}</small></td>
                            </tr>
                        ))}
                        {logs.length === 0 && <tr><td colSpan="5" style={td}>No logs found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const getActionColor = (action) => {
    if(action.includes('DELETE')) return '#dc3545';
    if(action.includes('CREATE')) return '#28a745';
    if(action.includes('EDIT')) return '#007bff';
    if(action.includes('STATUS')) return '#ffc107';
    return '#6c757d';
};

const th = { padding:'10px', textAlign:'left' };
const td = { padding:'10px' };
const badge = { color:'white', padding:'3px 6px', borderRadius:'3px', fontSize:'11px' };

export default Logs;