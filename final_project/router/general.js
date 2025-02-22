const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//simulation of fetching data in async function
async function fetchBooks() {
  try {
    return books;
  }catch (error) {
    throw new Error("failed to catch info of books");
  }
}

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
public_users.get('/',async function (req, res) {
  //Write your code here
  try {
    const books = await fetchBooks();
    res.status(200).json({ books });
  }catch (error) {
    res.status(500).json({ message: "failed to catch info of books", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  // First get request ISBN
  const isbn = req.params.isbn; 
  
  // Try to find the book according to the ISBN
  try {
    const book = books[isbn];  // Directly access the book without the IIFE

    if (book) {
      // If the book is found, return the book details
      return res.status(200).json(book);
    } else {
      // If the book is not found, return an error message
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    // If there is an error, return a failed response
    return res.status(500).json({ message: "Failed to fetch book details", error: error.message });
  }
});
  
// Get the list of books by a specific author
public_users.get('/author/:author', async function (req, res) {
  // Get request author from URL parameter
  const authorName = req.params.author; 

  try {
    // Convert the books object to an array asynchronously (assuming an async function for demonstration)
    const booksArray = await new Promise((resolve, reject) => {
      resolve(Object.values(books));  
    });

    // Filter the books by author name (synchronously)
    const booksByAuthor = booksArray.filter(book => book.author.toLowerCase() === authorName.toLowerCase());

    if (booksByAuthor.length > 0) {
      // If books are found, return them
      return res.status(200).json(booksByAuthor); 
    } else {
      // If no books found by this author
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    // Handle any unexpected errors
    return res.status(500).json({ message: "An error occurred while fetching books", error: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  //Get request title
  const titleName = req.params.title; // Get title name from URL parameter

  // Convert the books object to an array
  const booksArray = await new Promise((resolve, reject) => {
    resolve(Object.values(books));  
  });

  // use filter() receive book
  const booksByTitle = booksArray.filter(book => book.title == titleName);

  if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
  } else {
      return res.status(404).json({ message: "No books found by this title" }); 
  }
});

//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
  //Get request isbn
  const isbn = req.params.isbn; // Get isbn from URL parameter

  //simulation of fetching data in url
  try {
    const books = await fetchBooks();
  }catch (error) {
    res.status(500).json({ message: "failed to catch info of books", error: error.message });
  }
  
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
