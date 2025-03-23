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

const SelectUser_Post = 'SELECT posts.id,posts.title,posts.tags,posts.description,posts.attachment,posts.upvotes,posts.downvotes,posts.hasAttachment,posts.contentType, posts.price, posts.purchase, posts.PostDate, users.id AS userId, users.username, users.avatar,  JSON_LENGTH(posts.purchase) AS purchases, JSON_LENGTH(posts.upvotes) AS TotalUpVotes, JSON_LENGTH(posts.downvotes) AS TotalDownVotes FROM posts JOIN users ON posts.userid = users.id WHERE posts.userid = ? ORDER BY TotalUpVotes DESC, TotalDownVotes ASC';
const Select_Post = 'SELECT posts.id,posts.title,posts.tags,posts.description,posts.attachment,posts.upvotes,posts.downvotes,posts.hasAttachment,posts.contentType, posts.price, posts.purchase, posts.PostDate, users.id AS userId, users.username, users.avatar,  JSON_LENGTH(posts.purchase) AS purchases, JSON_LENGTH(posts.upvotes) AS TotalUpVotes, JSON_LENGTH(posts.downvotes) AS TotalDownVotes FROM posts JOIN users ON posts.userid = users.id WHERE posts.id = ? ORDER BY TotalUpVotes DESC, TotalDownVotes ASC';
const Show_All_Post = 'SELECT posts.id,posts.title,posts.tags,posts.description,posts.attachment,posts.upvotes,posts.downvotes,posts.hasAttachment,posts.contentType, posts.price, posts.purchase, posts.PostDate, users.id AS userId, users.username, users.avatar,  JSON_LENGTH(posts.purchase) AS purchases, JSON_LENGTH(posts.upvotes) AS TotalUpVotes, JSON_LENGTH(posts.downvotes) AS TotalDownVotes FROM posts JOIN users ON posts.userid = users.id ORDER BY TotalUpVotes DESC, TotalDownVotes ASC';

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
  const { username, email, password, JoinDate } = req.body;
  const checkUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.query(checkUserQuery, [username, email], (err, SelectResult) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  
    if (SelectResult.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    const insertUserQuery = 'INSERT INTO users (username, email, password, JoinDate) VALUES (?, ?, ?, ?)';
    db.query(insertUserQuery, [username, email, password, JoinDate], (err, InsertResult) => {
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
  const { usertoken, username, title, tags, description, contentType, price, PostDate} = req.body;
  const checkUserQuery = 'SELECT * FROM users WHERE token = ? AND username = ?';
  db.query(checkUserQuery, [usertoken, username], (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
    if (results.length > 0) {
      const userId = results[0].id;
      const insertUserQuery = 'INSERT INTO posts (userid, title, tags, description, contentType, price, PostDate) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.query(insertUserQuery, [userId, title, tags, description, contentType, price, PostDate], (err, results) => {
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
      downvotes: JSON.parse(post.downvotes || '[]'),
      purchase: JSON.parse(post.purchase || '[]')
    })));
  });
});

app.get('/user/:id/posts', (req, res) => {
  const postId = parseInt(req.params.id);
  db.query(SelectUser_Post, [postId],(err, results) => {
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
        downvotes = downvotes.filter(id => id !== userId); 
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
              downvotes: JSON.parse(results[0].downvotes || '[]'),
              purchase: JSON.parse(results[0].purchase || '[]')
            });
          });
        });
      } else {
        upvotes = upvotes.filter(id => id !== userId);
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
              downvotes: JSON.parse(results[0].downvotes || '[]'),
              purchase: JSON.parse(results[0].purchase || '[]')
            });
          });
        });
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
        upvotes = upvotes.filter(id => id !== userId); 
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
              downvotes: JSON.parse(results[0].downvotes || '[]'),
              purchase: JSON.parse(results[0].purchase || '[]')
            });
          });
        });
      } else {
        downvotes = downvotes.filter(id => id !== userId);
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
              downvotes: JSON.parse(results[0].downvotes || '[]'),
              purchase: JSON.parse(results[0].purchase || '[]')
            });
          });
        });
      }
    } else {
      res.status(404).send('Post not found');
    }
  });
});

app.post('/purchase/:postid/:authorname/:username', (req, res) => {
  const { postid, authorname, username} = req.params;
  const CheckUser = 'SELECT * FROM users WHERE username = ?';
  db.query(CheckUser, [username], (err, UserResults) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'CheckUser: Server error. Please try again later.' });
    }
    if (UserResults.length > 0) {
      db.query(CheckUser, [authorname], (err, AuthorResults) => {
        if (err) {
          console.error('Error:', err);
          return res.status(500).json({ message: 'CheckAuthor: Server error. Please try again later.' });
        }
        if(AuthorResults.length > 0){
          const SelectPost = 'SELECT * FROM posts WHERE id = ?';
          db.query(SelectPost, [postid], (err, PostResults) => {
            if(err){
              console.error('Error:', err);
              return res.status(500).json({ message: 'Post: Server error. Please try again later.' });
            }
            if(PostResults.length > 0){
              let purchasee = JSON.parse(PostResults[0].purchase || '[]');
              purchasee.push(UserResults[0].id);
              if(UserResults[0].balance > PostResults[0].price){
                const UpdateUserBalance = 'UPDATE users SET balance = balance - ? WHERE id = ?';
                db.query(UpdateUserBalance, [PostResults[0].price,UserResults[0].id], (err, UpdateUser) => {
                  if(err){
                    console.error('Error:', err);
                    return res.status(500).json({ message: 'Server error. Please try again later.' });
                  }
                  const UpdateAuthorBalance = 'UPDATE users SET balance = balance + ? WHERE id = ?';
                  db.query(UpdateAuthorBalance, [PostResults[0].price,AuthorResults[0].id], (err, UpdateAuthor) => {
                    if(err){
                      console.error('Error:', err);
                      return res.status(500).json({ message: 'Server error. Please try again later.' });
                    }
                    db.query('UPDATE posts SET purchase = ? WHERE id = ?', [JSON.stringify(purchasee), postid], (err) => {
                      if (err) {
                        console.error('Error updating post:', err);
                        res.status(500).send('Server error');
                        return;
                      }
                      db.query(Select_Post, [postid], (err, PostsResult) => {
                        if (err) {
                          console.error('Error fetching updated post:', err);
                          res.status(500).send('Server error');
                          return;
                        }
                        res.json({
                          ...PostsResult[0],
                          upvotes: JSON.parse(PostsResult[0].upvotes || '[]'),
                          downvotes: JSON.parse(PostsResult[0].downvotes || '[]'),
                          purchase: JSON.parse(PostsResult[0].purchase || '[]')
                        });
                      });
                    });
                  });
                });
              }else{
                return res.status(500).json({ message: 'Insufficient balance!' });
              }
            }else{
              return res.status(500).json({ message: 'Post not found' });
            }
          });
        }else{
          return res.status(500).json({ message: 'Author not found' });
        }
      });
    }else{
      return res.status(500).json({ message: 'User not found' });
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

app.get('/user/:username', (req, res) => {
  const { username } = req.params;
  const checkUserQuery = 'SELECT username, email, id, balance, JoinDate FROM users WHERE username = ?';
  db.query(checkUserQuery, [username], (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
    if (results.length > 0) {
      return res.status(200).json(results);
    }else{
      return res.status(500).json(JSON.parse('[]'));
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});