const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Added for password hashing
require('dotenv').config();

const app = express();

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: 'https://online-quiz.vercel.app', // Ensure this matches your frontend URL exactly
  methods: ['GET', 'POST', 'OPTIONS'], // Explicitly allow OPTIONS for preflight requests
  allowedHeaders: ['Content-Type'], // Allow Content-Type header
  credentials: false, // No credentials (e.g., cookies) are used
}));

// Explicitly handle preflight requests for all routes
app.options('*', cors());

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Will store hashed password
  role: { type: String, required: true, enum: ['student', 'teacher'] },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

// Quiz Schema
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  pointsPerQuestion: { type: Number, required: true, min: 1 },
  questions: [
    {
      questionText: { type: String, required: true },
      options: [
        {
          text: { type: String, required: true },
          isCorrect: { type: Boolean, required: true },
        },
      ],
    },
  ],
  createdBy: { type: String, required: true },
});

const Quiz = mongoose.model('Quiz', quizSchema);

// Quiz Result Schema
const quizResultSchema = new mongoose.Schema({
  quizId: { type: String, required: true },
  studentId: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  answers: [
    {
      questionId: { type: Number, required: true },
      selectedOption: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
    },
  ],
});

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

// Routes
// Root route (for testing)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Quiz System API' });
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Create User
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = new User({ username, password, role });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Get All Quizzes
app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Error fetching quizzes' });
  }
});

// Create Quiz
app.post('/api/quizzes', async (req, res) => {
  try {
    const { title, subject, pointsPerQuestion, questions, createdBy } = req.body;
    if (!title || !subject || !pointsPerQuestion || !questions || !createdBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const quiz = new Quiz({ title, subject, pointsPerQuestion, questions, createdBy });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Error creating quiz' });
  }
});

// Submit Quiz
app.post('/api/submit-quiz', async (req, res) => {
  try {
    const { quizId, studentId, score, total, answers } = req.body;
    if (!quizId || !studentId || score === undefined || !total || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = new QuizResult({ quizId, studentId, score, total, answers });
    await result.save();
    res.status(201).json(result);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Error submitting quiz' });
  }
});

// Get Quiz Results for a Student
app.get('/api/results/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ error: 'Missing studentId' });
    }

    const results = await QuizResult.find({ studentId });
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
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