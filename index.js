const { PORT = 9000 } = process.env
require('dotenv').config();
require('./helpers/additionalInit')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const connectToDb = require('./db/connect')

const { getUser, addUser, deleteUser } = require('./db/cruds/User')
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
app.post('/posts', async (req, res) => {
  const data = JSON.parse(req.body.data);

  log('JOB GOTTEN FROM REQUEST BUT NOT ADDING', data);

  await addPost(data);

  res.send('Post added');
});

// Get all posts in the data store
app.get('/posts', async (req, res) => {
  console.log('Get all jobs in the data store');

  const posts = await getPost({});

  console.log('Total number of posts', posts.length);

  res.json({ posts });
});


app.listen(PORT, () => {
  console.log(` Listening on port ${PORT}`)
})

