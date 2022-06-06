<script setup></script>

<template>
  <div id="uzh-container">
    <fieldset>
      <legend>{{ $t('fill-legend') }}</legend>
      <div>
        <button @click.prevent="resetForm">
          {{ $t('reset-form') }}
        </button>
      </div>
      {{ $t('requested-actions') }}
      <label class="uzh-inline-options">
        <input v-model="inputCreateAccount" type="checkbox" />
        {{ $t('input-create-account') }}
      </label>
      <label class="uzh-inline-options">
        <input v-model="inputGrantIpbe" type="checkbox" />
        {{ $t('input-grant-ipbe') }}
      </label>
      <label class="uzh-inline-options">
        <input v-model="inputBlockAppeal" type="checkbox" />
        {{ $t('input-unblock-request') }}
      </label>
      <label class="uzh-inline-options">
        <input v-model="inputResetPassword" type="checkbox" />
        {{ $t('input-reset-password') }}
      </label>
      <br />
      <label>
        {{ $t('username') }}
        <input v-model="username" type="text" style="width: 200px" />
      </label>
      <br />
      <label>
        {{ $t('email') }}
        <input v-model="email" type="email" style="width: 300px" placeholder="xxx@example.com" />
      </label>
      <br />
      <label>
        {{ $t('ip-or-block-id') }}
        <input v-model="ip" type="text" style="width: 300px" :placeholder="$t('ip-or-block-id-placeholder')" />
      </label>
      <br />
      <label>
        <span class="uzh-fullwidth-label">
          {{ $t('mail-archive-url') }}
        </span>
        <span class="uzh-fullwidth-input">
          <input
            v-model="archiveUrl"
            type="url"
            style="width: 100%"
            placeholder="https://lists.wikimedia.org/hyperkitty/list/unblock-zh@lists.wikimedia.org/message/..."
          />
        </span>
      </label>
      <button @click.prevent="checkInput">
        {{ $t('check-infomation') }}
      </button>
    </fieldset>

    <fieldset>
      <legend>{{ $t('choose-actions') }}</legend>
      {{ $t('status') }}
      <ul>
        <li v-if="normalizedUsername && username != normalizedUsername" class="uzh-status-info">
          {{ $t('normalized-username', [this.normalizedUsername]) }}
        </li>
        <li
          v-if="normalizedUsername && inputCreateAccount && usernameStatus == ACCST_NOT_EXISTS"
          class="uzh-status-success"
        >
          <i18n-t keypath="can-create-account" tag="span">
            <a :href="'https://www.google.com/search?q=' + encodeURIComponent(normalizedUsername)" target="_blank">
              {{ $t('google-search') }}
            </a>
          </i18n-t>
        </li>
        <li
          v-if="
            normalizedUsername &&
            !inputCreateAccount &&
            (usernameStatus == ACCST_BANNED || usernameStatus == ACCST_NOT_EXISTS)
          "
          class="uzh-status-error"
        >
          {{ $t('account-not-exists') }}
        </li>
        <li
          v-if="normalizedUsername && usernameStatus == ACCST_NEEDS_LOCAL"
          :class="{ 'uzh-status-error': inputCreateAccount, 'uzh-status-success': !inputCreateAccount }"
        >
          {{ $t('needs-force-create-local') }}
        </li>
        <li
          v-if="normalizedUsername && usernameStatus == ACCST_EXISTS"
          :class="{ 'uzh-status-error': inputCreateAccount, 'uzh-status-success': !inputCreateAccount }"
        >
          <i18n-t keypath="account-exists" tag="span">
            <a :href="getUrl('Special:CentralAuth', { target: normalizedUsername })" target="_blank">
              {{ $t('check-central-account') }}
            </a>
          </i18n-t>
        </li>
        <li v-if="normalizedUsername && inputCreateAccount && usernameStatus == ACCST_BANNED" class="uzh-status-error">
          <span v-if="usernameBannedDetail">
            <i18n-t keypath="username-banned-detail" tag="span">
              <span v-html="usernameBannedDetail"></span>
            </i18n-t>
          </span>
          <span v-else>
            {{ $t('username-banned') }}
          </span>
        </li>
        <li v-if="accountBlocked" class="uzh-status-error">
          <i18n-t keypath="account-blocked-row" tag="span">
            <b>{{ $t('account-blocked-text', [accountBlockBy, accountBlockReason]) }}</b>
            <a :href="getUrl('Special:Log/block', { page: 'User:' + normalizedUsername })" target="_blank">
              {{ $t('block-log') }}
            </a>
          </i18n-t>
        </li>
        <li v-if="ipChecked && ip && blocked" class="uzh-status-success">
          <i18n-t keypath="ip-blocked-row" tag="span">
            <span>{{ $t('ip-blocked-text', [blockBy, blockReason]) }}</span>
            <a :href="getUrl('Special:BlockList', { wpTarget: ip })" target="_blank">{{ $t('check-block-list') }}</a>
          </i18n-t>
        </li>
        <li v-if="ipChecked && ip && !blocked" class="uzh-status-error">
          <i18n-t keypath="ip-not-blocked" tag="span">
            <a :href="getUrl('Special:BlockList', { wpTarget: ip })" target="_blank">{{ $t('check-block-list') }}</a>
          </i18n-t>
        </li>
        <li v-if="accountHasIpbe" class="uzh-status-error">
          <i18n-t keypath="user-has-ipbe" tag="span">
            <a :href="getUrl('Special:Log', { type: 'rights', page: 'User:' + normalizedUsername })" target="_blank">
              {{ $t('check-right-log') }}
            </a>
          </i18n-t>
        </li>
      </ul>
      <div>
        <label>
          <span class="uzh-fullwidth-label">
            {{ $t('log-summary') }}
          </span>
          <span class="uzh-fullwidth-input">
            <input v-model="summary" type="text" style="width: 100%" />
          </span>
        </label>
      </div>
      <div v-if="inputCreateAccount && usernameStatus == ACCST_NOT_EXISTS">
        <label>
          <input v-model="actionOptions" :value="ACTOP_CREATEACCOUNT" type="checkbox" />
          {{ $t('create-new-account', [normalizedUsername, email]) }}</label
        >
        <span v-if="statusCreateAcccount">
          -
          <span :class="'uzh-status-' + statusCreateAcccountType">{{ statusCreateAcccount }}</span></span
        >
      </div>
      <div v-if="usernameStatus == ACCST_NEEDS_LOCAL">
        <label>
          <input v-model="actionOptions" :value="ACTOP_CREATELOCAL" type="checkbox" @change="autoMailOptionsAccount" />
          <i18n-t keypath="force-create-local" tag="span">
            <span>{{ normalizedUsername }}</span>
            <a :href="getUrl('Special:CentralAuth', { target: normalizedUsername })" target="_blank">
              {{ $t('check-central-account') }}
            </a>
          </i18n-t></label
        >
        <span v-if="statusCreateLocal">
          -
          <span :class="'uzh-status-' + statusCreateLocalType">{{ statusCreateLocal }}</span></span
        >
      </div>
      <div v-if="normalizedUsername">
        <label>
          <input v-model="actionOptions" :value="ACTOP_GRANTIPBE" type="checkbox" @change="autoMailOptionsIpbe" />
          {{ $t('grant-user-ipbe', [normalizedUsername]) }}</label
        >
        <span v-if="statusGrantIpbe">
          -
          <span :class="'uzh-status-' + statusGrantIpbeType">{{ statusGrantIpbe }}</span></span
        >
      </div>
      <div v-if="normalizedUsername" style="padding-left: 18px">
        <label>
          <input v-model="actionOptions" :value="ACTOP_NOTICEIPBE" type="checkbox" />
          {{ $t('send-ipbe-notice') }}</label
        >
        <span v-if="statusNoticeIpbe">
          -
          <span :class="'uzh-status-' + statusNoticeIpbeType">{{ statusNoticeIpbe }}</span></span
        >
      </div>
      <div v-if="normalizedUsername" style="padding-left: 18px">
        <label>
          <input v-model="actionOptions" :value="ACTOP_RFIPBE" type="checkbox" />
          {{ $t('record-at-rfipbe') }}</label
        >
        <span v-if="statusRfIpbe">
          -
          <span :class="'uzh-status-' + statusRfIpbeType">{{ statusRfIpbe }}</span></span
        >
      </div>
      <div v-if="normalizedUsername">
        <label>
          <input
            v-model="actionOptions"
            :value="ACTOP_RESETPASSWORDUSERNAME"
            type="checkbox"
            @change="autoMailOptionsResetPassword"
          />
          {{ $t('reset-password-by-username', [normalizedUsername]) }}</label
        >
        <span v-if="statusResetPasswordUsername">
          -
          <span :class="'uzh-status-' + statusResetPasswordUsernameType">{{ statusResetPasswordUsername }}</span></span
        >
      </div>
      <div v-if="email">
        <label>
          <input
            v-model="actionOptions"
            :value="ACTOP_RESETPASSWORDEMAIL"
            type="checkbox"
            @change="autoMailOptionsResetPassword"
          />
          {{ $t('reset-password-by-email', [email]) }}</label
        >
        <span v-if="statusResetPasswordEmail">
          -
          <span :class="'uzh-status-' + statusResetPasswordEmailType">{{ statusResetPasswordEmail }}</span></span
        >
      </div>
      <button @click.prevent="runActions">
        {{ $t('run-actions') }}
      </button>
      <a :href="getUrl('Special:RecentChanges', { hidebyothers: 1 })" target="_blank" style="margin-left: 10px">
        {{ $t('check-your-actions') }}
      </a>
    </fieldset>

    <fieldset>
      <legend>{{ $t('reply-mail') }}</legend>
      <div>
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" :value="MAILOP_NOUSERNAME" type="radio" />
          {{ $t('username-not-provided') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" :value="MAILOP_USERNAMEUSED" type="radio" />
          {{ $t('mailopt-username-exists') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" :value="MAILOP_USERNAMEBANNED" type="radio" />
          {{ $t('mailopt-username-banned') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" :value="MAILOP_ACCOUNTCREATED" type="radio" />
          {{ $t('mailopt-account-created') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" :value="MAILOP_ACCOUNTLOCAL" type="radio" />
          {{ $t('mailopt-force-create-local') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" :value="MAILOP_ACCTNOTEXISTS" type="radio" />
          {{ $t('mailopt-account-not-exists') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" value="" type="radio" />
          {{ $t('mailopt-none') }}</label
        >
        <br />

        <label class="uzh-inline-options">
          <input v-model="mailOptionsIpbe" :value="MAILOP_NOIP" type="radio" />
          {{ $t('mailopt-ip-not-provided') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsIpbe" :value="MAILOP_IPNOTBLOCKED" type="radio" />
          {{ $t('mailopt-ip-not-blocked') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsIpbe" :value="MAILOP_IPBEGRANTED" type="radio" />
          {{ $t('mailopt-ipbe-granted') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsIpbe" :value="MAILOP_MAYNEEDIPBE" type="radio" />
          {{ $t('mailopt-may-need-ipbe') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsIpbe" value="" type="radio" />
          {{ $t('mailopt-none') }}</label
        >
        <br />

        <label class="uzh-inline-options">
          <input v-model="mailOptionsResetPassword" type="checkbox" />
          {{ $t('mailopt-password-reset') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsOther" :value="MAILOP_OPENPROXY" type="checkbox" />
          {{ $t('mailopt-open-proxy') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsOther" :value="MAILOP_RANGEBLOCK" type="checkbox" />
          {{ $t('mailopt-range-block') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsOther" :value="MAILOP_ENWIKIBLOCK" type="checkbox" />
          {{ $t('mailopt-enwiki-block') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsOther" :value="MAILOP_GIPBE" type="checkbox" />
          {{ $t('mailopt-global-block') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsOther" :value="MAILOP_COMPANY" type="checkbox" />
          {{ $t('mailopt-company') }}</label
        >
        <br />

        <label class="uzh-inline-options">
          <input v-model="mailOptionsVariant" value="zh-hans" type="radio" />
          {{ $t('lang-hans') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsVariant" value="zh-hant" type="radio" />
          {{ $t('lang-hant') }}</label
        >
        <button @click.prevent="copyMailContent">{{ $t('copy-contents') }}</button>
        <span v-if="copyTimeoutId"> - {{ $t('copid') }}</span>
      </div>
      <textarea v-model="mailContent" id="uzh-mail-content" readonly rows="14"></textarea>
    </fieldset>

    <fieldset>
      <legend>{{ $t('debug') }}</legend>
      {{ allData }}
    </fieldset>
  </div>
</template>

<script>
var api = new mw.Api();
var loginapi = new mw.ForeignApi('https://login.wikimedia.org/w/api.php');

export default {
  data() {
    return {
      inputCreateAccount: true,
      inputGrantIpbe: true,
      inputBlockAppeal: false,
      inputResetPassword: false,
      username: '',
      email: '',
      ip: '',
      archiveUrl: '',
      usernameStatus: '',
      usernameBannedDetail: '',
      normalizedUsername: '',
      accountBlocked: false,
      accountBlockBy: '',
      accountBlockReason: '',
      ipChecked: false,
      blocked: false,
      blockBy: '',
      blockReason: '',
      accountHasIpbe: false,
      actionOptions: [],
      summary: '',
      statusCreateAcccountType: 'info',
      statusCreateAcccount: '',
      statusCreateLocalType: 'info',
      statusCreateLocal: '',
      statusGrantIpbeType: 'info',
      statusGrantIpbe: '',
      statusNoticeIpbeType: 'info',
      statusNoticeIpbe: '',
      statusRfIpbeType: 'info',
      statusRfIpbe: '',
      statusResetPasswordUsernameType: 'info',
      statusResetPasswordUsername: '',
      statusResetPasswordEmailType: 'info',
      statusResetPasswordEmail: '',
      mailOptionsUsername: '',
      mailOptionsIpbe: '',
      mailOptionsResetPassword: false,
      mailOptionsOther: [],
      mailOptionsVariant: 'zh-hans',
      copyTimeoutId: null,
    };
  },
  computed: {
    allData() {
      return this.$data;
    },
    mailContent() {
      let oldLocale = this.$i18n.locale;
      this.$i18n.locale = this.mailOptionsVariant;
      const useUsernameChecker = this.$t('use-username-checker', [
        '[LINK:https://zhwiki-username-check.toolforge.org]',
      ]);
      let text = this.$t('mail-hello') + '\n';
      let othertext = '';
      let pleaseProvide = [];
      let pleaseProvideHeader = '';
      let pleaseProvideAppend = '';

      if (this.mailOptionsUsername === this.MAILOP_NOUSERNAME) {
        if (this.inputCreateAccount) {
          pleaseProvide.push(this.$t('mail-wanted-username') + useUsernameChecker);
          if (this.mailOptionsOther.includes(this.MAILOP_COMPANY)) {
            pleaseProvide.push(this.$t('mail-private-email'));
          }
        } else if (this.inputGrantIpbe || this.inputBlockAppeal) {
          pleaseProvide.push(
            this.$t('mail-your-username', ['[LINK:https://zh.wikipedia.org/wiki/Special:Preferences]'])
          );
          if (this.inputGrantIpbe) {
            pleaseProvideAppend = this.$t('mail-no-account-give-username') + useUsernameChecker + '\n';
          }
        } else if (this.inputResetPassword) {
          pleaseProvide.push(this.$t('mail-your-username-help-reset'));
        }
      } else if (this.mailOptionsUsername === this.MAILOP_USERNAMEUSED) {
        text += this.$t('mail-username-exists-provide-another') + useUsernameChecker + '\n';
      } else if (this.mailOptionsUsername === this.MAILOP_USERNAMEBANNED) {
        text += this.$t('mail-username-banned-provide-another') + useUsernameChecker + '\n';
      } else if (this.mailOptionsUsername === this.MAILOP_ACCOUNTCREATED) {
        text += this.$t('mail-account-created', [this.normalizedUsername, this.email]) + '\n';
      } else if (this.mailOptionsUsername === this.MAILOP_ACCTNOTEXISTS) {
        text +=
          this.$t('mail-username-not-exists', ['[LINK:https://zh.wikipedia.org/wiki/Special:Preferences]']) + '\n';
      } else if (this.mailOptionsUsername === this.MAILOP_ACCOUNTLOCAL) {
        text += this.$t('mail-create-local') + '\n';
      }

      if (this.mailOptionsIpbe === this.MAILOP_NOIP || this.mailOptionsIpbe === this.MAILOP_MAYNEEDIPBE) {
        if (this.mailOptionsIpbe === this.MAILOP_MAYNEEDIPBE) {
          pleaseProvideHeader = this.$t('mail-cannot-edit-after-login') + '\n';
        }
        pleaseProvide.push(this.$t('mail-blocked-ip'));
        pleaseProvide.push(this.$t('mail-block-id'));
      } else if (this.mailOptionsIpbe === this.MAILOP_IPNOTBLOCKED) {
        othertext += this.$t('mail-ip-not-blocked') + '\n';
      } else if (this.mailOptionsIpbe === this.MAILOP_IPBEGRANTED) {
        text += this.$t('mail-ipbe-granted') + '\n';
      }

      if (this.mailOptionsResetPassword) {
        text += this.$t('mail-password-reset') + '\n';
        if (this.inputGrantIpbe && this.mailOptionsIpbe === '') {
          text += this.$t('mail-make-sure-login') + '\n';
        }
      }

      if (this.mailOptionsOther.includes(this.MAILOP_OPENPROXY)) {
        text += this.$t('mail-no-open-proxy', ['[LINK:https://meta.wikimedia.org/wiki/No_open_proxies/zh]']) + '\n';

        pleaseProvide.push(this.$t('mail-wanted-username') + useUsernameChecker);
      }
      if (this.mailOptionsOther.includes(this.MAILOP_RANGEBLOCK)) {
        othertext += this.$t('mail-range-block') + useUsernameChecker + '\n';
      }
      if (this.mailOptionsOther.includes(this.MAILOP_ENWIKIBLOCK)) {
        othertext +=
          this.$t('mail-only-handle-zhwiki', ['[LINK:https://zh.wikipedia.org]']) +
          '\n' +
          this.$t('mail-go-enwiki', ['[LINK:https://en.wikipedia.org/wiki/Wikipedia:Unblock_Ticket_Request_System]']) +
          '\n';
      }
      if (this.mailOptionsOther.includes(this.MAILOP_GIPBE)) {
        othertext +=
          this.$t('mail-only-handle-zhwiki', ['[LINK:https://zh.wikipedia.org]']) +
          '\n' +
          this.$t('mail-gipbe-go-meta', ['[LINK:https://meta.wikimedia.org/wiki/IP_block_exempt/zh]']) +
          '\n';
      }
      if (this.mailOptionsOther.includes(this.MAILOP_COMPANY)) {
        text +=
          this.$t('mail-company', [
            '[LINK:https://zh.wikipedia.org/wiki/Wikipedia:有償編輯方針#如何作出申報]',
            '[LINK:https://zh.wikipedia.org/wiki/Wikipedia:有償編輯方針#本地替代方針]',
            '[LINK:https://zh.wikipedia.org/wiki/Wikipedia:如何介绍自己的公司] ',
            '[LINK:https://zh.wikipedia.org/wiki/Wikipedia:互助客栈/求助] ',
          ]) + '\n';
      }

      if (pleaseProvide.length === 1) {
        text += this.$t('mail-please-provide') + pleaseProvide[0] + '\n';
      } else if (pleaseProvide.length > 1) {
        if (pleaseProvideHeader) {
          text += pleaseProvideHeader;
        } else {
          text += this.$t('mail-please-provide-following') + '\n';
        }
        for (let i = 0; i < pleaseProvide.length; i++) {
          text += this.$t('mail-please-provide-row', [i + 1, pleaseProvide[i]]) + '\n';
        }
        text += this.$t('mail-please-provide-footer') + '\n';
      }
      text += pleaseProvideAppend;
      text += othertext;

      let links_text = '';
      let links_count = 0;
      text = text.replace(/\[LINK:([^\]]+?)\]/g, function (match, link) {
        links_count++;
        links_text += '[' + links_count + '] ' + link + '\n';
        return '[' + links_count + ']';
      });

      if (links_count > 0) {
        text += '\n' + links_text;
      }

      text += '\n';
      text += this.$t('mail-reply-to-all') + '\n\n';
      text += 'User:' + mw.config.get('wgUserName');

      this.$i18n.locale = oldLocale;
      return text;
    },
  },
  created() {
    this.ACCST_NOT_EXISTS = 'NotExists';
    this.ACCST_BANNED = 'Banned';
    this.ACCST_NEEDS_LOCAL = 'NeedsLocal';
    this.ACCST_EXISTS = 'Exists';
    this.ACTOP_CREATEACCOUNT = 'CreateAccount';
    this.ACTOP_CREATELOCAL = 'CreateLocal';
    this.ACTOP_GRANTIPBE = 'GrantIpbe';
    this.ACTOP_NOTICEIPBE = 'NoticeIpbe';
    this.ACTOP_RFIPBE = 'RfIpbe';
    this.ACTOP_RESETPASSWORDUSERNAME = 'ResetPasswordUsername';
    this.ACTOP_RESETPASSWORDEMAIL = 'ResetPasswordEmail';
    this.MAILOP_NOUSERNAME = 'NoUsername';
    this.MAILOP_USERNAMEUSED = 'UsernameUsed';
    this.MAILOP_USERNAMEBANNED = 'UsernameBanned';
    this.MAILOP_ACCOUNTCREATED = 'AccountCreated';
    this.MAILOP_ACCOUNTLOCAL = 'AccountLocal';
    this.MAILOP_NOIP = 'NoIp';
    this.MAILOP_IPNOTBLOCKED = 'IpNotBlocked';
    this.MAILOP_ACCTNOTEXISTS = 'AcctNotExists';
    this.MAILOP_IPBEGRANTED = 'IpbeGranted';
    this.MAILOP_MAYNEEDIPBE = 'MayNeedIpbe';
    this.MAILOP_OPENPROXY = 'OpenProxy';
    this.MAILOP_RANGEBLOCK = 'RangeBlock';
    this.MAILOP_ENWIKIBLOCK = 'EnwikiBlock';
    this.MAILOP_GIPBE = 'Gipbe';
    this.MAILOP_COMPANY = 'Company';
    this.SUMMARY_SUFFIX = this.$t('summary-suffix', ['[[User:Xiplus/js/unblock-zh-helper|unblock-zh-helper]]']);
    mw.messages.set('antispoof-name-1', '$1');
    mw.messages.set('antispoof-name-123', '$1$2$3');
    mw.loader.load('ext.gadget.CollapsibleSidebar');
  },
  methods: {
    checkInput() {
      this.clearStatus();
      this.username = this.username.trim();
      this.email = this.email.trim();
      this.ip = this.ip.trim();
      this.archiveUrl = this.archiveUrl.trim();

      if (this.ip && !mw.util.isIPAddress(this.ip, true) && !/^#\d+$/.test(this.ip)) {
        alert(this.$t('ip-or-block-id-wrong-format'));
        return;
      }

      if (this.archiveUrl) {
        let m = this.archiveUrl.match(
          /https?:\/\/lists\.wikimedia\.org\/hyperkitty\/(list\/unblock-zh@lists\.wikimedia\.org\/(?:message|thread)\/[^/]+\/?)/
        );
        if (m) {
          this.summary = '[[listarchive:' + m[1] + '|' + this.$t('unblock-zh-apply') + ']]';
        } else {
          alert(this.$t('mailopt-archive-wrong-format'));
          return;
        }
      }
      let tm = new Morebits.taskManager();
      tm.add(this.checkUsernameStatus, []);
      tm.add(this.checkAccountStatus, []);
      tm.add(this.checkIpBlocks, []);
      tm.execute().then(this.showCheckResult);
    },
    checkUsernameStatus() {
      let def = $.Deferred();
      let self = this;

      self.usernameStatus = '';
      self.usernameBannedDetail = '';
      self.normalizedUsername = '';
      if (!self.username) {
        return def.resolve();
      }
      loginapi
        .get({
          action: 'query',
          format: 'json',
          list: 'users',
          usprop: 'cancreate|centralids',
          usattachedwiki: 'zhwiki',
          ususers: self.username,
        })
        .then(function (res) {
          let user = res.query.users[0];
          if ('userid' in user) {
            if ('CentralAuth' in user.attachedwiki) {
              self.usernameStatus = self.ACCST_EXISTS;
            } else {
              self.usernameStatus = self.ACCST_NEEDS_LOCAL;
            }
          } else if ('invalid' in user) {
            self.usernameStatus = self.ACCST_BANNED;
            self.usernameBannedDetail = self.$t('bad-username-banned-characters');
          } else if ('cancreateerror' in user) {
            self.usernameStatus = self.ACCST_NOT_EXISTS;
            let cancreateerror = user['cancreateerror'][0];
            if (cancreateerror.code === 'userexists') {
              self.usernameStatus = self.ACCST_NEEDS_LOCAL;
            } else if (cancreateerror.code === 'invaliduser') {
              self.usernameStatus = self.ACCST_BANNED;
              self.usernameBannedDetail = self.$t('bad-username-email');
            } else if (cancreateerror.code === 'antispoof-name-illegal') {
              self.usernameStatus = self.ACCST_BANNED;
              self.usernameBannedDetail = mw.msg('antispoof-name-illegal', ...cancreateerror.params);
            } else if (cancreateerror.code === '_1') {
              self.usernameStatus = self.ACCST_BANNED;
              self.usernameBannedDetail = mw.msg('antispoof-name-1', ...cancreateerror.params);
            } else if (cancreateerror.code === '_1_2_3') {
              self.usernameStatus = self.ACCST_BANNED;
              self.usernameBannedDetail = mw.msg('antispoof-name-123', ...cancreateerror.params);
            } else {
              self.usernameStatus = self.ACCST_BANNED;
            }
          } else {
            self.usernameStatus = self.ACCST_NOT_EXISTS;
          }
          self.normalizedUsername = user.name;
          def.resolve();
        });
      return def;
    },
    checkAccountStatus() {
      let def = $.Deferred();
      let self = this;

      self.accountBlocked = false;
      self.accountBlockBy = '';
      self.accountBlockReason = '';
      self.accountHasIpbe = false;
      if (!self.username) {
        return def.resolve();
      }
      api
        .get({
          action: 'query',
          format: 'json',
          list: 'users',
          usprop: 'blockinfo|groupmemberships',
          ususers: self.username,
        })
        .then(function (res) {
          let user = res.query.users[0];
          if ('blockid' in user) {
            self.accountBlocked = true;
            self.accountBlockBy = user.blockedby;
            self.accountBlockReason = user.blockreason;
          }
          if ('groupmemberships' in user) {
            for (const row of user.groupmemberships) {
              if (row.group === 'ipblock-exempt') {
                self.accountHasIpbe = true;
                break;
              }
            }
          }
          def.resolve();
        });
      return def;
    },
    checkIpBlocks() {
      let def = $.Deferred();
      let self = this;

      self.blocked = false;
      self.blockBy = '';
      self.blockReason;
      if (!self.ip) {
        return def.resolve();
      }
      let query = {
        action: 'query',
        format: 'json',
        list: 'blocks',
        bkprop: 'by|reason',
        utf8: 1,
      };
      if (mw.util.isIPAddress(self.ip, true)) {
        query.bkip = self.ip;
        query.list += '|globalblocks';
        query.bgprop = 'by|reason';
        query.bgip = self.ip;
      } else if (/^#\d+$/.test(self.ip)) {
        query.bkids = self.ip.substr(1);
      } else {
        return Promise.resolve();
      }
      api.get(query).then(function (res) {
        self.ipChecked = true;
        if (res.query.blocks.length > 0) {
          self.blocked = true;
          self.blockBy = res.query.blocks[0].by;
          self.blockReason = res.query.blocks[0].reason;
          return def.resolve();
        }
        if (res.query.globalblocks.length > 0) {
          self.blocked = true;
          self.blockBy = res.query.globalblocks[0].by;
          self.blockReason = res.query.globalblocks[0].reason;
          return def.resolve();
        }
        return def.resolve();
      });
      return def;
    },
    showCheckResult() {
      this.actionOptions = [];
      let userToBeCreated = false;
      if (this.inputCreateAccount) {
        if (this.normalizedUsername) {
          if (this.usernameStatus == this.ACCST_NOT_EXISTS) {
            this.actionOptions.push(this.ACTOP_CREATEACCOUNT);
            this.mailOptionsUsername = this.MAILOP_ACCOUNTCREATED;
            userToBeCreated = true;
          } else if (this.usernameStatus == this.ACCST_BANNED) {
            this.mailOptionsUsername = this.MAILOP_USERNAMEBANNED;
          } else if (this.usernameStatus == this.ACCST_EXISTS) {
            this.mailOptionsUsername = this.MAILOP_USERNAMEUSED;
          }
        } else {
          this.mailOptionsUsername = this.MAILOP_NOUSERNAME;
        }
      }
      if (
        this.inputGrantIpbe &&
        ((!this.inputCreateAccount &&
          (this.usernameStatus === this.ACCST_EXISTS || this.usernameStatus == this.ACCST_NEEDS_LOCAL)) ||
          userToBeCreated) &&
        this.ip &&
        this.blocked &&
        !this.accountBlocked &&
        !this.accountHasIpbe
      ) {
        if (this.usernameStatus == this.ACCST_NEEDS_LOCAL) {
          this.actionOptions.push(this.ACTOP_CREATELOCAL);
        }
        this.actionOptions.push(this.ACTOP_GRANTIPBE);
      }
      if (this.inputResetPassword) {
        if (this.username) {
          if (!this.inputCreateAccount && this.usernameStatus == this.ACCST_NEEDS_LOCAL) {
            this.actionOptions.push(this.ACTOP_CREATELOCAL);
          }
          this.actionOptions.push(this.ACTOP_RESETPASSWORDUSERNAME);
        } else if (this.email) {
          this.actionOptions.push(this.ACTOP_RESETPASSWORDEMAIL);
        }
      }
      this.autoMailOptionsAccount();
      this.autoMailOptionsIpbe();
      this.autoMailOptionsResetPassword();
    },
    autoMailOptionsAccount() {
      this.mailOptionsUsername = '';
      if (this.actionOptions.includes(this.ACTOP_CREATEACCOUNT)) {
        this.mailOptionsUsername = this.MAILOP_ACCOUNTCREATED;
      } else if (this.actionOptions.includes(this.ACTOP_CREATELOCAL)) {
        this.mailOptionsUsername = this.MAILOP_ACCOUNTLOCAL;
      } else if (this.inputCreateAccount) {
        if (this.normalizedUsername) {
          if (this.usernameStatus == this.ACCST_EXISTS || this.usernameStatus == this.ACCST_NEEDS_LOCAL) {
            this.mailOptionsUsername = this.MAILOP_USERNAMEUSED;
          } else if (this.usernameStatus == this.ACCST_BANNED) {
            this.mailOptionsUsername = this.MAILOP_USERNAMEBANNED;
          }
        } else {
          this.mailOptionsUsername = this.MAILOP_NOUSERNAME;
        }
      } else if (this.inputGrantIpbe) {
        if (!this.normalizedUsername) {
          this.mailOptionsUsername = this.MAILOP_NOUSERNAME;
        } else if (this.usernameStatus == this.ACCST_BANNED || this.usernameStatus == this.ACCST_NOT_EXISTS) {
          this.mailOptionsUsername = this.MAILOP_ACCTNOTEXISTS;
        }
      } else if (this.inputBlockAppeal) {
        if (!this.normalizedUsername) {
          this.mailOptionsUsername = this.MAILOP_NOUSERNAME;
        }
      } else if (this.inputResetPassword) {
        if (!this.normalizedUsername && !this.email) {
          this.mailOptionsUsername = this.MAILOP_NOUSERNAME;
        }
      }
    },
    autoMailOptionsIpbe() {
      this.mailOptionsIpbe = '';
      if (this.actionOptions.includes(this.ACTOP_GRANTIPBE)) {
        this.mailOptionsIpbe = this.MAILOP_IPBEGRANTED;
        if (!this.actionOptions.includes(this.ACTOP_NOTICEIPBE)) {
          this.actionOptions.push(this.ACTOP_NOTICEIPBE);
        }
        if (!this.actionOptions.includes(this.ACTOP_RFIPBE)) {
          this.actionOptions.push(this.ACTOP_RFIPBE);
        }
      } else {
        this.actionOptions = this.actionOptions.filter((key) => key !== this.ACTOP_NOTICEIPBE);
        this.actionOptions = this.actionOptions.filter((key) => key !== this.ACTOP_RFIPBE);
        if (this.inputGrantIpbe) {
          if (this.ip) {
            if (!this.blocked) {
              this.mailOptionsIpbe = this.MAILOP_IPNOTBLOCKED;
            }
          } else {
            this.mailOptionsIpbe = this.MAILOP_NOIP;
          }
        } else if (this.inputBlockAppeal && !this.ip) {
          this.mailOptionsIpbe = this.MAILOP_NOIP;
        }
      }
    },
    autoMailOptionsResetPassword() {
      this.mailOptionsResetPassword =
        this.actionOptions.includes(this.ACTOP_RESETPASSWORDUSERNAME) ||
        this.actionOptions.includes(this.ACTOP_RESETPASSWORDEMAIL);
    },
    runActions() {
      this.clearStatus();

      if (this.actionOptions.length === 0) {
        alert(this.$t('nothing-to-do'));
        return;
      }
      if (
        this.actionOptions.includes(this.ACTOP_RESETPASSWORDUSERNAME) &&
        this.actionOptions.includes(this.ACTOP_RESETPASSWORDEMAIL)
      ) {
        alert(this.$t('reset-password-actions-only-one'));
        return;
      }
      if (
        !this.summary &&
        !(
          this.actionOptions.length === 1 &&
          (this.actionOptions.includes(this.ACTOP_RESETPASSWORDUSERNAME) ||
            this.actionOptions.includes(this.ACTOP_RESETPASSWORDEMAIL))
        )
      ) {
        alert(this.$t('please-input-summary'));
        return;
      }
      if (this.actionOptions.includes(this.ACTOP_CREATEACCOUNT) && !this.email) {
        alert(this.$t('action-no-email'));
        return;
      }

      let tm = new Morebits.taskManager();
      tm.add(this.createAccount, []);
      tm.add(this.createLocal, []);
      tm.add(this.grantIpbe, [this.createAccount, this.createLocal]);
      tm.add(this.NoticeIpbe, [this.grantIpbe], () => {
        if (this.actionOptions.includes(this.ACTOP_NOTICEIPBE)) {
          this.statusNoticeIpbeType = 'error';
          this.statusNoticeIpbe = this.$t('grant-failed-auto-cancel');
        }
      });
      tm.add(this.RfIpbe, [this.grantIpbe], () => {
        if (this.actionOptions.includes(this.ACTOP_RFIPBE)) {
          this.statusRfIpbeType = 'error';
          this.statusRfIpbe = this.$t('grant-failed-auto-cancel');
        }
      });
      tm.add(this.resetPasswordUsername, [this.createAccount, this.createLocal]);
      tm.add(this.resetPasswordEmail, [this.createAccount, this.createLocal]);
      tm.execute();
    },
    createAccount() {
      let def = $.Deferred();
      let self = this;

      if (!self.actionOptions.includes(this.ACTOP_CREATEACCOUNT) || !self.normalizedUsername) {
        return def.resolve();
      }
      api.getToken('createaccount').then(function (token) {
        api
          .post({
            action: 'createaccount',
            username: self.normalizedUsername,
            email: self.email,
            realname: '',
            mailpassword: '1',
            reason: self.summary + self.SUMMARY_SUFFIX,
            createreturnurl: 'https:' + mw.config.get('wgServer'),
            createtoken: token,
          })
          .done(function (data) {
            if (data.createaccount.status === 'FAIL') {
              self.statusCreateAcccountType = 'error';
              self.statusCreateAcccount = data.createaccount.message;
            } else if (data.createaccount.status === 'PASS') {
              self.statusCreateAcccountType = 'success';
              self.statusCreateAcccount = self.$t('account-success-created');
            } else {
              self.statusCreateAcccountType = 'error';
              self.statusCreateAcccount = self.$t('unknown-error-check-console');
            }
            def.resolve();
          })
          .fail(function (code, error) {
            console.error(error);
            self.statusCreateAcccountType = 'error';
            if (error.error && error.error.info) {
              self.statusCreateAcccount = error.error.info;
            } else {
              self.statusCreateAcccount = self.$t('unknown-error-check-console');
            }
            def.reject();
          });
      });
      return def;
    },
    createLocal() {
      let def = $.Deferred();
      let self = this;

      if (!this.actionOptions.includes(this.ACTOP_CREATELOCAL) || !self.normalizedUsername) {
        return def.resolve();
      }
      api
        .postWithEditToken({
          action: 'createlocalaccount',
          username: self.normalizedUsername,
          reason: self.summary,
        })
        .done(function () {
          self.statusCreateLocalType = 'success';
          self.statusCreateLocal = self.$t('action-create-local-success');
          def.resolve();
        })
        .fail(function (code, error) {
          console.error(error);
          self.statusCreateLocalType = 'error';
          if (error.error && error.error.info) {
            self.statusCreateLocal = error.error.info;
          } else {
            self.statusCreateLocal = self.$t('unknown-error-check-console');
          }
          def.reject();
        });
      return def;
    },
    grantIpbe() {
      let def = $.Deferred();
      let self = this;

      if (!this.actionOptions.includes(this.ACTOP_GRANTIPBE)) {
        return def.resolve();
      }
      api
        .postWithToken('userrights', {
          action: 'userrights',
          user: self.normalizedUsername,
          add: 'ipblock-exempt',
          expiry: 'infinite',
          reason: self.$t('grant-ipbe-summary', [self.summary]) + self.SUMMARY_SUFFIX,
        })
        .done(function () {
          self.statusGrantIpbeType = 'success';
          self.statusGrantIpbe = self.$t('action-grant-ipbe-success');
          def.resolve();
        })
        .fail(function (code, error) {
          console.error(error);
          self.statusGrantIpbeType = 'error';
          if (error.error && error.error.info) {
            self.statusGrantIpbe = error.error.info;
          } else {
            self.statusGrantIpbe = self.$t('unknown-error-check-console');
          }
          def.reject();
        });
      return def;
    },
    NoticeIpbe() {
      let def = $.Deferred();
      let self = this;

      if (!this.actionOptions.includes(this.ACTOP_NOTICEIPBE)) {
        return def.resolve();
      }
      let message = '{{subst:Ipexempt granted}}';
      let usertalk = 'User talk:' + self.normalizedUsername;
      api
        .get({
          action: 'query',
          prop: 'info',
          titles: usertalk,
          formatversion: 2,
        })
        .done(function (data) {
          var page = data.query.pages[0];
          if (page.missing !== undefined) {
            api
              .create(usertalk, { summary: self.$t('notice-ipbe-summary') + self.SUMMARY_SUFFIX }, message)
              .done(function () {
                self.statusNoticeIpbeType = 'success';
                self.statusNoticeIpbe = self.$t('action-notice-success');
                def.resolve();
              })
              .fail(function (code, error) {
                console.error(error);
                self.statusNoticeIpbeType = 'error';
                if (error.error && error.error.info) {
                  self.statusNoticeIpbe = error.error.info;
                } else {
                  self.statusNoticeIpbe = self.$t('unknown-error-check-console');
                }
                def.reject();
              });
          } else if (page.contentmodel == 'flow-board') {
            api
              .postWithEditToken({
                action: 'flow',
                page: usertalk,
                submodule: 'new-topic',
                nttopic: self.$t('notice-ipbe-summary'),
                ntcontent: message,
                ntformat: 'wikitext',
              })
              .done(function () {
                self.statusNoticeIpbeType = 'success';
                self.statusNoticeIpbe = self.$t('action-notice-success');
                def.resolve();
              })
              .fail(function (code, error) {
                console.error(error);
                self.statusNoticeIpbeType = 'error';
                if (error.error && error.error.info) {
                  self.statusNoticeIpbe = error.error.info;
                } else {
                  self.statusNoticeIpbe = self.$t('unknown-error-check-console');
                }
                def.reject();
              });
          } else {
            api
              .edit(usertalk, function (revision) {
                return {
                  text: (revision.content + '\n\n' + message).trim(),
                  summary: self.$t('notice-ipbe-summary') + self.SUMMARY_SUFFIX,
                };
              })
              .done(function () {
                self.statusNoticeIpbeType = 'success';
                self.statusNoticeIpbe = self.$t('action-notice-success');
                def.resolve();
              })
              .fail(function (code, error) {
                console.error(error);
                self.statusNoticeIpbeType = 'error';
                if (error.error && error.error.info) {
                  self.statusNoticeIpbe = error.error.info;
                } else {
                  self.statusNoticeIpbe = self.$t('unknown-error-check-console');
                }
                def.reject();
              });
          }
        });
      return def;
    },
    RfIpbe() {
      let def = $.Deferred();
      let self = this;

      if (!this.actionOptions.includes(this.ACTOP_RFIPBE)) {
        return def.resolve();
      }
      api
        .edit('Wikipedia:權限申請/申請IP封禁例外權', function (revision) {
          let content =
            '{{subst:rfp|' + self.normalizedUsername + '|2=' + self.$t('rfipbe-text', [self.summary]) + '|status=+}}';
          let summary = self.$t('rfipbe-summary', [self.normalizedUsername]);
          return {
            text: revision.content + '\n\n' + content,
            summary: summary + self.SUMMARY_SUFFIX,
          };
        })
        .done(function () {
          self.statusRfIpbeType = 'success';
          self.statusRfIpbe = self.$t('fill-success');
          def.resolve();
        })
        .fail(function (code, error) {
          console.error(error);
          self.statusRfIpbeType = 'error';
          if (error.error && error.error.info) {
            self.statusRfIpbe = error.error.info;
          } else {
            self.statusRfIpbe = self.$t('unknown-error-check-console');
          }
          def.reject();
        });
      return def;
    },
    resetPasswordUsername() {
      let def = $.Deferred();
      let self = this;

      if (!this.actionOptions.includes(this.ACTOP_RESETPASSWORDUSERNAME)) {
        return def.resolve();
      }
      api
        .postWithEditToken({
          action: 'resetpassword',
          user: self.normalizedUsername,
        })
        .done(function (data) {
          if (data.resetpassword.status === 'success') {
            self.statusResetPasswordUsernameType = 'success';
            self.statusResetPasswordUsername = self.$t('success-reset-password');
          } else {
            self.statusResetPasswordUsernameType = 'error';
            self.statusResetPasswordUsername = self.$t('unknown-error-check-console');
          }
          def.resolve();
        })
        .fail(function (code, error) {
          console.error(error);
          self.statusResetPasswordUsernameType = 'error';
          if (error.error && error.error.info) {
            self.statusResetPasswordUsername = error.error.info;
          } else {
            self.statusResetPasswordUsername = self.$t('unknown-error-check-console');
          }
          def.resolve();
        });
      return def;
    },
    resetPasswordEmail() {
      let def = $.Deferred();
      let self = this;

      if (!this.actionOptions.includes(this.ACTOP_RESETPASSWORDEMAIL)) {
        return def.resolve();
      }
      api
        .postWithEditToken({
          action: 'resetpassword',
          email: self.email,
        })
        .done(function (data) {
          if (data.resetpassword.status === 'success') {
            self.statusResetPasswordEmailType = 'success';
            self.statusResetPasswordEmail = self.$t('success-reset-password');
          } else {
            self.statusResetPasswordEmailType = 'error';
            self.statusResetPasswordEmail = self.$t('unknown-error-check-console');
          }
          def.resolve();
        })
        .fail(function (code, error) {
          console.error(error);
          self.statusResetPasswordEmailType = 'error';
          if (error.error && error.error.info) {
            self.statusResetPasswordEmail = error.error.info;
          } else {
            self.statusResetPasswordEmail = self.$t('unknown-error-check-console');
          }
          def.resolve();
        });
      return def;
    },
    clearStatus() {
      this.statusCreateAcccountType =
        this.statusCreateLocalType =
        this.statusGrantIpbeType =
        this.statusNoticeIpbeType =
        this.statusRfIpbeType =
        this.statusResetPasswordUsernameType =
        this.statusResetPasswordEmailType =
          'info';
      this.statusCreateAcccount =
        this.statusCreateLocal =
        this.statusGrantIpbe =
        this.statusNoticeIpbe =
        this.statusRfIpbe =
        this.statusResetPasswordUsername =
        this.statusResetPasswordEmail =
          '';
    },
    copyMailContent() {
      let self = this;

      $('#uzh-mail-content').select();
      let copied;
      try {
        copied = document.execCommand('copy');
      } catch (e) {
        copied = false;
      }
      if (copied) {
        if (self.copyTimeoutId) {
          clearTimeout(self.copyTimeoutId);
        }
        self.copyTimeoutId = setTimeout(() => {
          self.copyTimeoutId = null;
        }, 3000);
      } else {
        mw.notify(this.$t('copy-failed'), { type: 'error' });
      }
    },
    resetForm() {
      this.inputCreateAccount = true;
      this.inputGrantIpbe = true;
      this.inputBlockAppeal = false;
      this.inputResetPassword = false;
      this.username = '';
      this.email = '';
      this.ip = '';
      this.archiveUrl = '';
      this.summary = '';
      this.normalizedUsername = '';
      this.accountBlocked = false;
      this.accountBlocked = '';
      this.accountBlockReason = '';
      this.accountHasIpbe = false;
      this.ipChecked = false;
      this.usernameStatus = '';
      this.usernameBannedDetail = '';
      this.actionOptions = [];
      this.mailOptionsUsername = '';
      this.mailOptionsIpbe = '';
      this.mailOptionsResetPassword = false;
      this.mailOptionsOther = [];
    },
    wgULS: window.wgULS,
    getUrl: mw.util.getUrl,
  },
};
</script>

<style>
.uzh-fullwidth-label {
  display: block;
  float: left;
}
.uzh-fullwidth-input {
  display: block;
  overflow: hidden;
  padding-right: 10px;
}
#uzh-container input[type='checkbox'] {
  margin-right: 2px;
}
#uzh-container fieldset {
  margin-top: 0;
  margin-bottom: 0;
}
.uzh-inline-options {
  margin-right: 5px;
}
.uzh-status-error {
  background: #ffcece;
}
.uzh-status-success {
  background: #aeffae;
}
</style>
