import { createI18n } from 'vue-i18n';
import hansLocale from './i18n/zh-hans.json';
import hantLocale from './i18n/zh-hant.json';

const messages = {
  'zh-hans': hansLocale,
  'zh-hant': hantLocale,
};

export default createI18n({
  locale: mw.config.get('wgUserLanguage'),
  fallbackLocale: {
    'zh-cn': ['zh-hans'],
    'zh-hk': ['zh-hant'],
    'zh-mo': ['zh-hk'],
    'zh-my': ['zh-sg'],
    'zh-sg': ['zh-hans'],
    'zh-tw': ['zh-hant'],
    'zh-hant': ['zh-hans'],
    default: ['zh-hans'],
  },
  messages,
});
