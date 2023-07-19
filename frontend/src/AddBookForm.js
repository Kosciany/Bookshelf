import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AddBookForm = () => {
  const [ISBN, setISBN] = useState('');
  const [rating, setRating] = useState(1); // Initialize rating with 1

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('accessToken'); // Get the access token from localStorage
    const url = 'http://localhost:8000/book';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the JWT token in the request header
        },
        body: JSON.stringify({ ISBN, rating }) // Convert data to JSON and send it in the request body
      });

      if (response.ok) {
        // Book added successfully, do something (e.g., show a success message)
        console.log('Book added successfully');
      } else {
        // Error occurred, handle the error (e.g., show an error message)
        console.error('Error adding book:', response.statusText);
      }
    } catch (error) {
      // Network error, handle the error (e.g., show an error message)
      console.error('Network error:', error.message);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center my-5">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="isbn" className="form-label">ISBN</label>
              <input
                type="text"
                className="form-control"
                id="isbn"
                value={ISBN}
                onChange={(e) => setISBN(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="rating" className="form-label">Rating</label>
              <input
                type="number"
                className="form-control"
                id="rating"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </form>
          <div className="mt-3 text-center">
            <Link to="/dashboard">
              <button className="btn btn-secondary">Back to Dashboard</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBookForm;
