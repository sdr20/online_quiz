<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <div class="w-1/6 bg-gray-200 p-4">
      <h1 class="text-2xl font-bold mb-4 text-blue-800">Simple Online Quiz System</h1>
      <nav>
        <ul>
          <li class="mb-2">
            <router-link to="/quiz-list" class="flex items-center p-2 hover:bg-gray-300 transition">
              <i class="fas fa-list mr-2"></i> Quiz List
            </router-link>
          </li>
          <li v-if="user.role === 'teacher'" class="mb-2">
            <router-link to="/create-quiz" class="flex items-center p-2 hover:bg-gray-300 transition">
              <i class="fas fa-plus mr-2"></i> Create Quiz
            </router-link>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="w-5/6">
      <div class="bg-blue-800 text-white p-4 flex justify-between items-center">
        <h2 class="text-xl font-semibold">{{ pageTitle }}</h2>
        <div class="flex items-center">
          <span class="mr-2">{{ user.username }}</span>
          <button @click="logout" class="text-white hover:text-gray-200">
            <i class="fas fa-power-off"></i>
          </button>
        </div>
      </div>
      <div class="p-6 bg-white min-h-screen">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    user() {
      return this.$store.state.user || { username: 'Sample Student', role: 'student' };
    },
    pageTitle() {
      return this.$route.meta.title || 'Dashboard';
    },
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
      localStorage.removeItem('user');
      this.$router.push('/login');
    },
  },
};
</script>