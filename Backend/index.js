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

const Select_Post = 'SELECT posts.id,posts.title,posts.tags,posts.description,posts.attachment,posts.upvotes,posts.downvotes,posts.hasAttachment,posts.contentType, posts.price, users.id AS userId, users.username, users.avatar,  JSON_LENGTH(posts.upvotes) AS TotalUpVotes, JSON_LENGTH(posts.downvotes) AS TotalDownVotes FROM posts JOIN users ON posts.userid = users.id WHERE posts.id = ? ORDER BY TotalUpVotes DESC, TotalDownVotes ASC';
const Show_All_Post = 'SELECT posts.id,posts.title,posts.tags,posts.description,posts.attachment,posts.upvotes,posts.downvotes,posts.hasAttachment,posts.contentType, posts.price, users.id AS userId, users.username, users.avatar,  JSON_LENGTH(posts.upvotes) AS TotalUpVotes, JSON_LENGTH(posts.downvotes) AS TotalDownVotes FROM posts JOIN users ON posts.userid = users.id ORDER BY TotalUpVotes DESC, TotalDownVotes ASC';

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
  db.query(checkUserQuery, [username, email], (err, SelectResult) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  
    if (SelectResult.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(insertUserQuery, [username, email, password], (err, InsertResult) => {
      if (err) {
        console.error('Error:', err);
        return res.status(500).json({ message: 'Server error. Please try again later.', error: err });
      }
      const userId = InsertResult.insertId;
      res.status(200).json({ message: 'Signup successful!', id: userId });
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
  db.query(Show_All_Post, (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
    res.json(results.map(post => ({
      ...post,
      upvotes: JSON.parse(post.upvotes || '[]'),
      downvotes: JSON.parse(post.downvotes || '[]')
    })));
  });
});

app.post('/posts/:id/upvote', (req, res) => {
  const postId = parseInt(req.params.id);
  const { userId } = req.body;

  db.query('SELECT upvotes, downvotes FROM posts WHERE id = ?', [postId], (err, results) => {
    if (err) {
      console.error('Error fetching post:', err);
      res.status(500).send('Server error');
      return;
    }
    if (results.length > 0) {
      let upvotes = JSON.parse(results[0].upvotes || '[]');
      let downvotes = JSON.parse(results[0].downvotes || '[]');

      if (!upvotes.includes(userId)) {
        upvotes.push(userId);
        downvotes = downvotes.filter(id => id !== userId); // Remove user from downvotes if present
        db.query('UPDATE posts SET upvotes = ?, downvotes = ? WHERE id = ?', [JSON.stringify(upvotes), JSON.stringify(downvotes), postId], (err) => {
          if (err) {
            console.error('Error updating post:', err);
            res.status(500).send('Server error');
            return;
          }
          db.query(Select_Post, [postId], (err, results) => {
            if (err) {
              console.error('Error fetching updated post:', err);
              res.status(500).send('Server error');
              return;
            }
            res.json({
              ...results[0],
              upvotes: JSON.parse(results[0].upvotes || '[]'),
              downvotes: JSON.parse(results[0].downvotes || '[]')
            });
          });
        });
      } else {
        res.status(400).send('User has already upvoted this post');
      }
    } else {
      res.status(404).send('Post not found');
    }
  });
});

app.post('/posts/:id/downvote', (req, res) => {
  const postId = parseInt(req.params.id);
  const { userId } = req.body;

  db.query('SELECT upvotes, downvotes FROM posts WHERE id = ?', [postId], (err, results) => {
    if (err) {
      console.error('Error fetching post:', err);
      res.status(500).send('Server error');
      return;
    }
    if (results.length > 0) {
      let upvotes = JSON.parse(results[0].upvotes || '[]');
      let downvotes = JSON.parse(results[0].downvotes || '[]');

      if (!downvotes.includes(userId)) {
        downvotes.push(userId);
        upvotes = upvotes.filter(id => id !== userId); // Remove user from upvotes if present
        db.query('UPDATE posts SET upvotes = ?, downvotes = ? WHERE id = ?', [JSON.stringify(upvotes), JSON.stringify(downvotes), postId], (err) => {
          if (err) {
            console.error('Error updating post:', err);
            res.status(500).send('Server error');
            return;
          }
          db.query(Select_Post, [postId], (err, results) => {
            if (err) {
              console.error('Error fetching updated post:', err);
              res.status(500).send('Server error');
              return;
            }
            res.json({
              ...results[0],
              upvotes: JSON.parse(results[0].upvotes || '[]'),
              downvotes: JSON.parse(results[0].downvotes || '[]')
            });
          });
        });
      } else {
        res.status(400).send('User has already downvoted this post');
      }
    } else {
      res.status(404).send('Post not found');
    }
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