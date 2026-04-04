import "./nav.css";
import { NavLink, useNavigate } from "react-router-dom";
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
      setUser(null);
      navigate("/");   // ✅ client-side navigation
    } catch (err) {
      console.error("Logout failed", err);
      setUser(null);
      navigate("/login"); // ✅ no full reload
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
          <li>
            <NavLink to="/" end activeClassName="active">Home</NavLink>
          </li>
          <li>
            <NavLink to="/products" activeClassName="active">Products</NavLink>
          </li>

          {user && (
            <li>
              <NavLink to="/orderhistory" activeClassName="active">Orders</NavLink>
            </li>
          )}

          <li className="wishlist-icon">
            <NavLink to="/wishlist" activeClassName="active">
              <FaHeart size={20} />
              {wishlistCount > 0 && (
                <span className="wishlist-count">{wishlistCount}</span>
              )}
            </NavLink>
          </li>

          <li className="cart-icon">
            <NavLink to="/cart" activeClassName="active">
              <FaShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </NavLink>
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
