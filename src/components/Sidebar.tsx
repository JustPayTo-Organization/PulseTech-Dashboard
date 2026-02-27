import { NavLink, useNavigate } from "react-router-dom";
import { PiSignOutBold } from "react-icons/pi";
import { LuBlocks } from "react-icons/lu";
import { PiHandWithdrawBold } from "react-icons/pi";
import { RiArrowLeftRightLine } from "react-icons/ri";
import { HiOutlineMenu } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";

export default function Sidebar() {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [clientName, setClientName] = useState<string>("");
    const [_error, setError] = useState<string | undefined>(undefined);
    const [_loading, setLoading] = useState(false);
    
    const navItems = [
        { name: "Overview", path: "/landing", icon: LuBlocks },
        { name: "Transactions", path: "/transactions", icon: PiHandWithdrawBold },
        { name: "Withdrawal", path: "/withdrawal", icon: RiArrowLeftRightLine },
    ];  

    useEffect(() => {
        const fetchClientName = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                const res = await fetch(`${API_URL}/dashboard/user`, {
                    method: "GET", 
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    },
                });
                if (!res.ok) throw new Error("Network response was not ok");
                const json = await res.json();
                setClientName(json.name);
            } catch (err: unknown) {
                if (err instanceof Error) setError(err.message);
                else setError("Unknown error");
            } finally {
                setLoading(false);
            }
        };
        fetchClientName();
    }, []);

    const [_accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken"));

    const handleSignOut = async () => {
        localStorage.removeItem('accessToken');
        setAccessToken(null);
        navigate("/login", { replace: true });
    };  

    const nameParts = clientName ? clientName.trim().split(" ") : [];
    const initials = nameParts.length >= 2
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
            : nameParts.length === 1 ? nameParts[0][0] : "?";
    const clientInitials = initials.toUpperCase();

    const [showChangePass, setShowChangePass] = useState(false);
    const clientRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (clientRef.current && !clientRef.current.contains(event.target as Node)) {
                setShowChangePass(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleToggleChangePass = () => setShowChangePass((prev) => !prev);
    const handleChangePass = () => navigate("/changepass");

    return (
        <>
            {/* Hamburger Button: Matched to Stone Theme */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="text-stone-600 bg-white/80 backdrop-blur-md p-2.5 rounded-xl shadow-md border border-stone-200 active:scale-90 transition-transform"
                >
                    {mobileOpen ? <IoClose size={24} /> : <HiOutlineMenu size={24} />}
                </button>
            </div>

            {/* Sidebar: Warm Stone Glassmorphism */}
            <div
                className={`
                    h-full w-64 bg-stone-50/80 backdrop-blur-2xl flex flex-col p-4
                    fixed top-0 left-0 z-40 lg:relative lg:translate-x-0
                    transition-transform duration-300 ease-in-out border-r border-stone-200
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                {/* Decorative Background Blur (Mossy accent) */}
                <div className="absolute top-[-5%] left-[-10%] w-32 h-32 rounded-full bg-emerald-100/30 blur-3xl -z-10" />
                
                {/* Logo Section */}
                <div className="flex flex-col items-center gap-2 mb-10 mt-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-2.5">
                        <img
                            src="/pulselogobgremoved.png"
                            alt="PulseTech"
                            className="w-14 h-14 object-contain"
                        />
                    </div>
                    <h1 className="text-xl font-black text-stone-800 tracking-tight mt-2">
                    </h1>
                </div>

                {/* Navigation: Bold Forest Style */}
                <nav className="flex flex-col gap-2 flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.path === window.location.pathname || (item.path === "/landing" && window.location.pathname === "/");
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                                    isActive
                                        ? "bg-emerald-900 text-stone-50 shadow-lg shadow-emerald-900/20 font-black"
                                        : "text-stone-500 hover:bg-stone-100 hover:text-emerald-900 font-bold"
                                }`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <Icon className={`text-xl ${isActive ? "text-stone-50" : "text-stone-400"}`} />
                                <span className="text-xs uppercase tracking-widest">{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Change Password Popover (Earthy Tone) */}
                {showChangePass && (
                    <button
                        onClick={handleChangePass}
                        className="bg-white text-stone-700 px-4 py-3.5 rounded-2xl 
                        shadow-xl border border-stone-100
                        hover:bg-stone-50 hover:text-emerald-900 transition-all duration-200
                        text-[11px] font-black uppercase tracking-wider w-full text-left flex items-center gap-2 mb-3 animate-pop-in"
                    >
                        Change Password
                    </button>
                )}

                {/* Client Info Container: Warm Stone finish */}
                <div ref={clientRef} className="mt-auto bg-white border border-stone-200 rounded-[2rem] p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div 
                            onClick={handleToggleChangePass}
                            className="cursor-pointer w-10 h-10 rounded-full bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-stone-50 font-black text-xs shadow-md active:scale-95 transition-transform"
                        >
                            {clientInitials}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <h5 className="text-stone-800 text-sm font-black truncate leading-none">{clientName}</h5>
                            <span className="text-[10px] text-stone-400 uppercase font-black tracking-[0.2em] mt-1">Client</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-400 hover:bg-red-50 hover:text-red-700 transition-all w-full text-[10px] font-black uppercase tracking-widest"
                    >
                        <PiSignOutBold size={16} /> Sign Out
                    </button>
                </div>
            </div>
        </>
    );
}