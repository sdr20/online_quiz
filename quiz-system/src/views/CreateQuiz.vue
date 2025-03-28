<template>
    <div class="p-6 bg-white rounded-lg">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Create a New Quiz</h2>
      <form @submit.prevent="createQuiz">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Quiz Title</label>
          <input
            v-model="quiz.title"
            type="text"
            class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Subject</label>
          <input
            v-model="quiz.subject"
            type="text"
            class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Points Per Question</label>
          <input
            v-model.number="quiz.pointsPerQuestion"
            type="number"
            class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
  
        <div v-for="(question, qIndex) in quiz.questions" :key="qIndex" class="mb-6 p-4 border rounded-lg">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ qIndex + 1 }}. Question</h3>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Question Text</label>
            <input
              v-model="question.questionText"
              type="text"
              class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div v-for="(option, oIndex) in question.options" :key="oIndex" class="mb-4 flex items-center">
            <input
              v-model="option.text"
              type="text"
              class="w-3/4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Option text"
              required
            />
            <label class="ml-4 flex items-center">
              <input
                type="radio"
                :name="'correct-' + qIndex"
                :value="oIndex"
                v-model="correctOptions[qIndex]"
                class="mr-2"
              />
              Correct
            </label>
          </div>
          <button
            type="button"
            @click="addOption(qIndex)"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Add Option
          </button>
        </div>
  
        <button
          type="button"
          @click="addQuestion"
          class="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Add Question
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
        >
          Create Quiz
        </button>
      </form>
    </div>
  </template>
  
  <script>
  import api from '../api';
  
  export default {
    data() {
      return {
        quiz: {
          title: '',
          subject: '',
          pointsPerQuestion: 1,
          questions: [
            {
              questionText: '',
              options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
            },
          ],
          createdBy: this.$store.state.user._id,
        },
        correctOptions: [0],
      };
    },
    methods: {
      addQuestion() {
        this.quiz.questions.push({
          questionText: '',
          options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
        });
        this.correctOptions.push(0);
      },
      addOption(questionIndex) {
        this.quiz.questions[questionIndex].options.push({ text: '', isCorrect: false });
      },
      async createQuiz() {
        this.quiz.questions.forEach((question, index) => {
          question.options.forEach((option, optIndex) => {
            option.isCorrect = optIndex === this.correctOptions[index];
          });
        });
  
        try {
          await api.post('/api/quizzes', this.quiz);
          this.$router.push('/quiz-list');
        } catch (error) {
          console.error('Error creating quiz:', error);
        }
      },
    },
  };
  </script>