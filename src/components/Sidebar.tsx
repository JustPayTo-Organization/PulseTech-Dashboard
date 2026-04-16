import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { PiSignOutBold } from "react-icons/pi";
import { LuBlocks } from "react-icons/lu";
import { PiHandWithdrawBold } from "react-icons/pi";
// import { RiArrowLeftRightLine } from "react-icons/ri";
import { HiOutlineMenu } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";

export default function Sidebar() {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [clientName, setClientName] = useState<string>("");
    const [_error, setError] = useState<string | undefined>(undefined);
    const [_loading, setLoading] = useState(false);
    
    const navItems = [
        { name: "Overview", path: "/landing", icon: LuBlocks },
        { name: "Transactions", path: "/transactions", icon: PiHandWithdrawBold }
        // { name: "Withdrawal", path: "/withdrawal", icon: RiArrowLeftRightLine },
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
    }, [API_URL]);

    const handleSignOut = async () => {
        localStorage.removeItem('accessToken');
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
            {/* Hamburger Button: Matched to Lighter Theme */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="text-stone-600 bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg shadow-emerald-900/5 border border-white active:scale-90 transition-transform"
                >
                    {mobileOpen ? <IoClose size={24} /> : <HiOutlineMenu size={24} />}
                </button>
            </div>

            {/* Sidebar: Minty Glassmorphism */}
            <div
                className={`
                    h-full w-64 bg-white/70 backdrop-blur-2xl flex flex-col p-5
                    fixed top-0 left-0 z-40 lg:relative lg:translate-x-0
                    transition-transform duration-300 ease-in-out border-r border-stone-100
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                {/* Subtle Glow Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-50/50 blur-3xl -z-10" />
                
                {/* Logo Section */}
                <div className="flex flex-col items-center gap-2 mb-10 mt-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-emerald-50 p-3 transition-transform hover:scale-105 duration-300">
                        <img
                            src="/pulselogobgremoved.png"
                            alt="PulseTech"
                            className="w-12 h-12 object-contain"
                        />
                    </div>
                    <div className="text-center">
                    </div>
                </div>

                {/* Navigation: Light & Vibrant Emerald */}
                <nav className="flex flex-col gap-2 flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path === "/landing" && location.pathname === "/");
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                                    isActive
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 font-bold"
                                        : "text-stone-400 hover:bg-emerald-50 hover:text-emerald-600 font-medium"
                                }`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <Icon className={`text-xl ${isActive ? "text-white" : "text-stone-300"}`} />
                                <span className="text-[11px] uppercase tracking-widest">{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Change Password Popover (Clean Mint) */}
                {showChangePass && (
                    <button
                        onClick={handleChangePass}
                        className="bg-emerald-600 text-white px-4 py-3.5 rounded-xl 
                        shadow-xl shadow-emerald-900/10 border border-emerald-500
                        hover:bg-emerald-700 transition-all duration-200
                        text-[10px] font-bold uppercase tracking-widest w-full text-left flex items-center gap-2 mb-3 animate-fade-in-up"
                    >
                        Change Password
                    </button>
                )}

                {/* Client Info Container: Soft Stone & Emerald Gradient */}
                <div ref={clientRef} className="mt-auto bg-stone-50/50 border border-stone-100 rounded-[1.5rem] p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div 
                            onClick={handleToggleChangePass}
                            className="cursor-pointer w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-transform"
                        >
                            {clientInitials}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <h5 className="text-stone-700 text-sm font-bold truncate leading-none">{clientName || "User"}</h5>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-400 hover:bg-red-50 hover:text-red-500 transition-all w-full text-[10px] font-bold uppercase tracking-widest"
                    >
                        <PiSignOutBold size={16} /> Sign Out
                    </button>
                </div>
            </div>
        </>
    );
}