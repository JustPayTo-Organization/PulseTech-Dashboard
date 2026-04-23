// Layout.tsx
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Landing from "../pages/Landing";
import Transactions from "../pages/Transactions";
import Withdrawal from "../pages/Withdrawal";
import Login from "../pages/Login";
import ChangePass from "../pages/ChangePass";
import ProtectedRoute from "../components/auth_guard/ProtectedRoute"
import QueuePage from "../pages/QueuePage"
// import OldLanding from "../pages/OldLanding"
import { useEffect, useState } from "react";

export default function Layout() {  
    const location = useLocation();

    const HIDE_SIDEBAR_ROUTES = ["/login", "/changepass"];
    // hide sidebar on login page
    const hideSidebar = HIDE_SIDEBAR_ROUTES.includes(location.pathname);

    const API_URL = import.meta.env.VITE_API_URL;
    const [clientName, setClientName] = useState("");

    useEffect(() => {
        const fetchClientName = async () => {
            const accessToken = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/dashboard/user`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
            });

            const json = await res.json();
            setClientName(json.name);
        };

        fetchClientName();
    }, [API_URL]);

    return (
        <div className="h-screen flex overflow-hidden">
            {!hideSidebar && <Sidebar clientName={clientName}/>}
            {/* Body */}
            <div className="flex-1 min-h-screen bg-slate-50/50 overflow-y-auto">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/landing" element={<Landing clientName={clientName}/>} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/withdrawal" element={<Withdrawal />} />
                        <Route path="/changepass" element={<ChangePass />} />
                        <Route path="/download-queue" element={< QueuePage/>} />
                    </Route>
                </Routes>
            </div>
        </div>
    );
}
