import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Nav from '../Nav/Nav';
import './orderSuccess.css';

function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      verifyPayment();
      hasRun.current = true;
    }
  }, []);

  const verifyPayment = async () => {
    const session_id = searchParams.get("session_id");

    console.log("SESSION ID:", session_id); 

    if (!session_id) {
      toast.error("Invalid session");
      navigate("/order");
      return;
    }

    try {
      const res = await axios.post(
        "https://shopease-g7bc.onrender.com/api/payment/verify/",
        { session_id },
        { withCredentials: true }
      );

      console.log("VERIFY RESPONSE:", res.data);

      if (res.data.status === "success") {
        toast.success("Payment Successful ✅");

        setTimeout(() => {
          navigate("/Order");
        }, 3000);

      } else {
        toast.error("Payment not completed ❌");
      }

    } catch (err) {
      console.error("ERROR:", err.response?.data); 
      toast.error("Payment verification failed ❌");
      navigate("/Order");
    }
  };

  return (
    <>
      <Nav />

      <div className="order-success-page">
        <div className="order-success-card">
          <h2>🎉 Order Placed Successfully!</h2>
          <p>Processing your payment...</p>

          <div className="order-success-buttons">
            <Link to="/Products" className="btn btn-products">Back to Products</Link>
            <Link to="/Order" className="btn btn-orders">View Orders</Link>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}

export default OrderSuccess;