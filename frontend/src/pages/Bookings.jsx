import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const Bookings = () => {
    // Data States
    const [bookings, setBookings] = useState([]);
    const [displayBookings, setDisplayBookings] = useState([]); 
    const [units, setUnits] = useState([]);
    
    // UI States
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form
    const [unitId, setUnitId] = useState('');
    const [guestName, setGuestName] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [amount, setAmount] = useState(0);

    const API_BASE = "http://localhost/booking-system/backend/";
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchBookings();
        fetchUnits();
    }, []);

    // ---------------------------------------
    // FILTER LOGIC (Tab + Search)
    // ---------------------------------------
    useEffect(() => {
        let results = bookings;

        // 1. Filter by Tab
        if(activeTab === 'active') {
            results = results.filter(b => ['confirmed', 'checked_in', 'pending'].includes(b.status));
        } else {
            // History Tab
            results = results.filter(b => ['checked_out', 'cancelled'].includes(b.status));
        }

        // 2. Filter by Search
        if(searchTerm) {
            const lower = searchTerm.toLowerCase();
            results = results.filter(b => 
                b.guest_name.toLowerCase().includes(lower) || 
                b.booking_reference.toLowerCase().includes(lower)
            );
        }

        setDisplayBookings(results);

    }, [bookings, activeTab, searchTerm]);

    // ---------------------------------------
    // PRICE CALCULATION
    // ---------------------------------------
    useEffect(() => {
        if(checkIn && checkOut && unitId) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if(days > 0) {
                const u = units.find(unit => unit.id == unitId); 
                if(u) setAmount(days * parseFloat(u.base_price));
            } else { setAmount(0); }
        }
    }, [checkIn, checkOut, unitId]);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(API_BASE + 'bookings.php', config);
            if(Array.isArray(res.data)) setBookings(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchUnits = async () => {
        try {
            const res = await axios.get(API_BASE + 'units.php', config);
            if(Array.isArray(res.data)) {
                setUnits(res.data);
                if (res.data.length > 0) setUnitId(res.data[0].id);
            }
        } catch (e) { console.error(e); }
    };

    // ---------------------------------------
    // ACTIONS
    // ---------------------------------------
    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_BASE + 'bookings.php', {
                unit_id: unitId, guest_name: guestName, check_in: checkIn, check_out: checkOut, total_amount: amount
            }, config);
            alert("Success!");
            setShowForm(false);
            setGuestName(''); setCheckIn(''); setCheckOut(''); setAmount(0);
            fetchBookings();
        } catch (error) {
            if (error.response?.data?.message) {
                alert(error.response.data.message); // Displays Maintenance/Dirty error
            } else {
                alert("Failed to book.");
            }
        }
    };

    const updateStatus = async (id, status) => {
        if(!confirm(`Mark as ${status}?`)) return;
        try {
            await axios.put(API_BASE + 'bookings.php', { id, status }, config);
            fetchBookings();
        } catch(e) { alert("Error"); }
    };

    const handleDelete = async (id) => {
        if(!confirm("Permanently delete this record from history?")) return;
        try {
            await axios.delete(API_BASE + `bookings.php?id=${id}`, config);
            fetchBookings();
        } catch(e) { alert("Delete failed"); }
    };

    // ---------------------------------------
    // STYLES & UI
    // ---------------------------------------
    const getBadge = (status) => {
        const colors = {
            confirmed: '#28a745', // Green
            checked_in: '#007bff', // Blue
            cancelled: '#dc3545', // Red
            checked_out: '#6c757d' // Grey
        };
        return { background: colors[status] || '#f8d7da', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase' };
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', width: '100%', padding: '20px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <h2>Reservations</h2>
                        <input style={{padding: '8px', width: '250px'}} placeholder="Search..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                    </div>
                    <button style={{padding: '10px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}} onClick={()=>setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Booking'}
                    </button>
                </header>

                {/* --- TAB SYSTEM --- */}
                <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '15px' }}>
                    <button 
                        onClick={() => setActiveTab('active')} 
                        style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'active' ? '3px solid #007BFF' : 'none', fontWeight: 'bold', cursor:'pointer', color: activeTab==='active'?'#007BFF':'#666' }}>
                        Active & Upcoming
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')} 
                        style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'history' ? '3px solid #007BFF' : 'none', fontWeight: 'bold', cursor:'pointer', color: activeTab==='history'?'#007BFF':'#666' }}>
                        History / Cancelled
                    </button>
                </div>
                {/* ------------------- */}

                {showForm && (
                    <div style={{background: '#eee', padding: '20px', marginBottom: '20px'}}>
                        <form onSubmit={handleBooking} style={{display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'flex-end'}}>
                            <div><label>Name</label><br/><input value={guestName} onChange={e=>setGuestName(e.target.value)} required /></div>
                            <div><label>Unit</label><br/>
                                <select value={unitId} onChange={e=>setUnitId(e.target.value)} style={{height:'35px', width:'200px'}}>
                                    {units.map(u=><option key={u.id} value={u.id}>{u.property_name} - {u.unit_name} (${u.base_price})</option>)}
                                </select>
                            </div>
                            <div><label>In</label><br/><input type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)} required /></div>
                            <div><label>Out</label><br/><input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)} required /></div>
                            <div><label>Total $</label><br/><input value={amount} readOnly style={{width:'80px', background:'#ddd'}} /></div>
                            <button type="submit" style={{height:'35px', background:'#28a745', color:'white', border:'none', cursor:'pointer'}}>Confirm</button>
                        </form>
                    </div>
                )}

                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                    <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                            <th style={{padding:'10px', textAlign:'left'}}>Ref</th>
                            <th style={{padding:'10px', textAlign:'left'}}>Guest</th>
                            <th style={{padding:'10px', textAlign:'left'}}>Dates</th>
                            <th style={{padding:'10px', textAlign:'left'}}>Status</th>
                            <th style={{padding:'10px', textAlign:'left'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayBookings.length > 0 ? (
                            displayBookings.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{padding:'10px'}}>#{b.booking_reference}</td>
                                    <td style={{padding:'10px'}}>
                                        <b>{b.guest_name}</b><br/>
                                        <small style={{color:'#666'}}>{b.unit_name}</small>
                                    </td>
                                    <td style={{padding:'10px'}}>
                                        <small>{b.check_in_date} to {b.check_out_date}</small>
                                    </td>
                                    <td style={{padding:'10px'}}>
                                        <span style={getBadge(b.status)}>{b.status.replace('_', ' ')}</span>
                                    </td>
                                    <td style={{padding:'10px'}}>
                                        <div style={{display:'flex', gap:'5px'}}>
                                            {/* ACTIVE TAB ACTIONS */}
                                            {b.status === 'confirmed' && (
                                                <>
                                                    <button onClick={() => updateStatus(b.id, 'checked_in')} style={btnBlue}>Check In</button>
                                                    <button onClick={() => updateStatus(b.id, 'cancelled')} style={btnRed}>Cancel</button>
                                                </>
                                            )}
                                            {b.status === 'checked_in' && (
                                                <button onClick={() => updateStatus(b.id, 'checked_out')} style={btnGrey}>Check Out</button>
                                            )}
                                            
                                            {/* HISTORY TAB ACTIONS */}
                                            {['checked_out', 'cancelled'].includes(b.status) && (
                                                <button onClick={() => handleDelete(b.id)} style={{...btnRed, background: '#a71d2a'}}>Delete</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{padding:'20px', textAlign:'center', color:'#888'}}>No bookings found in {activeTab}.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const btnBlue = { padding: '5px 10px', fontSize: '11px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' };
const btnRed = { padding: '5px 10px', fontSize: '11px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' };
const btnGrey = { padding: '5px 10px', fontSize: '11px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' };

export default Bookings;