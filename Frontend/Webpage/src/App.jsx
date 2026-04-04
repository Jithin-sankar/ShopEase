
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/Cartcontext';
import { WishlistProvider } from "./context/WishlistContext";
import ProtectedRoute from './ProtectedRoute/ProtectedRoute';

import Login from './login/Login';
import Register from './login/Register';
import Products from './Products/Products';
import Home from './Home/Home';
import Cart from './Cart/Cart';
import View from './Products/View';
import Order from './Placeorder/Order';
import OrderSuccess from './Placeorder/OrderSuccess';
import OrderHistory from './Placeorder/OrderHistory';
import Wishlist from './Wishlist/Wishlist';
import Admin from './adminportal/Admin/Admin';
import Dashboard from './adminportal/pages/dashboard/Dashboard';
import Orderdetails from './adminportal/pages/orderdetails/Orderdetails';
import Productdetails from './adminportal/pages/productdetails/Productdetails';
import Userdetails from './adminportal/pages/userdetails/Userdetails';
import Userorder from './adminportal/pages/userdetails/Userorder';

function App() {
  return (
    <BrowserRouter>
    <WishlistProvider>
      <CartProvider>
        
        <Routes>
        
          <Route path="/" element={<Home />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Products" element={<Products />} />
          <Route path="/View/:id" element={<View />} />
          <Route path="/Cart" element={<Cart />} />
          <Route path="/Order" element={<Order />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/OrderSuccess" element={<OrderSuccess/>}/>
          <Route path="/orderhistory" element={<OrderHistory />} />

       
          <Route path="/Admin"element={<ProtectedRoute><Admin /> </ProtectedRoute>}/>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
          <Route path="/orderdetails"element={<ProtectedRoute><Orderdetails /></ProtectedRoute>}/>
          <Route path="/productdetails"element={<ProtectedRoute><Productdetails /></ProtectedRoute>}/>
          <Route path="/userdetails" element={<ProtectedRoute><Userdetails/></ProtectedRoute> }/>
          <Route path="/Userorder/:id" element={<ProtectedRoute><Userorder/></ProtectedRoute>}/>
        </Routes>
        
      </CartProvider>
      </WishlistProvider>
    </BrowserRouter>
  );
}

export default App;

