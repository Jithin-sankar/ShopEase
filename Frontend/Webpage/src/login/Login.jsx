import React, { useState } from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

axios.defaults.withCredentials = true; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);

     
      await axios.post('https://shopease-g7bc.onrender.com/api/auth/login/', { username, password });

      
      const userRes = await axios.get('https://shopease-g7bc.onrender.com/api/auth/user/');
      console.log("User API Response:", userRes.data);

      const user = userRes.data.user || userRes.data;
      console.log("Final User Object:", user);

      if (!user) throw new Error("User data not received");

      toast.success('Login successful ✅');

      // 🔹 Redirect based on role
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/Admin');
        } else {
          navigate('/');
        }
      }, 500);

    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.error || err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login">
        <h1>Login</h1>
        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <h5>
          Don’t have an account? <Link to="/Register">Register</Link>
        </h5>
      </div>

      <ToastContainer 
        position="bottom-right" 
        autoClose={1500} 
        theme="colored" 
      />
    </>
  );
}

export default Login;