const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Use cors middleware to allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected');
    seedDatabase(); // Call the seeder after connecting to MongoDB
  })
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'teacher'] },
});

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

// Seeder Function to Create Static Accounts and Sample Quiz
const seedDatabase = async () => {
  try {
    // Seed Teacher Account
    const teacherUsername = 'teacher1';
    const teacherPassword = 'pass123'; // Password will be hashed
    let teacher = await User.findOne({ username: teacherUsername });
    if (!teacher) {
      teacher = new User({
        username: teacherUsername,
        password: teacherPassword,
        role: 'teacher',
      });
      await teacher.save();
      console.log('Teacher account created:', teacherUsername);
    }

    // Seed Student Account
    const studentUsername = 'student1';
    const studentPassword = 'pass123'; // Password will be hashed
    let student = await User.findOne({ username: studentUsername });
    if (!student) {
      student = new User({
        username: studentUsername,
        password: studentPassword,
        role: 'student',
      });
      await student.save();
      console.log('Student account created:', studentUsername);
    }

    // Seed Sample Quiz (created by the teacher)
    const quizTitle = 'Sample Math Quiz';
    let quiz = await Quiz.findOne({ title: quizTitle });
    if (!quiz) {
      quiz = new Quiz({
        title: quizTitle,
        subject: 'Mathematics',
        pointsPerQuestion: 2,
        questions: [
          {
            questionText: 'What is 2 + 2?',
            options: [
              { text: '3', isCorrect: false },
              { text: '4', isCorrect: true },
              { text: '5', isCorrect: false },
              { text: '6', isCorrect: false },
            ],
          },
          {
            questionText: 'What is the square root of 16?',
            options: [
              { text: '2', isCorrect: false },
              { text: '4', isCorrect: true },
              { text: '8', isCorrect: false },
              { text: '16', isCorrect: false },
            ],
          },
          {
            questionText: 'What is 5 * 3?',
            options: [
              { text: '10', isCorrect: false },
              { text: '15', isCorrect: true },
              { text: '20', isCorrect: false },
              { text: '25', isCorrect: false },
            ],
          },
        ],
        createdBy: teacher._id.toString(),
      });
      await quiz.save();
      console.log('Sample quiz created:', quizTitle);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Quiz System API' });
});

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

app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Error fetching quizzes' });
  }
});

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

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;