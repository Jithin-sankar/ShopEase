import React, { useEffect, useState } from "react";
import Nav from "../Nav/Nav";
import axios from "axios";
import "./orderHistory.css";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get("https://shopease-g7bc.onrender.com/api/orders/", {
        withCredentials: true,
      });

      console.log("Orders API:", res.data);

   
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }

    } catch (err) {
      console.error("Failed to fetch orders:", err);

      if (err.response) {
        setError(err.response.data.message || "Server error");
      } else if (err.request) {
        setError("No response from server");
      } else {
        setError("Something went wrong");
      }

      setOrders([]);

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />

      <div className="orders-container">
        <h2>Your Orders</h2>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">

              <div className="order-header">
                <h3>Status:</h3>
                <span className={`status ${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <p>
                Placed on:{" "}
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString()
                  : "N/A"}
              </p>

              <div className="order-items">
                {Array.isArray(order.items) && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={item.id || index} className="order-item">

                      <img
                        src={item.product_image || "/placeholder.png"}
                        alt={item.product_name || "product"}
                        className="order-item-img"
                      />

                      <div className="order-item-details">
                        <h4>{item.product_name || "No name"}</h4>

                        <p>Qty: {item.quantity}</p>

                        <p>
                          Price: ₹
                          {item.price
                            ? Number(item.price).toFixed(2)
                            : "0.00"}
                        </p>

                        <p>
                          Total: ₹
                          {item.price && item.quantity
                            ? (item.price * item.quantity).toFixed(2)
                            : "0.00"}
                        </p>
                      </div>

                    </div>
                  ))
                ) : (
                  <p>No items</p>
                )}
              </div>

              <p className="order-total">
                Order Total: ₹
                {order.total
                  ? Number(order.total).toFixed(2)
                  : "0.00"}
              </p>

            </div>
          ))
        )}
      </div>
    </>
  );
}

export default OrderHistory;