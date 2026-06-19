import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { API_PATHS } from "../constants/apiPaths";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("accessToken");

    if (!token) {
      if (isMounted) {
        setIsAuthenticated(false);
        setLoading(false);
      }
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}${API_PATHS.AUTH.REFRESH_TOKEN}`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);

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
            console.error("Error decoding token in PublicRoute", e);
          }

          if (isMounted) {
            setIsAuthenticated(true);
          }
        } else {
          throw new Error("No token returned");
        }
      } catch (error) {
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
    return null; // Prevents UI flashing during session check
  }

  return isAuthenticated ? <Navigate to="/home" replace /> : <>{children}</>;
};

export default PublicRoute;
