<template>
  <div class="login-page">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div>
        <label for="role">Role</label>
        <select v-model="role" id="role">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
      </div>
      <div>
        <label for="username">Username</label>
        <input
          v-model="username"
          type="text"
          id="username"
          placeholder="Username"
          autocomplete="username"
          required
        >
      </div>
      <div>
        <label for="password">Password</label>
        <input
          v-model="password"
          type="password"
          id="password"
          placeholder="Password"
          autocomplete="current-password"
          required
        >
      </div>
      <button type="submit">Login</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script>
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
        const response = await this.$api.post('/api/login', {
          username: this.username,
          password: this.password,
          role: this.role,
        });
        this.$store.dispatch('login', response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        this.$router.push('/quiz-list');
      } catch (error) {
        this.error = error.response?.data?.error || 'Error logging in';
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}
form div {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input, select {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.error {
  color: red;
}
</style>