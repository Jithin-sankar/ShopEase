import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // FIX: Added the full API path /api/auth/user/
        const res = await axios.get(
          "https://shopease-g7bc.onrender.com/api/auth/user/", 
          { withCredentials: true }
        );

        
        if (res.data?.role === "admin") {
          setIsAdmin(true);
        } else {
          console.warn("User is authenticated but not an admin.");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error.response?.status || error.message);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Checking authentication...</h2>;
  }

  if (!isAdmin) {
    
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;