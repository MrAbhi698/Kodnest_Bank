import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8">
            <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl px-6 py-4 flex justify-between items-center transition-all hover:shadow-md hover:bg-white/80">
                <Link to="/" className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2 group">
                    <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg group-hover:rotate-12 transition-transform">K</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Kodnest Bank</span>
                </Link>

                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="hidden md:block text-slate-500 font-medium hover:text-indigo-600 transition-colors text-sm">Dashboard</Link>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 bg-slate-50 rounded-full pl-1 pr-4 py-1 border border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                                        {user.cname ? user.cname.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 font-bold text-sm hidden md:block">
                                        {user.cname}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-slate-300 active:scale-95"
                                >
                                    Log Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-slate-600 font-bold text-sm hover:text-indigo-600 transition-colors">Log In</Link>
                            <Link
                                to="/signup"
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
