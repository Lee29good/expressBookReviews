const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const secretKey = 'yourSecretKey'; // Unified Secret Key

let users = [{ "username": "exampleUsername", "password": "examplePassword" }];

const isValid = (username) => {
  return !users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user ? user.password === password : false;
}

// **Login and generate JWT**
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body; // Directly destructure body
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(403).json({ message: "Incorrect username or password" });
  }

  // Generate JWT
  const accessToken = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

  // Store in session
  req.session.authorization = { accessToken };
  req.session.save(); // Ensure session is saved

  return res.status(200).json({ message: "User logged in successfully", token: accessToken });
});

// **Add or update book review**
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.content; // Fix: get the content from request body

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  const username = req.user.username; // Get the username from authenticated user data
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  book.reviews[username] = review;
  return res.status(200).json({ message: "Review added or updated successfully" });
});

// **Delete book review**
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get the book ISBN
  const username = req.user.username; // Get the authenticated user's username

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has a review
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found or not owned by user" });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;