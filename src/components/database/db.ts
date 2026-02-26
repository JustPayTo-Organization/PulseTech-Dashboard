import { openDB } from 'idb';
import type { DBSchema } from 'idb';
import type { Transaction } from '../../pages/Transactions';

// Define the shape of a download job
export interface DownloadJob {
    id: string;           
    name: string; 
    transactions: Transaction[];
    reference?: string;
    amount?: number;
    status: 'queued' | 'ready' | 'failed' | 'downloading';
    createdAt: number | string;    // timestamp
    progress?: number; 
}

// Define the database schema
interface TransactionDB extends DBSchema {
  downloadQueue: {
    key: string;
    value: DownloadJob;
  };
}

// Open the DB with the schema
export const dbPromise = openDB<TransactionDB>('TransactionDB', 1, {
  upgrade(db) {
    db.createObjectStore('downloadQueue', { keyPath: 'id' });
  },
});

// Add a job
export const addDownloadJob = async (job: DownloadJob) => {
  const db = await dbPromise;
  await db.put('downloadQueue', job);
};

// Get all jobs
export const getAllJobs = async (): Promise<DownloadJob[]> => {
  const db = await dbPromise;
  return await db.getAll('downloadQueue');
};

export const updateJob = async (job: DownloadJob) => {
  const db = await dbPromise;
  await db.put('downloadQueue', job);
};

export const deleteJob = async (id: string) => {
  const db = await dbPromise;
  await db.delete('downloadQueue', id);
};