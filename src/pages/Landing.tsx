import React, { useEffect, useState } from "react"; 
import GlowBackground from "../components/ui/GlowBackground";
import { GoArrowUpRight, GoArrowDownLeft } from "react-icons/go";
import { RiTimeLine } from "react-icons/ri";
import { GrTime } from "react-icons/gr";
import { FaWallet } from "react-icons/fa";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { MdRepeatOne } from "react-icons/md";

interface Payment{
    CLOSED: number;
    COUNT: number;
    FAILED: number;
    PENDING: number;
    SUCCESS: number;
    TOTAL: number;
    TRX_PER_MIN: number;
}

interface FundTransfer{
    SUCCESS: number,
    FAILED: number,
    CLOSED: number,
    PENDING:number,
    COUNT:number,
    TOTAL: number | null,
    BALANCE: number
    TRX_PER_MIN: number;
}

const Landing: React.FC = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paymentData, setPaymentData] = useState<Payment | null>(null);
    const [fundTransferData, setFundTransferData] = useState<FundTransfer | null>(null);
    
    const formattedBalance = fundTransferData
        ? `₱${fundTransferData.BALANCE.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "₱0.00";

    const hiddenBalance = formattedBalance.replace(/[^₱]/g, "*");
    const totalTransactions = (paymentData?.COUNT ?? 0) + (fundTransferData?.COUNT ?? 0);
    const totalTPM = ((paymentData?.TRX_PER_MIN ?? 0) + (fundTransferData?.TRX_PER_MIN ?? 0 ));
    
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            setError("Missing access token. Please login again.");
            setLoading(false);
            return;
        }

        const today = new Date().toISOString().split("T")[0];
        const fetchAll = async () => {
            setLoading(true);
            setError("");
            try {
                const [paymentRes, fundRes] = await Promise.all([
                    fetch(`${API_URL}/dashboard/success-rate/payment?start=${today}&end=${today}`, {
                        headers: { "Accept": "application/json", "Authorization": `Bearer ${accessToken}` },
                    }),
                    fetch(`${API_URL}/dashboard/success-rate/fund-transfer?start=${today}&end=${today}`, {
                        headers: { "Accept": "application/json", "Authorization": `Bearer ${accessToken}` },
                    }),
                ]);
                
                const paymentJson = await paymentRes.json();
                const fundJson = await fundRes.json();
                
                if (paymentJson?.detail || fundJson?.detail) {
                    alert("Token Expired, Please log in again");
                    localStorage.removeItem("accessToken");
                    window.location.href = "/login"; 
                    return;
                }

                if (paymentRes.status === 401 || fundRes.status === 401) {
                    setError("Session expired. Please login again.");
                    return;
                }

                if (!paymentRes.ok || !fundRes.ok) throw new Error("Failed to fetch dashboard data");

                setPaymentData(paymentJson);
                setFundTransferData(fundJson);
            } catch (err) {
                console.error(err);
                setError("Unable to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);
    
    const Spinner = () => (
        <span className="inline-block w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
    );

    return (
        <div className="relative mt-12 lg:mt-0 p-4 md:p-8 bg-slate-50 min-h-screen font-sans overflow-hidden">
            {/* Global Background Accents to match the new component colors */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-teal-100/30 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-purple-100/30 blur-[120px] pointer-events-none" />
            
            {/* Header */}
            <div className="relative z-10 mb-8 font-extrabold">
                <h1 className="text-2xl md:text-4xl font-black text-stone-700 tracking-tight">
                    Welcome, <span className="text-transparent bg-clip-text bg-emerald-500">Client</span>
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 font-bold text-xs uppercase tracking-widest text-center">
                    {error}
                </div>
            )}

            {/* Top Section: Balance + Quick Stats */}
            <div className="relative z-10 flex flex-col lg:flex-row items-start gap-6">
                
                {/* Balance Card: Updated to slate-950 base for better GlowBackground visibility */}
                <div className="relative overflow-hidden bg-slate-950 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 p-6 md:p-10 w-full lg:basis-[75%] transition-all duration-500 border border-slate-800">   
                    <GlowBackground />
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start text-white">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                    <FaWallet className="text-teal-400" size={20}/>
                                </div>
                                <div>
                                    <h2 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                                        Total Balance
                                    </h2>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBalanceVisible((prev) => !prev)}
                                className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl p-2.5 transition-all border border-white/5"
                            >
                                {isBalanceVisible ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
                            </button>
                        </div>
                        <div className="mt-8">
                            <p className="text-white text-4xl md:text-6xl font-black tracking-tighter">
                                {loading ? <Spinner /> : isBalanceVisible ? formattedBalance : hiddenBalance}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Column */}
                <div className="w-full lg:basis-[25%] flex flex-col md:flex-row lg:flex-col gap-4">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 flex-1 hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <div className="bg-teal-50 p-3 rounded-2xl text-teal-600">
                                <GoArrowDownLeft size={24}/>
                            </div>
                        </div>
                        <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Trans. / min</h4>
                        <p className="text-2xl font-black mt-1 text-slate-800">
                            {loading ? <Spinner /> : (totalTPM ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 flex-1 hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <div className="bg-purple-50 p-3 rounded-2xl text-purple-600">
                                <MdRepeatOne size={24}/>
                            </div>
                        </div>
                        <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Today's Volume</h4>
                        <p className="text-2xl font-black mt-1 text-slate-800">
                            {loading ? <Spinner/> : (totalTransactions ?? 0).toLocaleString("en-PH")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">

                {/* Summary Section */}
                <div>
                    <h3 className="text-slate-800 font-black mb-5 text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-teal-500 rounded-full"></span> Summary
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 hover:border-teal-200 transition-all">
                            <GoArrowDownLeft className="rounded-2xl p-3 text-5xl bg-teal-50 text-teal-600 mb-4"/>
                            <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Cash In</h4>
                            <p className="text-2xl font-black mt-1 text-slate-800">
                                {loading ? <Spinner /> : `₱${(paymentData?.TOTAL ?? 0).toLocaleString("en-PH", {minimumFractionDigits: 2})}`}
                            </p>
                        </div>

                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 hover:border-blue-200 transition-all">
                            <GoArrowUpRight className="rounded-2xl p-3 text-5xl bg-blue-50 text-blue-600 mb-4"/>
                            <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Cash Out</h4>
                            <p className="text-2xl font-black mt-1 text-slate-800">
                                {loading ? <Spinner /> : `₱${(fundTransferData?.TOTAL ?? 0).toLocaleString("en-PH", {minimumFractionDigits: 2})}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metrics Section */}
                <div>
                    <h3 className="text-slate-800 font-black mb-5 text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span> Performance
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white/60 backdrop-blur-sm rounded-[2rem] shadow-sm border border-white p-6">
                            <RiTimeLine className="rounded-2xl p-3 text-5xl bg-slate-100 text-slate-500 mb-4"/>
                            <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">TPM (Cash In)</h4>
                            <p className="text-2xl font-black mt-1 text-slate-800">
                                {loading ? <Spinner /> : (paymentData?.TRX_PER_MIN.toLocaleString("en-PH", {minimumFractionDigits: 2}) ?? "0.00")}
                            </p>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm rounded-[2rem] shadow-sm border border-white p-6">
                            <GrTime className="rounded-2xl p-3 text-5xl bg-slate-100 text-slate-500 mb-4"/>
                            <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">TPM (Cash Out)</h4>
                            <p className="text-2xl font-black mt-1 text-slate-800">
                                {loading ? <Spinner /> : (fundTransferData?.TRX_PER_MIN.toLocaleString("en-PH", {minimumFractionDigits: 2}) ?? "0.00")}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Landing;