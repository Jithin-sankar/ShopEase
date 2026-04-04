import "./nav.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FaShoppingCart, FaHeart } from "react-icons/fa"; 
import axios from "axios";
import { CartContext } from "../context/Cartcontext";
import { WishlistContext } from "../context/WishlistContext";
import { AuthContext } from "../context/AuthContext";

function Nav() {
  const navigate = useNavigate();
  const { wishlistItems } = useContext(WishlistContext);
  const { cartCount } = useContext(CartContext);
  const { user, setUser, loading } = useContext(AuthContext);

  const wishlistCount = wishlistItems.length;

  const logout = async () => {
    try {
      await axios.post(
        "https://shopease-g7bc.onrender.com/api/auth/logout/",
        {},
        { withCredentials: true }
      );
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      setUser(null);
      navigate("/login");
    }
  };

  const login = () => {
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="navR">
        <h1 className="title" onClick={() => navigate("/")}>
          ShopEase
        </h1>
      </div>

      <div className="nav-center"></div>

      <div className="navL">
        <ul className="nav-links">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/products">Products</NavLink></li>
          {user && <li><NavLink to="/orderhistory">Orders</NavLink></li>}
          <li className="wishlist-icon">
            <NavLink to="/wishlist">
              <FaHeart size={20} />
              {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
            </NavLink>
          </li>
          <li className="cart-icon">
            <NavLink to="/cart">
              <FaShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </NavLink>
          </li>
        </ul>

        <div className="user-section">
          {loading ? (
            <span>Loading...</span>   
          ) : user ? (
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
