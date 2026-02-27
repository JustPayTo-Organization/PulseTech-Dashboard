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
        <span className="inline-block w-8 h-8 border-4 border-stone-200 border-t-emerald-900 rounded-full animate-spin" />
    );

    return (
        <div className="mt-12 lg:mt-0 p-4 md:p-8 bg-stone-50 min-h-screen font-sans">
            {/* Background Decorative Blurs - Mossy and Earthy */}
            <div className="fixed top-0 right-0 w-[30%] h-[30%] rounded-full bg-emerald-100/20 blur-[100px] pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[20%] h-[20%] rounded-full bg-stone-200/40 blur-[80px] pointer-events-none" />
            
            {/* Header */}
            <div className="relative z-10 mb-8">
                <h1 className="text-2xl md:text-4xl font-black text-stone-800 tracking-tight">
                    Welcome, <span className="text-emerald-900">Client</span>
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-2xl mb-6 animate-fade-in font-bold text-sm">
                    {error}
                </div>
            )}

            {/* Top Section: Balance + Quick Stats */}
            <div className="relative z-10 flex flex-col lg:flex-row items-start gap-6">
                
                {/* Big Balance Card: Deep Forest Aesthetic */}
                <div className="relative overflow-hidden bg-emerald-950 rounded-[2.5rem] shadow-2xl shadow-emerald-900/20 p-6 md:p-10 w-full lg:basis-[75%] transition-transform hover:scale-[1.005] duration-500 border border-emerald-800/50">   
                    <GlowBackground />
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start text-stone-50">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-inner">
                                    <FaWallet className="text-stone-50 text-xl"/>
                                </div>
                                <div>
                                    <h2 className="text-stone-300 font-black text-[10px] uppercase tracking-[0.2em]">
                                        Total Balance
                                    </h2>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBalanceVisible((prev) => !prev)}
                                className="bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-xl p-2.5 transition-all border border-white/10"
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
                    {/* Stat 1: TPM (Forest Highlight) */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 p-6 flex-1 transition-all hover:shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-900">
                                <GoArrowDownLeft size={24}/>
                            </div>
                        </div>
                        <h4 className="text-stone-400 font-black text-[10px] uppercase tracking-[0.2em]">Trans. / min</h4>
                        <p className="text-2xl font-black mt-1 text-stone-800">
                            {loading ? <Spinner /> : (totalTPM ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* Stat 2: Count (Stone Highlight) */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 p-6 flex-1 transition-all hover:shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <div className="bg-stone-100 p-3 rounded-2xl text-stone-600">
                                <MdRepeatOne size={24}/>
                            </div>
                        </div>
                        <h4 className="text-stone-400 font-black text-[10px] uppercase tracking-[0.2em]">Today's Volume</h4>
                        <p className="text-2xl font-black mt-1 text-stone-800">
                            {loading ? <Spinner/> : (totalTransactions ?? 0).toLocaleString("en-PH")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Summary + Metrics */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">

                {/* Summary Section */}
                <div>
                    <h3 className="text-stone-800 font-black mb-5 text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-emerald-900 rounded-full"></span> Summary
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Cash In */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 p-6 hover:border-emerald-200 transition-colors">
                            <GoArrowDownLeft className="rounded-2xl p-3 text-5xl bg-emerald-50 text-emerald-900 mb-4"/>
                            <h4 className="text-stone-400 font-black text-[10px] uppercase tracking-[0.2em]">Cash In</h4>
                            <p className="text-2xl font-black mt-1 text-stone-800">
                                {loading ? <Spinner /> : `₱${(paymentData?.TOTAL ?? 0).toLocaleString("en-PH", {minimumFractionDigits: 2})}`}
                            </p>
                        </div>

                        {/* Cash Out (Muted Terracotta) */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 p-6 hover:border-orange-100 transition-colors">
                            <GoArrowUpRight className="rounded-2xl p-3 text-5xl bg-orange-50 text-orange-800 mb-4"/>
                            <h4 className="text-stone-400 font-black text-[10px] uppercase tracking-[0.2em]">Cash Out</h4>
                            <p className="text-2xl font-black mt-1 text-stone-800">
                                {loading ? <Spinner /> : `₱${(fundTransferData?.TOTAL ?? 0).toLocaleString("en-PH", {minimumFractionDigits: 2})}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metrics Section */}
                <div>
                    <h3 className="text-stone-800 font-black mb-5 text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-stone-400 rounded-full"></span> Performance
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 p-6">
                            <RiTimeLine className="rounded-2xl p-3 text-5xl bg-stone-100 text-stone-600 mb-4"/>
                            <h4 className="text-stone-400 font-black text-[10px] uppercase tracking-[0.2em]">TPM (Cash In)</h4>
                            <p className="text-2xl font-black mt-1 text-stone-800">
                                {loading ? <Spinner /> : (paymentData?.TRX_PER_MIN.toLocaleString("en-PH", {minimumFractionDigits: 2}) ?? "0.00")}
                            </p>
                        </div>

                        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 p-6">
                            <GrTime className="rounded-2xl p-3 text-5xl bg-stone-100 text-stone-600 mb-4"/>
                            <h4 className="text-stone-400 font-black text-[10px] uppercase tracking-[0.2em]">TPM (Cash Out)</h4>
                            <p className="text-2xl font-black mt-1 text-stone-800">
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