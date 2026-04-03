import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import Dashboard from '../pages/dashboard/Dashboard';
import "./admin.css";

function Admin() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <Dashboard />
    </div>
  );
}

export default Admin;