import React, { useState, useMemo, useEffect } from 'react';
import { Download, Trash2, CheckCircle, Clock, AlertCircle, FileText, Search, ChevronLeft, CircleArrowDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getAllJobs, updateJob, deleteJob, type DownloadJob } from "../components/database/db";

// --- Types ---
interface Transaction {
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

type JobStatus = 'queued' | 'ready' | 'failed' | 'downloading';

const TYPE_LABELS: Record<Transaction['type'], string> = {
  PAYMENT: "Cash In",
  FUND_TRANSFER: "Cash Out",
};

// --- Component ---
const DownloadQueueUI: React.FC = () => {

  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAndProcessQueue = async () => {
      setLoading(true);
      try {
        const allJobs = await getAllJobs();
        const updatedJobs = await Promise.all(
          allJobs.map(async job => {
            if (job.status === 'queued') {
              const updatedJob: DownloadJob = { ...job, status: 'ready', progress: 100 };
              await updateJob(updatedJob);
              return updatedJob;
            }
            return job;
          })
        );
        setJobs(updatedJobs);
      } finally {
        setLoading(false);
      }
    };
    loadAndProcessQueue();
  }, []);

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${day} ${h}:${min}:${s}`;
  };

  // --- Handlers ---
  const handleDownload = (job: DownloadJob) => {
    if (job.status !== 'ready') return;

    try {
      const worksheetData = job.transactions.map(tx => ({
        "Transaction ID": tx.transaction_id,
        "Reference ID": tx.reference_id,
        "Instapay Reference": tx.instapay_reference,
        "Amount": tx.amount,
        "Type": TYPE_LABELS[tx.type],
        "Status": tx.status,
        "Created At": formatDateTime(tx.created_at),
        "Paid At": formatDateTime(tx.paid_at),
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
      XLSX.writeFile(workbook, job.name.endsWith('.xlsx') ? job.name : `${job.name}.xlsx`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate Excel file");
    }
  };

  const updateAndPersist = async (updatedJob: DownloadJob) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    await updateJob(updatedJob);
  };

  const handleDownloadWithProgress = async (job: DownloadJob) => {
    let updatedJob: DownloadJob = { ...job, status: 'downloading', progress: 0 };
    await updateAndPersist(updatedJob);

    const chunkSize = Math.ceil(job.transactions.length / 10);

    for (let i = 0; i < job.transactions.length; i += chunkSize) {
      await new Promise(res => setTimeout(res, 150));
      updatedJob = {
        ...updatedJob,
        status: 'downloading',
        progress: Math.min(
          100,
          Math.round(((i + chunkSize) / job.transactions.length) * 100)
        ),
      };
      await updateAndPersist(updatedJob);
    }

    updatedJob = { ...updatedJob, status: 'ready', progress: 100 };
    await updateAndPersist(updatedJob);
    handleDownload(updatedJob);
    await updateAndPersist(updatedJob);
  };

  const removeJob = async (id: string) => {
    await deleteJob(id);
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const clearCompleted = async () => {
    const completed = jobs.filter(j => j.status !== 'queued');
    for (const job of completed) await deleteJob(job.id);
    setJobs(prev => prev.filter(j => j.status === 'queued'));
  };

  const downloadAllReady = async () => {
    setIsDownloadingAll(true);
    const readyJobs = jobs.filter(j => j.status === 'ready');
    for (const job of readyJobs) await handleDownloadWithProgress(job);
    setIsDownloadingAll(false);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => j.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [jobs, searchTerm]);

  // --- UI Helpers ---
  const StatusBadge = ({ status }: { status: JobStatus }) => {
    const styles = {
      queued: 'bg-stone-50 text-stone-600 border-stone-100',
      ready: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      failed: 'bg-red-50 text-red-700 border-red-100',
      downloading: 'bg-emerald-50/50 text-emerald-600 border-emerald-100/50 animate-pulse',
    };
    const icons = {
      queued: <Clock size={14} className="mr-1" />,
      ready: <CheckCircle size={14} className="mr-1" />,
      failed: <AlertCircle size={14} className="mr-1" />,
      downloading: <CircleArrowDown size={14} className="mr-1" />,
    };
    return (
      <span className={`flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  return (
    <div className="relative mt-12 md:mt-0 p-4 md:p-8 bg-[#f8faf9] min-h-screen font-sans text-stone-700 overflow-hidden">
        
        {/* PulseTech Background Accents */}
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full bg-emerald-50/50 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-green-50/40 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Back Navigation */}
        <div className="mb-6">
          <button
            onClick={() => window.location.href = '/transactions'}
            className="flex items-center text-stone-400 hover:text-emerald-500 transition-colors text-xs font-bold uppercase tracking-widest group"
          >
            <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Transactions
          </button>
        </div>

        {/* Header & Bulk Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-stone-700 tracking-tight">
            Download <span className="text-emerald-500">Queue</span>
          </h1>
          <div className="flex gap-2">
            <button
              onClick={clearCompleted}
              className="flex items-center px-4 py-2 text-sm font-bold text-stone-500 bg-white/50 backdrop-blur-sm border border-stone-100 rounded-xl hover:bg-white hover:text-red-500 transition-all shadow-sm"
            >
              <Trash2 size={16} className="mr-2" />
              Clear Finished
            </button>
            <button
              onClick={downloadAllReady}
              disabled={isDownloadingAll || !jobs.some(j => j.status === 'ready')}
              className="flex items-center px-6 py-2 text-sm font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              <Download size={16} className="mr-2" />
              {isDownloadingAll ? 'Processing...' : 'Download Ready'}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
          <input
            type="text"
            placeholder="Search files..."
            className="w-full pl-11 pr-4 py-3.5 bg-white/70 backdrop-blur-xl border border-white rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-stone-700 placeholder-stone-300 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(16,185,129,0.05)] border border-white overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50/50 border-b border-stone-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Filename</th>
                <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Transactions</th>
                <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Date Added</th>
                <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-stone-300 font-medium italic">Loading queue...</td>
                </tr>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <FileText className="text-emerald-400 mr-3" size={20} />
                        <span className="font-bold text-stone-700">{job.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-8 py-5 text-stone-500 text-sm font-medium">{job.transactions.length} items</td>
                    <td className="px-8 py-5 text-stone-400 text-sm font-medium">{job.createdAt}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownloadWithProgress(job)}
                          disabled={job.status !== 'ready'}
                          className={`p-2.5 rounded-xl transition-all ${job.status === 'ready' ? 'text-emerald-500 hover:bg-emerald-50 hover:scale-110 shadow-sm' : 'text-stone-200 cursor-not-allowed'}`}
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => removeJob(job.id)}
                          className="p-2.5 text-stone-300 hover:text-red-500 hover:bg-red-50 hover:scale-110 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-stone-300 font-medium italic">No downloads in queue.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="p-12 text-center text-stone-300 font-medium italic">Loading queue...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center text-stone-300 font-medium italic">No downloads in queue.</div>
          ) : filteredJobs.map(job => (
            <div key={job.id} className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="p-2.5 bg-emerald-50 rounded-2xl mr-3">
                    <FileText size={20} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-700 leading-tight">{job.name}</h3>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">{job.createdAt}</p>
                  </div>
                </div>
                <StatusBadge status={job.status} />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{job.transactions.length} items</span>
                <div className="flex gap-4">
                  <button
                    onClick={() => removeJob(job.id)}
                    className="flex items-center text-xs font-bold text-stone-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => handleDownloadWithProgress(job)}
                    disabled={job.status !== 'ready'}
                    className="flex items-center text-xs font-black text-emerald-500 disabled:opacity-30 uppercase tracking-widest"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DownloadQueueUI;