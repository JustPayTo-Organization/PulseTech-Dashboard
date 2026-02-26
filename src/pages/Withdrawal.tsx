import React, { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
// import { IoTimeOutline } from "react-icons/io5";
// import { IoIosInformationCircleOutline } from "react-icons/io";
// import { MdOutlineShield } from "react-icons/md";
import { TbSend } from "react-icons/tb";
import { FaWallet } from 'react-icons/fa6';
import { CreditCard, Landmark } from 'lucide-react';

interface WithdrawalFormData {
    amount: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    remarks: string;
    method: "instapay" | "pesonet";
}

interface fundTransferData {
    BALANCE : number;
    CLOSED : number;
    COUNT : number;
    FAILED : number;
    PENDING : number;
    SUCCESS : number;
    TOTAL : number;
    TRX_PER_MIN : number;
}

interface withdrawalAccount {
    account_name: string;
    account_number: string;
    bank_code: string;
    id: number;
    merchant_id: string;
}


const Withdrawal: React.FC = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const API_URL2 = import.meta.env.VITE_API_URL;
    const [_accounts, setAccounts] = useState<fundTransferData | null>(null);
    const [_withdrawalAccounts, setWithdrawalAccounts] = useState <withdrawalAccount[]>([]);
    const [_loadingAccounts, setLoadingAccounts] = useState<boolean>(true);
    const [_errorAccounts, setErrorAccounts] = useState<string | null>(null);
    const [amountError, setAmountError] = useState<string | null>(null);
    // Loading states
    const [_loading, setLoading] = useState(true);
    const [withdrawalAccountsLoading, setWithdrawalAccountsLoading] = useState(true);
    
    // Error states
    const [_error, setError] = useState("");
    
    // const dummy_accounts: withdrawalAccount[] = [
    //     {
    //     id: 1,
    //     account_name: "John Doe",
    //     account_number: "********4421",
    //     bank_code: "BPI_EXPRESS",
    //     merchant_id: "m-001"
    //     },
    //     {
    //     id: 2,
    //     account_name: "John Doe",
    //     account_number: "********9902",
    //     bank_code: "GCASH_DIRECT",
    //     merchant_id: "m-002"
    //     },
    //     {
    //     id: 3,
    //     account_name: "John Doe",
    //     account_number: "********9903",
    //     bank_code: "GCASH_DIRECT",
    //     merchant_id: "m-003"
    //     },
    //     {
    //     id: 4,
    //     account_name: "John Doe",
    //     account_number: "********9904",
    //     bank_code: "GCASH_DIRECT",
    //     merchant_id: "m-004"
    //     },
    //     {
    //     id: 5,
    //     account_name: "John Doe",
    //     account_number: "********9905",
    //     bank_code: "GCASH_DIRECT",
    //     merchant_id: "m-005"
    //     }
    // ];

    // const maskNumber = (num: string) => {
    //     const lastFour = num.slice(-4);
    //     return `•••• ${lastFour}`;
    // };
    
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

    const [formData, setFormData] = useState<WithdrawalFormData>({
        amount: "",
        bankName: "",
        accountNumber: "",
        accountName: "",
        remarks: "",
        method: "instapay",
    });

    const amountInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name !== "amount") {
            setFormData(prev => ({ ...prev, [name]: value }));
            return;
        }

        // Remove commas
        const numericValue = value.replace(/,/g, "");

        // Allow only digits and dot
        if (!/^\d*\.?\d*$/.test(numericValue)) return;

        // Split integer and decimal parts
        const [integerPart, decimalPartRaw] = numericValue.split(".");

        // Format integer with commas
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        // Handle decimal
        let formatted: string;
        let decimalPart = decimalPartRaw;
        const cursorPosition = formattedInteger.length; // default cursor at end of integer

        if (decimalPart === undefined || decimalPart === "") {
            formatted = `${formattedInteger}.00`;
        } else if (decimalPart.length === 1) {
            formatted = `${formattedInteger}.${decimalPart}`;
        } else {
            decimalPart = decimalPart.slice(0, 2); // max 2 decimals
            formatted = `${formattedInteger}.${decimalPart}`;
        }

        setFormData(prev => ({ ...prev, amount: formatted }));

        // Keep cursor right after integer part
        setTimeout(() => {
            if (amountInputRef.current) {
                amountInputRef.current.selectionStart = amountInputRef.current.selectionEnd = cursorPosition;
            }
        }, 0);
    };


    const handleAmountBlur = () => {
        const value = formData.amount.trim();

        // If user left it empty, force 0.00
        if (value === "") {
            setFormData(prev => ({ ...prev, amount: "0.00" }));
            return;
        }

        let num = Number(value.replace(/,/g, ""));
        if (isNaN(num)) {
            num = 0;
        }

        const formatted = formatNumberWithCommas(num.toFixed(2));
        setFormData(prev => ({ ...prev, amount: formatted }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log("Withdrawal Request:", formData);
    };

    // Remove commas and convert to number
    const amountNumber = Number(formData.amount.replace(/,/g, "")) || 0;

    // Summary Calculations
    function calculateFee(amount: number): number {
        if (amount <= 0) return 0;
        if (formData.method === "pesonet") return 0
        const blocks = Math.ceil(amount / 50000); // each 50k counts as 1 block
        return blocks * 5; // 5 pesos per block
    }

    function calculateTransfers(amount: number): number {
        if (amount <= 0) return 0;
        return Math.ceil(amount / 50000);
    }

    // Helper function for Number formatter
    function formatNumberWithCommas(value: string) {
        if (!value) return "";
        const parts = value.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    useEffect(() => {
        
        const fetchAccounts = async () => {
            try {
                setLoadingAccounts(true);
                setErrorAccounts(null);
                setWithdrawalAccountsLoading(true);

                const accessToken = localStorage.getItem("accessToken");
                const today = new Date().toISOString().split("T")[0];

                if (!accessToken) {
                    setError("Missing access token. Please login again.");
                    setLoading(false);
                    return;
                }

                const fundRes = await fetch(
                        `${API_URL}/dashboard/success-rate/fund-transfer?start=${today}&end=${today}`,
                        {
                            headers: {
                                "Accept": "application/json",
                                "Authorization": `Bearer ${accessToken}`,
                            },
                        }
                    );
                
                if (!fundRes.ok) {
                    throw new Error("Failed to fetch fund transfer data");
                }

                const fundTransferData: fundTransferData = await fundRes.json();
                setAccounts(fundTransferData);

                const res = await fetch(`${API_URL}/dashboard/account/wallet/depository-accounts`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
                    },
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText || "Failed to fetch accounts");
                }

                const data: withdrawalAccount[] = await res.json();
                setWithdrawalAccounts(data);
                // console.log("Response withdrawal accounts", data)
            } catch (err: unknown) {
                console.error("Error fetching accounts:", err);

                if (err instanceof Error) {
                    setErrorAccounts(err.message);
                } else {
                    setErrorAccounts("Unknown error");
                }
            } finally {
                setLoadingAccounts(false);
                setWithdrawalAccountsLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    const handleConfirmWithdrawal = async (e: FormEvent) => {
        e.preventDefault();

        // if (!_accounts) {
        //     alert("Unable to fetch account info. Please try again.");
        //     return;
        // }

        // Convert amount string to number
        const amountNumber = Number(formData.amount.replace(/,/g, "")) || 0;

        // Validate amount
        if (!amountNumber || amountNumber <= 0) {
            setAmountError("Amount must be greater than 0");
            if (amountInputRef.current) {
                amountInputRef.current.focus();
            }
            return;
        } else {
            setAmountError(null); // Clear previous error
        }

        try {
            

            // Build request payload to match WithdrawalRequest
            const payload = {
                wallet_id: `${selectedAccountId}`, 
                amount: Number(amountNumber).toFixed(2),
                method: formData.method, // 'instapay' or 'pesonet'
            };

            console.log("Sending withdrawal request:", payload);

            const token = localStorage.getItem("accessToken") || "";

            const res = await fetch(`${API_URL2}/dashboard/account/wallet/withdrawal`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Withdrawal failed");
            }

            const data = await res.json();
            console.log("Withdrawal response:", data);
            alert("Withdrawal successful!");
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) alert(err.message);
            else alert("Unknown error");
        }
    };

    const Spinner = () => (
        <span className="inline-block w-8 h-8 border-4 border-white/30 border-t-blue-300 rounded-full animate-spin" />
    );

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6 mt-12 lg:mt-0">Withdraw Details</h1>

            <div className="flex flex-col lg:flex-row gap-8 lg:items-start">

                {/* LEFT: Withdrawal Form */}
                <div className="flex-7 bg-white rounded-2xl shadow-lg p-6 flex flex-col">

                    {/* Transfer Method */}
                    <div className='mb-10'>
                        <h2 className="text-xl font-semibold text-gray-600 mb-2">Transfer Method</h2>
                        <div className="flex gap-4">
                            {/* Instapay */}
                            <label
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all w-full ${
                                formData.method === "instapay" ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-gray-300"
                            }`}
                            >
                            <input
                                type="radio"
                                name="method"
                                value="instapay"
                                className="sr-only"
                                checked={formData.method === "instapay"}
                                onChange={() => setFormData({ ...formData, method: "instapay" })}
                            />
                            <div
                                className={`p-2 rounded-lg ${
                                formData.method === "instapay" ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                <TbSend className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Instapay</p>
                                <p className="text-xs text-gray-500">Instant transfer up to ₱50,000</p>
                            </div>
                            </label>

                            {/* PESONet */}
                            {/* <label
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all w-full ${
                                formData.method === "pesonet" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                            }`}
                            >
                            <input
                                type="radio"
                                name="method"
                                value="pesonet"
                                className="sr-only"
                                checked={formData.method === "pesonet"}
                                onChange={() => setFormData({ ...formData, method: "pesonet" })}
                            />
                            <div
                                className={`p-2 rounded-lg ${
                                formData.method === "pesonet" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                <LuBuilding2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">PESONet</p>
                                <p className="text-xs text-gray-500">Same-day transfer, no limit</p>
                            </div>
                            </label> */}
                        </div>
                    </div>
                    
                    {/* Depository Account Selection */}
                    <div className="w-full max-w-5xl mx-auto p-4">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                            Withdrawal Account
                        </h2>

                        {/* Using a 6-column grid on desktop:
                            - Cards span 3 columns (3+3 = 6), forcing exactly 2 per row.
                            - On mobile/small screens, they span the full width.
                        */}
                        
                            {withdrawalAccountsLoading ?
                            (
                                // Loading state
                                <div className="flex justify-center items-center p-8">
                                <Spinner /> {/* Replace with your spinner component */}
                                </div>
                            ) : _withdrawalAccounts.length === 0 ? (
                                // No accounts
                                <p className="text-gray-500 text-center">No withdrawal accounts found.</p>
                            ) : (
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                {_withdrawalAccounts.map((account) => {
                                    const isSelected = selectedAccountId === account.id;
                                    const isBank = account.bank_code.toLowerCase().includes("bank");

                                    return (
                                        <label
                                        key={account.id}
                                        className={`
                                            relative md:col-span-3 flex items-center gap-4 p-4 cursor-pointer rounded-xl border-2 transition-all duration-200
                                            ${isSelected
                                            ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                            }
                                        `}
                                        >
                                        <input
                                            type="radio"
                                            name="withdrawalAccount"
                                            className="sr-only"
                                            checked={isSelected}
                                            onChange={() => setSelectedAccountId(account.id)}
                                        />

                                        <div className={`
                                            shrink-0 w-12 h-12 flex items-center justify-center rounded-xl transition-colors
                                            ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}
                                        `}>
                                            {isBank ? <Landmark size={22} /> : <CreditCard size={22} />}
                                        </div>

                                        <div className="flex flex-col min-w-0">
                                            <span className={`font-bold truncate ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                                            {account.account_name}
                                            </span>
                                            <span className="text-sm font-medium text-gray-500">
                                            {account.account_number}
                                            </span>
                                            <span className="text-xs text-gray-400 font-semibold uppercase tracking-tighter mt-0.5">
                                            {account.bank_code.replace("_", " ")}
                                            </span>
                                        </div>
                                    </label>
                                );
                                })}
                        </div>
                        )}
                    </div>
                    {/* Form */}
                    
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Amount</label>
                                <input 
                                    ref={amountInputRef}
                                    type="text" 
                                    name="amount" 
                                    value={formData.amount} 
                                    onChange={handleChange}
                                    onBlur={handleAmountBlur} 
                                    placeholder="Enter amount" 
                                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance]:textfield ${
                                        amountError ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
                                    }`}
                                    required
                                />
                                {amountError && <p className="text-red-500 text-sm mt-1">{amountError}</p>}
                            </div>

                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Enter bank name" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" required/>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Enter account number" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" required/>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                <input type="text" name="accountName" value={formData.accountName} onChange={handleChange} placeholder="Enter account name" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" required/>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Optional remarks" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 resize-none"/>
                            </div> */}

                        </form>
                    
                </div>

                {/* RIGHT: Balance + Transfer Info */}
                <div className="flex-3 flex flex-col gap-6">

                    <div className="bg-[#132440] rounded-2xl shadow-lg p-6">
                        <div className='flex items-center'>
                            <div className='bg-white/10 p-3 rounded-lg mr-2'>
                                <FaWallet className='text-teal-400'/>                        
                            </div>
                            <div>
                                <h2 className="text-gray-400 text-lg">Available Balance</h2>
                            </div>
                        </div>
                        <p className={`text-4xl font-bold mt-2 ${
                            _accounts?.BALANCE
                                ? "text-white"
                                : "text-red-500 text-[18px]"
                        }`}>
                            { _loadingAccounts ? (
                                <Spinner/>
                            ) : _accounts 
                            ? (formatNumberWithCommas(_accounts.BALANCE.toFixed(2))) 
                            : ("Unable to fetch balance")
                        }
                        </p>
                    </div>

                    {/* Summary Info */}
                    <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">

                        <h4 className="font-semibold">Summary</h4>

                        {formData.method === "instapay" && (
                            <p className='text-xs text-gray-500'>
                                Max Instapay Transfer Amount: ₱50,000.00
                            </p>
                        )}

                        <div className="flex justify-between">
                            <span className="text-gray-600">Amount</span>
                            <span className="font-medium">₱{formatNumberWithCommas(amountNumber.toFixed(2))}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Number of Transfers:</span>
                            <span className="font-medium">
                                {calculateTransfers(Number(amountNumber))}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Fees:</span>
                            <span className="font-medium">
                                ₱{calculateFee(Number(amountNumber))}
                            </span>
                        </div>

                        <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="text-gray-600 font-semibold">Total Withdrawal:</span>
                            <span className="font-semibold">
                                ₱{formatNumberWithCommas((amountNumber + calculateFee(amountNumber)).toFixed(2))}
                            </span>
                        </div>

                        <button
                            onClick={handleConfirmWithdrawal}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mt-auto cursor-pointer lg:text-sm xl:text-base">
                            Confirm Withdrawal
                        </button>

                    </div>
                    {/* Transfer Info Details */}
                    {/* <div className="bg-white shadow-lg rounded-2xl p-5 space-y-4">
                        <h4 className="font-semibold">Transfer Information</h4>

                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-3 rounded">
                                <IoTimeOutline className="text-green-500"/>
                            </div>
                            <div>
                                <h5 className="font-medium">Processing Time</h5>
                                <p className="text-gray-600 text-sm">Instapay: Instant • PESONet: Same day</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-3 rounded">
                                <MdOutlineShield className="text-blue-500"/>
                            </div>
                            <div>
                                <h5 className="font-medium">Secure Transfer</h5>
                                <p className="text-gray-600 text-sm">All transactions are encrypted and protected</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-3 rounded">
                                <IoIosInformationCircleOutline className="text-orange-500"/>
                            </div>
                            <div>
                                <h5 className="font-medium">Transaction Limits</h5>
                                <p className="text-gray-600 text-sm">Instapay: ₱50,000/tx • PESONet: No limit</p>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
    </div>

    );
};

export default Withdrawal;