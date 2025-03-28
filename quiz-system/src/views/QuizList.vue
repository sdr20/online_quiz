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
export default {
  computed: {
    quizzes() {
      return this.$store.state.quizzes;
    },
    results() {
      const userResults = this.$store.getters.getResultsByStudent(this.$store.state.user?._id);
      return userResults.reduce((acc, result) => {
        acc[result.quizId] = result;
        return acc;
      }, {});
    },
  },
  mounted() {
    this.$store.dispatch('loadResults');
  },
  methods: {
    takeQuiz(quizId) {
      this.$router.push(`/take-quiz/${quizId}`);
    },
  },
};
</script>