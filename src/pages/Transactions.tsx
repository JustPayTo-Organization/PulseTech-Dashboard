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
            return "bg-green-100 text-green-700 border-green-400";
        case "PENDING":
            return "bg-blue-100 text-blue-700 border-blue-400";
        case "FAILED":
            return "bg-red-100 text-red-700 border-red-400";
        case "CLOSED":
            return "bg-gray-100 text-gray-700 border-gray-400";
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
        <span className="inline-block w-8 h-8 border-4 border-white/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
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
        
        <div className="md:mt-12 lg:mt-0 p-4 md:p-8 bg-slate-50 h-full flex flex-col overflow-hidden">
            {notification && (
                <div className="fixed top-6 right-6 z-60 min-w-[320px] max-w-md animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex items-stretch">
                        {/* Success Accent Bar */}
                        <div className="w-1.5 bg-emerald-500" />
                        
                        <div className="p-4 flex flex-1 items-start gap-3">
                            {/* Success Icon */}
                            <div className="shrink-0 mt-0.5 bg-emerald-100 text-emerald-600 p-1.5 rounded-full">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            {/* Content */}
                            <div className="flex-1 mr-4">
                                <h3 className="text-sm font-bold text-slate-800">Success</h3>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    {notification}
                                </p>
                            </div>

                            {/* Manual Close Button */}
                            <button 
                                onClick={() => setNotification(null)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <RxCross2 size={18} />
                            </button>
                        </div>
                        
                        {/* Subtle Progress Bar */}
                        <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/10 w-full">
                            <div 
                                className="h-full bg-emerald-500 origin-left" 
                                style={{ 
                                    animation: 'shrink 4000ms linear forwards' 
                                }} 
                            />
                            {/* This style block defines the 'shrink' keyframe locally */}
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
            <h1 className="text-2xl md:text-3xl font-bold order-2 md:order-1 mt-12 md:mt-0 md:self-start">Transactions</h1>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow mb-4 md:mb-6">
            <div className="flex flex-col xl:flex-row gap-3 md:gap-4">
                
                {/* Scrollable Filter Row on Mobile */}
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
                        <span className="absolute inset-y-0 left-2.5 flex items-center text-gray-400">
                            <CiCalendar size={18} />
                        </span>
                        <input
                            type="date"
                            value={dateInput}
                            onChange={(e) => setDateInput(e.target.value)}
                            className="w-full border border-black/20 rounded-md pl-9 px-2 py-2 text-sm focus:ring-2 focus:ring-cyan-500/20 outline-none"
                        />
                    </div>

                    {/* Status Select*/}
                    <div className="relative min-w-32.5 md:flex-1">
                        <select
                            value={statusInput}
                            onChange={(e) => setStatusInput(e.target.value)}
                            className="w-full appearance-none border border-black/20 rounded-md px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-cyan-500/20 outline-none bg-white"
                        >
                            <option value="">All Status</option>
                            <option value="SUCCESS">Success</option>
                            <option value="PENDING">Pending</option>
                            <option value="CLOSED">Closed</option>
                            <option value="FAILED">Failed</option>
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                            <HiChevronDown size={14} />
                        </span>
                    </div>

                    {/* Type Select */}
                    <div className="relative min-w-32.5 md:flex-1">
                        <select
                            value={typeInput}
                            onChange={(e) => setTypeInput(e.target.value)}
                            className="w-full appearance-none border border-black/20 rounded-md px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-cyan-500/20 outline-none bg-white"
                        >
                            <option value="">All Types</option>
                            <option value="PAYMENT">Cash in</option>
                            <option value="FUND-TRANSFER">Cash out</option>
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                            <HiChevronDown size={14} />
                        </span>
                    </div>
                </div>

                {/* Action Buttons Grid on Mobile */}
                <div className="grid grid-cols-2 md:flex md:flex-1 xl:flex-1 gap-2 items-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">

                    <button
                        onClick={handleApplyFilters}
                        className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition font-semibold text-sm h-10 shadow-sm w-full md:flex-1"
                    >
                        Filter
                    </button>

                    <button
                        onClick={handleClearFilters}
                        className="text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors px-4 py-2 rounded-md font-semibold text-sm h-10 flex items-center justify-center gap-1 shadow-sm w-full md:flex-1"
                    >
                        <RxCross2 /> Clear
                    </button>

                    {/* Download Button - Spans full width on mobile grid if needed */}
                    <div ref={downloadDropdownRef} className="relative col-span-2 w-full md:flex-1">
                        <button
                            onClick={() => setDownloadMenuOpen(prev => !prev)}
                            className="relative w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md shadow-sm transition font-semibold text-sm h-10 flex justify-center items-center"
                        >
                            <span>Download</span>
                            <HiChevronDown size={16} className="absolute right-4 md:right-1 lg:right-4" />
                        </button>

                        {downloadMenuOpen && (
                            <div className="absolute right-0 top-full mb-2 md:bottom-auto md:mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                                <button
                                    disabled={isDownloading}
                                    onClick={() => { handleQueueDownload(); setDownloadMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm border-b border-slate-50 ${
                                        isDownloading
                                            ? "opacity-50 cursor-not-allowed text-slate-400"
                                            : "hover:bg-slate-50 text-slate-700"
                                        }`}
                                >
                                    Queue Download
                                </button>
                                <button
                                    // onClick={() => navigate("/download-queue", { state: { downloadQueue } })}
                                    onClick={() => navigate("/download-queue")}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700"
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
        <div className="hidden md:block overflow-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                {["Transaction ID", "Reference", "Instapay Ref", "Amount", "Type", "Status", "Created", "Paid"].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-xs">
            {loading ? 
            (
                <tr>
                <td colSpan={9} className="px-6 py-8 text-center">
                    <Spinner/>
                </td>
                </tr>
            )
            : _error ? (
                <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-red-500 font-semibold">
                        Invalid Token, Please Log in Again
                    </td>
                </tr>
            ) :
            currentTransactions.length > 0 ? (
                currentTransactions.map((tx) => (
                <tr key={tx.transaction_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">{tx.transaction_id ?? "N/A"}</td>
                    <td className="px-6 py-4 font-medium">{tx.reference_id}</td>
                    <td className="px-6 py-4">{tx.instapay_reference}</td>
                    <td className={`px-6 py-4 font-semibold ${tx.type === "PAYMENT" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "PAYMENT" ? "+" : "-"}₱{tx.amount.toLocaleString("en-PH")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.type === "PAYMENT" ? "Cash in" : "Cash out"}</td>
                    <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[10px] leading-5 font-bold rounded-full border ${getStatusClass(tx.status)}`}>
                        {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">{formatDateTime(tx.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">{formatDateTime(tx.paid_at)}</td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No transactions found.
                </td>
                </tr>
            )}
            </tbody>

            </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex-1 overflow-y-auto space-y-4">
        {loading ? (
            <div className="flex justify-center py-8">
                <Spinner />
            </div>
        ) : _error ? (
            <div className="text-center py-8 text-red-500 font-semibold">
                Invalid Token, Please Log in Again
            </div>
        ) : currentTransactions.map((tx) => (
            <div key={tx.transaction_id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-3">
                    <div>
                    <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">{tx.transaction_id}</p>
                    <p className="font-bold text-slate-800">{tx.instapay_reference}</p>
                    </div>

                    {/* Right side: status badge + triple-dot */}
                    <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusClass(tx.status)}`}>
                        {tx.status}
                    </span>

                    <button
                        onClick={() => openModal(tx)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        aria-label="View Details"
                    >
                        ⋮
                    </button>
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div className="text-xs text-gray-500">
                    <p>{tx.type === "PAYMENT" ? "Cash in" : "Cash out"}</p>
                    <p className="text-[10px]">{new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                    <p className={`text-lg font-bold ${tx.type === "PAYMENT" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "PAYMENT" ? "+" : "-"}₱{tx.amount.toLocaleString("en-PH")}
                    </p>
                </div>
            </div>
        ))}
        </div>

        {modalOpen && selectedTransaction && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Transaction Details</h2>
                        {/* OPTION 1: Sub-header (Uncomment if you want it at the top) */}
                        {/* <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedTransaction.id}</p> */}
                    </div>
                    <button
                        onClick={closeModal}
                        className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                    >
                        <RxCross2 size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Primary Info: Amount & Status */}
                    <div className="text-center mb-8">
                        <p className="text-xs font-medium text-slate-400 uppercase mb-1">Total Amount</p>
                        <div className={`text-3xl font-bold ${selectedTransaction.type === "PAYMENT" ? "text-emerald-600" : "text-slate-900"}`}>
                            {selectedTransaction.type === "PAYMENT" ? "+" : "-"}₱{selectedTransaction.amount.toLocaleString()}
                        </div>
                        <div className="mt-3 flex justify-center">
                            <span className={`px-4 py-1 rounded-full text-[11px] font-bold border ${getStatusClass(selectedTransaction.status)}`}>
                                {selectedTransaction.status}
                            </span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 gap-y-4">
                        {[
                            { label: "Reference ID", value: selectedTransaction.reference_id },
                            { label: "Instapay Reference", value: selectedTransaction.instapay_reference || "N/A" },
                            { label: "Transaction Type", value: selectedTransaction.type === "PAYMENT" ? "Cash in": "Cash out"},
                            { label: "Created At", value: formatDateTime(selectedTransaction.created_at) },
                            { label: "Paid At", value: formatDateTime(selectedTransaction.paid_at) },
                        ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start border-b border-slate-50 pb-2 last:border-0">
                                <span className="text-xs font-medium text-slate-400">{item.label}</span>
                                <span className="text-xs font-semibold text-slate-700 text-right max-w-50 break-all">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* OPTION 2: Technical Metadata Section (Recommended) */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">Transaction ID</span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded select-all">
                                {selectedTransaction.transaction_id}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
)}

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4 border-b border-black/30 pb-4 pt-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Rows:</span>
                    <select
                        value={rowsPerPage}
                        onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="border border-black/30 rounded px-2 py-1 text-xs"
                    >
                        {[25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 border border-black/30 rounded-lg disabled:opacity-30 bg-white shadow-sm"><MdKeyboardDoubleArrowLeft size={18}/></button>
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border border-black/30 rounded-lg disabled:opacity-30 bg-white shadow-sm"><MdKeyboardArrowLeft size={18}/></button>
                    </div>
                    
                    <div className="text-xs font-medium text-gray-600 min-w-20 text-center">
                        {totalItems === 0 ? "0-0 of 0" :
                            `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, totalItems)} of ${totalItems}`}
                    </div>

                    <div className="flex gap-1">
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border border-black/30 rounded-lg disabled:opacity-30 bg-white shadow-sm"><MdKeyboardArrowRight size={18}/></button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 border border-black/30 rounded-lg disabled:opacity-30 bg-white shadow-sm"><MdKeyboardDoubleArrowRight size={18}/></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transactions;