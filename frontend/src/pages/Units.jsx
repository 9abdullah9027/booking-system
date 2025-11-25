import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const Units = () => {
    const [units, setUnits] = useState([]);
    const [properties, setProperties] = useState([]); // Needed for the dropdown
    const [showForm, setShowForm] = useState(false);
    
    // Form Inputs
    const [propertyId, setPropertyId] = useState('');
    const [unitName, setUnitName] = useState('');
    const [price, setPrice] = useState('');

    const token = localStorage.getItem('token');
    const API_BASE = "http://localhost/booking-system/backend/";
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchUnits();
        fetchProperties();
    }, []);

    const fetchUnits = async () => {
        const res = await axios.get(API_BASE + 'units.php', config);
        setUnits(res.data);
    };

    const fetchProperties = async () => {
        // We reuse the existing Properties API to fill our dropdown
        const res = await axios.get(API_BASE + 'properties.php', config);
        setProperties(res.data);
        if (res.data.length > 0) setPropertyId(res.data[0].id); // Select first by default
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_BASE + 'units.php', {
                property_id: propertyId,
                unit_name: unitName,
                base_price: price
            }, config);
            setShowForm(false);
            setUnitName('');
            setPrice('');
            fetchUnits();
        } catch (error) {
            alert("Error adding unit");
        }
    };

    const handleDelete = async (id) => {
        if(confirm("Delete this unit?")) {
            await axios.delete(API_BASE + `units.php?id=${id}`, config);
            fetchUnits();
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', width: '100%', padding: '20px' }}>
                <header style={styles.header}>
                    <h2>Units (Rooms)</h2>
                    <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Unit'}
                    </button>
                </header>

                {showForm && (
                    <div style={styles.formContainer}>
                        <form onSubmit={handleAdd} style={{display:'flex', gap:'10px', alignItems:'flex-end'}}>
                            <div>
                                <label style={{fontSize:'12px'}}>Property</label><br/>
                                <select value={propertyId} onChange={e => setPropertyId(e.target.value)} style={styles.input}>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{fontSize:'12px'}}>Unit Name (e.g. 104)</label><br/>
                                <input value={unitName} onChange={e => setUnitName(e.target.value)} style={styles.input} required />
                            </div>
                            <div>
                                <label style={{fontSize:'12px'}}>Base Price ($)</label><br/>
                                <input type="number" value={price} onChange={e => setPrice(e.target.value)} style={styles.input} required />
                            </div>
                            <button type="submit" style={styles.btnSubmit}>Save</button>
                        </form>
                    </div>
                )}

                {/* Units Table */}
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Unit Name</th>
                            <th style={styles.th}>Property</th>
                            <th style={styles.th}>Base Price</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {units.map(u => (
                            <tr key={u.id}>
                                <td style={styles.td}>{u.unit_name}</td>
                                <td style={styles.td}>{u.property_name}</td>
                                <td style={styles.td}>${u.base_price}</td>
                                <td style={styles.td}>
                                    <span style={{...styles.badge, background: u.status === 'clean' ? '#d4edda' : '#f8d7da', color: u.status==='clean'?'#155724':'#721c24'}}>
                                        {u.status}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button style={styles.btnDelete} onClick={() => handleDelete(u.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    btnPrimary: { background: '#007BFF', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' },
    formContainer: { background: '#eee', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
    input: { padding: '8px', width: '200px', border:'1px solid #ccc', borderRadius:'4px' },
    btnSubmit: { background: '#28a745', color:'white', border:'none', padding:'8px 15px', height:'35px', borderRadius:'4px', cursor:'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow:'hidden', boxShadow:'0 2px 5px rgba(0,0,0,0.1)' },
    th: { textAlign: 'left', padding: '12px', background: '#f4f4f4', borderBottom: '1px solid #ddd' },
    td: { padding: '12px', borderBottom: '1px solid #eee' },
    badge: { padding: '4px 8px', borderRadius: '12px', fontSize: '12px', textTransform: 'uppercase' },
    btnDelete: { background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor:'pointer' }
};

export default Units;