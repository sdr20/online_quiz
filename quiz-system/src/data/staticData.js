// src/data/staticData.js

// Static Users
export const users = [
    {
      _id: 'teacher1_id',
      username: 'teacher1',
      password: 'pass123',
      role: 'teacher',
    },
    {
      _id: 'student1_id',
      username: 'student1',
      password: 'pass123',
      role: 'student',
    },
  ];
  
  // Static Quizzes
  export const quizzes = [
    {
      _id: 'quiz1',
      title: 'Sample Math Quiz',
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
      createdBy: 'teacher1_id',
    },
  ];
  
  // Sample Results (initially empty, will be populated in localStorage)
  export const initialResults = [];