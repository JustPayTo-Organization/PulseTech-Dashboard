import { useEffect, useState } from "react"; 
import { RiTimeLine } from "react-icons/ri";
import { PiHandDeposit } from "react-icons/pi";
import { LuGoal, LuHandCoins } from "react-icons/lu";
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
    // const todayStr = today.toISOString().split("T")[0];
    const [ overviewData, setOverviewData] = useState<overviewType | null>(null);
    // const [fromDate, setFromDate] = useState(today.toISOString().split("T")[0]);
    // const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);
    // const [appliedFromDate, setAppliedFromDate] = useState(todayStr);
    // const [appliedToDate, setAppliedToDate] = useState(todayStr);

    const formatted_date = today.toLocaleDateString("en-US", {
        month: "long",  // full month name
        day: "numeric",
        year: "numeric"
    });

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
            try{
                const res = await fetch(`${OVERVIEW_API_URL}/payment-page/overview`, {
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
    }, []);
    // }, [appliedFromDate, appliedToDate]);
    
    // Please check if need both cash in and cash out for the success transactions
    // const totalSuccessTransactions = (paymentData?.SUCCESS ?? 0) + (fundTransferData?.SUCCESS ?? 0);

    // Apply Filter for the dates

    // const handleApplyFilters = () => {
    //     setAppliedFromDate(fromDate);
    //     setAppliedToDate(toDate);
    // };

    // const handleClearFilters = () => {
    //     const todayStr = today.toISOString().split("T")[0];

    //     setAppliedFromDate(todayStr);
    //     setAppliedToDate(todayStr);

    //     // optional: also reset the inputs visually
    //     setFromDate(todayStr);
    //     setToDate(todayStr);
    // };

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
                    Welcome, <span className="text-transparent bg-clip-text bg-emerald-500">{clientName}</span>
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 font-bold text-xs uppercase tracking-widest text-center">
                    {error}
                </div>
            )}

            {/* Date Selector */}
            {/* <div className="flex flex-col md:flex-row gap-2 md:gap-5 lg:gap-5 xl:gap-8">
                <div> */}
                    {/* FROM DATE */}
                    {/* <div 
                        className="w-full sm:w-55 group relative flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/5 transition-all cursor-pointer"
                        onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.showPicker()}
                    >
                        <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <CiCalendar size={20} />
                        </div>
                        
                        <div className="flex">
                            <input 
                                type="date" 
                                value={fromDate}
                                max={new Date().toISOString().split("T")[0]} // Prevents future dates
                                onChange={(e) => setFromDate(e.target.value)}
                                className="text-sm font-black text-stone-700 bg-transparent outline-none cursor-pointer appearance-none"
                            />
                        </div> */}
                        
                        {/* Subtle decorative arrow */}
                        {/* <div className="text-stone-300 ml-auto">
                            <HiChevronDown size={16} />
                        </div>
                    </div>
                </div> */}

                {/* Separator */}
                {/* <div className="flex items-center justify-center text-sm font-semibold text-stone-400">
                    -
                </div> */}

                {/* <div> */}
                    {/* TO DATE */}
                    {/* <div 
                        className="w-full sm:w-55 group relative flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/5 transition-all cursor-pointer"
                        onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.showPicker()}
                    >
                        <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <CiCalendar size={20} />
                        </div>
                        
                        <div className="flex">
                            <input 
                                type="date" 
                                value={toDate}
                                max={new Date().toISOString().split("T")[0]} // Prevents future dates
                                onChange={(e) => setToDate(e.target.value)}
                                className="text-sm font-black text-stone-700 bg-transparent outline-none cursor-pointer appearance-none"
                            />
                        </div> */}
                        
                        {/* Subtle decorative arrow */}
                        {/* <div className="text-stone-300 ml-auto">
                            <HiChevronDown size={16} />
                        </div>
                    </div>
                </div> */}

                {/* Apply Button */}
                {/* <div className="flex items-center">
                    <button 
                        onClick={handleApplyFilters}
                        className="flex-1 md:flex-none bg-teal-500 text-white px-6 py-2 rounded-xl hover:bg-emerald-600 transition-all font-bold text-sm h-11 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                    >
                        Apply
                    </button>
                </div> */}

                {/* Clear Button */}
                {/* <div className="flex items-center">
                    <button 
                        onClick={handleClearFilters}
                        className="flex-1 md:flex-none flex items-center justify-center bg-white text-stone-600 px-4 py-2 rounded-xl border border-stone-100 hover:bg-stone-50 transition-all font-bold text-sm h-11 shadow-sm active:scale-[0.98]"
                    >
                       <RxCross2 className="mr-2"/>Clear
                    </button>
                </div>
            </div> */}
            

            {/* Overview */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10">

                <div>
                    {/* Last Login */}
                    <h3 className="text-slate-800 font-black mb-5 text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-teal-500 rounded-full"></span> Overview
                    </h3>
                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-6">
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 hover:border-teal-200 transition-all">
                            <RiTimeLine className="rounded-2xl p-3 text-5xl bg-blue-50 text-blue-600 mb-4"/>
                            <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Date</h4>
                            <p className="text-2xl font-black mt-1 text-slate-800">
                                {loading ? <Spinner /> : `${formatted_date}`}
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
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 hover:border-teal-200 transition-all">
                                <PiHandDeposit className="rounded-2xl p-3 text-5xl bg-red-50 text-red-600 mb-4"/>
                                <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Expected Settlement <span className="text-red-300">Date</span> </h4> 
                                <p className="text-2xl font-black mt-1 text-slate-800">
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
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 hover:border-teal-200 transition-all">
                            <LuGoal className="rounded-2xl p-3 text-5xl bg-green-100 text-green-500 mb-4"/>
                            <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Total Settled <span className="text-red-300">Date</span></h4>
                            <p className="text-2xl font-black mt-1 text-slate-800">
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
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 hover:border-teal-200 transition-all">
                                <LuHandCoins className="rounded-2xl p-3 text-5xl bg-teal-100 text-teal-500 mb-4"/>
                        <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">Today's Transactions</h4>
                        <p className="text-2xl font-black mt-1 text-slate-800">
                            {loading ? <Spinner/> : `${(overviewData?.total ?? 0)}`}
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