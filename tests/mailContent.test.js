import { mount } from '@vue/test-utils';
import App from '../src/App.vue';
import createMyI18n from '../src/lang';
import { expect, test, describe } from 'vitest';

describe('test variant', async () => {
  const wrapper = mount(App, {
    global: {
      plugins: [createMyI18n('zh-hant')],
    },
  });
  await wrapper.setData({
    mailOptionsVariant: 'zh-hans',
  });

  test('hans', async () => {
    await wrapper.vm.resetForm();
    expect(wrapper.vm.mailContent).toMatchSnapshot();
  });
});

describe('mail content', async () => {
  const wrapper = mount(App, {
    global: {
      plugins: [createMyI18n('zh-hant')],
    },
  });
  await wrapper.setData({
    mailOptionsVariant: 'zh-hant',
  });

  test('init', async () => {
    await wrapper.vm.resetForm();
    expect(wrapper.vm.mailContent).toMatchSnapshot();
  });

  test('req account & ipbe, done', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsUsername: wrapper.vm.MAILOP_ACCOUNTCREATED,
      mailOptionsIpbe: wrapper.vm.MAILOP_IPBEGRANTED,
      normalizedUsername: 'ExampleUser',
      email: 'email@example.org',
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('req account & ipbe, no username', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({ mailOptionsUsername: wrapper.vm.MAILOP_NOUSERNAME });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('req account & ipbe, no username & ip', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsUsername: wrapper.vm.MAILOP_NOUSERNAME,
      mailOptionsIpbe: wrapper.vm.MAILOP_NOIP,
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('req account & ipbe, acct created, no ip', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsUsername: wrapper.vm.MAILOP_ACCOUNTCREATED,
      normalizedUsername: 'ExampleUser',
      email: 'email@example.org',
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('req account & ipbe, acct created, ip not blocked', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsUsername: wrapper.vm.MAILOP_ACCOUNTCREATED,
      mailOptionsIpbe: wrapper.vm.MAILOP_IPNOTBLOCKED,
      normalizedUsername: 'ExampleUser',
      email: 'email@example.org',
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('req ipbe, granted', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsIpbe: wrapper.vm.MAILOP_IPBEGRANTED,
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('open proxy', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsOther: wrapper.vm.MAILOP_OPENPROXY,
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('range block', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsOther: wrapper.vm.MAILOP_RANGEBLOCK,
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('enwiki block', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsOther: wrapper.vm.MAILOP_ENWIKIBLOCK,
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('gipbe', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsOther: wrapper.vm.MAILOP_GIPBE,
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('company basic', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsOther: wrapper.vm.MAILOP_COMPANY,
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('company & no username & ip', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsUsername: wrapper.vm.MAILOP_NOUSERNAME,
      mailOptionsIpbe: wrapper.vm.MAILOP_NOIP,
      mailOptionsOther: wrapper.vm.MAILOP_COMPANY,
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('auto logout', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsOther: wrapper.vm.MAILOP_AUTOLOGOUT,
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('user rename', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsOther: wrapper.vm.MAILOP_USERRENAME,
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('go talkpage', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsOther: wrapper.vm.MAILOP_GOTALKPAGE,
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('talkpage requested', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsOther: wrapper.vm.MAILOP_TALKPAGEREQED,
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });

  test('can not understand', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      mailOptionsOther: wrapper.vm.MAILOP_CANTUNDERSTAND,
    });
    expect(wrapper.vm.mailContentCore).toMatchSnapshot();
  });
});
