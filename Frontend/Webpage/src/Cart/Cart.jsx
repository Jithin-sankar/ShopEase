import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Nav from '../Nav/Nav';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Cart.css";
import { CartContext } from '../context/Cartcontext';

function Cart() {
  const { cartItems, setCartItems, fetchCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  
  const deleteItem = async (id) => {
    try {
      await axios.delete(`/api/cart/delete/${id}/`, {
        withCredentials: true
      });

     
      setCartItems(prev => prev.filter(item => item.id !== id));

      toast.info("Item removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
    }
  };

  
  const increase = async (productId) => {
    try {
      await axios.post(
        "/api/cart/",
        { product_id: productId },
        { withCredentials: true }
      );

      
      await fetchCart();

    } catch (err) {
      console.error(err);
      toast.error("Failed to increase quantity");
    }
  };

  
  const decrease = async (item) => {
    try {
      await axios.patch(
        `/api/cart/update/${item.id}/`,
        { action: "decrease" },
        { withCredentials: true }
      );

      
      await fetchCart();

    } catch (err) {
      console.error(err);
      toast.error("Failed to decrease quantity");
    }
  };

 
  const total = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    const qty = item.quantity || 1;
    return sum + price * qty;
  }, 0);

 
  const placeOrder = () => {
  if (cartItems.length === 0) {
    toast.warning("Your cart is empty!");
    return;
  }

 
  navigate("/order");
}
  return (
    <div className="container">
      <Nav />
      <ToastContainer />

      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="empty">Your cart is empty</p>
      ) : (
        <div className="items">

          {cartItems.map(item => (
            <div key={item.id} className="cart-item">

              
              <img
                src={item.product?.image}
                alt={item.product?.productName}
                className="cart-img"
              />

              <div className="details">
                
                <h3>{item.product?.productName}</h3>

                
                <p>Price: ₹{item.product?.price}</p>

               
                <div className="quantity-controls">
                  <button onClick={() => decrease(item)}>−</button>
                  <span>{item.quantity || 1}</span>
                  <button onClick={() => increase(item.product?.id)}>+</button>
                </div>

               
                <button
                  onClick={() => deleteItem(item.id)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

        
          <div className="cart-total">
            <h3>Total: ₹{total}</h3>

            <button
              className="place-order-btn"
              onClick={placeOrder}
            >
              Place Order
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default Cart;