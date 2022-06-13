import { createI18n } from 'vue-i18n';
import hansLocale from './i18n/zh-hans.json';
import hantLocale from './i18n/zh-hant.json';

const messages = {
  'zh-hans': hansLocale,
  'zh-hant': hantLocale,
};

function createMyI18n(locale) {
  return createI18n({
    locale: locale,
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
}

export default createMyI18n;
