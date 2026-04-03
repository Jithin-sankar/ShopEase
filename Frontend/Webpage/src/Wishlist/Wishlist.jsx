import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Wishlist.css';
import Nav from '../Nav/Nav';
import { toast, ToastContainer } from 'react-toastify';
import { CartContext } from '../context/Cartcontext';
import { WishlistContext } from '../context/WishlistContext';

function Wishlist() {
  const navigate = useNavigate();

 
  const { fetchCart } = useContext(CartContext);
  const { wishlistItems, fetchWishlist } = useContext(WishlistContext);

  const removeFromWishlist = async (id, name, e) => {
    e.stopPropagation();

    try {
      await axios.delete(`/api/wishlist/${id}/`);

     
      fetchWishlist();

      toast.info(`${name} removed`);

    } catch (err) {
      console.error(err);
      toast.error("Failed to remove");
    }
  };

  
  const addToCart = async (item, e) => {
    e.stopPropagation();

    try {
      
      await axios.post("/api/cart/", {
        product_id: item.product.id
      });

     
      fetchCart();

      
      await axios.delete(`/api/wishlist/${item.id}/`);

      fetchWishlist();

      toast.success("Moved to cart 🛒");

    } catch (err) {
      console.error(err);
      toast.error("Error moving to cart");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <>
      
      <Nav />

      <ToastContainer position="bottom-right" autoClose={1500} />

      <div className="wishlist-container">
        <h1>My Wishlist ❤️</h1>

        {wishlistItems.length === 0 ? (
          <h2 className="empty">Your wishlist is empty</h2>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="wishlist-card"
                onClick={() => navigate(`/view/${item.product?.id}`)}
              >
                <img
                  src={item.product?.image}
                  alt={item.product?.productName}
                />

                <h3>{item.product?.productName}</h3>

                <p>₹ {item.product?.price}</p>

               
                <button
                  className="remove-btn"
                  onClick={(e) =>
                    removeFromWishlist(
                      item.id,
                      item.product?.productName,
                      e
                    )
                  }
                >
                  Remove ❤️
                </button>

               
                <button
                  className="cart-btn"
                  onClick={(e) => addToCart(item, e)}
                >
                  Move to Cart 🛒
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Wishlist;