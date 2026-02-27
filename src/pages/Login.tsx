import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdPerson, IoMdLock } from "react-icons/io";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { getDisplayNameFromUsername } from "../constants/clientDisplayMap";

const Login: React.FC = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${API_URL}/dashboard/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            const displayName = getDisplayNameFromUsername(username);

            if (!res.ok) {
                setError(data.detail || "Invalid username or password");
                return;
            }

            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem(
                "client",
                JSON.stringify({
                    displayName,
                })
            );

            navigate("/landing");
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        }
    };


    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-stone-50 font-sans">
        
        {/* BACKGROUND DECORATIVE ELEMENTS: Forest & Earth tones */}
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-emerald-100/30 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-stone-200/50 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 w-full max-w-md p-8 mx-4">
            
            {/* LOGO SECTION */}
            <div className="flex flex-col items-center mb-10 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s' }}>
                <div className="bg-white rounded-[2rem] shadow-sm mb-6 border border-stone-100 transition-transform hover:scale-105 duration-500 p-4">
                    <img
                        src="/pulselogonobg.png"
                        alt="PulseTech Logo"
                        className="w-24 h-24 object-contain"
                    />
                </div>
                <h1 className="text-3xl font-black text-stone-800 tracking-tighter">
                    Pulse<span className="text-emerald-900">Tech</span>
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 animate-fade-in-up">
                    <p className="text-red-800 text-xs font-black text-center uppercase tracking-wider">
                        {error}
                    </p>
                </div>
            )}

            {/* LOGIN CARD: Warm Stone finish */}
            <form 
                onSubmit={handleLogin}
                className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_rgba(28,54,36,0.05)] animate-fade-in-up opacity-0"
                style={{ animationDelay: '0.3s' }}
            >
                <div className="space-y-6">
                    {/* Username */}
                    <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s' }}>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-3 ml-1">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                                <IoMdPerson size={18} />
                            </div>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 pl-11 pr-4 text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-4 focus:ring-emerald-900/5 focus:border-emerald-900 focus:bg-white transition-all font-bold"
                                placeholder="Enter username"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s' }}>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-3 ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                                <IoMdLock size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 pl-11 pr-12 text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-4 focus:ring-emerald-900/5 focus:border-emerald-900 focus:bg-white transition-all font-bold"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-emerald-900 transition"
                            >
                                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full bg-emerald-900 hover:bg-emerald-950 text-stone-50 font-black py-4 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98] mt-4 animate-fade-in-up opacity-0 uppercase tracking-widest text-xs"
                        style={{ animationDelay: '0.6s' }}
                    >
                        Sign In
                    </button>
                </div>
            </form>

            <p className="text-center text-stone-400 text-[10px] mt-8 uppercase tracking-[0.2em] animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
                © 2026 PulseTech Solutions
            </p>
        </div>
        </div>
    );
};

export default Login;