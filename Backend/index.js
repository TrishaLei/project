const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Attachment Upload Path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'PostAttachments/');
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\.]/g, '');
    cb(null, Date.now() + '-' + sanitizedFilename);
  },
});
const upload = multer({ storage });

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

// -- Queries
const SelectUser_Post = 'SELECT posts.id,posts.title,posts.tags,posts.description,posts.attachments,posts.upvotes,posts.downvotes,posts.hasAttachments,posts.contentType, posts.price, posts.purchase, posts.PostDate, users.id AS userId, users.subscribers, users.username, users.avatar, IFNULL(JSON_LENGTH(posts.attachments), 0) AS AttachmentCount, IFNULL(JSON_LENGTH(posts.purchase), 0) AS PurchaseCount, IFNULL(JSON_LENGTH(posts.upvotes), 0) AS TotalUpVotes, IFNULL(JSON_LENGTH(posts.downvotes), 0) AS TotalDownVotes FROM posts JOIN users ON posts.userid = users.id WHERE posts.userid = ? ORDER BY (TotalUpVotes - TotalDownVotes) DESC';
const Select_Post = 'SELECT posts.id,posts.title,posts.tags,posts.description,posts.attachments,posts.upvotes,posts.downvotes,posts.hasAttachments,posts.contentType, posts.price, posts.purchase, posts.PostDate, users.id AS userId, users.subscribers, users.username, users.avatar, IFNULL(JSON_LENGTH(posts.attachments), 0) AS AttachmentCount, IFNULL(JSON_LENGTH(posts.purchase), 0) AS PurchaseCount, IFNULL(JSON_LENGTH(posts.upvotes), 0) AS TotalUpVotes, IFNULL(JSON_LENGTH(posts.downvotes), 0) AS TotalDownVotes FROM posts JOIN users ON posts.userid = users.id WHERE posts.id = ? ORDER BY (TotalUpVotes - TotalDownVotes) DESC';
const Show_All_Post = 'SELECT posts.id,posts.title,posts.tags,posts.description,posts.attachments,posts.upvotes,posts.downvotes,posts.hasAttachments,posts.contentType, posts.price, posts.purchase, posts.PostDate, users.id AS userId, users.subscribers, users.username, users.avatar, IFNULL(JSON_LENGTH(posts.attachments), 0) AS AttachmentCount, IFNULL(JSON_LENGTH(posts.purchase), 0) AS PurchaseCount, IFNULL(JSON_LENGTH(posts.upvotes), 0) AS TotalUpVotes, IFNULL(JSON_LENGTH(posts.downvotes), 0) AS TotalDownVotes FROM posts JOIN users ON posts.userid = users.id ORDER BY (TotalUpVotes - TotalDownVotes) DESC';

const UserSelect = 'SELECT id, username, balance, subscribers, followers, JoinDate FROM users WHERE username = ?';

// PayPal Components
const PAYPAL_CLIENT_ID = 'AYKWmFb-WbpwQ33wj5ox1adj-mThTPiLyYQG6431I6FVaepTksSkjfvmJLgE9iRqCpRu5_06ZwOQzBUS';
const PAYPAL_SECRET = 'ELpYA9IS-ku2cJoFf2yv4dIpTD-iOjGeOJ-wPfsGyUE0nLNw_8Gi7fIPEpNqtZZnG0u_NO20FUzs-des';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

