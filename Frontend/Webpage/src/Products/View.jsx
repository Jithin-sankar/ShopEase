import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './View.css';
import { toast, ToastContainer } from 'react-toastify';
import { CartContext } from "../context/Cartcontext";
import { WishlistContext } from "../context/WishlistContext";
import Nav from "../Nav/Nav";

function View() {
  const [view, setView] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  const { wishlistItems, fetchWishlist } = useContext(WishlistContext);
  const { fetchCart } = useContext(CartContext);

  
  const isLiked = wishlistItems.some(
    item => item.product.id === Number(id)
  );

 
  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/products/${id}/`);
      setView(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  const toggleWishlist = async (product) => {
    try {
      const item = wishlistItems.find(
        w => w.product.id === product.id
      );

      if (item) {
        await axios.delete(`/api/wishlist/${item.id}/`);
        toast.info(`${product.productName} removed`);
      } else {
        await axios.post('/api/wishlist/', {
          product_id: product.id
        });
        toast.success(`${product.productName} added ❤️`);
      }

      fetchWishlist(); 

    } catch (err) {
      console.error(err);
      toast.error("Login required!");
    }
  };


  const addToCart = async (product) => {
    try {
      await axios.post("/api/cart/", {
        product_id: product.id
      });

      fetchCart();

      toast.success(`${product.productName} added to cart!`);

    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Login required or failed!");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (!view) return <h2 style={{ textAlign: 'center' }}>Loading...</h2>;

  return (
    <>
      <Nav />

      <div className='view-container'>

      
        <button
          className='wishlist-btn-view'
          onClick={() => toggleWishlist(view)}
        >
          {isLiked ? "❤️" : "🤍"}
        </button>

        <img
          src={view.image}
          alt={view.productName}
          className="product-image"
        />

        <h2>{view.productName}</h2>
        <p>{view.description}</p>

        {view.specs && typeof view.specs === "object" && (
          <div>
            {Object.entries(view.specs).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {value}
              </p>
            ))}
          </div>
        )}

        <h3><strong>Price:</strong> ₹ {view.price}</h3>

        <div className="button-group">
          <button
            className="add-cart-btn"
            onClick={() => addToCart(view)}
          >
            Add to Cart
          </button>

          <button
            className="back-btn"
            onClick={() => navigate("/products")}
          >
            Back to Products
          </button>
        </div>

        <ToastContainer
          position='top-right'
          autoClose={1500}
          theme='colored'
        />
      </div>
    </>
  );
}

export default View;