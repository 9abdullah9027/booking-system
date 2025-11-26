import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { PaintBucket, CheckCircle, Hammer, RefreshCw } from 'lucide-react';

const Housekeeping = () => {
    const [units, setUnits] = useState([]);
    const API = "http://localhost/booking-system/backend/";
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

    useEffect(() => { fetchUnits(); }, []);

    const fetchUnits = async () => {
        try {
            const res = await axios.get(API + 'units.php', config);
            if(Array.isArray(res.data)) setUnits(res.data);
        } catch(e) {}
    };

    const updateStatus = async (id, currentStatus) => {
        let newStatus = currentStatus === 'clean' ? 'dirty' : 'clean';
        if(currentStatus === 'maintenance' && !confirm("Mark repair as finished?")) return;

        try {
            await axios.put(API + 'units.php', { id, status: newStatus }, config);
            fetchUnits();
        } catch(e) { alert("Update failed"); }
    };

    const setMaintenance = async (id) => {
        if(!confirm("Block room for Maintenance?")) return;
        await axios.put(API + 'units.php', { id, status: 'maintenance' }, config);
        fetchUnits();
    };

    const getStatusStyles = (status) => {
        switch(status) {
            case 'clean': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle };
            case 'dirty': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: PaintBucket };
            case 'maintenance': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: Hammer };
            default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: RefreshCw };
        }
    };

    return (
        <Layout title="Housekeeping">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {units.map(u => {
                    const style = getStatusStyles(u.status);
                    const StatusIcon = style.icon;

                    return (
                        <div key={u.id} className={`relative p-6 rounded-2xl border-2 shadow-sm transition-all ${style.bg} ${style.border}`}>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{u.unit_name}</h3>
                                    <p className="text-sm text-gray-500">{u.property_name}</p>
                                </div>
                                <StatusIcon className={style.text} size={28} />
                            </div>

                            <div className="mb-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-white ${style.text} border ${style.border}`}>
                                    {u.status}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {/* Main Toggle Action */}
                                <button 
                                    onClick={() => updateStatus(u.id, u.status)}
                                    className={`w-full py-2.5 rounded-xl font-bold text-white shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2
                                    ${u.status === 'clean' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                >
                                    {u.status === 'clean' ? <PaintBucket size={18}/> : <CheckCircle size={18}/>}
                                    {u.status === 'clean' ? 'Mark Dirty' : 'Mark Clean'}
                                </button>

                                {/* Maintenance Action */}
                                {u.status !== 'maintenance' && (
                                    <button 
                                        onClick={() => setMaintenance(u.id)}
                                        className="w-full py-2 rounded-xl font-medium text-xs text-gray-500 hover:bg-white/50 border border-transparent hover:border-gray-200 transition-colors"
                                    >
                                        Report Maintenance
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Layout>
    );
};

export default Housekeeping;