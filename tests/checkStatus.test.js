import { flushPromises, mount } from '@vue/test-utils';
import App from '../src/App.vue';
import createMyI18n from '../src/lang';
import { expect, test, describe } from 'vitest';

describe('form', async () => {
  const wrapper = mount(App, {
    global: {
      plugins: [createMyI18n('zh-hant')],
    },
  });
  await wrapper.setData({
    mailOptionsVariant: 'zh-hant',
  });

  test('status 1 normalized', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      username: 'xiplus',
      normalizedUsername: 'Xiplus',
    });
    expect(wrapper.find('#uzh-req-status').findAll('li')[0].wrapperElement).toMatchSnapshot();
  });

  test('status 2 account can be create', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      normalizedUsername: 'Xiplus',
      usernameStatus: wrapper.vm.ACCST_NOT_EXISTS,
    });
    expect(wrapper.find('#uzh-req-status').findAll('li')[1].wrapperElement).toMatchSnapshot();
  });

  test('status 2 account not exists', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      inputCreateAccount: false,
      normalizedUsername: 'Xiplus',
      usernameStatus: wrapper.vm.ACCST_NOT_EXISTS,
    });
    expect(wrapper.find('#uzh-req-status').findAll('li')[1].wrapperElement).toMatchSnapshot();
  });

  test('status 3 account needs local', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      normalizedUsername: 'Xiplus',
      usernameStatus: wrapper.vm.ACCST_NEEDS_LOCAL,
    });
    expect(wrapper.find('#uzh-req-status').findAll('li')[1].wrapperElement).toMatchSnapshot();
  });

  test('status 4 account exists req acct', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      normalizedUsername: 'Xiplus',
      usernameStatus: wrapper.vm.ACCST_EXISTS,
    });
    expect(wrapper.find('#uzh-req-status').findAll('li')[1].wrapperElement).toMatchSnapshot();
  });

  test('status 5 account exists not req acct', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      inputCreateAccount: false,
      normalizedUsername: 'Xiplus',
      usernameStatus: wrapper.vm.ACCST_EXISTS,
    });
    expect(wrapper.find('#uzh-req-status').findAll('li')[1].wrapperElement).toMatchSnapshot();
  });

  test('status 6 account banned', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      inputCreateAccount: false,
      normalizedUsername: 'Xiplus',
      usernameStatus: wrapper.vm.ACCST_BANNED,
    });
    expect(wrapper.find('#uzh-req-status').findAll('li')[1].wrapperElement).toMatchSnapshot();
  });

  test('status 7 account blocked', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      normalizedUsername: 'Xiplus',
      accountBlocked: true,
      accountBlockBy: 'BlockAdmin',
      accountBlockReason: 'Vandalism',
    });
    expect(wrapper.find('#uzh-req-status').findAll('li')[1].wrapperElement).toMatchSnapshot();
  });

  test('status 8 ip blocked proxy', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      ipChecked: true,
      ip: '1.2.3.4',
      blocked: true,
      blockReason: '{{Blocked proxy}}',
    });
    expect(wrapper.find('#uzh-req-status').findAll('li')[0].wrapperElement).toMatchSnapshot();
  });

  test('status 8 ip blocked other', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      ipChecked: true,
      ip: '1.2.3.4',
      blocked: true,
      blockReason: 'Vandalism',
    });
    expect(wrapper.find('#uzh-req-status').findAll('li')[0].wrapperElement).toMatchSnapshot();
  });

  test('status 9 ip not blocked', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      ipChecked: true,
      ip: '1.2.3.4',
      blocked: false,
    });
    expect(wrapper.find('#uzh-req-status').findAll('li')[0].wrapperElement).toMatchSnapshot();
  });

  test('status 10 acct has ipbe', async () => {
    await wrapper.vm.resetForm();
    await wrapper.setData({
      accountHasIpbe: true,
      normalizedUsername: 'Xiplus',
    });
    expect(wrapper.find('#uzh-req-status').findAll('li')[1].wrapperElement).toMatchSnapshot();
  });
});
