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
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#f8faf9] font-sans">
            
            {/* BACKGROUND: Lighter, more ethereal "Mint" glow */}
            <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full bg-emerald-50 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-green-50/80 blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />

            <div className="relative z-10 w-full max-w-md p-8 mx-4">
                
                {/* LOGO SECTION */}
                <div className="flex flex-col items-center mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-white rounded-3xl shadow-sm mb-6 border border-emerald-50 transition-transform hover:rotate-2 duration-500 p-5">
                        <img
                            src="/pulselogonobg.png"
                            alt="PulseTech Logo"
                            className="w-20 h-20 object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-extrabold text-stone-700 tracking-tight">
                        Pulse<span className="text-emerald-500">Tech</span>
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 animate-shake">
                        <p className="text-red-600 text-[11px] font-bold text-center uppercase tracking-wider">
                            {error}
                        </p>
                    </div>
                )}

                {/* LOGIN CARD: Clean Glassmorphism */}
                <form 
                    onSubmit={handleLogin}
                    className="bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] p-10 shadow-[0_30px_100px_rgba(16,185,129,0.08)] animate-fade-in-up opacity-0"
                    style={{ animationDelay: '0.3s' }}
                >
                    <div className="space-y-6">
                        {/* Username */}
                        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s' }}>
                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2.5 ml-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400">
                                    <IoMdPerson size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/50 border border-stone-100 rounded-xl py-4 pl-11 pr-4 text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 focus:bg-white transition-all font-medium"
                                    placeholder="Username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s' }}>
                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2.5 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400">
                                    <IoMdLock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/50 border border-stone-100 rounded-xl py-4 pl-11 pr-12 text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 focus:bg-white transition-all font-medium"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-300 hover:text-emerald-500 transition"
                                >
                                    {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Login Button: Light Vibrant Emerald */}
                        <button
                            type="submit"
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.97] mt-4 animate-fade-in-up opacity-0 tracking-wide"
                            style={{ animationDelay: '0.6s' }}
                        >
                            Sign In
                        </button>
                    </div>
                </form>

                <div className="text-center mt-8 space-y-2 animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
                    <p className="text-stone-400 text-[10px] uppercase tracking-[0.2em]">
                        © 2026 PulseTech Solutions
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;