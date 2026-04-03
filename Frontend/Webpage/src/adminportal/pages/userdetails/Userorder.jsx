import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../sidebar/Sidebar';
import "./userorder.css";

axios.defaults.withCredentials = true;

const BASE_URL = "https://shopease-g7bc.onrender.com"; 

function Userorders() {
  const { id } = useParams(); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      toast.error('Invalid user');
      navigate('/userdetails');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/user-orders/${id}/`);

        const sortedOrders = res.data.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setOrders(sortedOrders);

      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.error || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [id, navigate]);

  return (
    <div className="dashpro">
      <Sidebar />
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="forprducte">
        <h1>User Orders</h1>

        <button className="back-btn" onClick={() => navigate('/userdetails')}>
          ← Back to Users
        </button>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found for this user.</p>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">

                

                <p><strong>Customer Name:</strong> {order.customer_name}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Address:</strong> {order.address}</p>
                <p><strong>Location:</strong> {order.location}</p>

                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Total Price:</strong> ₹{order.total_price}</p>
                <p><strong>Status:</strong> {order.status}</p>

                <div className="order-items">
                  <h4>Items:</h4>
                  <ul>
                    {order.items?.map((item, index) => (
                      <li key={index}>
                        {item.product_name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Userorders;