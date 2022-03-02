<script setup></script>

<template>
  <div id="uzh-container">
    <fieldset>
      <legend>
        {{ wgULS('填写申请人给予的资料', '填寫申請人給予的資料') }}
      </legend>
      要求操作：
      <label class="uzh-inline-options">
        <input v-model="inputCreateAccount" type="checkbox" />
        {{ wgULS('创建账户', '建立帳號') }}
      </label>
      <label class="uzh-inline-options">
        <input v-model="inputGrantIpbe" type="checkbox" />
        {{ wgULS('授予IP封禁豁免权', '授予IP封鎖例外權') }}
      </label>
      <label class="uzh-inline-options">
        <input v-model="inputResetPassword" type="checkbox" />
        {{ wgULS('重置密码', '重設密碼') }}
      </label>
      <br />
      <label>
        {{ wgULS('用户名：', '使用者名稱：') }}
        <input
          v-model="username"
          type="text"
          name="uzh-username"
          style="width: 400px"
        />
      </label>
      <br />
      <label>
        {{ wgULS('IP地址或封禁ID：', 'IP地址或封鎖ID：') }}
        <input v-model="ip" type="text" name="uzh-ip" style="width: 400px" />
      </label>
      <br />
      <label>
        <span class="uzh-fullwidth-label">
          {{ wgULS('邮件存档URL：', '郵件存檔URL：') }}
        </span>
        <span class="uzh-fullwidth-input">
          <input
            v-model="archiveUrl"
            type="text"
            name="uzh-archive-url"
            style="width: 100%"
            placeholder="https://lists.wikimedia.org/hyperkitty/list/unblock-zh@lists.wikimedia.org/message/..."
          />
        </span>
      </label>
      <button @click.prevent="checkInput">{{ wgULS('检查', '檢查') }}</button>
    </fieldset>

    <fieldset>
      <legend>{{ wgULS('选择您要进行的操作', '選擇您要進行的操作') }}</legend>
      狀態：
      <ul>
        <li
          v-if="username && username != normalizedUsername"
          class="uzh-status-info"
        >
          {{ wgULS('用户名被正规化为“', '使用者名稱被正規化為「')
          }}{{ this.normalizedUsername }}{{ wgULS('”', '」') }}
        </li>
        <li v-if="username && cancreate" class="uzh-status-succress">
          {{ wgULS('账户可以创建', '帳號可以建立') }}
        </li>
        <li
          v-if="username && !cancreate && needsCreateLocal"
          class="uzh-status-success"
        >
          {{ wgULS('需要强制创建本地账户', '需要強制建立本地帳號') }}
        </li>
        <li
          v-if="username && !cancreate && !needsCreateLocal"
          class="uzh-status-error"
        >
          {{ wgULS('账户已被注册', '帳號已被註冊') }}（<a
            :href="'/wiki/Special:CentralAuth/' + normalizedUsername"
            target="_blank"
            >{{ wgULS('检查全域账户', '檢查全域帳號') }}</a
          >）
        </li>
        <li v-if="ip && blocked" class="uzh-status-success">
          {{ 'IP已被' }}{{ blockBy
          }}{{ wgULS('封禁，原因为：', '封鎖，原因為：') }}{{ blockReason }}（<a
            :href="'/wiki/Special:BlockList?wpTarget=' + encodeURIComponent(ip)"
            target="_blank"
            >{{ wgULS('检查', '檢查') }}</a
          >）
        </li>
        <li v-if="ip && !blocked" class="uzh-status-error">
          {{ wgULS('申请人给定的IP未被封禁', '申請人給定的IP未被封鎖') }}（<a
            :href="'/wiki/Special:BlockList?wpTarget=' + encodeURIComponent(ip)"
            target="_blank"
            >{{ wgULS('检查', '檢查') }}</a
          >）
        </li>
      </ul>
      <div v-if="inputCreateAccount && cancreate">
        <label>
          <input
            v-model="actionOptions"
            :value="ACTOP_CREATEACCOUNT"
            type="checkbox"
          />
          {{ wgULS('创建新账户“', '建立新帳號「') }}{{ normalizedUsername
          }}{{ wgULS('”', '」') }}</label
        >
      </div>
      <div v-if="needsCreateLocal">
        <label>
          <input
            v-model="actionOptions"
            :value="ACTOP_CREATELOCAL"
            type="checkbox"
            @change="autoMailOptionsAccount"
          />
          {{ wgULS('强制创建本地账户“', '強制建立本地帳號「')
          }}{{ normalizedUsername }}{{ wgULS('”', '」') }}（<a
            :href="'/wiki/Special:CentralAuth/' + normalizedUsername"
            target="_blank"
            >{{ wgULS('检查全域账户', '檢查全域帳號') }}</a
          >）</label
        >
      </div>
      <div v-if="username">
        <label>
          <input
            v-model="actionOptions"
            :value="ACTOP_GRANTIPBE"
            type="checkbox"
            @change="autoMailOptionsIpbe"
          />
          {{ wgULS('授予“', '授予「') }}{{ normalizedUsername
          }}{{ wgULS('”IP封禁豁免权', '」IP封鎖例外權') }}</label
        >
      </div>
      <div v-if="username">
        <label>
          <input
            v-model="actionOptions"
            :value="ACTOP_RESETPASSWORD"
            type="checkbox"
            @change="autoMailOptionsResetPassword"
          />
          {{ wgULS('重置“', '重設「') }}{{ normalizedUsername
          }}{{ wgULS('”的密码', '」的密碼') }}</label
        >
      </div>
      <button>{{ wgULS('执行选定的操作', '執行選定的操作') }}</button>
    </fieldset>

    <fieldset>
      <legend>{{ wgULS('回复邮件', '回覆郵件') }}</legend>
      <div>
        <label class="uzh-inline-options">
          <input
            v-model="mailOptionsUsername"
            :value="MAILOP_NOUSERNAME"
            type="radio"
          />
          {{ wgULS('未给用户名', '未給使用者名稱') }}</label
        >
        <label class="uzh-inline-options">
          <input
            v-model="mailOptionsUsername"
            :value="MAILOP_USERNAMEUSED"
            type="radio"
          />
          {{ wgULS('用户名已被占用', '使用者名稱已被占用') }}</label
        >
        <label class="uzh-inline-options">
          <input
            v-model="mailOptionsUsername"
            :value="MAILOP_ACCOUNTCREATED"
            type="radio"
          />
          {{ wgULS('已创建账户', '已建立帳號') }}</label
        >
        <label class="uzh-inline-options">
          <input
            v-model="mailOptionsUsername"
            :value="MAILOP_ACCOUNTLOCAL"
            type="radio"
          />
          {{ wgULS('已强制创建本地账户', '已強制建立本地帳號') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" value="" type="radio" />
          {{ wgULS('无', '無') }}</label
        >
        <br />

        <label class="uzh-inline-options">
          <input v-model="mailOptionsIpbe" value="NoIp" type="radio" />
          {{ wgULS('未给IP地址', '未給IP地址') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsIpbe" value="IpNotBlocked" type="radio" />
          {{ wgULS('所给IP未被封禁', '所給IP未被封鎖') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsIpbe" value="IpbeGranted" type="radio" />
          {{ wgULS('已授予IP封禁豁免权', '已授予IP封鎖例外權') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsIpbe" value="" type="radio" />
          {{ wgULS('无', '無') }}</label
        >
        <br />

        <label class="uzh-inline-options">
          <input v-model="mailOptionsResetPassword" type="checkbox" />
          {{ wgULS('已重置密码', '已重設密碼') }}</label
        >
        <br />

        <label class="uzh-inline-options">
          <input v-model="mailOptionsVariant" value="hans" type="radio" />
          {{ wgULS('简体', '簡體') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsVariant" value="hant" type="radio" />
          {{ wgULS('繁体', '繁體') }}</label
        >
      </div>
      <textarea
        v-model="mailContent"
        readonly
        rows="8"
        @click="$event.target.select()"
      ></textarea>
    </fieldset>
  </div>
</template>

<script>
var api = new mw.Api();

export default {
  data() {
    return {
      inputCreateAccount: true,
      inputGrantIpbe: true,
      inputResetPassword: false,
      username: '',
      ip: '',
      archiveUrl: '',
      cancreate: false,
      needsCreateLocal: false,
      normalizedUsername: '',
      blocked: false,
      blockBy: '',
      blockReason: '',
      actionOptions: [],
      mailOptionsUsername: '',
      mailOptionsIpbe: '',
      mailOptionsResetPassword: false,
      mailOptionsVariant: 'hans',
    };
  },
  computed: {
    mailContent() {
      const useUsernameChecker =
        this.resULS('请务必使用', '請務必使用') +
        ' https://zhwiki-username-check.toolforge.org ' +
        this.resULS(
          '来确认您想要注册的用户名是否可用。',
          '來確認您想要註冊的使用者名稱是否可用。'
        );

      let links = [];
      let text = '您好：\n\n';
      if (this.mailOptionsUsername === this.MAILOP_NOUSERNAME) {
        if (this.inputCreateAccount) {
          text +=
            this.resULS(
              '请告知您想要的用户名，“不要提供密码”。',
              '請告知您想要的使用者名稱，「不要提供密碼」。'
            ) +
            useUsernameChecker +
            '。\n';
        } else {
          links.push('https://w.wiki/4oNy');
          text +=
            this.resULS(
              '请告知您的用户名（登录后从参数设置查看[',
              '請告知您的使用者名稱（登入後從偏好設定檢視['
            ) +
            links.length +
            this.resULS(
              ']，这不是电子邮件地址）\n',
              ']，這不是電子郵件位址）\n'
            );
          if (!this.inputResetPassword) {
            text +=
              this.resULS(
                '如果您没有账户且无法自行注册，请告知您想要的用户名，“不要提供密码”。',
                '如果您沒有帳號且無法自行註冊，請告知您想要的使用者名稱，「不要提供密碼」。'
              ) +
              useUsernameChecker +
              '。\n';
          }
        }
      } else if (this.mailOptionsUsername === this.MAILOP_USERNAMEUSED) {
        text +=
          this.resULS(
            '您所指定的用户名已经被注册。请提供另一个用户名，',
            '您所指定的使用者名稱已經被註冊。請提供另一個使用者名稱，'
          ) +
          useUsernameChecker +
          '。\n';
      } else if (this.mailOptionsUsername === this.MAILOP_ACCOUNTCREATED) {
        text += this.resULS(
          '已代为注册账户，账户的随机密码用另一封邮件寄出，随机密码的有效期限仅有7天，请尽速登录修改密码。\n',
          '已代為註冊帳戶，帳戶的隨機密碼用另一封郵件寄出，隨機密碼的有效期限僅有7天，請盡速登入修改密碼。\n'
        );
      } else if (this.mailOptionsUsername === this.MAILOP_ACCOUNTLOCAL) {
        text += this.resULS(
          '由于您先前于中文维基百科以外的站点注册，已为您的账户强制创建在中文维基百科的本地账户，您可以使用相同的账户密码登录。\n',
          '由於您先前於中文維基百科以外的站點註冊，已為您的帳號強制建立在中文維基百科的本地帳號，您可以使用相同的帳號密碼登入。\n'
        );
      }

      if (this.mailOptionsIpbe === this.MAILOP_NOIP) {
        text +=
          this.resULS('请告知以下信息：\n', '請告知以下資訊：\n') +
          this.resULS('　1. 被封禁的IP地址\n', '　1. 被封鎖的IP位址\n') +
          this.resULS(
            '　2. 封禁ID（如果有，可在告知被封禁页面看到“您当前的IP地址是xxxx，而该封禁ID是#xxxx。”，这不是用户名）\n',
            '　2. 封鎖ID（如果有，可在告知被封鎖頁面看到「您目前的IP位址是xxxx，而該封鎖ID是#xxxx。」，這不是使用者名稱）\n'
          ) +
          this.resULS(
            '以让我们做下一步处理（复制您看到的文字对我们处理较为方便，请避免使用截图）。\n',
            '以讓我們做下一步處理（複製您看到的文字對我們處理較為方便，請避免使用截圖）。\n'
          );
      } else if (this.mailOptionsIpbe === this.MAILOP_IPNOTBLOCKED) {
        text += this.resULS(
          '您所给的IP地址未被封禁，请确认正确的IP地址后再回信，您可在告知被封禁页面看到“您当前的IP地址是xxxx”，若您已经可以编辑，则不用回信。\n',
          '您所給的IP位址未被封鎖，請確認正確的IP位址後再回信，您可在告知被封鎖頁面看到「您目前的IP位址是xxxx」，若您已經可以編輯，則不用回信。\n'
        );
      } else if (this.mailOptionsIpbe === this.MAILOP_IPBEGRANTED) {
        text += this.resULS(
          '已授予您IP封禁豁免权限，登录后即可编辑页面。祝您编辑愉快。\n',
          '已授予您IP封鎖例外權限，登入後即可編輯頁面。祝您編輯愉快。\n'
        );
      }

      if (this.mailOptionsResetPassword) {
        text += this.resULS(
          '已协助重置密码，将会寄出重置密码的信件给您，随机密码的有效期限仅有7天，请尽速登录修改密码。\n如果没有收到邮件，请检查垃圾邮件匣，并确定您之前有在维基百科上登记您的电子邮件地址。\n',
          '已協助重設密碼，將會寄出重設密碼的信件給您，隨機密碼的有效期限僅有7天，請盡速登入修改密碼。\n如果沒有收到郵件，請檢查垃圾郵件匣，並確定您之前有在維基百科上登記您的電子郵件位址。\n'
        );
        if (this.inputGrantIpbe && this.mailOptionsIpbe === '') {
          text += this.resULS(
            '在确定您能够登录您的账户后才会授予您IP封禁豁免权，请成功登录后再回信告知。\n',
            '在確定您能夠登入您的帳號後才會授予您IP封鎖例外權，請成功登入後再回信告知。\n'
          );
        }
      }

      if (links.length > 0) {
        text += '\n';
        for (let index = 0; index < links.length; index++) {
          text += '[' + (index + 1) + '] ' + links[index] + '\n';
        }
      }
      text += '\n';
      text += 'User:' + mw.config.get('wgUserName') + '\n';
      text += '--\n';
      text +=
        this.resULS(
          '注意：请在回复任何邮件时选择“回复所有人”（收件者包含 ',
          '注意：請在回覆任何郵件時選擇「回覆所有人」（收件者包含 '
        ) +
        'unblock-zh@lists.wikimedia.org' +
        this.resULS(' ），否则可能无法收到回复', ' ），否則可能無法收到回覆');

      return text;
    },
  },
  watch: {
    actionOptions(newVal) {
      console.log('actionOptions', newVal);
    },
    mailOptionsUsername(newVal) {
      console.log('mailOptionsUsername', newVal);
    },
    mailOptionsIpbe(newVal) {
      console.log('mailOptionsIpbe', newVal);
    },
  },
  created() {
    this.ACTOP_CREATEACCOUNT = 'CreateAccount';
    this.ACTOP_CREATELOCAL = 'CreateLocal';
    this.ACTOP_GRANTIPBE = 'GrantIpbe';
    this.ACTOP_RESETPASSWORD = 'ResetPassword';
    this.MAILOP_NOUSERNAME = 'NoUsername';
    this.MAILOP_USERNAMEUSED = 'UsernameUsed';
    this.MAILOP_ACCOUNTCREATED = 'AccountCreated';
    this.MAILOP_ACCOUNTLOCAL = 'AccountLocal';
    this.MAILOP_NOIP = 'NoIp';
    this.MAILOP_IPNOTBLOCKED = 'IpNotBlocked';
    this.MAILOP_IPBEGRANTED = 'IpbeGranted';
  },
  methods: {
    checkInput() {
      this.username = this.username.trim();
      this.ip = this.ip.trim();
      this.archiveUrl = this.archiveUrl.trim();

      if (
        this.ip &&
        !mw.util.isIPAddress(this.ip, true) &&
        !/^#\d+$/.test(this.ip)
      ) {
        alert(wgULS('IP地址或封禁ID格式错误', 'IP地址或封鎖ID格式錯誤'));
        return;
      }

      let tm = new Morebits.taskManager();
      tm.add(this.checkUserCancreate, []);
      tm.add(this.checkIpBlocks, []);
      tm.execute().then(this.showCheckResult);
    },
    checkUserCancreate() {
      let self = this;

      self.cancreate = false;
      self.needsCreateLocal = false;
      self.normalizedUsername = '';
      if (!self.username) {
        return Promise.resolve();
      }
      return api
        .get({
          action: 'query',
          format: 'json',
          list: 'users',
          usprop: 'cancreate',
          ususers: self.username,
        })
        .then(function (res) {
          let user = res.query.users[0];
          self.cancreate = 'cancreate' in user;
          self.needsCreateLocal = !self.cancreate && 'missing' in user;
          self.normalizedUsername = user.name;
        });
    },
    checkIpBlocks() {
      let self = this;

      self.blocked = false;
      self.blockBy = '';
      self.blockReason;
      if (!self.ip) {
        return Promise.resolve();
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
      return api.get(query).then(function (res) {
        if (res.query.blocks.length > 0) {
          self.blocked = true;
          self.blockBy = res.query.blocks[0].by;
          self.blockReason = res.query.blocks[0].reason;
          return;
        }
        if (res.query.globalblocks.length > 0) {
          self.blocked = true;
          self.blockBy = res.query.globalblocks[0].by;
          self.blockReason = res.query.globalblocks[0].reason;
          return;
        }
      });
    },
    showCheckResult() {
      this.actionOptions = [];
      let canGrantIpbe = false;
      if (this.inputCreateAccount) {
        if (this.normalizedUsername) {
          if (this.cancreate) {
            this.actionOptions.push(this.ACTOP_CREATEACCOUNT);
            this.mailOptionsUsername = this.MAILOP_ACCOUNTCREATED;
            canGrantIpbe = true;
          } else if (this.needsCreateLocal) {
            this.actionOptions.push(this.ACTOP_CREATELOCAL);
            canGrantIpbe = true;
          } else {
            this.mailOptionsUsername = this.MAILOP_USERNAMEUSED;
          }
        } else {
          this.mailOptionsUsername = this.MAILOP_NOUSERNAME;
        }
      }
      if (this.inputGrantIpbe && this.ip && this.blocked && canGrantIpbe) {
        this.actionOptions.push(this.ACTOP_GRANTIPBE);
      }
      if (this.inputResetPassword && this.username) {
        if (!this.inputCreateAccount && this.needsCreateLocal) {
          this.actionOptions.push(this.ACTOP_CREATELOCAL);
        }
        this.actionOptions.push(this.ACTOP_RESETPASSWORD);
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
          if (!this.cancreate) {
            this.mailOptionsUsername = this.MAILOP_USERNAMEUSED;
          }
        } else {
          this.mailOptionsUsername = this.MAILOP_NOUSERNAME;
        }
      }
    },
    autoMailOptionsIpbe() {
      this.mailOptionsIpbe = '';
      if (this.actionOptions.includes(this.ACTOP_GRANTIPBE)) {
        this.mailOptionsIpbe = this.MAILOP_IPBEGRANTED;
      } else {
        if (this.inputGrantIpbe) {
          if (this.ip) {
            if (!this.blocked) {
              this.mailOptionsIpbe = this.MAILOP_IPNOTBLOCKED;
            }
          } else {
            this.mailOptionsIpbe = this.MAILOP_NOIP;
          }
        }
      }
    },
    autoMailOptionsResetPassword() {
      this.mailOptionsResetPassword = this.actionOptions.includes(
        this.ACTOP_RESETPASSWORD
      );
    },
    resULS(hans, hant) {
      if (this.mailOptionsVariant === 'hans') {
        return hans;
      }
      return hant;
    },
    resetUserData() {},
    wgULS: window.wgULS,
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
