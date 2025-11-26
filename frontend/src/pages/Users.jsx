import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('booking_manager');

    const API_BASE = "http://localhost/booking-system/backend/";
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // --- HELPER: Extract my ID from the Token ---
    const getCurrentUserId = () => {
        try {
            if (!token) return null;
            // Decode the JWT Payload to find "user_id"
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.user_id;
        } catch (e) {
            return null;
        }
    };
    const currentUserId = getCurrentUserId();
    // ---------------------------------------------

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(API_BASE + 'users.php', config);
            if(Array.isArray(res.data)) {
                setUsers(res.data);
            }
        } catch (error) {
            if(error.response && error.response.status === 403) {
                alert("Access Denied: You must be Super Admin to view this.");
            }
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_BASE + 'users.php', {
                full_name: fullName,
                email: email,
                password: password,
                role: role
            }, config);

            alert("User Created!");
            setShowForm(false);
            setFullName(''); setEmail(''); setPassword('');
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create user");
        }
    };

    const handleDelete = async (id) => {
        // Double check visual protection
        if(id === currentUserId) {
            alert("You cannot delete yourself!");
            return;
        }
        if(id === 1) {
            alert("Root Admin is supreme and cannot be deleted!");
            return;
        }

        if(!window.confirm("Are you sure? This user will lose access immediately.")) return;

        try {
            await axios.delete(API_BASE + `users.php?id=${id}`, config);
            fetchUsers();
        } catch (error) {
            // Displays the specific backend error message
            alert(error.response?.data?.message || "Delete failed");
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', width: '100%', padding: '20px' }}>
                <header style={styles.header}>
                    <h2>User Management</h2>
                    <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add New User'}
                    </button>
                </header>

                {showForm && (
                    <div style={styles.formContainer}>
                        <h3>Create New Staff Account</h3>
                        <form onSubmit={handleAddUser} style={styles.formGrid}>
                            <div style={styles.field}>
                                <label>Full Name</label>
                                <input required value={fullName} onChange={e=>setFullName(e.target.value)} style={styles.input} />
                            </div>
                            <div style={styles.field}>
                                <label>Email Address</label>
                                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} style={styles.input} />
                            </div>
                            <div style={styles.field}>
                                <label>Password</label>
                                <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} style={styles.input} placeholder="******" />
                            </div>
                            <div style={styles.field}>
                                <label>Role</label>
                                <select value={role} onChange={e=>setRole(e.target.value)} style={styles.input}>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="booking_manager">Booking Manager</option>
                                    <option value="checkout_agent">Checkout Agent</option>
                                </select>
                            </div>
                            <button type="submit" style={styles.btnSubmit}>Create Account</button>
                        </form>
                    </div>
                )}

                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => {
                            const isMe = u.id === currentUserId;
                            const isRoot = u.id === 1;

                            return (
                                <tr key={u.id} style={{ background: isMe ? '#f0f8ff' : (isRoot ? '#fffbe6' : 'white')}}>
                                    <td style={styles.td}>{u.id}</td>
                                    <td style={styles.td}>
                                        <b>{u.full_name}</b> 
                                        {isMe && <span style={{fontSize:'10px', color:'#007bff'}}> (You)</span>}
                                        {isRoot && <span style={{fontSize:'10px', color:'#d48806', fontWeight:'bold'}}> (Supreme)</span>}
                                    </td>
                                    <td style={styles.td}>{u.email}</td>
                                    <td style={styles.td}>
                                        <span style={{...styles.badge, 
                                            background: u.role === 'super_admin' ? '#343a40' : (u.role === 'booking_manager' ? '#007bff' : '#17a2b8'),
                                            color: 'white'
                                        }}>
                                            {u.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {/* HIDE button if Is Me OR Is Root */}
                                        {!isMe && !isRoot ? (
                                            <button style={styles.btnDelete} onClick={() => handleDelete(u.id)}>Delete</button>
                                        ) : (
                                            <span style={{color: '#999', fontSize: '11px', fontStyle: 'italic'}}>Protected</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
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
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems:'end' },
    field: { display:'flex', flexDirection:'column' },
    input: { padding: '8px', border:'1px solid #ccc', borderRadius:'4px', marginTop:'5px' },
    btnSubmit: { background: '#27ae60', color:'white', border:'none', padding:'10px', borderRadius:'4px', cursor:'pointer', height:'35px', alignSelf:'end'},
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden' },
    th: { background: '#f4f4f4', padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' },
    td: { padding: '12px', borderBottom: '1px solid #eee' },
    badge: { padding: '5px 10px', borderRadius: '15px', fontSize: '11px', textTransform: 'uppercase', fontWeight:'bold' },
    btnDelete: { padding: '5px 10px', fontSize: '11px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default Users;