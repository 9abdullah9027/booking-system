import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, MoreVertical, Home, BedDouble, Users, Plus, Download } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const navigate = useNavigate();
    const API = "http://localhost/booking-system/backend/";
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

    useEffect(() => {
        axios.get(API + 'dashboard.php', config)
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    }, []);

    const downloadReport = async () => {
        try {
            const response = await axios.get(API + 'export.php', {
                headers: config.headers,
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Report_${new Date().toISOString().slice(0,10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) { alert("Failed to download report."); }
    };

    if (!data) return <Layout title="Dashboard"><div className="p-10 text-gray-400">Loading...</div></Layout>;

    // Status Badge Helper
    const getStatusBadge = (status) => {
        const styles = {
            confirmed: 'bg-green-100 text-green-700 border border-green-200',
            checked_in: 'bg-blue-100 text-blue-700 border border-blue-200',
            checked_out: 'bg-gray-100 text-gray-500 border border-gray-200',
            cancelled: 'bg-red-50 text-red-500 border border-red-100',
            pending: 'bg-yellow-50 text-yellow-600 border border-yellow-100'
        };
        return `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || styles.pending}`;
    };

    const StatCard = ({ title, value, change, isPositive, icon: Icon }) => (
        <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 group hover:border-blue-100 transition-all duration-300 relative overflow-hidden">
            <div className="flex justify-between items-start z-10">
                <div className={`p-3 rounded-xl transition-colors duration-300 ${isPositive ? 'bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-red-50 text-red-500'}`}>
                    <Icon size={24} strokeWidth={2} />
                </div>
                <button className="text-gray-300 hover:text-gray-600"><MoreVertical size={18}/></button>
            </div>
            <div className="z-10 mt-4">
                <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
                <div className="flex items-end gap-3">
                    <h2 className="text-2xl font-bold text-dark">{value}</h2>
                    <span className={`text-xs font-bold py-1 px-2 rounded-full flex items-center gap-1 ${isPositive ? 'bg-green-100 text-success' : 'bg-red-100 text-danger'}`}>
                        {isPositive ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {change}
                    </span>
                </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gray-50 rounded-full opacity-50 pointer-events-none"></div>
        </div>
    );

    return (
        <Layout title="Dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
                <StatCard title="Total Income" value={`$${parseInt(data.total_income).toLocaleString()}`} change="+12%" isPositive={true} icon={Home} />
                <StatCard title="Total Revenue" value="$289,122" change="+4%" isPositive={true} icon={BedDouble} />
                <StatCard title="Total Customer" value={data.active_customers} change="-5%" isPositive={false} icon={Users} />
                <StatCard title="Properties" value={data.total_units} change="+8%" isPositive={true} icon={Home} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-card border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-dark">Income Overview</h3>
                        <button onClick={downloadReport} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 font-medium transition-colors flex items-center gap-2">
                            <Download size={14}/> Download Report
                        </button>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chart_data}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94A3B8', fontSize:12}} dy={10}/>
                                <YAxis axisLine={false} tickLine={false} tick={{fill:'#94A3B8', fontSize:12}} />
                                <Tooltip contentStyle={{borderRadius:'10px', border:'none', boxShadow:'0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                                <Area type="monotone" dataKey="income" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-lg text-dark self-start mb-4">Occupancy</h3>
                    <div className="relative w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data.unit_stats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                    {data.unit_stats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-dark">{data.total_units}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Units</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        {data.unit_stats.map(s => (
                            <div key={s.name} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{background:s.color}}></span> 
                                <span className="text-xs text-gray-600 font-medium">{s.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MY UNITS */}
            <div className="mb-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
                <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-lg text-dark">My Units</h3>
                    <Link to="/properties/units" className="text-sm font-medium text-primary bg-blue-50 px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-2">
                        <Plus size={16} /> Add Unit
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.my_units.map(unit => (
                        <div key={unit.id} className="bg-white p-4 rounded-2xl shadow-card border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                            <div className="h-36 bg-gray-100 rounded-xl mb-4 relative overflow-hidden">
                                <img 
                                    src={unit.image_path ? API + 'uploads/units/' + unit.image_path : `https://source.unsplash.com/random/400x300?hotel,room&sig=${unit.id}`} 
                                    alt="Room" 
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                                />
                                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide text-dark shadow-sm">
                                    {unit.status}
                                </span>
                            </div>
                            <h4 className="font-bold text-dark text-base truncate">{unit.unit_name}</h4>
                            <p className="text-xs text-gray-500 mb-3 truncate">{unit.property_name || "Main Building"}</p>
                            <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                                <span className="text-primary font-bold text-lg">${parseFloat(unit.base_price)}<span className="text-gray-400 text-xs font-normal">/night</span></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* BOOKING LIST TABLE */}
            <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 animate-slide-up" style={{animationDelay: '0.3s'}}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-dark">Recent Bookings</h3>
                    <button onClick={()=>navigate('/bookings')} className="text-sm font-medium text-white bg-primary px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-200">
                        <Plus size={16} /> New Booking
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-100">
                                <th className="pb-4 font-medium pl-4">Customer</th>
                                <th className="pb-4 font-medium">Room</th>
                                <th className="pb-4 font-medium">Dates</th>
                                <th className="pb-4 font-medium">Total</th>
                                <th className="pb-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recent_bookings.map(b => (
                                <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-4 pl-4 font-medium text-dark flex items-center gap-3">
                                        <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-primary font-bold text-xs border border-blue-100">
                                            {b.guest_name.charAt(0)}
                                        </div>
                                        {b.guest_name}
                                    </td>
                                    <td className="py-4 text-gray-500">{b.unit_name}</td>
                                    <td className="py-4 text-gray-500">
                                        <span className="font-medium text-gray-700">{b.check_in_date}</span> 
                                        <span className="text-gray-300 mx-2">/</span> 
                                        <span className="font-medium text-gray-700">{b.check_out_date}</span>
                                    </td>
                                    <td className="py-4 font-bold text-dark">${parseFloat(b.total_amount).toLocaleString()}</td>
                                    <td className="py-4">
                                        <span className={getStatusBadge(b.status)}>
                                            {b.status.replace('_',' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;