//Verify Transaction | Components
const getAccessToken = async () => {
  const response = await axios({
    url: `${PAYPAL_API}/v1/oauth2/token`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`
    },
    data: 'grant_type=client_credentials'
  });
  return response.data.access_token;
};

const verifyTransaction = async (transactionId) => {
  const accessToken = await getAccessToken();
  const response = await axios({
    url: `${PAYPAL_API}/v2/checkout/orders/${transactionId}`,
    method: 'get',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data;
};


//Topup APIs
app.post('/user/paypal', async (req, res) => {
  const { transactionId, amount, payerId } = req.body;
  try {
    const transaction = await verifyTransaction(transactionId);
    if (transaction.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Transaction not completed' });
    }
    db.query('SELECT balance FROM users WHERE id = ?', [payerId], (err, results) => {
      if (err) {
        console.error('Error fetching user balance:', err);
        return res.status(500).send('Server error');
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [parseFloat(amount), payerId], (err, Paid) => {
        if (err) {
          console.error('Error updating user balance:', err);
          return res.status(500).send('Server error');
        }
        return res.status(200).json({ message: 'Payment successful'});
      });
    });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login/Signup APIs
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
        db.query(query, [usertoken, username, password], (err) => {
          if (err) {
            return res.status(500).send(`Server error: ${err}`);
          }
          return res.status(200).json({ message: 'Login successfuls', id: userId});
        });
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
});

app.post('/signup', (req, res) => {
  const { username, email, password, JoinDate } = req.body;
  db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, SelectResult) => {
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

// User Related APIs
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
  db.query(UserSelect, [username], (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
    if (results.length > 0) {
      return res.json({
        ...results[0],
        followers: JSON.parse(results[0].followers || '[]'),
        subscribers: JSON.parse(results[0].subscribers || '[]')
      });
    }else{
      return res.status(500).json(JSON.parse('[]'));
    }
  });
});


app.post('/user/follow/', (req, res) => {
  const { Authorname, userid } = req.body;
  db.query('SELECT followers, id FROM users WHERE username = ?', [Authorname], (err, AuthorResults) => {
    if (err) {
      console.error('Error fetching post:', err);
      res.status(500).send('Server error');
      return;
    }
    if (AuthorResults.length > 0) {
      let followers = JSON.parse(AuthorResults[0].followers || '[]');
      if(AuthorResults[0].id === userid){
        return res.status(500).json({ message: 'You cannot follow yourself!' });
      }
      if (!followers.includes(userid)) {
        followers.push(userid);
        db.query('UPDATE users SET followers = ? WHERE username = ?', [JSON.stringify(followers), Authorname], (err) => {
          if (err) {
            console.error('Error updating post:', err);
            res.status(500).send('Server error');
            return;
          }
          db.query(UserSelect, [Authorname], (err, NewAuthorResults) => {
            if (err) {
              console.error('Error fetching updated post:', err);
              res.status(500).send('Server error');
              return;
            }
            if(NewAuthorResults.length > 0){
              return res.json({
                ...NewAuthorResults[0],
                followers: JSON.parse(NewAuthorResults[0].followers || '[]'),
                subscribers: JSON.parse(NewAuthorResults[0].subscribers || '[]')
              });
            }else{
              return res.status(500).json(JSON.parse('[]'));
            }
          });
        });
      } else {
        followers = followers.filter(id => id !== userid);
        db.query('UPDATE users SET followers = ? WHERE username = ?', [JSON.stringify(followers), Authorname], (err) => {
          if (err) {
            console.error('Error updating post:', err);
            res.status(500).send('Server error');
            return;
          }
          db.query(UserSelect, [Authorname], (err, NewAuthorResults) => {
            if (err) {
              console.error('Error fetching updated post:', err);
              res.status(500).send('Server error');
              return;
            }
            if(NewAuthorResults.length > 0){
              return res.json({
                ...NewAuthorResults[0],
                followers: JSON.parse(NewAuthorResults[0].followers || '[]'),
                subscribers: JSON.parse(NewAuthorResults[0].subscribers || '[]')
              });
            }else{
              return res.status(500).json(JSON.parse('[]'));
            }
          });
        });
      }
    } else {
      res.status(404).send('Post not found');
    }
  });
});


// Post Related APIs
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
      purchase: JSON.parse(post.purchase || '[]'),
      subscribers: JSON.parse(post.subscribers || '[]')
    })));
  });
});

app.post('/publish', upload.array('attachments'), (req, res) => {
  const { usertoken, username, title, tags, description, contentType, price, hasAttachments, PostDate } = req.body;
  const attachments = req.files ? req.files.map(file => file.filename) : [];
  db.query('SELECT * FROM users WHERE token = ? AND username = ?', [usertoken, username], (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
    if (results.length > 0) {
      const userId = results[0].id;
      const insertUserQuery = 'INSERT INTO posts (userid, title, tags, description, contentType, price, attachments, hasAttachments, PostDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(insertUserQuery, [userId, title, tags, description, contentType, price, JSON.stringify(attachments), hasAttachments, PostDate], (err, results2) => {
        if (err) {
          console.error('Error:', err);
          return res.status(500).json({ message: 'Server error. Please try again later.' });
        }
        return res.status(200).json({ message: 'Post published!' });
      });
    }else{
      return res.status(500).json({ message: 'Invalid token!' });
    }
  });
});

app.post('/posts/download', (req, res) => {
  const { PostId, userId, Filename } = req.body;
  db.query('SELECT purchase, userid FROM posts WHERE id = ?', [PostId], (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
    if (results.length > 0) {
      results[0].purchase = JSON.parse(results[0].purchase || '[]');
      if(results[0].purchase.includes(userId) || results[0].userid === userId){
        const { id } = req.params;
        const filePath = __dirname + `/PostAttachments/${Filename}`;
        res.sendFile(filePath, err => {
          if (err) {
            res.status(404).send('File not found' + Filename);
          }
        });
      }else{
        return res.status(500).json({ message: 'You have not purchased this post!' });
      }
    }else{
      return res.status(200).json({ message: 'Post not available!' })
    }
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
              purchase: JSON.parse(results[0].purchase || '[]'),
              subscribers: JSON.parse(results[0].subscribers || '[]')
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
              purchase: JSON.parse(results[0].purchase || '[]'),
              subscribers: JSON.parse(results[0].subscribers || '[]')
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
              purchase: JSON.parse(results[0].purchase || '[]'),
              subscribers: JSON.parse(results[0].subscribers || '[]')
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
              purchase: JSON.parse(results[0].purchase || '[]'),
              subscribers: JSON.parse(results[0].subscribers || '[]')
            });
          });
        });
      }
    } else {
      res.status(404).send('Post not found');
    }
  });
});

app.post('/purchase/:postid', (req, res) => {
  const { postid } = req.params;
  const { username } = req.body;
  const CheckUser = 'SELECT * FROM users WHERE username = ?';
  const SelectPost = 'SELECT * FROM posts WHERE id = ?';

  db.query(CheckUser, [username], (err, UserResults) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'CheckUser: Server error. Please try again later.' });
    }
    if (UserResults.length > 0) {
      db.query(SelectPost, [postid], (err, PostResults) => {
        if(err){
          console.error('Error:', err);
          return res.status(500).json({ message: 'Post: Server error. Please try again later.' });
        }
        if(PostResults.length > 0){
          let PurchaseUserList = JSON.parse(PostResults[0].purchase || '[]');
          PurchaseUserList.push(UserResults[0].id);
          if(UserResults[0].balance > PostResults[0].price){
            const UpdateUserBalance = 'UPDATE users SET balance = balance - ? WHERE id = ?';
            db.query(UpdateUserBalance, [PostResults[0].price, UserResults[0].id], (err) => {
              if(err){
                console.error('Error:', err);
                return res.status(500).json({ message: 'Server error. Please try again later.' });
              }
              const UpdateAuthorBalance = 'UPDATE users SET balance = balance + ? WHERE id = ?';
              try{
                db.query(UpdateAuthorBalance, [PostResults[0].price, PostResults[0].userid], (err,UpdatedAuthor) => {
                  if(err){
                    console.error('Error:', err);
                    return res.status(500).json({ message: 'Server error. Please try again later.' });
                  }
                  if (UpdatedAuthor.affectedRows === 0) {
                    console.error('No rows affected. Author not found.');
                    return res.status(404).json({ message: 'Author not found.' });
                  }
                  db.query('UPDATE posts SET purchase = ? WHERE id = ?', [JSON.stringify(PurchaseUserList), postid], (err) => {
                    if (err) {
                      console.error('Error updating post:', err);
                      res.status(500).send('Server error');
                      return;
                    }
                    db.query(Select_Post, [postid], (err, NewPostResult) => {
                      if (err) {
                        console.error('Error fetching updated post:', err);
                        res.status(500).send('Server error');
                        return;
                      }
                      res.json({
                        ...NewPostResult[0],
                        upvotes: JSON.parse(NewPostResult[0].upvotes || '[]'),
                        downvotes: JSON.parse(NewPostResult[0].downvotes || '[]'),
                        purchase: JSON.parse(NewPostResult[0].purchase || '[]'),
                        subscribers: JSON.parse(NewPostResult[0].subscribers || '[]')
                      });
                    });
                  });
                });
              }catch(err){
                return res.status(500).json({ message: 'Author not found!', error: err });
              }
            });
          }else{
            return res.status(500).json({ message: 'Insufficient balance!' });
          }
        }else{
          return res.status(500).json({ message: 'Post not found' });
        }
      });
    }else{
      return res.status(500).json({ message: 'User not found' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});