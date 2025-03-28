const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
});

const User = mongoose.model('User', userSchema);

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

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching quizzes' });
  }
});

app.post('/api/quizzes', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Error creating quiz' });
  }
});

app.post('/api/submit-quiz', async (req, res) => {
  try {
    const result = new QuizResult(req.body);
    await result.save();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error submitting quiz' });
  }
});

app.get('/api/results/:studentId', async (req, res) => {
  try {
    const results = await QuizResult.find({ studentId: req.params.studentId });
    res.json(results);
  } catch (error) {
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