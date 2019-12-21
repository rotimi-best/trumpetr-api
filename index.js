const { PORT = 9000 } = process.env
require('dotenv').config();
require('./helpers/additionalInit')

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const connectToDb = require('./db/connect')

const { getUser, addUser } = require('./db/cruds/User')
const { getPost, addPost, updatePost } = require('./db/cruds/Post')

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
    return res.status(400).json({ success: false, message: 'Nickname already exists' });
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
app.put('/post/react/:postId', async (req, res) => {
  const { postId } = req.params;
  const { userId, type } = req.body;

  const allowedTypes = [
    'lovedBy',
    'suprisedBy',
    'thankfulBy',
  ];

  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ success: false, message: 'Reaction is not valid' });
  }
  if (!ObjectId.isValid(postId)) {
    return res.status(400).json({ success: false, message: 'Invalid postId' });
  }

  const [post] = await getPost({ _id: ObjectId(postId) });
  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  const { lovedBy, suprisedBy, thankfulBy } = post;

  const fieldToUpdate = reactionType => {
    switch(reactionType) {
      case allowedTypes[0]:
        return {
          lovedBy: lovedBy.includes(userId)
            ? lovedBy.filter(id => id !== userId)
            : lovedBy.concat(userId)
        }
      case allowedTypes[1]:
        return {
          suprisedBy: suprisedBy.includes(userId)
            ? suprisedBy.filter(id => id !== userId)
            : suprisedBy.concat(userId)
        }
      case allowedTypes[2]:
        return {
          thankfulBy: thankfulBy.includes(userId)
            ? thankfulBy.filter(id => id !== userId)
            : thankfulBy.concat(userId)
        }
      default:
        return {};
    }
  }

  const updateField = fieldToUpdate(type);
  post[type] = updateField[type]

  await updatePost({ _id: ObjectId(postId) }, updateField);

  res.json({
    success: true,
    post,
  });
});


app.listen(PORT, () => {
  console.log(` Listening on port ${PORT}`)
})

