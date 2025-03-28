<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="p-6 text-center">
      <p class="text-gray-600">Loading quiz...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6 text-center">
      <p class="text-red-500">{{ error }}</p>
      <button @click="$router.push('/quiz-list')" class="mt-4 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition">
        Back to Quiz List
      </button>
    </div>

    <!-- Quiz Content -->
    <div v-else>
      <!-- Quiz Header -->
      <div class="mb-6 p-4 bg-blue-100 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-800">{{ quiz.title }} ({{ quiz.subject }}) [{{ quiz.pointsPerQuestion }} Points Each Question]</h3>
      </div>

      <!-- Score Display -->
      <div v-if="isSubmitted" class="mb-6 p-4 bg-green-100 rounded-lg">
        <p class="text-green-700 font-semibold">SCORE: {{ score }} / {{ total }}</p>
      </div>

      <!-- Questions -->
      <div v-for="(question, index) in quiz.questions" :key="index" class="mb-6 p-4 bg-white border rounded-lg">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ index + 1 }}. {{ question.questionText }}</h3>
        <div v-for="(option, optIndex) in question.options" :key="optIndex" class="p-2 rounded-lg" :class="getOptionClass(index, optIndex)">
          <label :for="'question-' + index + '-' + optIndex" class="flex items-center">
            <input
              type="radio"
              :id="'question-' + index + '-' + optIndex"
              :name="'question-' + index"
              :value="option.text"
              v-model="answers[index]"
              @change="submitAnswer(index)"
              :disabled="isSubmitted"
              class="mr-2"
              autocomplete="off"
            />
            <span class="text-gray-700">{{ option.text }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  data() {
    return {
      quiz: null,
      answers: [],
      submitted: [],
      isSubmitted: false,
      score: 0,
      total: 0,
      loading: true,
      error: null,
    };
  },
  async mounted() {
    try {
      this.loading = true;
      this.error = null;

      // Check if the user is logged in
      if (!this.$store.state.user || !this.$store.state.user._id) {
        throw new Error('User not logged in');
      }

      // Fetch quizzes
      const response = await api.get('/api/quizzes');
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('No quizzes found or invalid response');
      }

      // Find the quiz by ID
      this.quiz = response.data.find(q => q._id === this.$route.params.id);
      if (!this.quiz) {
        throw new Error('Quiz not found');
      }

      // Initialize data
      this.answers = new Array(this.quiz.questions.length).fill(null);
      this.submitted = new Array(this.quiz.questions.length).fill(false);
      this.total = this.quiz.questions.length * this.quiz.pointsPerQuestion;

      // Fetch quiz results for the user
      const resultResponse = await api.get(`/api/results/${this.$store.state.user._id}`);
      const result = resultResponse.data.find(r => r.quizId === this.quiz._id);
      if (result) {
        this.isSubmitted = true;
        this.score = result.score;
        this.answers = result.answers.map(a => a.selectedOption);
        this.submitted = new Array(this.quiz.questions.length).fill(true);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      this.error = error.message || 'An error occurred while loading the quiz';
      if (this.error === 'User not logged in') {
        this.$router.push('/login');
      }
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async submitAnswer(index) {
      this.submitted[index] = true;

      if (this.answers.every(answer => answer !== null)) {
        this.isSubmitted = true;
        let score = 0;
        const total = this.quiz.questions.length * this.quiz.pointsPerQuestion;
        const resultAnswers = this.quiz.questions.map((question, i) => {
          const correctOption = question.options.find(opt => opt.isCorrect);
          const isCorrect = this.answers[i] === correctOption.text;
          if (isCorrect) score += this.quiz.pointsPerQuestion;
          return {
            questionId: i,
            selectedOption: this.answers[i],
            isCorrect,
          };
        });

        this.score = score;
        this.total = total;

        try {
          await api.post('/api/submit-quiz', {
            quizId: this.quiz._id,
            studentId: this.$store.state.user._id,
            score,
            total,
            answers: resultAnswers,
          });
        } catch (error) {
          console.error('Error submitting quiz:', error);
          this.error = 'Failed to submit quiz';
        }
      }
    },
    getOptionClass(questionIndex, optionIndex) {
      if (!this.submitted[questionIndex]) return '';
      const selectedOption = this.answers[questionIndex];
      const correctOption = this.quiz.questions[questionIndex].options.find(opt => opt.isCorrect).text;
      const currentOption = this.quiz.questions[questionIndex].options[optionIndex].text;

      if (currentOption === correctOption) return 'bg-green-500 text-white';
      if (currentOption === selectedOption && selectedOption !== correctOption) return 'bg-red-500 text-white';
      return '';
    },
  },
};
</script>