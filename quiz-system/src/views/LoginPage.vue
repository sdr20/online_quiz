<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">Simple Online Quiz System</h2>
      <div class="mb-6">
        <label class="block text-gray-700 mb-2">Login as:</label>
        <div class="flex justify-center space-x-4">
          <button
            @click="role = 'student'"
            :class="[
              'px-4 py-2 rounded-lg transition',
              role === 'student' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700',
            ]"
          >
            Student
          </button>
          <button
            @click="role = 'teacher'"
            :class="[
              'px-4 py-2 rounded-lg transition',
              role === 'teacher' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700',
            ]"
          >
            Teacher
          </button>
        </div>
      </div>
      <form @submit.prevent="login">
        <div class="mb-4">
          <label for="username" class="block text-gray-700 mb-2">Username</label>
          <input
            v-model="username"
            type="text"
            id="username"
            class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
            autocomplete="username"
            required
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            autocomplete="current-password"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
        >
          Login
        </button>
      </form>
      <p v-if="error" class="mt-4 text-red-500 text-center">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  data() {
    return {
      role: 'student',
      username: '',
      password: '',
      error: '',
    };
  },
  methods: {
    async login() {
      try {
        const response = await api.post('/api/login', {
          username: this.username,
          password: this.password,
          role: this.role,
        });
        this.$store.commit('setUser', response.data);
        if (this.role === 'student') {
          this.$router.push('/quiz-list');
        } else {
          this.$router.push('/dashboard');
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Error logging in';
      }
    },
  },
};
</script>