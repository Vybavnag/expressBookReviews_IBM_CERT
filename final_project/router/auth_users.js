const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  const existingUser = users.find((user) => user.username === username);
  return !existingUser;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const matchingUser = users.find((user) => user.username === username && user.password === password);
  return !!matchingUser;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(!username || !password){
      return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
            let accessToken = jwt.sign({
                username: username
            }, 'access', { expiresIn: 60 });
            req.session.authorization = {
                accessToken, username
            }
            return res.status(200).send("User successfully logged in");
        } else {
            return res.status(208).json({ message: "Invalid Login. Check username and password" });
        }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  if(!books[isbn]){
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

  const username = req.user.username;

  if(!books[isbn].reviews){
    books[isbn].reviews = {};
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

  const username  = req.body.username; 

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: `No review found for user '${username}' on this book` });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review successfully deleted" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
