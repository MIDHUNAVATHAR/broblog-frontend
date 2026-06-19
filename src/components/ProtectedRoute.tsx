import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { API_PATHS } from "../constants/apiPaths";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      // Check if token is still valid (not expired)
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const decoded = JSON.parse(jsonPayload);
        if (decoded.exp && decoded.exp * 1000 > Date.now() + 10000) {
          if (isMounted) {
            setIsAuthenticated(true);
            setLoading(false);
          }
          return;
        }
      } catch (e) {
        console.error("Error decoding token pre-check in ProtectedRoute", e);
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}${API_PATHS.AUTH.REFRESH_TOKEN}`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);

          // Decode access token to set user in localStorage
          try {
            const base64Url = accessToken.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              window.atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            );
            const user = JSON.parse(jsonPayload);
            localStorage.setItem(
              "user",
              JSON.stringify({ id: user.id, email: user.email })
            );
          } catch (e) {
            console.error("Error decoding token in ProtectedRoute", e);
          }

          if (isMounted) {
            setIsAuthenticated(true);
          }
        } else {
          throw new Error("No token returned");
        }
      } catch (error) {
        console.error("Error refreshing token in ProtectedRoute", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center p-2 shadow-xl shadow-slate-200">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 15 H55 C75 15 75 45 55 45 H25 V15 Z M25 45 H60 C80 45 80 85 60 85 H25 V45 Z" fill="white" />
              <path d="M35 25 H55 V40 H45 L35 48 V25 Z" fill="black" />
              <rect x="40" y="30" width="10" height="2" fill="white" />
              <rect x="40" y="34" width="10" height="2" fill="white" />
              <rect x="40" y="38" width="6" height="2" fill="white" />
              <path d="M50 55 L70 85 L60 92 L40 62 Z" fill="black" stroke="white" strokeWidth="1" />
              <circle cx="55" cy="73" r="1.5" fill="white" />
              <line x1="55" y1="73" x2="60" y2="80" stroke="white" strokeWidth="1" />
            </svg>
          </div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold mt-2">
            <Loader2 className="animate-spin h-5 w-5" />
            <span className="text-sm tracking-wider uppercase">Verifying session...</span>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
