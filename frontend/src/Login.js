import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate  = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:8000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
    
        if (response.ok) {
          const data = await response.json();
          const accessToken = data.access_token;
          // Handle successful login, e.g., save the token to localStorage
          localStorage.setItem('accessToken', accessToken);
          console.log('Login successful!', data);
          navigate('/dashboard');
        } else {
          // Handle login error, e.g., display an error message
          console.log('Login failed!');
        }
      } catch (error) {
        // Handle network or server errors
        console.log('An error occurred during login:', error);
      }
  };

  const handleSignup = () => {
    navigate('/signup');
  };


  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4">
        <h1 className="text-center mb-4">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="text-center">
            <button type="button" className="btn btn-secondary me-2" onClick={handleSignup}>
              Sign up
            </button>
            <button type="submit" className="btn btn-primary ms-2">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;