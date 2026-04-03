import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get(
          "https://shopease-g7bc.onrender.com",
          { withCredentials: true }
        );

        const user = res.data.user || res.data;

        if (user?.role === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Auth check failed");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  
  if (loading) {
    return <h2>Checking authentication...</h2>;
  }

  
  if (!isAdmin) {
    return <Navigate to="/Login" replace />;
  }


  return children;
}

export default ProtectedRoute;