import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Building2, MapPin, Plus, Edit, Trash2, X, Home, Building } from 'lucide-react';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // Form State
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [type, setType] = useState('Hotel');

    const API = "http://localhost/booking-system/backend/";
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => { fetchProperties(); }, []);

    const fetchProperties = async () => {
        try {
            const res = await axios.get(API + 'properties.php', config);
            setProperties(res.data);
        } catch(e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { name, address, type, id: editId };
        const method = editMode ? 'put' : 'post';

        try {
            await axios[method](API + 'properties.php', payload, config);
            setShowModal(false);
            fetchProperties();
            alert(editMode ? "Property Updated!" : "Property Created!");
        } catch(err) { alert("Error saving property"); }
    };

    const handleDelete = async (id) => {
        if(confirm("Are you sure? This will DELETE ALL ROOMS inside this property!")) {
            try {
                await axios.delete(API + `properties.php?id=${id}`, config);
                fetchProperties();
            } catch(e) { alert("Delete failed"); }
        }
    };

    const openCreate = () => {
        setEditMode(false); setEditId(null);
        setName(''); setAddress(''); setType('Hotel');
        setShowModal(true);
    };

    const openEdit = (p) => {
        setEditMode(true); setEditId(p.id);
        setName(p.name); setAddress(p.address); setType(p.type);
        setShowModal(true);
    };

    return (
        <Layout title="Properties Management">
            <div className="flex justify-end mb-6">
                <button onClick={openCreate} className="bg-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all font-medium">
                    <Plus size={20} /> Add Property
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                {p.type === 'Hotel' ? <Building2 size={24} /> : <Home size={24} />}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={()=>openEdit(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                    <Edit size={18} />
                                </button>
                                <button onClick={()=>handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{p.name}</h3>
                        
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                            <MapPin size={16} className="mr-1" />
                            {p.address}
                        </div>

                        <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-full tracking-wide">
                            {p.type}
                        </div>
                    </div>
                ))}
                
                {properties.length === 0 && (
                    <div className="col-span-3 text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                        <Building size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No properties found. Add your first building!</p>
                    </div>
                )}
            </div>

            {/* === MODAL === */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">{editMode ? 'Edit Property' : 'New Property'}</h3>
                            <button onClick={()=>setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                                <input 
                                    required 
                                    value={name} 
                                    onChange={e=>setName(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                    placeholder="e.g. Grand Plaza Hotel"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input 
                                    required 
                                    value={address} 
                                    onChange={e=>setAddress(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                    placeholder="e.g. 123 Ocean Drive, Miami"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select 
                                    value={type} 
                                    onChange={e=>setType(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                                >
                                    <option value="Hotel">Hotel</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Villa">Villa</option>
                                    <option value="Resort">Resort</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium shadow-lg shadow-blue-200 transition">
                                    {editMode ? 'Save Changes' : 'Create Property'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Properties;