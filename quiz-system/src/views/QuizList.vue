<template>
    <div>
      <div v-for="quiz in quizzes" :key="quiz._id" class="mb-6 p-4 bg-white border rounded-lg">
        <div class="p-4 bg-blue-100 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-800">{{ quiz.title }} ({{ quiz.subject }}) [{{ quiz.pointsPerQuestion }} Points Each Question]</h3>
        </div>
        <div v-if="results[quiz._id]" class="mt-4 p-4 bg-green-100 rounded-lg">
          <p class="text-green-700 font-semibold">SCORE: {{ results[quiz._id].score }} / {{ results[quiz._id].total }}</p>
        </div>
        <button
          v-else
          @click="takeQuiz(quiz._id)"
          class="mt-4 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
        >
          Take Quiz
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import api from '../api';
  
  export default {
    data() {
      return {
        quizzes: [],
        results: {},
      };
    },
    async mounted() {
      try {
        const quizResponse = await api.get('/api/quizzes');
        this.quizzes = quizResponse.data;
  
        const resultResponse = await api.get(`/api/results/${this.$store.state.user._id}`);
        this.results = resultResponse.data.reduce((acc, result) => {
          acc[result.quizId] = result;
          return acc;
        }, {});
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    methods: {
      takeQuiz(quizId) {
        this.$router.push(`/take-quiz/${quizId}`);
      },
    },
  };
  </script>