import { createRouter, createWebHistory } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import LoginPage from '../views/LoginPage.vue';
import QuizList from '../views/QuizList.vue';
import CreateQuiz from '../views/CreateQuiz.vue';
import TakeQuiz from '../views/TakeQuiz.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/quiz-list',
      },
      {
        path: 'quiz-list',
        name: 'QuizList',
        component: QuizList,
        meta: { title: 'Quiz List' },
      },
      {
        path: 'create-quiz',
        name: 'CreateQuiz',
        component: CreateQuiz,
        meta: { title: 'Create Quiz' },
      },
      {
        path: 'take-quiz/:id',
        name: 'TakeQuiz',
        component: TakeQuiz,
        meta: { title: 'Take Quiz' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'));
  // If the route requires authentication and there is no user in localStorage
  if (to.meta.requiresAuth && !user) {
    next('/login');
  } else {
    // Ensure the Vuex store is updated with the user data
    if (user && !to.meta.requiresAuth) {
      // If the user is logged in but trying to access the login page, redirect to quiz-list
      if (to.path === '/login') {
        next('/quiz-list');
      } else {
        next();
      }
    } else {
      next();
    }
  }
});

export default router;