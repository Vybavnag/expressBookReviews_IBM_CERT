const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  if(!username || !password){
    return res.status(400).json({ message: "Username or password is missing" });
  }
  
  let userExists = users.some((user) => user.username === username);
  if(userExists){
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({username,password});

  return res.status(201).json({
    message: `User '${username}' successfully registered`,
  });

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let matchingBooks =[];

  for(let bookID in books){
    const book = books[bookID];
    if(book.author === author){
      matchingBooks.push(book);
    }
  }

  return res.send(matchingBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let matchingBooks =[]

  for(let bookID in books){
    const book = books[bookID];
    if(book.title === title){
      matchingBooks.push(book);
    }
  }
  return res.send(matchingBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const review = books[isbn].reviews;
  return res.send(review);
});

module.exports.general = public_users;
