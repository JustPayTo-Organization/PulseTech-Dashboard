// ProtectedRoute.tsx
// import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
    // const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("accessToken");
    // const [loading, setLoading] = useState(true);
    // const [authenticated, setAuthenticated] = useState(false);

    // const Spinner = () => (
    //     <span className="inline-block w-8 h-8 border-4 border-white/30 border-t-blue-300 rounded-full animate-spin" />
    // );
    // useEffect(() => {
    // const checkAuth = async () => {
    //     const token = localStorage.getItem("accessToken");
    //     if (!token) {
    //     setAuthenticated(false);
    //     setLoading(false);
    //     return;
    //     }

    //     try {
    //     const res = await fetch(`${API_URL}/auth/verify`, {
    //         headers: { Authorization: `Bearer ${token}` },
    //     });

    //     setAuthenticated(res.ok);
    //     } catch (err) {
    //     setAuthenticated(false);
    //     } finally {
    //     setLoading(false);
    //     }
    // };

    // checkAuth();
    // }, []);

    // if (loading) return <div className="flex items-center justify-center h-screen"><Spinner/></div>;
    // if (!authenticated) return <Navigate to="/login" />;
        
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
