import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    try {
      const res = await axios.get("https://shopease-g7bc.onrender.com/api/cart/", {
        withCredentials: true
      });
      setCartItems(res.data);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);


  const cartCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{ cartItems, setCartItems, cartCount, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
}