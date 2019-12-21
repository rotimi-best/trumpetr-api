const { PORT = 9000 } = process.env
require('dotenv').config();
require('./helpers/additionalInit')

const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types;

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const connectToDb = require('./db/connect')

const { getUser, addUser } = require('./db/cruds/User')
const { getPost, addPost } = require('./db/cruds/Post')

const len = val => val.length;

const app = express()

// MONGODB ATLAS CONNECTION
connectToDb()

app.use(cors())
app.options('*', cors())
app.use(bodyParser.json())

/**
 * @route GET check
 * @route Check if server is running
 * @access Public
 */
app.get('/', (req, res) => {
  const date = new Date()

  res.send(`<h1>&copy; ${date.getFullYear()} API </h1>`)
})

/**
 * @route POST login
 * @route Login
 * @access Public
 */
app.post('/login', async (req, res) => {
  const { nickname = '', password = '' } = req.body;

  if (!len(nickname) || !len(password)) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  const user = await getUser({ nickname, password });

  if (!len(user)) {
    return res.status(400).json({ success: false, message: 'Username or Password is wrong' });
  }

  res.json({
    success: true,
    user: user[0],
  });
});

/**
 * @route POST register
 * @route Register
 * @access Public
 */
app.post('/register', async (req, res) => {
  const { fullname = '', nickname = '', password = '' } = req.body;

  if (!len(fullname) || !len(nickname) || !len(password)) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  const user = await getUser({ nickname });

  if (len(user)) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const newUser = await addUser({
    fullname,
    nickname,
    password,
  })

  delete newUser.password;

  res.json({
    success: true,
    user: newUser,
  });
});

// Add new job to the data store
app.post('/post', async (req, res) => {
  const data = req.body;

  console.log('JOB GOTTEN FROM REQUEST BUT NOT ADDING', data);
  data.userId = ObjectId(data.userId);

  await addPost(data);

  res.json({
    success: true,
  });
});

// Get all posts in the data store
app.get('/posts', async (req, res) => {
  const posts = await getPost({}, { sort: { createdAt: -1 } });
  const formattedPosts = [];

  for (const post of posts) {
    const user = await getUser({ _id: post.userId });
    const formattedPost = { ...post._doc }

    if (len(user)) {
      formattedPost.fullname = user[0].fullname
      formattedPost.nickname = user[0].nickname
    }

    formattedPosts.push(formattedPost);
  }

  res.json({ posts: formattedPosts });
});

// TODO: React to a post
app.put('/post/react/:id', async (req, res) => {
  const { id } = req.params;

  const post = await getPost({ _id: ObjectId(id) });

  console.log(post)
  res.json({ success: true });
});


app.listen(PORT, () => {
  console.log(` Listening on port ${PORT}`)
})

