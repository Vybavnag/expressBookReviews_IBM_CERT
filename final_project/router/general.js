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
public_users.get('/', (req, res) => {
  new Promise((resolve, reject) => {
    if (Object.keys(books).length > 0) {
      resolve(books);
    } else {
      reject("No books found");
    }
  })
    .then((allBooks) => {
      return res.status(200).json(allBooks);
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = await new Promise((resolve, reject) => {
      const found = books[isbn];
      found ? resolve(found) : reject(`No book found with ISBN ${isbn}`);
    });
    return res.status(200).json(book);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;

  new Promise((resolve, reject) => {
    let matchingBooks = [];
    for (let bookID in books) {
      if (books[bookID].author === author) {
        matchingBooks.push(books[bookID]);
      }
    }
    matchingBooks.length > 0
      ? resolve(matchingBooks)
      : reject(`No books found by author '${author}'`);
  })
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(404).json({ message: err }));
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const matchingBooks = await new Promise((resolve, reject) => {
      let found = [];
      for (let bookID in books) {
        if (books[bookID].title === title) {
          found.push(books[bookID]);
        }
      }
      found.length > 0
        ? resolve(found)
        : reject(`No books found with title '${title}'`);
    });
    return res.status(200).json(matchingBooks);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});

//  Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn].reviews);
    } else {
      reject(`No book found with ISBN '${isbn}'`);
    }
  })
    .then((reviews) => res.status(200).json(reviews))
    .catch((err) => res.status(404).json({ message: err }));
});
module.exports.general = public_users;
