import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get("/api/wishlist/");
      setWishlistItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlistItems, setWishlistItems, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}