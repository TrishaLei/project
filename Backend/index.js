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
  db.query(query, [username, password], (err, results) => {
    if (err) {
      res.status(500).send('Server error');
      return;
    }
    if (results.length > 0) {
        const query = 'UPDATE users SET token = ? WHERE username = ? AND password = ?';
        db.query(query, [usertoken, username, password], (err, results) => {
          if (err) {
            res.status(500).send('Server error');
            return;
          }
          if (results.length > 0) {
            res.status(200).send('Login successful');
          } else {
            res.status(401).send('Invalid credentials');
          }
        });
    } else {
      res.status(401).send('Invalid credentials');
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});