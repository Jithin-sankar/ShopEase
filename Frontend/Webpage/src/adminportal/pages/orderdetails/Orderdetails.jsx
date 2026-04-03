import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './orderdetails.css';
import Sidebar from '../../sidebar/Sidebar';

const BASE_URL = "https://shopease-g7bc.onrender.com/";


axios.defaults.withCredentials = true;

function Orderdetails() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/api/admin/orders/`);

      setOrders(res.data.data);

    } catch (err) {
      console.error("Error fetching orders:", err);

      if (err.response?.status === 403) {
        setError("Access denied. Admins only.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err.response) {
        setError(err.response.data.error || "Server error");
      } else if (err.request) {
        setError("No response from server");
      } else {
        setError("Something went wrong");
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  
  const update = async (orderId, status) => {
    try {
      await axios.put(
        `${BASE_URL}/api/admin/orders/${orderId}/`,
        { status }
      );

      fetchOrders();

    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order");
    }
  };

  return (
    <div className='fororder'>
      <Sidebar />

      <div className="admin-orders">
        <h2>Order Management</h2>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length > 0 ? (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Products</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.user}</td>

                  <td>
                    {order.items?.map((item, index) => (
                      <div key={index}>{item.productName}</div>
                    ))}
                  </td>

                  <td>
                    {order.items?.map((item, index) => (
                      <div key={index}>{item.quantity}</div>
                    ))}
                  </td>

                  <td>₹{order.total}</td>
                  <td>{order.status}</td>

                  <td>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : "N/A"}
                  </td>

                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => update(order.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
}

export default Orderdetails;