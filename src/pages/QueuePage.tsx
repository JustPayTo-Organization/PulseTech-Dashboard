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
      queued: 'bg-blue-50 text-blue-700 border-blue-100',
      ready: 'bg-green-50 text-green-700 border-green-100',
      failed: 'bg-red-50 text-red-700 border-red-100',
      downloading: 'bg-gray-50 text-gray-700 border-gray-100',
    };
    const icons = {
      queued: <Clock size={14} className="mr-1" />,
      ready: <CheckCircle size={14} className="mr-1" />,
      failed: <AlertCircle size={14} className="mr-1" />,
      downloading: <CircleArrowDown size={14} className="mr-1" />,
    };
    return (
      <span className={`flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
        {icons[status]}
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="mt-12 md:mt-0 p-4 md:p-8 bg-gray-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">

        {/* Back Navigation */}
        <div className="mb-6">
          <button
            onClick={() => window.location.href = '/transactions'}
            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium group"
          >
            <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Transactions
          </button>
        </div>

        {/* Header & Bulk Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl font-bold text-slate-800">Download Queue</h1>
          <div className="flex gap-2">
            <button
              onClick={clearCompleted}
              className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Trash2 size={16} className="mr-2" />
              Clear Finished
            </button>
            <button
              onClick={downloadAllReady}
              disabled={isDownloadingAll || !jobs.some(j => j.status === 'ready')}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Download size={16} className="mr-2" />
              {isDownloadingAll ? 'Processing...' : 'Download Ready'}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Filename</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Transactions</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date Added</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">Loading queue...</td>
                </tr>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="text-slate-400 mr-3" size={20} />
                        <span className="font-medium text-slate-700">{job.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{job.transactions.length} items</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{job.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownloadWithProgress(job)}
                          disabled={job.status !== 'ready'}
                          className={`p-2 rounded-lg transition-colors ${job.status === 'ready' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-300 cursor-not-allowed'}`}
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => removeJob(job.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">No downloads in queue.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading queue...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No downloads in queue.</div>
          ) : filteredJobs.map(job => (
            <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-slate-100 rounded-lg mr-3">
                    <FileText size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-base font-bold text-slate-800 leading-tight">{job.name}</h3>
                    <p className="text-xs text-slate-500">{job.createdAt}</p>
                  </div>
                </div>
                <StatusBadge status={job.status} />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-500">{job.transactions.length} Transactions</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => removeJob(job.id)}
                    className="flex items-center text-sm font-medium text-slate-500"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => handleDownloadWithProgress(job)}
                    disabled={job.status !== 'ready'}
                    className="flex items-center text-sm font-bold text-emerald-600 disabled:opacity-30"
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
