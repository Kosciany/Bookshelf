import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BooksList = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Fetch the list of books from the backend API
    fetch('http://localhost:8000/books', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Send the JWT token in the request header
      }
    })
      .then(response => response.json())
      .then(data => {
        // For each book, fetch additional details from the Open Library API
        Promise.all(data.map(book => fetchBookDetails(book)))
          .then(booksWithDetails => setBooks(booksWithDetails))
          .catch(error => console.error('Error fetching book details:', error));
      })
      .catch(error => console.error('Error fetching books:', error));
  }, []);

  const fetchBookDetails = (book) => {
    const isbn = book.ISBN;
    const apiUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=details&format=json`;

    return fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const bookDetails = data[`ISBN:${isbn}`]?.details;
        if (bookDetails) {
        console.log(bookDetails)
        if (bookDetails.covers && bookDetails.covers.length > 0) {
            book.cover = bookDetails.covers[0]; // Extract the thumbnail URL
        }
        
          console.log(book.cover)
          book.title = bookDetails.title; // Extract the title
          if (bookDetails.authors && bookDetails.authors.length > 0) {
            book.author = bookDetails.authors[0].name; // Extract the author's name
          }
        }
        return book;
      });
  };

  return (
    <div>
      <h2 className="text-center">Books List</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Thumbnail</th>
            <th>Title</th>
            <th>Author</th>
            <th>Rating</th>
            <th>ISBN</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.ISBN}>
              <td>{book.ISBN && <img src={`https://covers.openlibrary.org/b/isbn/${book.ISBN}-M.jpg`} alt="Book Cover" className="thumbnail" />}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.rating}</td>
              <td>{book.ISBN}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-center mt-3">
        <Link to="/add-book">
          <button className="btn btn-primary">Add Book</button>
        </Link>
      </div>
    </div>
  );
};

export default BooksList;
