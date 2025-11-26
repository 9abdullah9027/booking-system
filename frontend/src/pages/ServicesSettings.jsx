import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Layout from '../components/Layout'; // Using your Layout wrapper
import axios from 'axios';
import { Trash2, Plus } from 'lucide-react';

const Settings = () => {
    // Services State
    const [services, setServices] = useState([]);
    const [sName, setSName] = useState('');
    const [sPrice, setSPrice] = useState('');

    // Seasons State
    const [seasons, setSeasons] = useState([]);
    const [seasName, setSeasName] = useState('');
    const [seasStart, setSeasStart] = useState('');
    const [seasEnd, setSeasEnd] = useState('');
    const [seasMulti, setSeasMulti] = useState('1.5');

    const API = "http://localhost/booking-system/backend/";
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

    useEffect(() => { loadAll(); }, []);

    const loadAll = () => {
        axios.get(API + 'services.php', config).then(r => setServices(r.data));
        axios.get(API + 'seasons.php', config).then(r => setSeasons(r.data));
    }

    const addService = async (e) => {
        e.preventDefault();
        await axios.post(API + 'services.php', { name: sName, price: sPrice }, config);
        setSName(''); setSPrice(''); loadAll();
    }

    const addSeason = async (e) => {
        e.preventDefault();
        await axios.post(API + 'seasons.php', { 
            name: seasName, start_date: seasStart, end_date: seasEnd, multiplier: seasMulti 
        }, config);
        setSeasName(''); setSeasStart(''); setSeasEnd(''); loadAll();
    }

    const deleteItem = async (endpoint, id) => {
        if(confirm("Delete?")) {
            await axios.delete(API + endpoint + `?id=${id}`, config);
            loadAll();
        }
    }

    return (
        <Layout title="System Settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* --- 1. SERVICES --- */}
                <div className="bg-white p-6 rounded-xl shadow-card">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Add-on Services</h3>
                    <form onSubmit={addService} className="flex gap-2 mb-4">
                        <input className="border p-2 rounded w-full" placeholder="Name" value={sName} onChange={e=>setSName(e.target.value)} required />
                        <input className="border p-2 rounded w-24" type="number" placeholder="$" value={sPrice} onChange={e=>setSPrice(e.target.value)} required />
                        <button className="bg-primary text-white p-2 rounded"><Plus/></button>
                    </form>
                    <ul className="space-y-2">
                        {services.map(s => (
                            <li key={s.id} className="flex justify-between p-3 bg-gray-50 rounded border">
                                <span>{s.name}</span>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold">${parseFloat(s.price).toFixed(2)}</span>
                                    <button onClick={()=>deleteItem('services.php', s.id)} className="text-red-500"><Trash2 size={16}/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* --- 2. SEASONAL PRICING --- */}
                <div className="bg-white p-6 rounded-xl shadow-card">
                    <h3 className="font-bold text-lg mb-1 text-gray-800">Seasonal Pricing Rules</h3>
                    <p className="text-xs text-gray-500 mb-4">Multiplies room base price during these dates.</p>
                    
                    <form onSubmit={addSeason} className="grid grid-cols-2 gap-2 mb-4">
                        <input className="border p-2 rounded col-span-2" placeholder="Season Name (e.g. Christmas)" value={seasName} onChange={e=>setSeasName(e.target.value)} required />
                        <div className="col-span-2 flex gap-2">
                            <input type="date" className="border p-2 rounded w-full" value={seasStart} onChange={e=>setSeasStart(e.target.value)} required />
                            <span className="self-center">-</span>
                            <input type="date" className="border p-2 rounded w-full" value={seasEnd} onChange={e=>setSeasEnd(e.target.value)} required />
                        </div>
                        <div className="col-span-2 flex gap-2 items-center">
                            <label className="text-sm font-bold">Multiplier:</label>
                            <input type="number" step="0.1" className="border p-2 rounded w-20" value={seasMulti} onChange={e=>setSeasMulti(e.target.value)} required />
                            <span className="text-xs text-gray-400">(e.g. 1.5 = +50%)</span>
                            <button className="bg-primary text-white p-2 rounded ml-auto flex items-center gap-1"><Plus size={16}/> Add Rule</button>
                        </div>
                    </form>

                    <ul className="space-y-2">
                        {seasons.map(s => (
                            <li key={s.id} className="flex justify-between p-3 bg-orange-50 rounded border border-orange-100">
                                <div>
                                    <div className="font-bold text-orange-800">{s.name} (x{s.multiplier})</div>
                                    <div className="text-xs text-orange-600">{s.start_date} to {s.end_date}</div>
                                </div>
                                <button onClick={()=>deleteItem('seasons.php', s.id)} className="text-red-500"><Trash2 size={16}/></button>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </Layout>
    );
};

export default Settings;