import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  
  const Logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <h2>Admin </h2>

      

      <nav>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
          Dashboard
        </NavLink>
        <NavLink to="/orderdetails" className={({ isActive }) => isActive ? "active" : ""}>
          Orders
        </NavLink>
        <NavLink to="/productdetails" className={({ isActive }) => isActive ? "active" : ""}>
          Products
        </NavLink>
        <NavLink to="/userdetails" className={({ isActive }) => isActive ? "active" : ""}>
          Users
        </NavLink>
      </nav>

      <button className="log" onClick={Logout}>
        Sign Out
      </button>
    </aside>
  );
}

export default Sidebar;