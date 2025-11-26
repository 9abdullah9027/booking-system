import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Search, Plus, Trash2, Edit, Eye, User, Phone, Mail, CreditCard } from 'lucide-react';

const Guests = () => {
    const [guests, setGuests] = useState([]);
    const [filteredGuests, setFilteredGuests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // Form
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const API = "http://localhost/booking-system/backend/";
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    useEffect(() => { fetchGuests(); }, []);
    
    useEffect(() => {
        const results = guests.filter(g => 
            g.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            g.phone.includes(searchTerm) ||
            g.id_number.toLowerCase().includes(searchTerm)
        );
        setFilteredGuests(results);
    }, [searchTerm, guests]);

    const fetchGuests = async () => {
        try {
            const res = await axios.get(API + 'guests.php', config);
            if(Array.isArray(res.data)) {
                setGuests(res.data);
                setFilteredGuests(res.data);
            }
        } catch(e) {}
    };

    const openCreate = () => {
        setEditId(null); setFullName(''); setEmail(''); setPhone(''); setIdNumber(''); setSelectedFile(null);
        setShowModal(true);
    };

    const openEdit = (g) => {
        setEditId(g.id); setFullName(g.full_name); setEmail(g.email); setPhone(g.phone); setIdNumber(g.id_number); setSelectedFile(null);
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('full_name', fullName);
        fd.append('email', email);
        fd.append('phone', phone);
        fd.append('id_number', idNumber);
        if(selectedFile) fd.append('id_card', selectedFile);
        if(editId) fd.append('id', editId);

        try {
            await axios.post(API + 'guests.php', fd, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setShowModal(false); fetchGuests(); alert("Saved Successfully!");
        } catch (error) { alert("Failed to save."); }
    };

    const handleDelete = async (id) => {
        if(confirm("Delete guest profile?")) {
            await axios.delete(API + `guests.php?id=${id}`, config);
            fetchGuests();
        }
    };

    return (
        <Layout title="Guest CRM">
            {/* Header Controls */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by Name, Phone or ID..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white shadow-sm"
                    />
                </div>
                <button onClick={openCreate} className="bg-primary hover:bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-medium">
                    <Plus size={20} /> Add Guest
                </button>
            </div>

            {/* Grid / List View */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Guest Profile</th>
                            <th className="px-6 py-4">Contact Info</th>
                            <th className="px-6 py-4">Identity Doc</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredGuests.map(g => (
                            <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold">
                                            {g.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">{g.full_name}</div>
                                            <div className="text-xs text-gray-400">ID: {g.id || 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-gray-600">
                                        <div className="flex items-center gap-2"><Phone size={14}/> {g.phone || '-'}</div>
                                        <div className="flex items-center gap-2"><Mail size={14}/> {g.email || '-'}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {g.id_number && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <CreditCard size={14} className="text-gray-400"/> 
                                            <span className="font-medium text-gray-700">{g.id_number}</span>
                                        </div>
                                    )}
                                    {g.id_card_image ? (
                                        <a href={API+'uploads/ids/'+g.id_card_image} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                            <Eye size={12}/> View Document
                                        </a>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">No scan uploaded</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={()=>openEdit(g)} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={()=>handleDelete(g.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredGuests.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-400">No guests found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">{editId ? 'Edit Profile' : 'New Guest'}</h3>
                            <button onClick={()=>setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input required value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                    <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Passport / ID Number</label>
                                <input value={idNumber} onChange={e=>setIdNumber(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Document (Image/PDF)</label>
                                <input type="file" onChange={e=>setSelectedFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*,application/pdf" />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={()=>setShowModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-blue-600 shadow-lg shadow-blue-200 transition">Save Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Guests;