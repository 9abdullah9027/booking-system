import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = ({ children, title }) => {
    // State to control Sidebar collapse
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] overflow-hidden">
            {/* Pass state down to Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Main Content - Adjust margin based on sidebar state */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                
                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
                    
                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-white pl-10 pr-4 py-2 rounded-full text-sm border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-64 transition-all"
                            />
                        </div>
                        
                        <button className="p-2 bg-white rounded-full hover:bg-gray-50 relative border border-gray-100">
                            <Bell size={20} className="text-gray-600" />
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-700">Super Admin</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Manager</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-0.5 cursor-pointer">
                                <div className="h-full w-full rounded-full bg-white border-2 border-transparent overflow-hidden">
                                    <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Profile" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Animated Content Area */}
                <motion.main 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex-1 p-8 overflow-y-auto"
                >
                    {children}
                </motion.main>
            </div>
        </div>
    );
};

export default Layout;