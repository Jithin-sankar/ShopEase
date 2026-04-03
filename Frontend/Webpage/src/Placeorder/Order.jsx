import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../Nav/Nav';
import axios from 'axios';
import './Order.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartContext } from '../context/Cartcontext';

function Order() {
  const { fetchCart } = useContext(CartContext);
  const navigate = useNavigate(); 

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    location: ''
  });

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      const res = await axios.get('https://shopease-g7bc.onrender.com/api/cart/', {
        withCredentials: true
      });
      setCartItems(res.data);

      const totalPrice = res.data.reduce(
        (sum, item) =>
          sum + (item.product?.price || 0) * (item.quantity || 1),
        0
      );

      setTotal(totalPrice);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirm = async () => {
    const { fullName, phone, email, address, location } = data;

    if (!fullName || !phone || !email || !address || !location) {
      toast.warning('Please fill in all fields!');
      return;
    }

    if (cartItems.length === 0) {
      toast.warning('Cart is empty!');
      return;
    }

    setLoading(true);

    try {
      
      const orderRes = await axios.post(
        'https://shopease-g7bc.onrender.com/api/orders/',
        { customer_name: fullName, phone, email, address, location, total },
        { withCredentials: true }
      );

      const orderId = orderRes.data.order_id;

      
      const sessionRes = await axios.post(
        'https://shopease-g7bc.onrender.com/api/payment/create-checkout-session/',
        { order_id: orderId },
        { withCredentials: true }
      );

      
      window.location.href = sessionRes.data.url;

    } catch (err) {
      console.error(err);
      toast.error("Order or Payment failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />

      <div className="order-container">
        <h2>Checkout</h2>

        {cartItems.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            <div className="order-items">
              {cartItems.map(item => (
                <div key={item.id} className="order-item">
                  <img
                    src={item.product?.image}
                    alt={item.product?.productName}
                    className="order-item-img"
                  />
                  <div className="order-item-details">
                    <h4>{item.product?.productName}</h4>
                    <p>Price: ₹{item.product?.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Total: ₹{(item.product?.price || 0) * (item.quantity || 1)}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3>Total: ₹{total}</h3>

            <div className="address-section">
              <h4>Customer & Delivery Details</h4>

              <input type="text" name="fullName" value={data.fullName} onChange={handleChange} placeholder="Full Name" />
              <input type="tel" name="phone" value={data.phone} onChange={handleChange} placeholder="Phone Number" />
              <input type="email" name="email" value={data.email} onChange={handleChange} placeholder="Email Address" />
              <input type="text" name="address" value={data.address} onChange={handleChange} placeholder="Full Address" />
              <input type="text" name="location" value={data.location} onChange={handleChange} placeholder="City / Location" />
            </div>

            <button className="confirm-btn" onClick={handleConfirm} disabled={loading}>
              {loading ? "Processing..." : `Pay ₹${total}`}
            </button>
          </>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={1500} theme="colored" />
    </>
  );
}

export default Order;