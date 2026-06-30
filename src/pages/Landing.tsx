import { useEffect, useState } from "react"; 
import { RiTimeLine } from "react-icons/ri";
import { PiHandDeposit } from "react-icons/pi";
import { LuGoal, LuHandCoins } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
// import { HiChevronDown } from "react-icons/hi";
import { CiCalendar } from "react-icons/ci";
import React from "react";
// import { VscGraph } from "react-icons/vsc";
// import { HiCash, HiChevronDown } from "react-icons/hi";
// import { CiCalendar } from "react-icons/ci";
// import { RxCross2 } from "react-icons/rx";

// interface Payment{
//     CLOSED: number;
//     COUNT: number;
//     FAILED: number;
//     PENDING: number;
//     SUCCESS: number;
//     TOTAL: number;
//     TRX_PER_MIN: number;
// }

// interface FundTransfer{
//     SUCCESS: number,
//     FAILED: number,
//     CLOSED: number,
//     PENDING:number,
//     COUNT:number,
//     TOTAL: number | null,
//     BALANCE: number
//     TRX_PER_MIN: number;
// }

type LandingProps = {
    clientName: string;
};

type overviewType = {
    expected: string;
    settled: string;
    total: string;
}

const Landing = ({ clientName }: LandingProps) => {
    const OVERVIEW_API_URL = import.meta.env.VITE_OVERVIEW_API_URL || import.meta.env.VITE_API_URL;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // const [paymentData, setPaymentData] = useState<Payment | null>(null);
    // const [fundTransferData, setFundTransferData] = useState<FundTransfer | null>(null);
    const today = new Date();
    // const [selectedDate, setSelectedDate] = useState(today.toISOString().split("T")[0]);
    const todayStr = today.toISOString().split("T")[0];
    const [ overviewData, setOverviewData] = useState<overviewType | null>(null);
    const [fromDate, setFromDate] = useState(today.toISOString().split("T")[0]);
    const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);
    const [appliedFromDate, setAppliedFromDate] = useState(todayStr);
    const [appliedToDate, setAppliedToDate] = useState(todayStr);
    
    // A helper function to format date strings
    const formatDateDisplay = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    };

    // Derive the label in the component body
    const dateDisplayConfig = (() => {
        if (!appliedFromDate || !appliedToDate) {
            return { text: "", className: "text-2xl lg:text-[15px] xl:text-2xl" };
        }
        
        // SCENARIO 0: Same exact day (Shortest text -> Largest font size)
        if (appliedFromDate === appliedToDate) {
            return {
                text: formatDateDisplay(appliedFromDate),
                className: "text-2xl lg:text-[15px] xl:text-2xl"
            };
        }

        const fromDateObj = new Date(appliedFromDate);
        const toDateObj = new Date(appliedToDate);

        const fromYear = fromDateObj.getFullYear();
        const toYear = toDateObj.getFullYear();
        const fromMonth = fromDateObj.toLocaleString('en-US', { month: 'short' });
        const toMonth = toDateObj.toLocaleString('en-US', { month: 'short' });
        const fromDay = fromDateObj.getDate();
        const toDay = toDateObj.getDate();

        // SCENARIO 1: Same Month, Same Year -> "June 23–30, 2026" (Small)
        if (fromYear === toYear && fromMonth === toMonth) {
            return {
                text: `${fromMonth} ${fromDay}–${toDay}, ${fromYear}`,
                className: "text-xl lg:text-[13px] xl:text-xl 2xl:text-2xl"
            };
        }

        // SCENARIO 2: Different Month, Same Year -> "Feb 4 – Jun 30, 2026" (Smaller)
        if (fromYear === toYear) {
            return {
                text: `${fromMonth} ${fromDay} – ${toMonth} ${toDay}, ${fromYear}`,
                className: "text-base lg:text-[11px] xl:text-base 2xl:text-xl"
            };
        }

        // SCENARIO 3: Different Years -> "Dec 30, 2026 – Jan 2, 2027" (Smallest)
        return {
            text: `${fromMonth} ${fromDay}, ${fromYear} – ${toMonth} ${toDay}, ${toYear}`,
            className: "text-xs lg:text-[10px] xl:text-sm 2xl:text-base"
        };
    })();
    // const formatDate = (date: string) =>
    //     new Date(date).toLocaleDateString("en-US", {
    //         month: "long",
    //         day: "numeric",
    // });

    // const labelDateSelected =
    //     appliedFromDate === todayStr && appliedToDate === todayStr
    //         ? "Today's"
    //         : appliedFromDate === appliedToDate
    //         ? `${formatDate(appliedFromDate)}`
    //         : `${formatDate(appliedFromDate)} – ${formatDate(appliedToDate)}`;
    
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            setError("Missing access token. Please login again.");
            setLoading(false);
            return;
        }
        const fetchAll = async () => {
            setLoading(true);
            setError("");
            // try {
            //     const [paymentRes, fundRes] = await Promise.all([
            //         fetch(`${API_URL}/dashboard/success-rate/payment?start=${todayStr}&end=${todayStr}`, {
            //             headers: { "Accept": "application/json", "Authorization": `Bearer ${accessToken}` },
            //         }),
            //         fetch(`${API_URL}/dashboard/success-rate/fund-transfer?start=${todayStr}&end=${todayStr}`, {
            //             headers: { "Accept": "application/json", "Authorization": `Bearer ${accessToken}` },
            //         }),
            //     ]);
                
            //     const paymentJson = await paymentRes.json();
            //     const fundJson = await fundRes.json();
                
            //     if (paymentJson?.detail || fundJson?.detail) {
            //         alert("Token Expired, Please log in again");
            //         localStorage.removeItem("accessToken");
            //         window.location.href = "/login"; 
            //         return;
            //     }

            //     if (paymentRes.status === 401 || fundRes.status === 401) {
            //         setError("Session expired. Please login again.");
            //         return;
            //     }

            //     if (!paymentRes.ok || !fundRes.ok) throw new Error("Failed to fetch dashboard data");

            //     setPaymentData(paymentJson);
            //     setFundTransferData(fundJson);
            // } 

            // Construct the query string: ?start=2026-06-01&end=2026-06-26
            const queryParams = new URLSearchParams({
                start: appliedFromDate,
                end: appliedToDate
            }).toString();
            
            try{
                const res = await fetch(`${OVERVIEW_API_URL}/payment-page/overview?${queryParams}`, {
                        method: "GET",
                        headers: { 
                            "Accept": "application/json", 
                            "Authorization": `Bearer ${accessToken}` 
                        },
                    });

                const overviewDataJson = await res.json();

                if (!overviewDataJson) {
                    alert("Token Expired, Please log in again");
                    localStorage.removeItem("accessToken");
                    window.location.href = "/login"; 
                    return;
                }

                if (!res.ok) throw new Error("Failed to fetch dashboard data");

                setOverviewData(overviewDataJson);
            }
            catch (err) {
                console.error(err);
                setError("Unable to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    // }, []);
    }, [appliedFromDate, appliedToDate]);
    
    // Please check if need both cash in and cash out for the success transactions
    // const totalSuccessTransactions = (paymentData?.SUCCESS ?? 0) + (fundTransferData?.SUCCESS ?? 0);

    // Apply Filter for the dates

    const handleApplyFilters = () => {
        setAppliedFromDate(fromDate);
        setAppliedToDate(toDate);
    };

    const handleClearFilters = () => {
        const todayStr = today.toISOString().split("T")[0];

        setAppliedFromDate(todayStr);
        setAppliedToDate(todayStr);

        // optional: also reset the inputs visually
        setFromDate(todayStr);
        setToDate(todayStr);
    };

    const Spinner = () => (
        <span className="inline-block w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
    );

    const [activeTab, setActiveTab] = useState<"all" | number | null> (null);
    
    const handleButtonDateFilter = (days: "all" | number) => {
        const today = new Date();
        const to = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        // Set which button is active
        setActiveTab(days);

        if (days === 'all') {
            setFromDate("");
            setToDate("");
        } else {
            const from = new Date();
            from.setDate(today.getDate() - days);
            setFromDate(from.toISOString().split('T')[0]);
            setToDate(to);
        }
    };
    
    const [dimensions, setDimensions] = React.useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
        });

        React.useEffect(() => {
        const handleResize = () => {
            setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative mt-12 lg:mt-0 p-4 md:p-8 bg-slate-50 min-h-screen font-sans overflow-hidden">
            {/* Screen Dimension Indicator */}
            <div className="fixed bottom-4 right-4 z-50 bg-slate-900/90 text-white font-mono text-[11px] px-3 py-1.5 rounded-full shadow-lg border border-slate-700 pointer-events-none tracking-wider">
                {dimensions.width}px × {dimensions.height}px
                <span className="ml-2 px-1 py-0.5 bg-teal-500 text-slate-950 font-bold rounded text-[9px] uppercase">
                    {dimensions.width >= 1536 ? '2xl' : dimensions.width >= 1280 ? 'xl' : dimensions.width >= 1024 ? 'lg' : dimensions.width >= 768 ? 'md' : dimensions.width >= 640 ? 'sm' : 'xs'}
                </span>
            </div>

            {/* Global Background Accents to match the new component colors */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-teal-100/30 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-purple-100/30 blur-[120px] pointer-events-none" />
            
            {/* Header */}
            <div className="relative z-10 mb-8 font-extrabold">
                <h1 className="text-2xl md:text-4xl font-black text-stone-700 tracking-tight">
                    Welcome, <span className="text-transparent bg-clip-text bg-emerald-500">{clientName}</span>
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 font-bold text-xs uppercase tracking-widest text-center">
                    {error}
                </div>
            )}

            {/* Date Selector */}
            <div className="flex flex-col lg:flex-row gap-3 w-full items-center">
                {/* Filter Inputs Container */}
                <div className="flex flex-nowrap overflow-x-auto pb-2 md:pb-0 md:flex-wrap lg:flex-nowrap lg:flex-[5] gap-3 w-full scrollbar-hide items-center">
                    
                    {/* QUICK FILTERS */}
                    <div className="flex gap-2 min-w-max lg:flex-none">
                        <button
                            onClick={() => handleButtonDateFilter(7)}
                            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all border ${
                                activeTab === 7
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                            }`}
                        >
                            Last 7 Days
                        </button>

                        <button
                            onClick={() => handleButtonDateFilter(20)}
                            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all border ${
                                activeTab === 20
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                            }`}
                        >
                            Last 20 Days
                        </button>
                    </div>

                    {/* FROM DATE */}
                    <div
                        className="relative min-w-35 md:flex-1 lg:flex-[1.5]"
                        onClick={(e) => {
                            if ((e.target as HTMLElement).tagName !== "INPUT") {
                                const input = (e.currentTarget.querySelector("input") as HTMLInputElement);
                                input?.showPicker?.();
                            }
                        }}
                    >
                        <span className="absolute inset-y-0 left-2.5 flex items-center text-emerald-400">
                            <CiCalendar size={18} />
                        </span>
                        <input
                            type="date"
                            value={fromDate}
                            max={toDate || new Date().toISOString().split("T")[0]}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full border border-stone-200 rounded-xl pl-9 px-2 py-2 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none text-stone-600 transition-all font-semibold"
                        />
                    </div>

                    {/* TO DATE */}
                    <div
                        className="relative min-w-35 md:flex-1 lg:flex-[1.5]"
                        onClick={(e) => {
                            if ((e.target as HTMLElement).tagName !== "INPUT") {
                                const input = (e.currentTarget.querySelector("input") as HTMLInputElement);
                                input?.showPicker?.();
                            }
                        }}
                    >
                        <span className="absolute inset-y-0 left-2.5 flex items-center text-emerald-400">
                            <CiCalendar size={18} />
                        </span>
                        <input
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full border border-stone-200 rounded-xl pl-9 px-2 py-2 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none text-stone-600 transition-all font-semibold"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex md:flex w-full md:w-full lg:flex-[2] gap-2 items-center border-t lg:border-t-0 pt-3 lg:pt-0 border-stone-100">
                    <button
                        onClick={handleApplyFilters}
                        className="bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-all font-bold text-sm h-10 shadow-lg shadow-emerald-500/20 active:scale-[0.98] w-full lg:flex-1"
                    >
                        Filter
                    </button>

                    <button
                        onClick={handleClearFilters}
                        className="text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 transition-colors px-4 py-2 rounded-xl font-bold text-sm h-10 flex items-center justify-center gap-1 w-full lg:flex-1"
                    >
                        <RxCross2 /> Clear
                    </button>
                </div>
            </div>
            

            {/* Overview */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10">

                <div>
                    {/* Last Login */}
                    <h3 className="text-slate-800 font-black mb-5 text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-teal-500 rounded-full"></span> Overview
                    </h3>
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-6">
                        {/* Added 'min-h-[156px] flex flex-col justify-between' to match typical height of the other cards */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 hover:border-teal-200 transition-all min-h-[156px] flex flex-col justify-between">
                            <div>
                                <RiTimeLine className="rounded-2xl p-3 text-5xl bg-blue-50 text-blue-600 mb-4 flex-shrink-0"/>
                                <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Date</h4>
                            </div>
                            
                            {/* The text sizing classes are now injected straight from our config object */}
                            <p className={`font-black mt-1 text-slate-800 whitespace-nowrap overflow-visible tracking-tight leading-7 ${dateDisplayConfig.className}`}>
                                {loading ? <Spinner /> : dateDisplayConfig.text}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    {/* Expected Settlement */}
                    <h3 className="text-slate-800 font-black mb-0 sm:mb-5 text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-6 rounded-full"></span>
                    </h3>
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-6">
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 hover:border-teal-200 transition-all min-h-[156px] flex flex-col justify-between">
                            <div>
                                <PiHandDeposit className="rounded-2xl p-3 text-5xl bg-red-50 text-red-600 mb-4"/>
                                <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Expected Settlement</h4> 
                            </div>
                            <p className="text-2xl font-black mt-1 text-slate-800 leading-7">
                                {loading ? <Spinner /> : `₱${(overviewData?.expected ?? 0).toLocaleString("en-PH", {minimumFractionDigits: 2})}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Total Settled */}
                <div>
                    <h3 className="text-slate-800 font-black mb-0 sm:mb-5 text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-6 rounded-full"></span>
                    </h3>
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-6">
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 hover:border-teal-200 transition-all min-h-[156px] flex flex-col justify-between">
                            <div>
                                <LuGoal className="rounded-2xl p-3 text-5xl bg-green-100 text-green-500 mb-4"/>
                                <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Total Settled</h4>
                            </div>
                            <p className="text-2xl font-black mt-1 text-slate-800 leading-7">
                                {loading ? <Spinner /> : `₱${(overviewData?.settled ?? 0).toLocaleString("en-PH", {minimumFractionDigits: 2}) ?? "0.00"}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Total Since */}
                <div>
                    <h3 className="text-slate-800 font-black mb-0 sm:mb-5 text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-6 rounded-full"></span>
                    </h3>
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-6">
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 hover:border-teal-200 transition-all min-h-[156px] flex flex-col justify-between">
                            <div>
                                <LuHandCoins className="rounded-2xl p-3 text-5xl bg-teal-100 text-teal-500 mb-4"/>
                                <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">Today's Transactions</h4>
                            </div>
                            <p className="text-2xl font-black mt-1 text-slate-800 leading-7">
                                ₱{loading ? <Spinner/> : `${(overviewData?.total ?? 0).toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}`}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
            
            {/* Transactions */}
            {/* <div className="mt-15">
                <h3 className="text-slate-800 font-black mb-5 text-sm uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span> Transactions
                </h3>
            
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> */}
                     {/*Successful Transactions */}
                    {/* <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 flex-1 hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <div className="bg-teal-100 p-3 rounded-2xl text-teal-600">
                                <LuHandCoins size={24}/>
                            </div>
                        </div>
                        <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{labelDateSelected} Successful Transactions</h4>
                        <p className="text-2xl font-black mt-1 text-slate-800">
                            {loading ? <Spinner/> : `${(totalSuccessTransactions ?? "0.00").toLocaleString("en-PH")}`}
                        </p>
                    </div> */}

                     {/*Today's Volume*/}
                    {/* <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 flex-1 hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <div className="bg-purple-100 p-3 rounded-2xl text-purple-600">
                                <HiCash size={24}/>
                            </div>

                        </div>
                        <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{labelDateSelected} Total</h4>
                        <p className="text-2xl font-black mt-1 text-slate-800">
                            {loading ? <Spinner /> : `₱${(paymentData?.TOTAL ?? 0).toLocaleString("en-PH", {minimumFractionDigits: 2})}`}
                        </p>
                    </div> */}
                {/* </div>
            </div> */}

        </div>
    );
};

export default Landing;