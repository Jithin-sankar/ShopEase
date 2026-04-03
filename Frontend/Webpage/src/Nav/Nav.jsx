import "./nav.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { FaShoppingCart, FaHeart } from "react-icons/fa"; 
import axios from "axios";
import { CartContext } from "../context/Cartcontext";
import { WishlistContext } from "../context/WishlistContext";

function Nav() {
  const navigate = useNavigate();

  const { wishlistItems } = useContext(WishlistContext);
  const { cartCount } = useContext(CartContext);

  const wishlistCount = wishlistItems.length; 

  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        "https://shopease-g7bc.onrender.com/api/auth/user/",
        { withCredentials: true }
      );
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

 const logout = async () => {
    try {
      await axios.post(
        "https://shopease-g7bc.onrender.com/api/auth/logout/",
        {},
        { withCredentials: true }
      );
      
      // Clear local state
      setUser(null);
      
      // Force a full refresh to clear any cached auth data in the browser
      window.location.href = "/"; 
      
    } catch (err) {
      console.error("Logout failed", err);
      // Fallback: clear local state anyway
      setUser(null);
      window.location.href = "/login";
    }
  };
  const login = () => {
    navigate("/login");
  };

  return (
    <div className="navbar">

      {/* LEFT */}
      <div className="navR">
        <h1 className="title" onClick={() => navigate("/")}>
          ShopEase
        </h1>
      </div>

      {/* CENTER (important for layout balance) */}
      <div className="nav-center"></div>

      {/* RIGHT */}
      <div className="navL">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/Products">Products</Link></li>

          {user && (
            <li>
              <Link to="/orderhistory">Orders</Link>
            </li>
          )}

          <li className="wishlist-icon">
            <Link to="/wishlist">
              <FaHeart size={20} />
              {wishlistCount > 0 && (
                <span className="wishlist-count">{wishlistCount}</span>
              )}
            </Link>
          </li>

          <li className="cart-icon">
            <Link to="/Cart">
              <FaShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </Link>
          </li>
        </ul>

        <div className="user-section">
          {user ? (
            <>
              <span className="username">Hi, {user.username}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <button onClick={login}>Login/Register</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Nav;