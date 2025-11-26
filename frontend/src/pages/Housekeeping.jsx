import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const Housekeeping = () => {
    const [units, setUnits] = useState([]);
    
    const API_BASE = "http://localhost/booking-system/backend/";
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            const res = await axios.get(API_BASE + 'units.php', config);
            if(Array.isArray(res.data)) {
                setUnits(res.data);
            }
        } catch (error) { console.error(error); }
    };

    const updateStatus = async (id, currentStatus) => {
        // Logic: Toggle Clean <-> Dirty, or Reset Maintenance
        let newStatus = 'clean';
        if(currentStatus === 'clean') newStatus = 'dirty';
        
        // If it was maintenance, confirm before marking clean
        if(currentStatus === 'maintenance' && !confirm("Mark repair as finished and room as Clean?")) return;

        try {
            await axios.put(API_BASE + 'units.php', {
                id: id,
                status: newStatus
            }, config);
            fetchUnits(); // Refresh UI
        } catch (error) {
            alert("Failed to update status");
        }
    };

    // Maintenance needs a specific separate action
    const setMaintenance = async (id) => {
        if(!confirm("Block this room for Maintenance?")) return;
        try {
            await axios.put(API_BASE + 'units.php', { id: id, status: 'maintenance' }, config);
            fetchUnits();
        } catch(e) { alert("Error"); }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'clean': return '#28a745'; // Green
            case 'dirty': return '#dc3545'; // Red
            case 'needs_cleaning': return '#ffc107'; // Yellow
            case 'maintenance': return '#6c757d'; // Grey
            default: return '#007bff';
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', width: '100%', padding: '20px' }}>
                <header style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom:'10px' }}>
                    <h2>Housekeeping</h2>
                </header>

                <div style={styles.grid}>
                    {units.map(u => (
                        <div key={u.id} style={{...styles.card, borderTop: `5px solid ${getStatusColor(u.status)}`}}>
                            <div style={styles.cardHeader}>
                                <h3>{u.unit_name}</h3>
                                <span style={{fontSize: '12px', color: '#666'}}>{u.property_name}</span>
                            </div>

                            <div style={styles.statusDisplay}>
                                <span style={{fontSize:'12px', textTransform:'uppercase'}}>Current Status:</span>
                                <h4 style={{color: getStatusColor(u.status), margin:'5px 0'}}>{u.status.replace('_', ' ')}</h4>
                            </div>

                            <div style={styles.actions}>
                                {/* Toggle Button */}
                                <button 
                                    onClick={() => updateStatus(u.id, u.status)}
                                    style={u.status === 'clean' ? styles.btnDirty : styles.btnClean}
                                >
                                    {u.status === 'clean' ? 'Mark Dirty' : 'Mark Clean'}
                                </button>

                                {/* Maintenance Link */}
                                {u.status !== 'maintenance' && (
                                    <button onClick={() => setMaintenance(u.id)} style={styles.btnMaint}>
                                        🛠 Maintenance
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {units.length === 0 && <p>No units found. Add units in Properties page first.</p>}
                </div>
            </div>
        </div>
    );
};

const styles = {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
    card: { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display:'flex', flexDirection:'column', justifyContent:'space-between', height:'220px' },
    cardHeader: { textAlign: 'center', marginBottom: '10px' },
    statusDisplay: { textAlign: 'center', background: '#f8f9fa', padding: '10px', borderRadius: '5px' },
    actions: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' },
    
    // Dynamic Buttons
    btnClean: { padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    btnDirty: { padding: '10px', background: '#e0a800', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    btnMaint: { padding: '5px', background: 'transparent', color: '#666', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontSize:'12px' }
};

export default Housekeeping;