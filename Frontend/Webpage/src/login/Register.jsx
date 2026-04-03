import React, { useState } from 'react';
import './reg.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
   
    if (!username || !email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await axios.post(
        'https://shopease-g7bc.onrender.com/api/auth/register/',
        {
          username,
          email,
          password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      
      toast.success('Registration successful!');

     
      setTimeout(() => navigate('/Login'), 1000);

    } catch (error) {
      console.error('Error:', error);

     
      if (error.response && error.response.data) {
        const errors = error.response.data;

        
        const errorMessage = Object.values(errors)
          .flat()
          .join(' ');

        toast.error(errorMessage);
      } else {
        toast.error('Registration failed. Try again.');
      }
    }
  };

  return (
    <>
      <div className='reg'>
        <h1>Registration</h1>

        <input
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type='email'
          placeholder='Email Address'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleRegister}>Register</button>

        <h5>
          Already have an account? <Link to='/Login'>Login</Link>
        </h5>
      </div>

      
      <ToastContainer
        position='bottom-right'
        autoClose={2000}
        theme='colored'
      />
    </>
  );
}

export default Register;