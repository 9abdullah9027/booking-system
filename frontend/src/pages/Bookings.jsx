import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { 
    Search, Plus, Filter, X, Check, Printer, CreditCard, 
    User, Calendar, DollarSign, Trash2, Edit, LogIn, LogOut 
} from 'lucide-react';

const Bookings = () => {
    // 1. Core Data
    const [bookings, setBookings] = useState([]);
    const [displayBookings, setDisplayBookings] = useState([]);
    const [units, setUnits] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [seasons, setSeasons] = useState([]);
    
    // 2. Filter/View States
    const [activeTab, setActiveTab] = useState('active');
    const [searchTerm, setSearchTerm] = useState('');

    // 3. Modal Controls
    const [modalType, setModalType] = useState(null); // 'create', 'edit', 'checkin', 'checkout'
    const [selBooking, setSelBooking] = useState(null);
    
    // 4. Form States (Create/Edit)
    const [f_unitId, setF_unitId] = useState('');
    const [f_guest, setF_guest] = useState('');
    const [f_ref, setF_ref] = useState('');
    const [f_in, setF_in] = useState('');
    const [f_out, setF_out] = useState('');
    const [f_total, setF_total] = useState(0);

    // 5. Wizard States
    const [wiz_items, setWiz_items] = useState([]); 
    const [wiz_idFile, setWiz_idFile] = useState(null);
    const [wiz_phone, setWiz_phone] = useState('');
    const [wiz_serviceId, setWiz_serviceId] = useState('');
    const [wiz_paymentStatus, setWiz_paymentStatus] = useState('pending');
    const [wiz_paymentMethod, setWiz_paymentMethod] = useState('cash');

    const API = "http://localhost/booking-system/backend/";
    
    // Helper to get token
    const getConfig = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // --- INITIAL LOAD ---
    useEffect(() => { loadAll(); }, []);
    
    useEffect(() => {
        let list = bookings;
        if(activeTab==='active') list = list.filter(b=>['confirmed','checked_in','pending'].includes(b.status));
        else list = list.filter(b=>['checked_out','cancelled'].includes(b.status));
        
        if(searchTerm) {
            const lower = searchTerm.toLowerCase();
            list = list.filter(b => 
                b.guest_name.toLowerCase().includes(lower) || 
                b.booking_reference.toLowerCase().includes(lower)
            );
        }
        setDisplayBookings(list);
    }, [bookings, activeTab, searchTerm]);

    const loadAll = async () => {
        const cfg = getConfig();
        try {
            const [bRes, uRes, sRes, seaRes] = await Promise.all([
                axios.get(API+'bookings.php', cfg).catch(()=>({data:[]})),
                axios.get(API+'units.php', cfg).catch(()=>({data:[]})),
                axios.get(API+'services.php', cfg).catch(()=>({data:[]})),
                axios.get(API+'seasons.php', cfg).catch(()=>({data:[]}))
            ]);
            setBookings(bRes.data);
            setUnits(uRes.data);
            setAvailableServices(sRes.data);
            setSeasons(seaRes.data);
        } catch(e) { console.error(e); }
    };

    // --- PRICING LOGIC ---
    useEffect(() => {
        if((modalType === 'create' || modalType === 'edit') && f_in && f_out && f_unitId) {
            const u = units.find(unit => unit.id == f_unitId); // loose match
            if(!u) return;

            const basePrice = parseFloat(u.base_price);
            let totalPrice = 0;
            let loopDate = new Date(f_in);
            const endDate = new Date(f_out);

            while(loopDate < endDate) {
                let dailyRate = basePrice;
                const dateStr = loopDate.toISOString().split('T')[0];
                const activeSeason = seasons.find(season => dateStr >= season.start_date && dateStr <= season.end_date);
                
                if(activeSeason) {
                    dailyRate = basePrice * parseFloat(activeSeason.multiplier);
                }
                
                totalPrice += dailyRate;
                loopDate.setDate(loopDate.getDate() + 1);
            }
            setF_total(totalPrice.toFixed(2));
        }
    }, [f_in, f_out, f_unitId, modalType, units, seasons]);

    // --- ACTIONS ---
    const openCreate = () => {
        const defaultUnit = units.length > 0 ? units[0].id : '';
        setF_unitId(defaultUnit); 
        setF_guest(''); setF_ref(''); setF_in(''); setF_out(''); setF_total(0);
        setModalType('create');
    }
    const openEdit = (b) => {
        setSelBooking(b);
        setF_unitId(b.unit_id); setF_guest(b.guest_name); setF_ref(b.booking_reference); 
        setF_in(b.check_in_date); setF_out(b.check_out_date); setF_total(b.total_amount);
        setModalType('edit');
    }
    const openCheckIn = (b) => {
        setSelBooking(b); setWiz_items([]); setWiz_paymentStatus('pending'); setWiz_idFile(null); setWiz_phone('');
        setModalType('checkin');
    }
    const openCheckOut = (b) => {
        setSelBooking(b);
        const loadedAddons = b.addons ? b.addons.map(x => ({ name: x.name, price: parseFloat(x.price) })) : [];
        setWiz_items(loadedAddons);
        setWiz_paymentStatus(b.payment_status);
        setModalType('checkout');
    }

    const saveBooking = async (e) => {
        e.preventDefault();
        const payload = { 
            unit_id: f_unitId, guest_name: f_guest, check_in: f_in, check_out: f_out, total_amount: f_total,
            booking_reference: f_ref, 
            id: modalType === 'edit' ? selBooking.id : null, edit_mode: modalType === 'edit'
        };
        const method = modalType === 'edit' ? 'put' : 'post';
        try {
            await axios[method](API + 'bookings.php', payload, getConfig());
            setModalType(null); loadAll(); alert("Saved!");
        } catch(err) { alert(err.response?.data?.message || "Error saving"); }
    }

    const processCheckIn = async () => {
        const totalExtras = wiz_items.reduce((acc, item) => acc + parseFloat(item.price), 0);
        const fd = new FormData();
        fd.append('booking_id', selBooking.id);
        fd.append('guest_name', selBooking.guest_name);
        fd.append('guest_phone', wiz_phone);
        if(wiz_idFile) fd.append('id_card', wiz_idFile);
        fd.append('invoice_items', JSON.stringify(wiz_items));
        fd.append('services_total', totalExtras);
        fd.append('payment_status', wiz_paymentStatus);
        fd.append('payment_method', wiz_paymentMethod);

        try {
            await axios.post(API+'checkin_process.php', fd, { headers: {...getConfig().headers, 'Content-Type': 'multipart/form-data'}});
            setModalType(null); loadAll(); alert("Check-In Complete");
        } catch(e) { alert("Check-in Error"); }
    }

    const processCheckOut = async () => {
        if(!confirm("Complete checkout?")) return;
        const totalExtras = wiz_items.reduce((acc, item) => acc + parseFloat(item.price), 0);
        const newItems = wiz_items.filter(i => !selBooking.addons?.some(old => old.name === i.name && parseFloat(old.price) === parseFloat(i.price)));

        try {
            await axios.post(API+'checkout_process.php', {
                id: selBooking.id, invoice_items: newItems, total_services_fee: totalExtras 
            }, getConfig());
            setModalType(null); loadAll(); alert("Checked Out!");
        } catch(e) { alert("Checkout Error"); }
    }

    const handleDelete = async (id) => {
        if(!confirm("Delete?")) return;
        await axios.delete(API + `bookings.php?id=${id}`, getConfig());
        loadAll();
    }

    const printBill = (isFinal) => {
        const room = parseFloat(selBooking.total_amount || 0);
        const extras = wiz_items.reduce((acc, item) => acc + parseFloat(item.price), 0);
        const total = room + extras;
        const w = window.open();
        w.document.write(`<html><body style='font-family:monospace; padding:20px'>
            <h2 align='center'>${isFinal ? 'FINAL INVOICE' : 'INVOICE'}</h2>
            <p>Guest: ${selBooking.guest_name} <br> Ref: ${selBooking.booking_reference}</p>
            <hr/>
            <table width='100%'><tr><td>Room Charges</td><td align='right'>$${room.toFixed(2)}</td></tr>
            ${wiz_items.map(i=>`<tr><td>${i.name}</td><td align='right'>$${parseFloat(i.price).toFixed(2)}</td></tr>`).join('')}
            </table><hr/><h3>Total: $${total.toFixed(2)}</h3>
        </body></html>`);
        w.print();
    }

    // UI Helpers
    const addItem = () => {
        // FIX: Variable name changed to 'service'
        const service = availableServices.find(x => x.id == wiz_serviceId);
        if(service) {
            setWiz_items([...wiz_items, {name: service.name, price: parseFloat(service.price)}]);
        }
    }
    const addCustomItem = () => {
        const name = prompt("Name:"); const price = prompt("Price:");
        if(name && price) setWiz_items([...wiz_items, {name, price: parseFloat(price)}]);
    }

    const renderTotal = () => {
        if (!selBooking) return "0.00";
        const base = parseFloat(selBooking.total_amount || 0);
        const extra = wiz_items.reduce((acc, item) => acc + parseFloat(item.price || 0), 0);
        return (base + extra).toFixed(2);
    }

    const getOptionStyle = (status) => {
        if(status === 'maintenance') return { color: 'red', fontWeight: 'bold' };
        if(status === 'dirty') return { color: '#e0a800' };
        return {};
    }

    const getBadgeClass = (status) => {
        const map = {
            confirmed: 'bg-green-100 text-green-700 border-green-200',
            checked_in: 'bg-blue-100 text-blue-700 border-blue-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200',
            checked_out: 'bg-gray-100 text-gray-600 border-gray-200',
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
        };
        return `px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${map[status] || map.pending}`;
    }

    return (
        <Layout title="Reservations">
            
            {/* CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex">
                    <button onClick={() => setActiveTab('active')} 
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        Active
                    </button>
                    <button onClick={() => setActiveTab('history')} 
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        History
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={e=>setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                        />
                    </div>
                    <button onClick={openCreate} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all">
                        <Plus size={18} /> New
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Ref</th>
                            <th className="px-6 py-4">Guest</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {displayBookings.map(b => (
                            <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">#{b.booking_reference}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800">{b.guest_name}</div>
                                    <div className="text-xs text-gray-400">{b.unit_name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={getBadgeClass(b.status)}>{b.status.replace('_', ' ')}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={()=>openEdit(b)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><Edit size={16}/></button>
                                        
                                        {b.status === 'confirmed' && (
                                            <button onClick={()=>openCheckIn(b)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><LogIn size={16}/></button>
                                        )}
                                        {b.status === 'checked_in' && (
                                            <button onClick={()=>openCheckOut(b)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg"><LogOut size={16}/></button>
                                        )}
                                        
                                        <button onClick={()=>handleDelete(b.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {displayBookings.length === 0 && <tr><td colSpan="4" className="text-center py-10 text-gray-400">No bookings found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {modalType && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800">
                                {modalType==='create' && 'New Reservation'}
                                {modalType==='edit' && 'Edit Booking'}
                                {modalType==='checkin' && 'Check-In Wizard'}
                                {modalType==='checkout' && 'Checkout & Payment'}
                            </h3>
                            <button onClick={()=>setModalType(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>

                        <div className="p-6">
                            {/* FORM */}
                            {(modalType === 'create' || modalType === 'edit') && (
                                <form onSubmit={saveBooking} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reference (Opt)</label>
                                            <input value={f_ref} onChange={e=>setF_ref(e.target.value)} className="w-full p-2 border rounded-lg outline-none" placeholder="#BK-XXX" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Guest Name</label>
                                            <input value={f_guest} onChange={e=>setF_guest(e.target.value)} required className="w-full p-2 border rounded-lg outline-none" />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Room Unit</label>
                                        <select value={f_unitId} onChange={e=>setF_unitId(e.target.value)} className="w-full p-2 border rounded-lg bg-white">
                                            {units.map(u => (
                                                <option key={u.id} value={u.id} style={getOptionStyle(u.status)}>
                                                    {u.property_name} - {u.unit_name} [{u.status.toUpperCase()}]
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check In</label>
                                            <input type="date" value={f_in} onChange={e=>setF_in(e.target.value)} required className="w-full p-2 border rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check Out</label>
                                            <input type="date" value={f_out} onChange={e=>setF_out(e.target.value)} required className="w-full p-2 border rounded-lg" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200">
                                        <span className="font-bold text-gray-600">Total</span>
                                        <span className="font-bold text-xl text-primary">${f_total}</span>
                                    </div>
                                    <button className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 transition-all">Save</button>
                                </form>
                            )}

                            {/* WIZARD */}
                            {(modalType === 'checkin' || modalType === 'checkout') && (
                                <div className="space-y-6">
                                    {modalType === 'checkin' && (
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-3"><User size={18}/> Guest Verification</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input type="file" onChange={e=>setWiz_idFile(e.target.files[0])} className="text-xs" />
                                                <input placeholder="Phone" value={wiz_phone} onChange={e=>setWiz_phone(e.target.value)} className="p-2 border rounded text-sm" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h4 className="flex items-center gap-2 font-bold text-gray-700 mb-3"><DollarSign size={18}/> Add-ons</h4>
                                        <div className="flex gap-2 mb-3">
                                            <select onChange={e=>setWiz_serviceId(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm">
                                                <option value="">Select Service...</option>
                                                {availableServices.map(s=><option key={s.id} value={s.id}>{s.name} ${s.price}</option>)}
                                            </select>
                                            <button onClick={addItem} className="bg-white border p-2 rounded-lg hover:bg-gray-100"><Plus size={18}/></button>
                                            <button onClick={addCustomItem} className="text-xs text-blue-500 font-medium px-2">Custom</button>
                                        </div>
                                        <ul className="space-y-1">
                                            {wiz_items.map((x,i) => (
                                                <li key={i} className="flex justify-between text-sm bg-white p-2 rounded border border-gray-200 shadow-sm">
                                                    <span>{x.name}</span> <span className="font-bold">${parseFloat(x.price).toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center text-lg font-bold mb-4">
                                            <span>Total Bill</span>
                                            <span className="text-2xl text-primary">${renderTotal()}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                                                <select value={wiz_paymentStatus} onChange={e=>setWiz_paymentStatus(e.target.value)} className="w-full p-2 border rounded-lg bg-white">
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                </select>
                                            </div>
                                            {wiz_paymentStatus === 'paid' && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Method</label>
                                                    <select value={wiz_paymentMethod} onChange={e=>setWiz_paymentMethod(e.target.value)} className="w-full p-2 border rounded-lg bg-white">
                                                        <option value="cash">Cash</option>
                                                        <option value="online">Online</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={()=>printBill(modalType==='checkout')} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-50 transition">
                                                <Printer size={18}/> Invoice
                                            </button>
                                            <button onClick={modalType==='checkin'?processCheckIn:processCheckOut} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-200 transition">
                                                <Check size={18}/> Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Bookings;