import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username) {
      setUsernameError('Username cannot be empty');
      return;
    }

    if (!password) {
      setPasswordError('Password cannot be empty');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        navigate('/login');
      } else if (response.status === 409) {
        setUsernameError('Username already exists');
      } else {
        // Handle other signup errors
      }
    } catch (error) {
      // Handle network or other errors
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setUsernameError('');
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4">
        <h1 className="text-center mb-4">Sign up</h1>
        <form onSubmit={handleSignup}>
          <div className={`mb-3 ${usernameError && 'has-error'}`}>
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className={`form-control ${usernameError && 'is-invalid'}`}
              id="username"
              value={username}
              onChange={handleUsernameChange}
            />
            {usernameError && <div className="invalid-feedback">{usernameError}</div>}
          </div>
          <div className={`mb-3 ${passwordError && 'has-error'}`}>
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${passwordError && 'is-invalid'}`}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleTogglePasswordVisibility}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {passwordError && <div className="invalid-feedback">{passwordError}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="text-center">
            <button type="submit" className="btn btn-primary me-2">Sign up</button>
            <button type="button" className="btn btn-secondary ms-2" onClick={handleLogin}>
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
