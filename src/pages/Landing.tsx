import React, { useEffect, useState } from "react"; 
import GlowBackground from "../components/ui/GlowBackground";
import { GoArrowUpRight, GoArrowDownLeft } from "react-icons/go";
import { RiTimeLine } from "react-icons/ri";
import { GrTime } from "react-icons/gr";
// import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
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

    // Hiding the balance
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);

    // Loading states
    const [loading, setLoading] = useState(true);

    // Error states
    const [error, setError] = useState("");

    const [paymentData, setPaymentData] = useState<Payment | null>(null);
    const [fundTransferData, setFundTransferData] = useState<FundTransfer | null>(null);
    
    const formattedBalance =
    fundTransferData
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
                    fetch(
                        `${API_URL}/dashboard/success-rate/payment?start=${today}&end=${today}`,
                        {
                            headers: {
                                "Accept": "application/json",
                                "Authorization": `Bearer ${accessToken}`,
                            },
                        }
                    ),
                    fetch(
                        `${API_URL}/dashboard/success-rate/fund-transfer?start=${today}&end=${today}`,
                        {
                            headers: {
                                "Accept": "application/json",
                                "Authorization": `Bearer ${accessToken}`,
                            },
                        }
                    ),
                ]);
                
                const paymentJson = await paymentRes.json();
                const fundJson = await fundRes.json();
                
                 // Check for API errors
                const paymentError = paymentJson?.detail;
                const fundError = fundJson?.detail;

                if (paymentError || fundError) {
                    const errorMessage = "Token Expired, Please log in again";

                    // Show alert
                    alert(errorMessage);

                    // Clear local storage and redirect/log out
                    localStorage.removeItem("accessToken");
                    // Optionally redirect to login page
                    window.location.href = "/login"; 
                    return;
                }

                if (paymentRes.status === 401 || fundRes.status === 401) {
                    setError("Session expired. Please login again.");
                    return;
                }

                if (!paymentRes.ok || !fundRes.ok) {
                    throw new Error("Failed to fetch dashboard data");
                }

                

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
    
    // 
    // Loading
    // 

    const Spinner = () => (
        <span className="inline-block w-8 h-8 border-4 border-white/30 border-t-blue-300 rounded-full animate-spin" />
    );

    return (
        <div className="mt-12 lg:mt-0 p-4 md:p-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-slate-800">Welcome, Client</h1>
            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
                    {error}
                </div>
            )}
            {/* Top Section: Balance + Quick Stats */}
            <div className="flex flex-col lg:flex-row items-start gap-6">
                
                
                {/* Big Balance Card */}
                <div className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 md:p-8 w-full lg:basis-[78%]">   
                    <GlowBackground/>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between text-white">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/10 p-3 rounded">
                                    <FaWallet className="text-teal-400"/>
                                </div>
                                <h2 className="text-white/80 font-medium text-base md:text-lg">
                                    Total Balance
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBalanceVisible((prev) => !prev)}
                                className="text-white hover:opacity-80 transition p-1"
                            >
                                {isBalanceVisible ? <IoEyeOutline size={22} /> : <IoEyeOffOutline size={22} />}
                            </button>
                        </div>
                        <div className="mt-4">
                            <p className="text-white text-3xl md:text-5xl font-bold tracking-tight ">
                                {loading ? (
                                    <Spinner />
                                ) : isBalanceVisible ? (
                                    formattedBalance
                                ) : (
                                    hiddenBalance
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Column */}
                <div className="w-full lg:basis-[22%] flex flex-col md:flex-row lg:flex-col gap-4">
                    {/* Stat 1 */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <GoArrowDownLeft className="rounded-lg p-2 text-4xl bg-purple-100 text-purple-600"/>
                            {/* <div className="flex text-green-500 items-center gap-1 text-sm font-medium">
                                <FaArrowTrendUp/>
                                <span>Active</span>
                            </div> */}
                        </div>
                        <h4 className="text-gray-500 font-medium text-xs uppercase tracking-wider">Trans. / min</h4>
                        <p className="text-2xl font-bold mt-1 text-slate-800">
                            {loading ? (
                                <Spinner />
                            ) : (totalTPM ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            }
                        </p>
                    </div>

                    {/* Stat 2 */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <MdRepeatOne className="rounded-lg p-2 text-4xl bg-blue-100 text-blue-600"/>
                        </div>
                        <h4 className="text-gray-500 font-medium text-xs uppercase tracking-wider">Today's Transactions</h4>
                        <p className="text-2xl font-bold mt-1 text-slate-800">
                            { loading 
                                ? (
                                    <Spinner/>
                                ) 
                                : (totalTransactions ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Summary + Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                {/* Summary Section */}
                <div>
                    <h3 className="text-slate-800 font-bold mb-4 text-lg">Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {/* Cash In */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <GoArrowDownLeft className="rounded-lg p-2 text-4xl bg-emerald-100 text-emerald-600"/>
                                {/* <div className="flex text-green-500 items-center gap-1 text-sm">
                                    <FaArrowTrendUp/>
                                    <p>+12.5%</p>
                                </div> */}
                            </div>
                            <h4 className="text-gray-500 font-medium text-sm">Cash In</h4>
                            <p className="text-2xl font-bold mt-1 text-slate-800">₱
                                {loading ? (
                                    <Spinner />
                                ) : (paymentData?.TOTAL ?? 0).toLocaleString("en-PH", {minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                }
                            </p>
                        </div>

                        {/* Cash Out */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <GoArrowUpRight className="rounded-lg p-2 text-4xl bg-red-100 text-red-600"/>
                                {/* <div className="flex text-red-500 items-center gap-1 text-sm">
                                    <FaArrowTrendDown/>
                                    <p>-3.4%</p>
                                </div> */}
                            </div>
                            <h4 className="text-gray-500 font-medium text-sm">Cash Out</h4>
                            <p className="text-2xl font-bold mt-1 text-slate-800">₱
                                {loading ? (
                                    <Spinner />
                                ) : (fundTransferData?.TOTAL ?? 0).toLocaleString("en-PH" , {minimumFractionDigits:2 , maximumFractionDigits: 2})
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metrics Section */}
                <div>
                    <h3 className="text-slate-800 font-bold mb-4 text-lg">Metrics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <RiTimeLine className="rounded-lg p-2 text-4xl bg-amber-100 text-amber-600"/>
                            <h4 className="text-gray-500 font-medium text-sm mt-4">TPM (Cash In)</h4>
                            <p className="text-2xl font-bold mt-1 text-slate-800">
                                {loading ? (
                                    <Spinner />
                                ) : (paymentData?.TRX_PER_MIN.toLocaleString("en-PH", {minimumFractionDigits: 2, maximumFractionDigits: 2}) ?? 0)
                                }
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <GrTime className="rounded-lg p-2 text-4xl bg-indigo-100 text-indigo-600"/>
                            <h4 className="text-gray-500 font-medium text-sm mt-4">TPM (Cash Out)</h4>
                            <p className="text-2xl font-bold mt-1 text-slate-800">
                                {loading ? (
                                    <Spinner />
                                ) : (fundTransferData?.TRX_PER_MIN ?? 0).toLocaleString("en-PH", {minimumFractionDigits: 2 , maximumFractionDigits: 2 })
                                }
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Landing;