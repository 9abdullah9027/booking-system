import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutGrid, Calendar, Bed, Users, ClipboardCheck, Settings, LogOut, Shield, Building, ChevronLeft, ChevronRight 
} from 'lucide-react';

const Sidebar = ({ isOpen, toggle }) => {
    const navigate = useNavigate();
    const role = localStorage.getItem('user_role');

    const handleLogout = () => {
        if(confirm("Logout?")) { localStorage.clear(); navigate('/'); }
    };

    const NavItem = ({ to, icon: Icon, label }) => (
        <NavLink to={to} className={({ isActive }) => `
            flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 mb-1 group relative
            ${isActive 
                ? 'bg-primary text-white shadow-lg shadow-blue-200' 
                : 'text-slate-500 hover:bg-blue-50 hover:text-primary'}
        `}>
            <Icon size={22} strokeWidth={1.5} className="min-w-[22px]" />
            <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-10 pointer-events-none'}`}>
                {label}
            </span>
            
            {/* Tooltip on Collapse */}
            {!isOpen && (
                <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    {label}
                </div>
            )}
        </NavLink>
    );

    return (
        <div className={`h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
            
            {/* Branding */}
            <div className="h-20 flex items-center px-5 border-b border-gray-50 relative">
                <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 min-w-[40px]">H</div>
                <div className={`ml-3 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                    <h1 className="text-lg font-bold text-slate-800 leading-none">HOTEL</h1>
                    <span className="text-[10px] text-primary font-bold tracking-[0.2em]">SYSTEM</span>
                </div>

                {/* Toggle Button */}
                <button 
                    onClick={toggle}
                    className="absolute -right-3 top-8 bg-white border border-gray-200 p-1 rounded-full text-gray-500 hover:text-primary shadow-sm z-50"
                >
                    {isOpen ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-6 custom-scrollbar overflow-x-hidden">
                <NavItem to="/dashboard" icon={LayoutGrid} label="Dashboard" />
                <NavItem to="/calendar" icon={Calendar} label="Calendar" />
                <NavItem to="/bookings" icon={ClipboardCheck} label="Bookings" />
                <NavItem to="/guests" icon={Users} label="Guest CRM" />
                
                <div className={`my-4 border-t border-gray-100 ${!isOpen && 'hidden'}`}></div>
                
                <NavItem to="/properties/units" icon={Bed} label="Room Manager" />
                <NavItem to="/housekeeping" icon={Shield} label="Housekeeping" />

                {role === 'super_admin' && (
                    <>
                    <div className={`my-4 border-t border-gray-100 ${!isOpen && 'hidden'}`}></div>
                    <NavItem to="/properties" icon={Building} label="Properties" /> 
                    <NavItem to="/settings" icon={Settings} label="Settings" />
                    <NavItem to="/users" icon={Users} label="Staff" />
                    <NavItem to="/logs" icon={Shield} label="Audit Logs" />
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-gray-50">
                <button onClick={handleLogout} className="flex items-center justify-center gap-3 text-slate-400 hover:text-red-500 transition-colors font-medium w-full p-2 rounded-lg hover:bg-red-50">
                    <LogOut size={20} />
                    <span className={`${isOpen ? 'block' : 'hidden'}`}>Logout</span>
                </button>
            </div>
        </div>
    );
};
export default Sidebar;