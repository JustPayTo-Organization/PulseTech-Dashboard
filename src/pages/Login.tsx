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

            const data = await res.json(); // parse backend response
            const displayName = getDisplayNameFromUsername(username);

            if (!res.ok) {
                // Use backend message if available
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

            navigate("/landing"); // login success
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        }
    };


    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-50 font-sans">
        
        {/* BACKGROUND DECORATIVE ELEMENTS */}
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-cyan-100/50 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 w-full max-w-md p-8 mx-4">
            
            {/* LOGO SECTION */}
            <div className="flex flex-col items-center mb-10 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white p-4 rounded-3xl shadow-sm mb-4 border border-slate-100 transition-transform hover:scale-105 duration-500">
                <img
                src="/pulsetechlogov2.png"
                alt="PulseTech Logov2"
                className="w-16 h-16 object-contain"
                />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                Pulse<span className="text-blue-600">Tech</span>
            </h1>
            </div>

            {error && (
                <p className="text-red-500 text-sm p-5 font-medium text-center animate-fade-in-up">
                    {error}
                </p>
            )}

            {/* LOGIN CARD */}
            <form 
            onSubmit={handleLogin}
            className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] animate-fade-in-up opacity-0"
            style={{ animationDelay: '0.3s' }}
            >
            <div className="space-y-5">
                {/* Username */}
                <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s' }}>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <IoMdPerson size={18} />
                    </div>
                    <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="Username"
                    />
                </div>
                </div>

                {/* Password */}
                <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s' }}>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <IoMdLock size={18} />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-12 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                        placeholder="Password"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition"
                    >
                    {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                </div>
                </div>

                {/* Login Button */}
                <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.97] mt-2 animate-fade-in-up opacity-0"
                style={{ animationDelay: '0.6s' }}
                >
                Sign In
                </button>
            </div>
            </form>

        </div>
        </div>
    );
    };

export default Login;