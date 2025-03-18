const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'discord',
  password: 'omgdropaeye',
  database: 'EduHub'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Login route
app.post('/login', (req, res) => {
  const { usertoken, username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, selectResult) => {
    if (err) {
      res.status(500).send('Server error');
      return;
    }
    if (selectResult.length > 0) {
        const userId = selectResult[0].id;
        const query = 'UPDATE users SET token = ? WHERE username = ? AND password = ?';
        db.query(query, [usertoken, username, password], (err, updateResult) => {
          if (err) {
            res.status(500).send('Server error');
            return;
          }else{
            res.status(200).json({ message: 'Login successfuls', id: userId});
          }
        });
    } else {
      res.status(401).send('Invalid credentials2');
    }
  });
});

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  const checkUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.query(checkUserQuery, [username, email], (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  
    if (results.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(insertUserQuery, [username, email, password], (err, results) => {
      if (err) {
        console.error('Error:', err);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
      }
  
      res.status(200).json({ message: 'Signup successful!' });
    });
  });
});

app.post('/publish', (req, res) => {
  const { usertoken, username, title, tags, description, contentType, price } = req.body;
  const checkUserQuery = 'SELECT * FROM users WHERE token = ? AND username = ?';
  db.query(checkUserQuery, [usertoken, username], (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
    if (results.length > 0) {
      const userId = results[0].id;
      const insertUserQuery = 'INSERT INTO posts (userid, title, tags, description, contentType, price) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(insertUserQuery, [userId, title, tags, description, contentType, price], (err, results) => {
        if (err) {
          console.error('Error:', err);
          return res.status(500).json({ message: 'Server error. Please try again later.' });
        }else{
          res.status(200).send('Post published');
        }
      });
    }
  });
});

app.get('/posts', (req, res) => {
  const getPostsQuery = `SELECT posts.title,posts.tags,posts.description,posts.attachment,posts.upvote,posts.downvote,posts.hasAttachment,posts.contentType, posts.price, users.username, users.avatar FROM posts JOIN users ON posts.userid = users.id ORDER BY posts.id DESC`;
  db.query(getPostsQuery, (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
    res.status(200).json(results);
  });
});

app.get('/avatar/:id', (req, res) => {
  const { id } = req.params;
  const filePath = __dirname + `/public/avatar/${id}.png`;
  res.sendFile(filePath, err => {
    if (err) {
      res.status(404).send('Image not found');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});