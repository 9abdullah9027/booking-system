import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [showForm, setShowForm] = useState(false);
    
    // Form States
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [type, setType] = useState('Hotel');

    const API_URL = "http://localhost/booking-system/backend/properties.php";
    const token = localStorage.getItem('token');

    // Configure Headers with Token
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await axios.get(API_URL, config);
            setProperties(response.data);
        } catch (error) {
            console.error("Error fetching data", error);
            // If token expired, could redirect to login here
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_URL, { name, address, type }, config);
            setShowForm(false);
            setName('');
            setAddress('');
            fetchProperties(); // Refresh list
        } catch (error) {
            alert("Error adding property");
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Are you sure? This deletes all associated units/bookings!")) {
            try {
                await axios.delete(`${API_URL}?id=${id}`, config);
                fetchProperties();
            } catch (error) {
                alert("Failed to delete");
            }
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', width: '100%', padding: '20px' }}>
                <header style={styles.header}>
                    <h2>Properties</h2>
                    <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add New Property'}
                    </button>
                </header>

                {/* Simple Form for Adding */}
                {showForm && (
                    <div style={styles.formContainer}>
                        <form onSubmit={handleAdd}>
                            <input placeholder="Property Name (e.g. Ocean View Hotel)" value={name} onChange={e=>setName(e.target.value)} required style={styles.input}/>
                            <input placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} required style={styles.input}/>
                            <select value={type} onChange={e=>setType(e.target.value)} style={styles.input}>
                                <option value="Hotel">Hotel</option>
                                <option value="Apartment">Apartment</option>
                                <option value="Villa">Villa</option>
                            </select>
                            <button type="submit" style={styles.btnSubmit}>Save Property</button>
                        </form>
                    </div>
                )}

                {/* List */}
                <div style={styles.grid}>
                    {properties.map(prop => (
                        <div key={prop.id} style={styles.card}>
                            <h3>{prop.name}</h3>
                            <p style={{color:'#666'}}>{prop.address}</p>
                            <span style={styles.badge}>{prop.type}</span>
                            <div style={styles.actions}>
                                <button style={styles.btnDelete} onClick={() => handleDelete(prop.id)}>Delete</button>
                                {/* We will add Edit/View Units buttons later */}
                            </div>
                        </div>
                    ))}
                    {properties.length === 0 && <p>No properties found.</p>}
                </div>
            </div>
        </div>
    );
};

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
    btnPrimary: { background: '#007BFF', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' },
    formContainer: { background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' },
    input: { padding: '8px', marginRight: '10px', width: '250px', border:'1px solid #ccc', borderRadius:'4px' },
    btnSubmit: { background: '#28a745', color: 'white', border:'none', padding:'8px 15px', borderRadius:'4px', cursor:'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    card: { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', position: 'relative' },
    badge: { background: '#e1ecf4', color: '#00529B', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', display: 'inline-block', marginTop: '10px' },
    actions: { marginTop: '15px', display: 'flex', gap: '10px' },
    btnDelete: { background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '5px 10px', borderRadius: '4px', cursor:'pointer' }
};

export default Properties;