import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import './Products.css';
import { useNavigate } from 'react-router-dom';
import Nav from '../Nav/Nav';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartContext } from '../context/Cartcontext';
import { WishlistContext } from '../context/WishlistContext';

axios.defaults.baseURL = "https://shopease-g7bc.onrender.com";
axios.defaults.withCredentials = true;

function Products() {
  const navigate = useNavigate();

  const { fetchCart } = useContext(CartContext);


  const { wishlistItems, fetchWishlist } = useContext(WishlistContext);

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [brands, setBrands] = useState([]);
  const [activeBrand, setActiveBrand] = useState('All');

 
  useEffect(() => {
    fetchProducts();
    fetchWishlist(); 
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products/');
      setProducts(res.data);
      setFiltered(res.data);

      const uniqueBrands = [...new Set(res.data.map(item => item.brand))];
      setBrands(uniqueBrands);
    } catch (err) {
      console.error(err);
    }
  };

 
  const wishlistIds = wishlistItems.map(item => item.product.id);

  
  const toggleWishlist = async (product, e) => {
    e.stopPropagation();

    try {
     
      if (!wishlistIds.includes(product.id)) {
        await axios.post("/api/wishlist/", {
          product_id: product.id
        });

        fetchWishlist();
        toast.success(`${product.productName} added ❤️`);
      }
      
      else {
        const item = wishlistItems.find(
          w => w.product.id === product.id
        );

        if (item) {
          await axios.delete(`/api/wishlist/${item.id}/`);
          fetchWishlist(); 
          toast.info(`${product.productName} removed`);
        }
      }

    } catch (err) {
      console.error(err);
      toast.error("Login required");
    }
  };

 
  const filterByBrand = (brand) => {
    setActiveBrand(brand);

    if (brand === 'All') {
      setFiltered(products);
    } else {
      setFiltered(
        products.filter(item =>
          item.brand.toLowerCase() === brand.toLowerCase()
        )
      );
    }
  };

  
  const addToCart = async (product, e) => {
    e.stopPropagation();

    try {
      await axios.post("/api/cart/", {
        product_id: product.id
      });

      fetchCart();
      toast.success(`${product.productName} added to cart 🛒`);
    } catch (err) {
      console.error(err);
      toast.error("Login required!");
    }
  };

  return (
    <>
      
      <Nav />

      <div className='products-container'>
        <h1>Products</h1>

        <div className='brand-filter'>
          <button
            className={`brand-btn ${activeBrand === 'All' ? 'active' : ''}`}
            onClick={() => filterByBrand('All')}
          >
            All
          </button>

          {brands.map((brand) => (
            <button
              key={brand}
              className={`brand-btn ${activeBrand === brand ? 'active' : ''}`}
              onClick={() => filterByBrand(brand)}
            >
              {brand}
            </button>
          ))}
        </div>

     
        <div className='products-grid'>
          {filtered.map((pro) => (
            <div
              key={pro.id}
              className='product-card'
              onClick={() => navigate(`/view/${pro.id}`)}
            >
            
              <button
                className='wishlist-btn'
                onClick={(e) => toggleWishlist(pro, e)}
              >
                {wishlistIds.includes(pro.id) ? "❤️" : "🤍"}
              </button>

              <img
                src={pro.image}
                alt={pro.productName}
                className='product-img'
              />

              <h2>{pro.productName}</h2>

              <p>
                <strong>Price:</strong> ₹ {pro.price}
              </p>

              <div className='actions'>
                <button
                  className='add-cart-btn'
                  onClick={(e) => addToCart(pro, e)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ToastContainer position='bottom-right' autoClose={1500} />
    </>
  );
}

export default Products;