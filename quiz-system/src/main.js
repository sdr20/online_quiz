import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/main.css'; // Import Tailwind CSS
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome

const app = createApp(App);
app.use(router);
app.use(store);
app.mount('#app');