import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import BooksList from './Booklist';
import AddBookForm from './AddBookForm';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<BooksList />} />
        <Route path="/add-book" element={<AddBookForm />} /> {/* Add the route for the AddBookForm */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
};

export default App;