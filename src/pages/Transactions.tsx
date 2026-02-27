import React, { useEffect, useState, useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import { CiCalendar } from "react-icons/ci";
import { HiChevronDown } from "react-icons/hi";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight, MdKeyboardArrowRight, MdKeyboardArrowLeft} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { addDownloadJob, getAllJobs, type DownloadJob } from "../components/database/db";

export interface Transaction {
    amount: number;
    created_at: string;
    error?: string;
    fees: number;
    instapay_reference: string;
    merchant_id: string;
    paid_at: string;
    reference_id: string;
    status: "SUCCESS" | "PENDING" | "FAILED" | "CLOSED";
    transaction_id: string;
    type: "PAYMENT" | "FUND_TRANSFER";
}

const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "N/A"; // fallback for empty or null values
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A"; // invalid date
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${day} ${h}:${min}:${s}`;
};

// const dummyTransactions: Transaction[] = Array.from({ length: 50 }, (_, i) => {
//     const transactionDate = new Date();

//     // Random number of minutes between 60 and 120 (1-2 hours)
//     const randomMinutes = 60 + Math.floor(Math.random() * 61);
//     const processedDate = new Date(transactionDate.getTime() + randomMinutes * 60 * 1000);

//     return {
//         id: `TXN-${1000 + i}`,
//         reference: `REF-${2000 + i}`,
//         qrphReference: `QR-${3000 + i}`,
//         amount: Math.floor(Math.random() * 5000) + 100,
//         type: Math.random() > 0.5 ? "Cash In" : "Cash Out",
//         status: ["Success", "Pending", "Failed", "Closed"][Math.floor(Math.random() * 4)] as Transaction["status"],
//         description: "Sample transaction",
//         transactionDate: transactionDate.toISOString(),
//         processedDate: processedDate.toISOString(),
//     };
// });

const Transactions: React.FC = () => {
    
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const [_transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [_error, setError] = useState<string | null>(null);
    const [totalItems, setTotalItems] = useState(0);
    const [statusInput, setStatusInput] = useState("");
    const [typeInput, setTypeInput] = useState("");
    const [notification, setNotification] = useState<string | null>(null);
    const downloadDropdownRef = useRef<HTMLDivElement | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const [dateInput, setDateInput] = useState(today);

    const [appliedStatus, setAppliedStatus] = useState("");
    const [appliedType, setAppliedType] = useState("");
    const [appliedDate, setAppliedDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [_downloadQueue, _setDownloadQueue] = useState<DownloadJob[]>([]);
    const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const openModal = (tx: Transaction) => {
        setSelectedTransaction(tx);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedTransaction(null);
    };

    const handleQueueDownload = async () => {
        if (isDownloading || currentTransactions.length === 0) return;

        setIsDownloading(true);
        const jobId = `job-${Date.now()}`;
        const job: DownloadJob = {
            id: jobId,
            name: `transactions_page_${currentPage}_${new Date().toISOString().slice(0,10)}.xlsx`,
            status: "queued",
            progress: 0,
            transactions: [..._transactions],
            createdAt: new Date().toISOString(),
        };

        // Save job to IndexedDB
        await addDownloadJob(job);
        _setDownloadQueue( await getAllJobs());

        setNotification(`Download queued: ${job.name}`);
        setTimeout(() => setNotification(null), 4000);
    };


    const handleApplyFilters = () => {
        setAppliedStatus(statusInput);
        setAppliedType(typeInput);
        setAppliedDate(dateInput);
        setCurrentPage(1);
    };

    // NOTE:
    // Replace dummyTransactions with _transactions if using api response
    // const filteredTransactions = _transactions.filter((tx) => {
    //     const allowedType = tx.type === "PAYMENT" || tx.type === "FUND_TRANSFER";
    //     const statusUpper = tx.status.toUpperCase(); 
    //     const matchesStatus = appliedStatus ? statusUpper === appliedStatus : true;
    //     const matchesType = appliedType ? tx.type === appliedType : true;
    //     const matchesDate = appliedDate ? tx.created_at.includes(appliedDate) : true;
    //     return allowedType && matchesStatus && matchesType && matchesDate;
    // });

    // const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / rowsPerPage));
    // const currentTransactions = filteredTransactions.slice(
    // (currentPage - 1) * rowsPerPage,
    // currentPage * rowsPerPage
    // );
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    const currentTransactions = _transactions.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const getStatusClass = (status: string) => {
        switch (status) {
        case "SUCCESS":
            // Moss green tones
            return "bg-emerald-50 text-emerald-800 border-emerald-200/60";
        case "PENDING":
            // Earthy Amber
            return "bg-orange-50 text-orange-800 border-orange-200/60";
        case "FAILED":
            // Muted Terracotta
            return "bg-red-50 text-red-800 border-red-200/60";
        case "CLOSED":
            // Stone Gray
            return "bg-stone-100 text-stone-600 border-stone-200/60";
        default:
            return "";
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();

            params.append("start", appliedDate || new Date().toISOString().slice(0, 10));
            params.append("end", appliedDate || new Date().toISOString().slice(0, 10));
            // params.append("page", (currentPage - 1).toString());
            // params.append("limit", rowsPerPage.toString());
            
            // Conditionally include optional params
            if (appliedStatus) params.append("status", appliedStatus);
            if (typeInput) params.append("transaction_type", typeInput.toLowerCase());

            // const params = new URLSearchParams({
            //     status: appliedStatus || "",      // empty string if no filter
            //     start: appliedDate || new Date().toISOString().slice(0,10), // fallback today
            //     end: appliedDate || new Date().toISOString().slice(0,10),
            //     page: (currentPage - 1).toString(),
            //     limit: rowsPerPage.toString(),
            //     transaction_type: typeInput.toLowerCase() || ""
            // });

            const token = localStorage.getItem("accessToken"); // or from cookie
            const res = await fetch(`${API_URL}/dashboard/transactions?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });

            if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Failed to fetch transactions");
            }

            const data = await res.json();

            // If your API returns { items, total } structure:
            setTransactions(data.items ?? data); 
            setTotalItems(data.total ?? data.length);
        } catch (err: unknown) {
            if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Unknown error");
        }
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setStatusInput(""); 
        setTypeInput(""); 
        setDateInput(today);
        setAppliedStatus(""); 
        setAppliedType(""); 
        setAppliedDate(today);
        setCurrentPage(1);
    }
    useEffect(() => {
        fetchTransactions();
    }, [appliedStatus, appliedType, appliedDate, rowsPerPage]); //removed currentPage

    const Spinner = () => (
        // Changed to forest green t-color
        <span className="inline-block w-8 h-8 border-4 border-stone-200 border-t-emerald-800 rounded-full animate-spin mx-auto" />
    );
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                downloadDropdownRef.current &&
                !downloadDropdownRef.current.contains(event.target as Node)
            ) {
                setDownloadMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        
        // Background changed to a warm 'stone' white to compliment dark green
        <div className="md:mt-12 lg:mt-0 p-4 md:p-8 bg-stone-50 h-full flex flex-col overflow-hidden">
            {notification && (
                <div className="fixed top-6 right-6 z-60 min-w-[320px] max-w-md animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="bg-white border border-stone-200 rounded-xl shadow-2xl overflow-hidden flex items-stretch">
                        {/* Forest Green Accent Bar */}
                        <div className="w-1.5 bg-emerald-900" />
                        
                        <div className="p-4 flex flex-1 items-start gap-3">
                            <div className="shrink-0 mt-0.5 bg-emerald-50 text-emerald-800 p-1.5 rounded-full">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <div className="flex-1 mr-4">
                                <h3 className="text-sm font-bold text-stone-800">System Notification</h3>
                                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                                    {notification}
                                </p>
                            </div>

                            <button 
                                onClick={() => setNotification(null)}
                                className="text-stone-400 hover:text-stone-600 transition-colors"
                            >
                                <RxCross2 size={18} />
                            </button>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 h-1 bg-stone-100 w-full">
                            <div 
                                className="h-full bg-emerald-800 origin-left" 
                                style={{ 
                                    animation: 'shrink 4000ms linear forwards' 
                                }} 
                            />
                            <style>{`
                                @keyframes shrink {
                                    from { transform: scaleX(1); }
                                    to { transform: scaleX(0); }
                                }
                            `}</style>
                        </div>
                    </div>
                </div>
            )}
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-black text-emerald-950 order-2 md:order-1 mt-12 md:mt-0 md:self-start tracking-tight">Transactions</h1>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-3 md:p-5 rounded-xl shadow-sm border border-stone-200 mb-4 md:mb-6">
            <div className="flex flex-col xl:flex-row gap-3 md:gap-4">
                
                <div className="flex flex-nowrap overflow-x-auto pb-2 md:pb-0 md:flex-wrap lg:flex-row gap-3 flex-1 scrollbar-hide">
                    
                    {/* Date Input*/}
                    <div className="relative min-w-35 md:flex-1"
                        onClick={(e) => {
                            if ((e.target as HTMLElement).tagName !== "INPUT") {
                                const input = (e.currentTarget.querySelector("input") as HTMLInputElement);
                                input?.showPicker?.();
                            }
                        }}
                    >
                        <span className="absolute inset-y-0 left-3 flex items-center text-stone-400">
                            <CiCalendar size={18} />
                        </span>
                        <input
                            type="date"
                            value={dateInput}
                            onChange={(e) => setDateInput(e.target.value)}
                            className="w-full border border-stone-200 rounded-lg pl-10 px-3 py-2.5 text-sm focus:ring-4 focus:ring-emerald-50 focus:border-emerald-800 outline-none transition-all text-stone-700"
                        />
                    </div>

                    {/* Status Select*/}
                    <div className="relative min-w-32.5 md:flex-1">
                        <select
                            value={statusInput}
                            onChange={(e) => setStatusInput(e.target.value)}
                            className="w-full appearance-none border border-stone-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-4 focus:ring-emerald-50 focus:border-emerald-800 outline-none bg-white transition-all text-stone-700 font-medium"
                        >
                            <option value="">All Status</option>
                            <option value="SUCCESS">Success</option>
                            <option value="PENDING">Pending</option>
                            <option value="CLOSED">Closed</option>
                            <option value="FAILED">Failed</option>
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-400">
                            <HiChevronDown size={14} />
                        </span>
                    </div>

                    {/* Type Select */}
                    <div className="relative min-w-32.5 md:flex-1">
                        <select
                            value={typeInput}
                            onChange={(e) => setTypeInput(e.target.value)}
                            className="w-full appearance-none border border-stone-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-4 focus:ring-emerald-50 focus:border-emerald-800 outline-none bg-white transition-all text-stone-700 font-medium"
                        >
                            <option value="">All Types</option>
                            <option value="PAYMENT">Cash in</option>
                            <option value="FUND-TRANSFER">Cash out</option>
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-400">
                            <HiChevronDown size={14} />
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:flex md:flex-1 xl:flex-1 gap-2 items-center border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">

                    <button
                        onClick={handleApplyFilters}
                        className="bg-emerald-900 text-stone-50 px-4 py-2.5 rounded-lg hover:bg-emerald-950 active:transform active:scale-95 transition-all font-bold text-sm h-11 shadow-md w-full md:flex-1"
                    >
                        Filter
                    </button>

                    <button
                        onClick={handleClearFilters}
                        className="text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-all px-4 py-2.5 rounded-lg font-bold text-sm h-11 flex items-center justify-center gap-2 w-full md:flex-1"
                    >
                        <RxCross2 /> Clear
                    </button>

                    <div ref={downloadDropdownRef} className="relative col-span-2 w-full md:flex-1">
                        <button
                            onClick={() => setDownloadMenuOpen(prev => !prev)}
                            className="relative w-full bg-stone-800 hover:bg-black text-white px-4 py-2.5 rounded-lg shadow-sm transition-all font-bold text-sm h-11 flex justify-center items-center"
                        >
                            <span>Download</span>
                            <HiChevronDown size={16} className="absolute right-4 md:right-2 lg:right-4" />
                        </button>

                        {downloadMenuOpen && (
                            <div className="absolute right-0 top-full mb-2 md:bottom-auto md:mt-2 w-full bg-white border border-stone-200 rounded-xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    disabled={isDownloading}
                                    onClick={() => { handleQueueDownload(); setDownloadMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 text-sm font-bold ${
                                        isDownloading
                                            ? "opacity-50 cursor-not-allowed text-stone-300"
                                            : "hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                                    }`}
                                >
                                    Queue Download
                                </button>
                                <button
                                    onClick={() => navigate("/download-queue")}
                                    className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                                >
                                    View Queue
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-auto bg-white rounded-xl shadow-sm border border-stone-200">
            <table className="min-w-full divide-y divide-stone-100">
            <thead className="bg-stone-50/80">
                <tr>
                {["Transaction ID", "Reference", "Instapay Ref", "Amount", "Type", "Status", "Created", "Paid"].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-[11px] font-black text-stone-500 uppercase tracking-widest whitespace-nowrap">{header}</th>
                ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-100 text-[13px]">
            {loading ? 
            (
                <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                    <Spinner/>
                </td>
                </tr>
            )
            : _error ? (
                <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-red-800 font-bold bg-red-50/30">
                        Invalid Token, Please Log in Again
                    </td>
                </tr>
            ) :
            currentTransactions.length > 0 ? (
                currentTransactions.map((tx) => (
                <tr key={tx.transaction_id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 text-stone-400 font-mono text-[11px] whitespace-nowrap">{tx.transaction_id ?? "N/A"}</td>
                    <td className="px-6 py-4 font-bold text-stone-700">{tx.reference_id}</td>
                    <td className="px-6 py-4 text-stone-500 font-medium">{tx.instapay_reference}</td>
                    <td className={`px-6 py-4 font-black text-base ${tx.type === "PAYMENT" ? "text-emerald-700" : "text-red-700"}`}>
                    {tx.type === "PAYMENT" ? "+" : "-"}₱{tx.amount.toLocaleString("en-PH")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-stone-500 uppercase text-[10px] tracking-wider">{tx.type === "PAYMENT" ? "Cash in" : "Cash out"}</td>
                    <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[10px] leading-5 font-black rounded-full border shadow-sm ${getStatusClass(tx.status)}`}>
                        {tx.status}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-stone-400">{formatDateTime(tx.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-stone-400">{formatDateTime(tx.paid_at)}</td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-stone-400 font-medium">
                    No transactions found in this period.
                </td>
                </tr>
            )}
            </tbody>

            </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex-1 overflow-y-auto space-y-4">
        {loading ? (
            <div className="flex justify-center py-12">
                <Spinner />
            </div>
        ) : _error ? (
            <div className="text-center py-12 text-red-800 font-bold">
                Invalid Token, Please Log in Again
            </div>
        ) : currentTransactions.map((tx) => (
            <div key={tx.transaction_id} className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 active:bg-stone-50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div>
                    <p className="text-[10px] text-stone-400 font-mono tracking-widest mb-1">{tx.transaction_id}</p>
                    <p className="font-black text-stone-800 tracking-tight">{tx.instapay_reference}</p>
                    </div>

                    <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full border shadow-sm ${getStatusClass(tx.status)}`}>
                        {tx.status}
                    </span>

                    <button
                        onClick={() => openModal(tx)}
                        className="p-2 text-stone-400 hover:text-emerald-900 bg-stone-50 rounded-full"
                    >
                        <MdKeyboardArrowRight size={20} />
                    </button>
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div className="text-xs">
                    <p className="font-black text-stone-500 uppercase text-[10px] mb-1">{tx.type === "PAYMENT" ? "Cash in" : "Cash out"}</p>
                    <p className="text-[10px] text-stone-400 font-medium">{new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                    <p className={`text-xl font-black tracking-tighter ${tx.type === "PAYMENT" ? "text-emerald-700" : "text-red-700"}`}>
                    {tx.type === "PAYMENT" ? "+" : "-"}₱{tx.amount.toLocaleString("en-PH")}
                    </p>
                </div>
            </div>
        ))}
        </div>

        {modalOpen && selectedTransaction && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-stone-900/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-stone-200">
                
                <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                    <div>
                        <h2 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em]">Transaction Record</h2>
                    </div>
                    <button
                        onClick={closeModal}
                        className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 transition-all"
                    >
                        <RxCross2 size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="text-center mb-10">
                        <p className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2">Total Amount</p>
                        <div className={`text-4xl font-black tracking-tighter ${selectedTransaction.type === "PAYMENT" ? "text-emerald-800" : "text-stone-900"}`}>
                            {selectedTransaction.type === "PAYMENT" ? "+" : "-"}₱{selectedTransaction.amount.toLocaleString()}
                        </div>
                        <div className="mt-4 flex justify-center">
                            <span className={`px-5 py-1.5 rounded-full text-[11px] font-black border shadow-sm ${getStatusClass(selectedTransaction.status)}`}>
                                {selectedTransaction.status}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: "Reference ID", value: selectedTransaction.reference_id },
                            { label: "Instapay Reference", value: selectedTransaction.instapay_reference || "N/A" },
                            { label: "Transaction Type", value: selectedTransaction.type === "PAYMENT" ? "Cash in": "Cash out"},
                            { label: "Created At", value: formatDateTime(selectedTransaction.created_at) },
                            { label: "Paid At", value: formatDateTime(selectedTransaction.paid_at) },
                        ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start group border-b border-stone-50 pb-2">
                                <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider">{item.label}</span>
                                <span className="text-xs font-bold text-stone-700 text-right max-w-[200px] break-all font-mono">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-6 border-t border-stone-100">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-black text-stone-300 uppercase tracking-[0.3em]">System Tracking ID</span>
                            <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg select-all border border-stone-100">
                                {selectedTransaction.transaction_id}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
)}

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4 border-t border-stone-200 pt-6 pb-6">
                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm">
                    <span className="text-[11px] font-black text-stone-400 uppercase">Per Page:</span>
                    <select
                        value={rowsPerPage}
                        onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-transparent rounded px-1 py-0.5 text-xs font-black text-emerald-900 outline-none cursor-pointer"
                    >
                        {[25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 border border-stone-200 rounded-xl disabled:opacity-30 bg-white hover:bg-stone-50 text-stone-600 transition-all shadow-sm"><MdKeyboardDoubleArrowLeft size={20}/></button>
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border border-stone-200 rounded-xl disabled:opacity-30 bg-white hover:bg-stone-50 text-stone-600 transition-all shadow-sm"><MdKeyboardArrowLeft size={20}/></button>
                    </div>
                    
                    <div className="text-xs font-black text-stone-500 bg-stone-100 px-5 py-2 rounded-full min-w-36 text-center tracking-tighter">
                        {totalItems === 0 ? "0-0 of 0" :
                            `${(currentPage - 1) * rowsPerPage + 1} — ${Math.min(currentPage * rowsPerPage, totalItems)} of ${totalItems}`}
                    </div>

                    <div className="flex gap-1.5">
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border border-stone-200 rounded-xl disabled:opacity-30 bg-white hover:bg-stone-50 text-stone-600 transition-all shadow-sm"><MdKeyboardArrowRight size={20}/></button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 border border-stone-200 rounded-xl disabled:opacity-30 bg-white hover:bg-stone-50 text-stone-600 transition-all shadow-sm"><MdKeyboardDoubleArrowRight size={20}/></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transactions;