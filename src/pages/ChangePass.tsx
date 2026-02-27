import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const ChangePass = () => {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ currentPassword: '', newPassword: '' });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            setError("Missing access token. Please login again.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/dashboard/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    new_password: formData.newPassword,
                    password: formData.currentPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.detail || "Failed to change password.");
                return;
            }

            // Success - Trigger Modal
            setShowSuccessModal(true);
            setFormData({ currentPassword: "", newPassword: "" });
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        }
    };

    const handleModalClose = () => {
        setShowSuccessModal(false);
        navigate('/landing');
    };

    return (
        // Changed bg-slate-50 to bg-stone-50
        <div className="relative min-h-screen w-full flex items-center justify-center bg-stone-50 overflow-hidden font-sans">
            
            {/* --- Background Animated Blobs (Now Forest & Moss themed) --- */}
            <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-emerald-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-stone-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

            {/* --- Card Container --- */}
            <div className="relative z-10 w-full max-w-100 px-6 animate-fade-in">
                {/* Updated shadow to stone-900/10 for a more organic depth */}
                <div className="bg-white/80 backdrop-blur-xl border border-stone-200/50 p-8 rounded-[2.5rem] shadow-2xl shadow-stone-900/10">
                
                {/* Header */}
                <div className="mb-8 text-center">
                    {/* Brand color changed to Emerald 900 */}
                    <h1 className="text-3xl font-black text-stone-800 mb-2 tracking-tight">Pulse<span className='text-emerald-500'>Tech</span></h1>
                </div>

                {/* Error Message - Muted Terracotta/Red */}
                {error && (
                    <div className="bg-red-50 text-red-800 text-xs py-2 px-3 rounded-lg text-center font-bold border border-red-100 animate-shake mb-4">
                        {error}
                    </div>
                )}
                    
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Current Password Field */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-400 ml-1 uppercase tracking-[0.15em]">Current Password</label>
                        <div className="relative group">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input 
                                type={showCurrent ? "text" : "password"}
                                className="w-full bg-stone-100/50 border border-stone-100 rounded-2xl py-4 pl-12 pr-12 text-stone-700 focus:ring-4 focus:ring-emerald-50 focus:border-emerald-800 transition-all outline-none font-medium"
                                placeholder="••••••••"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                                required
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                            >
                                {showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password Field */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-400 ml-1 uppercase tracking-[0.15em]">New Password</label>
                        <div className="relative group">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input 
                                type={showNew ? "text" : "password"}
                                className="w-full bg-stone-100/50 border border-stone-100 rounded-2xl py-4 pl-12 pr-12 text-stone-700 focus:ring-4 focus:ring-emerald-50 focus:border-emerald-800 transition-all outline-none font-medium"
                                placeholder="••••••••"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                required
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                            >
                                {showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button - Now Emerald 900 */}
                    <button 
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-700 active:scale-[0.98] text-stone-50 font-black py-4 rounded-2xl shadow-lg shadow-emerald-900/20 transition-all duration-200 mt-2 tracking-wide"
                    >
                        Update Password
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-8 text-center">
                    <Link to="/landing" className="inline-flex items-center text-sm text-stone-400 hover:text-emerald-500 transition-colors font-black group tracking-tight">
                        <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />Back
                    </Link>
                </div>
                </div>  
            </div>

            {/* --- Success Modal --- */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center px-4 overflow-hidden">
                    {/* Overlay - Darker Stone/Forest tint */}
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-fade-in"></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-85 shadow-2xl animate-pop-in text-center border border-stone-200">
                        <div className="flex justify-center mb-4">
                            {/* Checkmark icon in Forest Green */}
                            <FiCheckCircle className="text-emerald-700" size={64} />
                        </div>
                        <h2 className="text-2xl font-black text-stone-800 mb-2 tracking-tight">Success!</h2>
                        <p className="text-stone-500 mb-8 font-medium">Password changed successfully.</p>
                        <button 
                            onClick={handleModalClose}
                            className="w-full bg-emerald-900 hover:bg-emerald-950 text-stone-50 font-black py-4 rounded-2xl shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.95]"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangePass;