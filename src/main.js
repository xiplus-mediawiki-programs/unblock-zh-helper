import { createApp } from 'vue';
import App from './App.vue';
import createMyI18n from './lang';

const app = createApp(App);
app.use(createMyI18n(mw.config.get('wgUserLanguage')));
app.mount('#app');
