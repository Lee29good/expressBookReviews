const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  // Get user information from the request body
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // if user not exist then we create an user data
  if (!isValid(username)) {
    return res.status(400).json({ message: "The username already exist" });
  }

  // Otherwise , Add the new user to the users array
  const newUser = { username, password }; // Create a new user object
  users.push(newUser); // Add the new user to the list
  
  return res.status(201).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.status(200).send(JSON.stringify({books}, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //First get request ISBN
  const isbn = req.params.isbn; 
  
  //find the book according to the ISBN
  const book = books[isbn];
  if (book) {
    // 如果找到了該書籍，返回書籍詳細信息
    return res.status(200).json(book);
  } else {
    // 如果沒有找到，返回錯誤消息
    return res.status(404).json({ message: "Book not found" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Get request author
  const authorName = req.params.author; // Get author name from URL parameter

  // Convert the books object to an array
  const booksArray = Object.values(books);

  // use filter() receive all author's books
  const booksByAuthor = booksArray.filter(book => book.author.toLowerCase() === authorName.toLowerCase());

  if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor); 
  } else {
      return res.status(404).json({ message: "No books found by this author" }); 
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Get request title
  const titleName = req.params.title; // Get title name from URL parameter

  // Convert the books object to an array
  const booksArray = Object.values(books);

  // use filter() receive book
  const booksByTitle = booksArray.filter(book => book.title == titleName);

  if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
  } else {
      return res.status(404).json({ message: "No books found by this title" }); 
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Get request isbn
  const isbn = req.params.isbn; // Get isbn from URL parameter

  const book = books[isbn];
  if (book) {
    // Check if reviews exist for the book
    if (Object.keys(book.reviews).length > 0) {
      return res.status(200).json(book.reviews); // Return the reviews for the book
    } else {
      return res.status(404).json({ message: "No reviews found for this book" }); // No reviews found for the book
    }
  } else {
    return res.status(404).json({ message: "Book not found" }); // If the book is not found
  }
});

module.exports.general = public_users;
