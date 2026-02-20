import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Dashboard = () => {
    const { user, updateBalance, updateUser } = useAuth();
    const [balance, setBalance] = useState(0);
    const [cid, setCid] = useState(null);
    const [name, setName] = useState(''); // Add local name state
    const [showBalance, setShowBalance] = useState(false);

    // Send Money Modal State
    const [isSendOpen, setIsSendOpen] = useState(false);
    const [transferSuccess, setTransferSuccess] = useState(false);
    const [transferFailed, setTransferFailed] = useState(false);
    const [receiverEmail, setReceiverEmail] = useState('');
    const [receiverId, setReceiverId] = useState('');
    const [amount, setAmount] = useState('');

    // PIN Modal State
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinMode, setPinMode] = useState('VERIFY'); // 'SET' or 'VERIFY'
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [hasPin, setHasPin] = useState(true); // Default to true to avoid flicker
    const [isFetched, setIsFetched] = useState(false);

    useEffect(() => {
        if (user && user.hasPin !== undefined) {
            setHasPin(user.hasPin);
        }
    }, [user]);
    const pinInputRef = useRef(null);
    const [confirmPin, setConfirmPin] = useState('');
    const [appPassword, setAppPassword] = useState('');
    const [pinAction, setPinAction] = useState(null); // 'SHOW_BALANCE', 'SEND_MONEY'
    const [pinSuccess, setPinSuccess] = useState(false);

    // Messages
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // History & Transactions State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/user/transactions');
            setTransactions(response.data); // Backend returns the array directly
            setIsHistoryOpen(true);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setMessage('Failed to fetch transactions');
            setIsError(true);
            setIsSendOpen(true); // Temporarily use send modal for error message if needed
        }
    };


    useEffect(() => {
        fetchUserData();
    }, []);

    // Auto-hide balance after 10 seconds
    useEffect(() => {
        let timer;
        if (showBalance) {
            timer = setTimeout(() => {
                setShowBalance(false);
            }, 10000);
        }
        return () => clearTimeout(timer);
    }, [showBalance]);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/user/balance');
            console.log('Fetched User Data:', response.data);
            setBalance(response.data.balance);
            setHasPin(response.data.hasPin);
            setCid(response.data.cid);
            setName(response.data.cname); // Set name from API
            updateBalance(response.data.balance);
            setIsFetched(true);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsFetched(true); // Still set to true to stop "loading" state if error
        }
    };

    const handlePinSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (pinMode === 'SET') {
            if (pin !== confirmPin) {
                setIsError(true);
                setMessage('PINs do not match');
                return;
            }
            try {
                await api.post('/user/set-pin', { password: appPassword, pin });
                setHasPin(true);
                updateUser({ hasPin: true });
                setPinSuccess(true);
                setMessage('PIN set successfully!');
                setIsError(false);
                // Clear fields
                setPin('');
                setConfirmPin('');
                setAppPassword('');
            } catch (error) {
                setIsError(true);
                setMessage(error.response?.data?.error || 'Failed to set PIN');
            }
        } else {
            // VERIFY
            try {
                await api.post('/user/verify-pin', { pin });

                // If success:
                if (pinAction === 'SHOW_BALANCE') {
                    setShowBalance(true);
                    setIsPinModalOpen(false);
                } else if (pinAction === 'SEND_MONEY') {
                    performSendMoney();
                }
                setPin(''); // clear pin after success
            } catch (error) {
                setIsError(true);
                if (error.response?.status === 400 && error.response.data.error === 'PIN not set') {
                    setMessage('PIN not set. Please set a PIN first.');
                    setPinMode('SET');
                } else {
                    setMessage('Invalid PIN');
                }
            }
        }
    };

    const performSendMoney = async () => {
        try {
            await api.post('/user/send-money', { receiverEmail, receiverId, amount, pin });

            // Set success state
            setTransferSuccess(true);
            setTransferFailed(false);
            setMessage('Money sent successfully!');
            setIsError(false);

            // Clear inputs
            setReceiverEmail('');
            setReceiverId('');
            setAmount('');
            setPin('');

            // Hide PIN modal, keep Send modal open to show success
            setIsPinModalOpen(false);

            // Refresh user data
            fetchUserData();

        } catch (error) {
            setIsError(true);
            setTransferSuccess(false);
            setTransferFailed(true);
            setMessage(error.response?.data?.error || 'Transaction failed');
            // Keep send modal open, hide PIN modal
            setIsPinModalOpen(false);
            setIsSendOpen(true);
        }
    };

    const clearPinState = () => {
        setPin('');
        setConfirmPin('');
        setAppPassword('');
        setMessage('');
        setShowPin(false);
        setPinSuccess(false);
    };

    const openPinModal = (mode, action = null) => {
        clearPinState();
        setPinMode(mode);
        setPinAction(action);
        setIsPinModalOpen(true);
    };

    const openSetPin = () => openPinModal('SET');

    const handleShowBalance = () => {
        if (showBalance) {
            setShowBalance(false);
        } else {
            openPinModal('VERIFY', 'SHOW_BALANCE');
        }
    };

    const initiateSendMoney = (e) => {
        if (e) e.preventDefault();
        openPinModal('VERIFY', 'SEND_MONEY');
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-36 pb-12 px-4 font-sans text-slate-800">
            <div className="max-w-5xl mx-auto space-y-10">
                {/* PIN Set Header - New User Guide */}
                {!hasPin && isFetched && (
                    <div className="mb-8 relative overflow-hidden bg-white/80 backdrop-blur-xl border border-indigo-100 p-8 rounded-[2rem] shadow-xl animate-scale-up group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl transition-transform group-hover:scale-110 duration-700"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6 text-center md:text-left">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 animate-bounce">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Setup Your Security PIN</h2>
                                    <p className="text-slate-500 font-medium max-w-sm">To send and receive money securely, please create your 4-6 digit security PIN first.</p>
                                </div>
                            </div>
                            <button
                                onClick={openSetPin}
                                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-slate-900 shadow-xl shadow-indigo-100 hover:shadow-slate-200 transition-all active:scale-95 whitespace-nowrap"
                            >
                                Setup PIN Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-2xl shadow-xl shadow-indigo-100 ring-1 ring-slate-900/5 transition-all hover:shadow-2xl hover:shadow-indigo-200/50">
                    <div className="space-y-4 w-full md:w-auto">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{name || user?.cname || 'User'}</h2>
                        </div>

                        {cid && (
                            <div className="group relative inline-flex items-center gap-3 bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100 transition-all hover:border-indigo-200 cursor-default">
                                <div>
                                    <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-widest leading-none mb-1">Customer ID</p>
                                    <p className="text-2xl font-mono font-bold text-indigo-700 leading-none">{cid}</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                onClick={openSetPin}
                                className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5 py-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                </svg>
                                Manage Security PIN
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 md:mt-0 w-full md:w-auto text-right bg-gradient-to-br from-indigo-600 to-blue-600 p-6 rounded-2xl shadow-lg text-white min-w-[300px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                        <p className="text-indigo-100 text-sm font-medium mb-2 relative z-10">Available Balance</p>
                        <div className="flex items-center justify-end gap-4 relative z-10">
                            <p className="text-4xl font-bold tracking-tight">
                                {showBalance ? `₹${parseFloat(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '••••••'}
                            </p>
                            <button
                                onClick={handleShowBalance}
                                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                                title={showBalance ? "Hide Balance" : "Show Balance"}
                            >
                                {showBalance ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {showBalance && <p className="text-[10px] text-indigo-100 mt-2 text-right animate-pulse">Auto-hides in 10s</p>}
                    </div>
                </header>

                {/* Quick Actions */}
                <h3 className="text-xl font-bold text-slate-800 px-1">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <button
                        onClick={() => { setIsSendOpen(true); setIsError(false); setMessage(''); }}
                        className="group relative overflow-hidden bg-white hover:bg-slate-50 border border-slate-200 p-8 rounded-2xl shadow-lg shadow-slate-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mt-10 -mr-10 transition-transform group-hover:scale-150"></div>

                        <div className="relative z-10 flex items-center gap-6">
                            <div className="bg-indigo-600 p-4 rounded-xl text-white shadow-lg shadow-indigo-300 group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900">Send Money</h4>
                                <p className="text-slate-500 text-sm mt-1">Instant secure transfer to anyone</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={fetchTransactions}
                        className="group relative overflow-hidden bg-white hover:bg-slate-50 border border-slate-200 p-8 rounded-2xl shadow-lg shadow-slate-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mt-10 -mr-10 transition-transform group-hover:scale-150"></div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="bg-emerald-500 p-4 rounded-xl text-white shadow-lg shadow-emerald-300 group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900">Transaction History</h4>
                                <p className="text-slate-500 text-sm mt-1">View past transfers and records</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Modals - Shared Backdrop */}
                {(isSendOpen || isPinModalOpen || isHistoryOpen) && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 transition-opacity animate-fade-in" />
                )}

                {/* Send Money Modal */}
                {isSendOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white pointer-events-auto rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-scale-up ring-1 ring-slate-900/5">
                            <button
                                onClick={() => {
                                    setIsSendOpen(false);
                                    setTransferSuccess(false);
                                    setTransferFailed(false);
                                    setMessage('');
                                    setReceiverEmail('');
                                    setReceiverId('');
                                    setAmount('');
                                }}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {transferSuccess ? (
                                <div className="text-center py-10 animate-scale-up">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-emerald-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Transfer Successful!</h3>
                                    <p className="text-slate-500 font-medium mt-2">{message}</p>
                                    <button
                                        onClick={() => {
                                            setIsSendOpen(false);
                                            setTransferSuccess(false);
                                        }}
                                        className="mt-8 px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            ) : transferFailed ? (
                                <div className="text-center py-10 animate-scale-up">
                                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-red-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Transfer Failed</h3>
                                    <p className="text-red-500 font-semibold mt-2">{message}</p>
                                    <div className="flex flex-col gap-3 mt-8">
                                        <button
                                            onClick={() => {
                                                setTransferFailed(false);
                                                setIsError(false);
                                                setMessage('');
                                            }}
                                            className="px-8 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-xl active:scale-95"
                                        >
                                            Try Again
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsSendOpen(false);
                                                setTransferFailed(false);
                                                setMessage('');
                                            }}
                                            className="px-8 py-3 text-slate-500 font-bold hover:text-slate-800 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-6 shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900">Send Money</h3>
                                        <p className="text-slate-500 text-sm mt-1">Enter details to initiate transfer</p>
                                    </div>

                                    <form onSubmit={initiateSendMoney} className="space-y-6">
                                        {message && isError && !transferFailed && (
                                            <div className="p-4 rounded-xl flex items-start gap-3 text-sm bg-red-50 text-red-700 border border-red-100 animate-fade-in">
                                                <div className="flex-1 font-semibold text-center">
                                                    {message}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Receiver Email</label>
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 placeholder-slate-400 bg-slate-50 hover:bg-white"
                                                    value={receiverEmail}
                                                    onChange={(e) => setReceiverEmail(e.target.value)}
                                                    placeholder="friend@example.com"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Customer ID</label>
                                                <input
                                                    type="number"
                                                    required
                                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 placeholder-slate-400 bg-slate-50 hover:bg-white"
                                                    value={receiverId}
                                                    onChange={(e) => setReceiverId(e.target.value)}
                                                    placeholder="e.g. 1"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Amount</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                        <span className="text-slate-500 font-bold text-lg">₹</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        step="0.01"
                                                        className="w-full pl-10 pr-5 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 placeholder-slate-400 font-semibold bg-slate-50 hover:bg-white text-lg"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95 mt-2 transition-all"
                                        >
                                            Proceed to Verify
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* PIN Modal */}
                {isPinModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white pointer-events-auto rounded-3xl shadow-2xl max-w-sm w-full p-8 relative animate-scale-up ring-1 ring-slate-900/5">
                            <button
                                onClick={() => setIsPinModalOpen(false)}
                                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {pinSuccess ? (
                                <div className="text-center py-6 animate-scale-up">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-emerald-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Setup Successful!</h3>
                                    <p className="text-slate-500 font-medium mt-2">Your security PIN has been {pinMode === 'SET' ? 'created' : 'updated'} successfully.</p>
                                    <button
                                        onClick={() => setIsPinModalOpen(false)}
                                        className="mt-8 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-500 mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">
                                            {pinMode === 'SET' ? 'Set New Security PIN' : 'Security Verification'}
                                        </h3>
                                        <p className="text-slate-500 text-sm mt-1">
                                            {pinMode === 'SET' ? 'Create a secure PIN for your account' : 'Enter your 4-6 digit PIN to continue'}
                                        </p>
                                    </div>

                                    {message && (
                                        <div className={`p-4 rounded-xl text-sm mb-6 font-medium text-center ${isError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {message}
                                        </div>
                                    )}

                                    <form onSubmit={handlePinSubmit} className="space-y-6">

                                        {pinMode === 'SET' && (
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Application Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-slate-300"
                                                    value={appPassword}
                                                    onChange={(e) => setAppPassword(e.target.value)}
                                                    placeholder="Verify your identity"
                                                />
                                            </div>
                                        )}

                                        <div className="relative group/pin">
                                            <input
                                                type={showPin ? "text" : "password"}
                                                required
                                                ref={pinInputRef}
                                                style={{ caretColor: 'transparent' }}
                                                className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-center text-3xl tracking-[0.5em] text-slate-800 font-bold placeholder-slate-200 transition-all"
                                                value={pin}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setPin(val);
                                                    if (val.length === 4) {
                                                        pinInputRef.current?.blur();
                                                    }
                                                }}
                                                placeholder="••••"
                                                maxLength={6}
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPin(!showPin)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors p-2"
                                            >
                                                {showPin ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.399 8.049 7.21 4.5 12 4.5c4.793 0 8.601 3.549 9.963 7.178.07.207.07.431 0 .639C20.6 15.951 16.79 19.5 12 19.5c-4.793 0-8.601-3.549-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>

                                        {pinMode === 'SET' && (
                                            <div className="space-y-4 pt-2">
                                                <div className="relative">
                                                    <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm PIN</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-center text-3xl tracking-[0.5em] text-slate-800 font-bold placeholder-slate-200 transition-all"
                                                        value={confirmPin}
                                                        onChange={(e) => setConfirmPin(e.target.value)}
                                                        placeholder="••••"
                                                        maxLength={6}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95 mt-4"
                                        >
                                            {pinMode === 'SET' ? 'Set PIN' : 'Verify PIN'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* History Modal */}
                {isHistoryOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white pointer-events-auto rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative animate-scale-up ring-1 ring-slate-900/5 flex flex-col max-h-[80vh]">
                            <button
                                onClick={() => setIsHistoryOpen(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Transaction History</h3>

                            <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                                {!Array.isArray(transactions) || transactions.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 flex flex-col items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3 opacity-50">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                        <p>No transactions found.</p>
                                    </div>
                                ) : (
                                    transactions.map((t) => {
                                        const isCredit = t.receiver_id === cid;
                                        return (
                                            <div key={t.id} className="group flex items-center justify-between p-5 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                        {isCredit ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.5-9a.75.75 0 00-.75-.75h-5.5a.75.75 0 000 1.5h5.5a.75.75 0 00.75-.75z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm md:text-base">
                                                            {isCredit
                                                                ? `Received from ${t.sender_name || 'Unknown'} (ID: ${t.sender_id})`
                                                                : `Sent to ${t.receiver_name || 'Unknown'} (ID: ${t.receiver_id})`}
                                                        </p>
                                                        <p className="text-xs font-medium text-slate-400 mt-0.5">
                                                            {new Date(t.timestamp).toLocaleString('en-IN', {
                                                                weekday: 'short',
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                second: '2-digit',
                                                                hour12: true
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className={`font-bold text-lg md:text-xl tracking-tight ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {isCredit ? '+' : '-'} ₹{parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Dashboard;
