import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [units, setUnits] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [unitId, setUnitId] = useState('');
    const [guestName, setGuestName] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    
    // Default to 0, will be auto-calculated
    const [amount, setAmount] = useState(0);

    const API_BASE = "http://localhost/booking-system/backend/";
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchBookings();
        fetchUnits();
    }, []);

    // ---------------------------------------------
    // NEW: Auto-Calculate Price whenever data changes
    // ---------------------------------------------
    useEffect(() => {
        calculateTotal();
    }, [checkIn, checkOut, unitId]);

    const calculateTotal = () => {
        // Only calculate if we have dates and a unit selected
        if(checkIn && checkOut && unitId) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);

            // Calculate difference in milliseconds
            const diffTime = end - start;
            // Convert to days (1000ms * 60s * 60m * 24h)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if(diffDays > 0) {
                // Find the base price of the selected unit
                // Note: We use loose equality (==) because value is string, id is int
                const selectedUnit = units.find(u => u.id == unitId);
                
                if(selectedUnit) {
                    const pricePerNight = parseFloat(selectedUnit.base_price);
                    setAmount(diffDays * pricePerNight);
                }
            } else {
                setAmount(0); // Reset if dates are invalid (e.g. check out before check in)
            }
        }
    };
    // ---------------------------------------------

    const fetchBookings = async () => {
        try {
            const res = await axios.get(API_BASE + 'bookings.php', config);
            console.log("FULL API DATA:", res.data); // Look at Console for this!

            if (Array.isArray(res.data)) {
                setBookings(res.data);
            } else {
                console.warn("Backend response is not an array:", res.data);
                setBookings([]);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    const fetchUnits = async () => {
        try {
            const res = await axios.get(API_BASE + 'units.php', config);
            if(Array.isArray(res.data)) {
                setUnits(res.data);
                // Automatically select first unit to prevent empty unitId
                if (res.data.length > 0) {
                    setUnitId(res.data[0].id); 
                }
            }
        } catch (err) {
            console.error("Units error", err);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        
        try {
            await axios.post(API_BASE + 'bookings.php', {
                unit_id: unitId,
                guest_name: guestName,
                check_in: checkIn,
                check_out: checkOut,
                total_amount: amount
            }, config);

            alert("Booking Confirmed! Bill: $" + amount);
            setShowForm(false);
            
            // Clear Form
            setGuestName('');
            setCheckIn('');
            setCheckOut('');
            setAmount(0);

            // Reload Data
            fetchBookings();
            
        } catch (error) {
            if (error.response && error.response.status === 409) {
                alert("Conflict: Dates already booked!");
            } else {
                alert("Failed to book.");
            }
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', width: '100%', padding: '20px' }}>
                <header style={styles.header}>
                    <h2>Reservations</h2>
                    <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Close Form' : '+ New Booking'}
                    </button>
                </header>

                {showForm && (
                    <div style={styles.formContainer}>
                        <h3>New Reservation</h3>
                        <form onSubmit={handleBooking} style={styles.formGrid}>
                            <div style={styles.field}>
                                <label>Guest Name</label>
                                <input required value={guestName} onChange={e=>setGuestName(e.target.value)} style={styles.input}/>
                            </div>
                            
                            <div style={styles.field}>
                                <label>Room / Unit</label>
                                <select value={unitId} onChange={e=>setUnitId(e.target.value)} style={styles.input}>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.property_name} - {u.unit_name} (${u.base_price}/night)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={styles.field}>
                                <label>Check In</label>
                                <input type="date" required value={checkIn} onChange={e=>setCheckIn(e.target.value)} style={styles.input}/>
                            </div>
                            
                            <div style={styles.field}>
                                <label>Check Out</label>
                                <input type="date" required value={checkOut} onChange={e=>setCheckOut(e.target.value)} style={styles.input}/>
                            </div>
                            
                            {/* Amount is now Read-Only or Manual Override allowed */}
                            <div style={styles.field}>
                                <label>Total Amount ($)</label>
                                <input 
                                    type="number" 
                                    value={amount} 
                                    onChange={e=>setAmount(e.target.value)} // Allows manual edit if needed
                                    style={{...styles.input, fontWeight: 'bold', background: '#e9ecef'}} 
                                />
                            </div>
                            
                            <button type="submit" style={styles.btnSubmit}>Confirm Booking</button>
                        </form>
                    </div>
                )}

                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Reference</th>
                            <th style={styles.th}>Guest</th>
                            <th style={styles.th}>Unit</th>
                            <th style={styles.th}>Dates</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(bookings) && bookings.length > 0 ? (
                            bookings.map(b => (
                                <tr key={b.id}>
                                    <td style={styles.td}>#{b.booking_reference}</td>
                                    <td style={styles.td}><b>{b.guest_name}</b></td>
                                    <td style={styles.td}>{b.unit_name} <br/><span style={{fontSize:'10px', color:'#777'}}>{b.property_name}</span></td>
                                    <td style={styles.td}>
                                        <span style={{fontSize:'12px'}}>{b.check_in_date} <br/> to <br/> {b.check_out_date}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.statusConfirmed}>{b.status}</span>
                                    </td>
                                    <td style={styles.td}>${b.total_amount}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{textAlign:'center', padding:'20px', color: '#888'}}>
                                    No bookings found. <br/>
                                
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    btnPrimary: { background: '#007BFF', color: 'white', padding: '10px 20px', border:'none', borderRadius:'5px', cursor:'pointer'},
    formContainer: { background: '#f9f9f9', padding: '20px', borderRadius:'10px', marginBottom:'20px', border:'1px solid #ddd' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', alignItems:'end' },
    field: { display:'flex', flexDirection:'column' },
    input: { padding: '8px', border:'1px solid #ccc', borderRadius:'4px', marginTop:'5px' },
    btnSubmit: { background: '#27ae60', color:'white', border:'none', padding:'10px', borderRadius:'4px', cursor:'pointer', height:'35px', alignSelf:'end'},
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden' },
    th: { background: '#f4f4f4', padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' },
    td: { padding: '12px', borderBottom: '1px solid #eee' },
    statusConfirmed: { background: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase'}
};

export default Bookings;