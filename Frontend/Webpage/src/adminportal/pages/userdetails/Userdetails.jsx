import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './userdetails.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../sidebar/Sidebar';

axios.defaults.withCredentials = true;

const BASE_URL = "https://shopease-g7bc.onrender.com";

function UserDetails() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/users/`);
        setUsers(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.error || "Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  
  const handleBlock = async (user) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/admin/users/${user.id}/`,
        {
          is_active: !user.is_active
        }
      );

      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u
        )
      );

      toast.success(user.is_active ? "User blocked" : "User unblocked");

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update user");
    }
  };

  
  const handleRemove = async (user) => {
    try {
      await axios.delete(`${BASE_URL}/api/admin/users/${user.id}/`);

      setUsers(prev => prev.filter(u => u.id !== user.id));

      toast.success("User removed successfully");

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to delete user");
    }
  };

  
  const handleViewOrders = (user) => {
    navigate(`/userorder/${user.id}`); 
  };

 return (
  
  <div className="dashpro">
  <Sidebar />
  <ToastContainer position="top-center" autoClose={2000} />

  <div className="forprducte">
    {/* Clean, minimal header */}
    <header className="main-header">
      <div className="header-left">
        <h1>User Directory</h1>
        <p>Monitor and manage your community members</p>
      </div>
      <div className="header-right">
        <div className="stat-pill">
          <span className="dot"></span>
          <strong>{users.length}</strong> Users
        </div>
      </div>
    </header>

    <div className="table-card">
      {/* Sticky Table Header */}
      <div className="table-header-row">
        <div className="col-user">Profile</div>
        <div className="col-email">Contact Information</div>
        <div className="col-status">Current Status</div>
        <div className="col-actions text-right">Management</div>
      </div>

      {/* User List Body */}
      <div className="Ad">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="user-list-item">
              <div className="col-user">
                <div className="user-profile-box">
                  <div className="user-avatar-initial">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-name-info">
                    <span className="user-fullname">{user.username}</span>
                    
                  </div>
                </div>
              </div>

              <div className="col-email">
                <span className="email-link">{user.email}</span>
              </div>

              <div className="col-status">
                <span className={`badge ${user.is_active ? 'is-active' : 'is-blocked'}`}>
                  {user.is_active ? 'Active' : 'Blocked'}
                </span>
              </div>

              <div className="col-actions action-buttons">
                <button className="icon-btn orders" onClick={() => handleViewOrders(user)}>Orders</button>
                <button className={`icon-btn ${user.is_active ? 'block' : 'unblock'}`} onClick={() => handleBlock(user)}>
                  {user.is_active ? 'Block' : 'Unblock'}
                </button>
                <button className="icon-btn remove" onClick={() => handleRemove(user)}>Remove</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No users found in database.</div>
        )}
      </div>
    </div>
  </div>
</div>
);
}

export default UserDetails;