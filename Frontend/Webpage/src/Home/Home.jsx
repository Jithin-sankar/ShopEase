import React from 'react'
import { useNavigate } from 'react-router-dom';
import "./Home.css"
import Nav from '../Nav/Nav';
function Home() {
   const navigate = useNavigate();
  return (
    <div>
       <Nav/>
    <div className='home'>
<img className='homeimage' src="home1.png" alt="" />
 <button className="shop-button"  onClick={() => navigate('/products')} > SHOP NOW</button>
    </div>
    <div className='categories'>
        <div className='category-card' onClick={() => navigate('/products')}>
          <img src="realme.jpg" alt="Realme" />
          <h3>Realme</h3>
        </div>

        <div className='category-card' onClick={() => navigate('/products')}>
          <img src="samsung.jpg" alt="Samsung" />
          <h3>Samsung</h3>
        </div>

        <div className='category-card' onClick={() => navigate('/products')}>
          <img src="OnePlus-9-series-1.avif" alt="OnePlus" />
          <h3>OnePlus</h3>
        </div>
      </div>
      <div className='footer'>
         <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: support@shopease.com</p>
          <p>Phone: +91 8110824821</p>
          <p>© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
        </div>
      </div>
      </div>
      
    
  
  )
}

export default Home