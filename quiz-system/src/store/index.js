import { createStore } from 'vuex';
import { users, quizzes, initialResults } from '../data/staticData';

export default createStore({
  state: {
    user: null,
    quizzes: quizzes,
    results: initialResults,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setResults(state, results) {
      state.results = results;
      // Save results to localStorage
      localStorage.setItem('quizResults', JSON.stringify(results));
    },
  },
  actions: {
    login({ commit }, { username, password, role }) {
      const user = users.find(
        u => u.username === username && u.password === password && u.role === role
      );
      if (user) {
        commit('setUser', user);
        return Promise.resolve(user);
      } else {
        return Promise.reject(new Error('Invalid credentials'));
      }
    },
    logout({ commit }) {
      commit('setUser', null);
    },
    loadResults({ commit }) {
      // Load results from localStorage
      const savedResults = localStorage.getItem('quizResults');
      if (savedResults) {
        commit('setResults', JSON.parse(savedResults));
      } else {
        commit('setResults', initialResults);
      }
    },
    submitQuiz({ commit, state }, { quizId, studentId, score, total, answers }) {
      const newResult = {
        quizId,
        studentId,
        score,
        total,
        answers,
      };
      const updatedResults = [...state.results, newResult];
      commit('setResults', updatedResults);
    },
  },
  getters: {
    getResultsByStudent: state => studentId => {
      return state.results.filter(result => result.studentId === studentId);
    },
  },
});