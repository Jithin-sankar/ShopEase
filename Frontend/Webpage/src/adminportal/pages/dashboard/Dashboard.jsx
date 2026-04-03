import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts';
import { FaUsers, FaBox, FaShoppingCart, FaRupeeSign } from "react-icons/fa";
import "./dashboard.css";
import Sidebar from '../../sidebar/Sidebar';

const BASE_URL = "https://shopease-g7bc.onrender.com/";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/admin/dashboard/`, { withCredentials: true })
      .then(res => setData(res.data.data))
      .catch(err => console.log(err));
  }, []);

  if (!data) return <div className="loading-state">Initializing Dashboard...</div>;

  const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      
      <div className="dashboard-content">
        <h1>🚀 Admin Analytics</h1>

        {/* KPI Section */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-box users-kpi"><FaUsers /></div>
            <div className="kpi-info">
              <h3>{data.stats.users}</h3>
              <p>Active Users</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box products-kpi"><FaBox /></div>
            <div className="kpi-info">
              <h3>{data.stats.products}</h3>
              <p>Total Products</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box orders-kpi"><FaShoppingCart /></div>
            <div className="kpi-info">
              <h3>{data.stats.orders}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box sales-kpi"><FaRupeeSign /></div>
            <div className="kpi-info">
              <h3>₹{data.stats.sales.toLocaleString()}</h3>
              <p>Gross Revenue</p>
            </div>
          </div>
        </div>

        {/* Main Chart Section */}
        <div className="chart-box">
          <h3>📈 Sales Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.sales_trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-row">
          {/* Order Status Pie */}
          <div className="chart-box">
            <h3>📦 Distribution by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.order_status}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {data.order_status.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products Progress */}
          <div className="chart-box">
            <h3>🔥 Best Selling Products</h3>
            <div className="progress-container">
              {data.top_products.map((p, i) => (
                <div key={i} className="progress-item">
                  <div className="progress-info">
                    <span>{p.productName}</span>
                    <span>{p.total_sold} units</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-fill" style={{ width: `${Math.min(p.total_sold * 5, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="chart-box">
          <h3>🧾 Recent Transactions</h3>
          <table className="recent-orders-table">
            <thead>
              <tr>
                
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_orders_list.map((o) => (
                <tr key={o.id}>
                  <td>{o.user__username}</td>
                  <td>₹{o.total.toLocaleString()}</td>
                  <td>
                    <span className={`status-tag status-${o.status.toLowerCase()}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> 
    </div>
  );
}

export default Dashboard;