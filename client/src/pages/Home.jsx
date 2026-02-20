import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col justify-center items-center relative overflow-hidden bg-slate-50">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 animate-slide-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-sm font-bold animate-fadeIn">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    The Future of Banking is Here
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    Banking Simplified. <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Secure & Instant.</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    Experience the next generation of financial management.
                    Secure transfers, instant balance updates, and complete control over your money.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                    <Link
                        to="/signup"
                        className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-1"
                    >
                        Create Account
                    </Link>
                    <Link
                        to="/login"
                        className="w-full md:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 transition-all hover:border-slate-300"
                    >
                        Sign In
                    </Link>
                </div>

                <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
                    <div className="p-6 bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm">
                        <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4 mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Bank-Grade Security</h3>
                        <p className="text-sm text-slate-500 mt-2">Your data is encrypted and protected 24/7.</p>
                    </div>
                    <div className="p-6 bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Instant Transfers</h3>
                        <p className="text-sm text-slate-500 mt-2">Send money to anyone, anywhere, instantly.</p>
                    </div>
                    <div className="p-6 bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm">
                        <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4 mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Zero Hidden Fees</h3>
                        <p className="text-sm text-slate-500 mt-2">Transparent banking with absolutely no hidden charges.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
