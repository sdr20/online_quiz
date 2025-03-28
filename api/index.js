const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: 'https://online-quiz.vercel.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
});

const User = mongoose.model('User', userSchema);

// Quiz Schema
const quizSchema = new mongoose.Schema({
  title: String,
  subject: String,
  pointsPerQuestion: Number,
  questions: [
    {
      questionText: String,
      options: [
        {
          text: String,
          isCorrect: Boolean,
        },
      ],
    },
  ],
  createdBy: String,
});

const Quiz = mongoose.model('Quiz', quizSchema);

// Quiz Result Schema
const quizResultSchema = new mongoose.Schema({
  quizId: String,
  studentId: String,
  score: Number,
  total: Number,
  answers: [
    {
      questionId: Number,
      selectedOption: String,
      isCorrect: Boolean,
    },
  ],
});

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

// Routes
// Root route (optional, for testing)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Quiz System API' });
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.findOne({ username, password, role });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Create User
app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Get All Quizzes
app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching quizzes' });
  }
});

// Create Quiz
app.post('/api/quizzes', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Error creating quiz' });
  }
});

// Submit Quiz
app.post('/api/submit-quiz', async (req, res) => {
  try {
    const result = new QuizResult(req.body);
    await result.save();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error submitting quiz' });
  }
});

// Get Quiz Results for a Student
app.get('/api/results/:studentId', async (req, res) => {
  try {
    const results = await QuizResult.find({ studentId: req.params.studentId });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching results' });
  }
});

// Start the server locally (not used in Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;