import axios from 'axios';

const api = axios.create({
  baseURL: 'https://quiz-system-api.vercel.app',
});

export default api;