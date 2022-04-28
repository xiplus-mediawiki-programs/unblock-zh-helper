<script setup></script>

<template>
  <div id="uzh-container">
    <fieldset>
      <legend>
        {{ wgULS('填写申请人给予的资料', '填寫申請人給予的資料') }}
      </legend>
      <div>
        <button @click.prevent="resetForm">
          {{ wgULS('重置表单', '重設表單') }}
        </button>
      </div>
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
        <input v-model="inputBlockAppeal" type="checkbox" />
        {{ wgULS('封禁申诉', '封鎖申訴') }}
      </label>
      <label class="uzh-inline-options">
        <input v-model="inputResetPassword" type="checkbox" />
        {{ wgULS('重置密码', '重設密碼') }}
      </label>
      <br />
      <label>
        {{ wgULS('用户名：', '使用者名稱：') }}
        <input v-model="username" type="text" style="width: 200px" />
      </label>
      <br />
      <label>
        {{ wgULS('电子邮件地址：', '電子郵件地址：') }}
        <input v-model="email" type="email" style="width: 300px" placeholder="xxx@example.com" />
      </label>
      <br />
      <label>
        {{ wgULS('IP地址或封禁ID：', 'IP地址或封鎖ID：') }}
        <input v-model="ip" type="text" style="width: 300px" placeholder="1.2.3.4 或 #123456" />
      </label>
      <br />
      <label>
        <span class="uzh-fullwidth-label">
          {{ wgULS('邮件存档URL：', '郵件存檔URL：') }}
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
        {{ wgULS('检查信息', '檢查資訊') }}
      </button>
    </fieldset>

    <fieldset>
      <legend>{{ wgULS('选择您要进行的操作', '選擇您要進行的操作') }}</legend>
      {{ wgULS('状态：', '狀態：') }}
      <ul>
        <li v-if="normalizedUsername && username != normalizedUsername" class="uzh-status-info">
          {{ wgULS('用户名被正规化为“', '使用者名稱被正規化為「') }}{{ this.normalizedUsername }}{{ wgULS('”', '」') }}
        </li>
        <li
          v-if="normalizedUsername && inputCreateAccount && usernameStatus == ACCST_NOT_EXISTS"
          class="uzh-status-success"
        >
          {{ wgULS('账户可以创建', '帳號可以建立') }}（<a
            :href="'https://www.google.com/search?q=' + encodeURIComponent(normalizedUsername)"
            target="_blank"
            >{{ wgULS('Google搜索', 'Google搜尋') }}</a
          >）
        </li>
        <li
          v-if="
            normalizedUsername &&
            !inputCreateAccount &&
            (usernameStatus == ACCST_BANNED || usernameStatus == ACCST_NOT_EXISTS)
          "
          class="uzh-status-error"
        >
          {{ wgULS('账户不存在', '帳號不存在') }}
        </li>
        <li
          v-if="normalizedUsername && usernameStatus == ACCST_NEEDS_LOCAL"
          :class="{ 'uzh-status-error': inputCreateAccount, 'uzh-status-success': !inputCreateAccount }"
        >
          {{ wgULS('需要强制创建本地账户', '需要強制建立本地帳號') }}
        </li>
        <li
          v-if="normalizedUsername && usernameStatus == ACCST_EXISTS"
          :class="{ 'uzh-status-error': inputCreateAccount, 'uzh-status-success': !inputCreateAccount }"
        >
          {{ wgULS('账户已被注册', '帳號已被註冊') }}（<a
            :href="getUrl('Special:CentralAuth', { target: normalizedUsername })"
            target="_blank"
            >{{ wgULS('检查全域账户', '檢查全域帳號') }}</a
          >）
        </li>
        <li v-if="normalizedUsername && inputCreateAccount && usernameStatus == ACCST_BANNED" class="uzh-status-error">
          {{ wgULS('此用户名被系统禁止', '此使用者名稱被系統禁止')
          }}<span v-if="usernameBannedDetail">：<span v-html="usernameBannedDetail"></span></span>
        </li>
        <li v-if="accountBlocked" class="uzh-status-error">
          <b
            >{{ wgULS('警告：账户被', '警告：帳號被') }}{{ accountBlockBy
            }}{{ wgULS('封禁，原因为：', '封鎖，原因為：') }}{{ accountBlockReason }}</b
          >（<a :href="getUrl('Special:Log/block', { page: 'User:' + normalizedUsername })" target="_blank">{{
            wgULS('封禁日志', '封鎖日誌')
          }}</a
          >）
        </li>
        <li v-if="ipChecked && ip && blocked" class="uzh-status-success">
          {{ 'IP已被' }}{{ blockBy }}{{ wgULS('封禁，原因为：', '封鎖，原因為：') }}{{ blockReason }}（<a
            :href="getUrl('Special:BlockList', { wpTarget: ip })"
            target="_blank"
            >{{ wgULS('检查', '檢查') }}</a
          >）
        </li>
        <li v-if="ipChecked && ip && !blocked" class="uzh-status-error">
          {{ wgULS('申请人给定的IP未被封禁', '申請人給定的IP未被封鎖') }}（<a
            :href="getUrl('Special:BlockList', { wpTarget: ip })"
            target="_blank"
            >{{ wgULS('检查', '檢查') }}</a
          >）
        </li>
        <li v-if="accountHasIpbe" class="uzh-status-error">
          {{ wgULS('用户已拥有IP封禁豁免权', '使用者已擁有IP封鎖例外權') }}（<a
            :href="getUrl('Special:Log', { type: 'rights', page: 'User:' + normalizedUsername })"
            target="_blank"
            >{{ wgULS('检查权限日志', '檢查權限日誌') }}</a
          >）
        </li>
      </ul>
      <div>
        <label>
          <span class="uzh-fullwidth-label">
            {{ wgULS('日志摘要：', '日誌摘要：') }}
          </span>
          <span class="uzh-fullwidth-input">
            <input v-model="summary" type="text" style="width: 100%" />
          </span>
        </label>
      </div>
      <div v-if="inputCreateAccount && usernameStatus == ACCST_NOT_EXISTS">
        <label>
          <input v-model="actionOptions" :value="ACTOP_CREATEACCOUNT" type="checkbox" />
          {{ wgULS('创建新账户“', '建立新帳號「') }}{{ normalizedUsername
          }}{{ wgULS('”，临时密码寄至“', '」，臨時密碼寄至「') }}{{ email }}{{ wgULS('”', '」') }}</label
        >
        <span v-if="statusCreateAcccount">
          -
          <span :class="'uzh-status-' + statusCreateAcccountType">{{ statusCreateAcccount }}</span></span
        >
      </div>
      <div v-if="usernameStatus == ACCST_NEEDS_LOCAL">
        <label>
          <input v-model="actionOptions" :value="ACTOP_CREATELOCAL" type="checkbox" @change="autoMailOptionsAccount" />
          {{ wgULS('强制创建本地账户“', '強制建立本地帳號「') }}{{ normalizedUsername }}{{ wgULS('”', '」') }}（<a
            :href="getUrl('Special:CentralAuth', { target: normalizedUsername })"
            target="_blank"
            >{{ wgULS('检查全域账户', '檢查全域帳號') }}</a
          >）</label
        >
        <span v-if="statusCreateLocal">
          -
          <span :class="'uzh-status-' + statusCreateLocalType">{{ statusCreateLocal }}</span></span
        >
      </div>
      <div v-if="normalizedUsername">
        <label>
          <input v-model="actionOptions" :value="ACTOP_GRANTIPBE" type="checkbox" @change="autoMailOptionsIpbe" />
          {{ wgULS('授予“', '授予「') }}{{ normalizedUsername }}{{ wgULS('”IP封禁豁免权', '」IP封鎖例外權') }}</label
        >
        <span v-if="statusGrantIpbe">
          -
          <span :class="'uzh-status-' + statusGrantIpbeType">{{ statusGrantIpbe }}</span></span
        >
      </div>
      <div v-if="normalizedUsername" style="padding-left: 18px">
        <label>
          <input v-model="actionOptions" :value="ACTOP_NOTICEIPBE" type="checkbox" />
          {{ wgULS('发送授权通知', '發送授權通知') }}</label
        >
        <span v-if="statusNoticeIpbe">
          -
          <span :class="'uzh-status-' + statusNoticeIpbeType">{{ statusNoticeIpbe }}</span></span
        >
      </div>
      <div v-if="normalizedUsername" style="padding-left: 18px">
        <label>
          <input v-model="actionOptions" :value="ACTOP_RFIPBE" type="checkbox" />
          {{ wgULS('在WP:RFIPBE备案', '在WP:RFIPBE備案') }}</label
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
          {{ wgULS('重置“', '重設「') }}{{ normalizedUsername }}{{ wgULS('”的密码', '」的密碼') }}</label
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
          {{ wgULS('重置“', '重設「') }}{{ email }}{{ wgULS('”的密码', '」的密碼') }}</label
        >
        <span v-if="statusResetPasswordEmail">
          -
          <span :class="'uzh-status-' + statusResetPasswordEmailType">{{ statusResetPasswordEmail }}</span></span
        >
      </div>
      <button @click.prevent="runActions">
        {{ wgULS('执行选定的操作', '執行選定的操作') }}
      </button>
      <a :href="getUrl('Special:RecentChanges', { hidebyothers: 1 })" target="_blank" style="margin-left: 10px">{{
        wgULS('检查您的操作', '檢查您的操作')
      }}</a>
    </fieldset>

    <fieldset>
      <legend>{{ wgULS('回复邮件', '回覆郵件') }}</legend>
      <div>
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" :value="MAILOP_NOUSERNAME" type="radio" />
          {{ wgULS('未给用户名', '未給使用者名稱') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" :value="MAILOP_USERNAMEUSED" type="radio" />
          {{ wgULS('用户名已被占用', '使用者名稱已被占用') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" :value="MAILOP_USERNAMEBANNED" type="radio" />
          {{ wgULS('用户名被系统禁止', '使用者名稱被系統禁止') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" :value="MAILOP_ACCOUNTCREATED" type="radio" />
          {{ wgULS('已创建账户', '已建立帳號') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" :value="MAILOP_ACCOUNTLOCAL" type="radio" />
          {{ wgULS('已强制创建本地账户', '已強制建立本地帳號') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" :value="MAILOP_ACCTNOTEXISTS" type="radio" />
          {{ wgULS('申请IPBE所给账户不存在', '申請IPBE所給帳號不存在') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsUsername" value="" type="radio" />
          {{ wgULS('无', '無') }}</label
        >
        <br />

        <label class="uzh-inline-options">
          <input v-model="mailOptionsIpbe" :value="MAILOP_NOIP" type="radio" />
          {{ wgULS('未给IP地址', '未給IP地址') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsIpbe" :value="MAILOP_IPNOTBLOCKED" type="radio" />
          {{ wgULS('所给IP未被封禁', '所給IP未被封鎖') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsIpbe" :value="MAILOP_IPBEGRANTED" type="radio" />
          {{ wgULS('已授予IP封禁豁免权', '已授予IP封鎖例外權') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsIpbe" :value="MAILOP_MAYNEEDIPBE" type="radio" />
          {{ wgULS('申请人可能需要IP封禁豁免权', '申請人可能需要IP封鎖例外權') }}</label
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
        <label class="uzh-inline-options">
          <input v-model="mailOptionsOther" :value="MAILOP_OPENPROXY" type="checkbox" />
          {{ wgULS('开放代理', '開放代理') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsOther" :value="MAILOP_RANGEBLOCK" type="checkbox" />
          {{ wgULS('段封禁', '段封鎖') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsOther" :value="MAILOP_ENWIKIBLOCK" type="checkbox" />
          {{ wgULS('英文维基封禁', '英文維基封鎖') }}</label
        >
        <label class="uzh-inline-options">
          <input v-model="mailOptionsOther" :value="MAILOP_GIPBE" type="checkbox" />
          {{ wgULS('全域封禁', '全域封鎖') }}</label
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
        <button @click.prevent="copyMailContent">{{ wgULS('复制以下内容', '複製以下內容') }}</button>
        <span v-if="copyTimeoutId"> - {{ wgULS('已复制！', '已複製！') }}</span>
      </div>
      <textarea v-model="mailContent" id="uzh-mail-content" readonly rows="14"></textarea>
    </fieldset>

    <fieldset>
      <legend>{{ wgULS('调试', '除錯') }}</legend>
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
      mailOptionsVariant: 'hans',
      copyTimeoutId: null,
    };
  },
  computed: {
    allData() {
      return this.$data;
    },
    mailContent() {
      const useUsernameChecker =
        this.resULS('请务必使用用户名检查工具', '請務必使用使用者名稱檢查工具') +
        '[LINK:https://zhwiki-username-check.toolforge.org]' +
        this.resULS('来确认您想要注册的用户名是否可用。', '來確認您想要註冊的使用者名稱是否可用。');

      let text = '您好：\n';
      let othertext = '';
      let pleaseProvide = [];
      let pleaseProvideHeader = '';
      let pleaseProvideAppend = '';

      if (this.mailOptionsUsername === this.MAILOP_NOUSERNAME) {
        if (this.inputCreateAccount) {
          pleaseProvide.push(
            this.resULS('您想要的用户名，“不要提供密码”。', '您想要的使用者名稱，「不要提供密碼」。') +
              useUsernameChecker +
              '\n'
          );
        } else if (this.inputGrantIpbe || this.inputBlockAppeal) {
          pleaseProvide.push(
            this.resULS('您的用户名（如果有，登录后从参数设置查看', '您的使用者名稱（如果有，登入後從偏好設定檢視') +
              '[LINK:https://zh.wikipedia.org/wiki/Special:Preferences]' +
              this.resULS('，这不是电子邮件地址）\n', '，這不是電子郵件位址）\n')
          );
          if (this.inputGrantIpbe) {
            pleaseProvideAppend =
              this.resULS(
                '如果您没有账户且无法自行注册，请告知您想要的用户名，“不要提供密码”。',
                '如果您沒有帳號且無法自行註冊，請告知您想要的使用者名稱，「不要提供密碼」。'
              ) +
              useUsernameChecker +
              '\n';
          }
        } else if (this.inputResetPassword) {
          pleaseProvide.push(
            this.resULS('您的用户名，我们能协助您重置密码。\n', '您的使用者名稱，我們能協助您重設密碼。\n')
          );
        }
      } else if (this.mailOptionsUsername === this.MAILOP_USERNAMEUSED) {
        text +=
          this.resULS(
            '您所指定的用户名已经被注册。请提供另一个用户名，',
            '您所指定的使用者名稱已經被註冊。請提供另一個使用者名稱，'
          ) +
          useUsernameChecker +
          '\n';
      } else if (this.mailOptionsUsername === this.MAILOP_USERNAMEBANNED) {
        text +=
          this.resULS(
            '您所指定的用户名被系统禁止。请提供另一个用户名，',
            '您所指定的使用者名稱被系統禁止。請提供另一個使用者名稱，'
          ) +
          useUsernameChecker +
          '\n';
      } else if (this.mailOptionsUsername === this.MAILOP_ACCOUNTCREATED) {
        text +=
          this.resULS('已代为注册账户“', '已代為註冊帳號「') +
          this.normalizedUsername +
          this.resULS('”，账户的随机密码用另一封邮件寄出到“', '」，帳號的隨機密碼用另一封郵件寄出到「') +
          this.email +
          this.resULS(
            '”，随机密码的有效期限仅有7天，请尽速登录修改密码。\n',
            '」，隨機密碼的有效期限僅有7天，請盡速登入修改密碼。\n'
          );
      } else if (this.mailOptionsUsername === this.MAILOP_ACCTNOTEXISTS) {
        text +=
          this.resULS(
            '您提供的用户名不存在，请确认正确后再回信（登录后从参数设置查看',
            '您提供的使用者名稱不存在，請確認正確後再回信（登入後從偏好設定檢視'
          ) +
          '[LINK:https://zh.wikipedia.org/wiki/Special:Preferences]' +
          this.resULS('，这不是电子邮件地址）\n', '，這不是電子郵件位址）\n');
      } else if (this.mailOptionsUsername === this.MAILOP_ACCOUNTLOCAL) {
        text += this.resULS(
          '由于您先前于中文维基百科以外的站点注册，已为您的账户强制创建在中文维基百科的本地账户，您可以使用相同的账户密码登录。\n',
          '由於您先前於中文維基百科以外的站點註冊，已為您的帳號強制建立在中文維基百科的本地帳號，您可以使用相同的帳號密碼登入。\n'
        );
      }

      if (this.mailOptionsIpbe === this.MAILOP_NOIP || this.mailOptionsIpbe === this.MAILOP_MAYNEEDIPBE) {
        if (this.mailOptionsIpbe === this.MAILOP_MAYNEEDIPBE) {
          pleaseProvideHeader = this.resULS(
            '若登录后仍然无法编辑，请回信告知以下信息：\n',
            '若登入後仍然無法編輯，請回信告知以下資訊：\n'
          );
        }
        pleaseProvide.push(this.resULS('被封禁的IP地址\n', '被封鎖的IP位址\n'));
        pleaseProvide.push(
          this.resULS(
            '封禁ID（如果有，可在告知被封禁页面看到“您当前的IP地址是xxxx，而该封禁ID是#xxxx。”，这不是用户名）\n',
            '封鎖ID（如果有，可在告知被封鎖頁面看到「您目前的IP位址是xxxx，而該封鎖ID是#xxxx。」，這不是使用者名稱）\n'
          )
        );
      } else if (this.mailOptionsIpbe === this.MAILOP_IPNOTBLOCKED) {
        othertext += this.resULS(
          '您所给的IP地址未被封禁，请确认正确的IP地址或封禁ID后再回信，您可在告知被封禁页面看到“您当前的IP地址是xxxx，而该封禁ID是#xxxx。”，若您已经可以编辑，则不用回信。\n',
          '您所給的IP位址未被封鎖，請確認正確的IP位址或封鎖ID後再回信，您可在告知被封鎖頁面看到「您目前的IP位址是xxxx，而該封鎖ID是#xxxx。」，若您已經可以編輯，則不用回信。\n'
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

      if (this.mailOptionsOther.includes(this.MAILOP_OPENPROXY)) {
        text +=
          this.resULS(
            '维基媒体基金会禁止使用某些开放代理来编辑维基百科',
            '維基媒體基金會禁止使用某些開放代理來編輯維基百科'
          ) +
          '[LINK:https://meta.wikimedia.org/wiki/No_open_proxies/zh]' +
          this.resULS(
            '，所以我们不会解除封禁这个IP。我们可以为您注册一个账户以绕过这个限制。\n',
            '，所以我們不會解除封鎖這個IP。我們可以為您註冊一個帳號以繞過這個限制。\n'
          );

        pleaseProvide.push(
          this.resULS('您想要的用户名，“不要提供密码”。', '您想要的使用者名稱，「不要提供密碼」。') +
            useUsernameChecker +
            '\n'
        );
      }
      if (this.mailOptionsOther.includes(this.MAILOP_RANGEBLOCK)) {
        othertext +=
          this.resULS(
            '由于有其他人使用此段IP地址对维基百科进行破坏，所以您使用这一个范围的IP地址已经被暂时封禁。\n如果您与破坏行为无关，请注册一个账户并登录后即可编辑。若您无法自行注册账户，请回信告知您想要的用户名，“不要提供密码”。',
            '由於有其他人使用此段IP位址對維基百科進行破壞，所以您使用這一個範圍的IP位址已經被暫時封鎖。\n如果您與破壞行為無關，請註冊一個帳號並登入後即可編輯。若您無法自行註冊帳號，請回信告知您想要的使用者名稱，「不要提供密碼」。'
          ) +
          useUsernameChecker +
          '\n';
      }
      if (this.mailOptionsOther.includes(this.MAILOP_ENWIKIBLOCK)) {
        othertext +=
          this.resULS(
            '由于各个语言的维基百科是各自独立管理的，这里仅能处理中文维基百科',
            '由於各個語言的維基百科是各自獨立管理的，這裡僅能處理中文維基百科'
          ) +
          '[LINK:https://zh.wikipedia.org]' +
          this.resULS(
            '的问题，很抱歉帮不上忙。\n英文维基百科上的申诉请自行向英文维基百科申请，请参考英文维基百科的说明',
            '的問題，很抱歉幫不上忙。\n英文維基百科上的申訴請自行向英文維基百科申請，請參考英文維基百科的說明'
          ) +
          '[LINK:https://en.wikipedia.org/wiki/Wikipedia:Unblock_Ticket_Request_System]' +
          '。\n';
      }
      if (this.mailOptionsOther.includes(this.MAILOP_GIPBE)) {
        othertext +=
          this.resULS(
            '由于各个语言的维基百科是各自独立管理的，这里仅能处理中文维基百科',
            '由於各個語言的維基百科是各自獨立管理的，這裡僅能處理中文維基百科'
          ) +
          '[LINK:https://zh.wikipedia.org]' +
          this.resULS(
            '的问题，很抱歉帮不上忙。\n若有需要全域IP封禁豁免权，请参考Meta-Wiki上的说明',
            '的問題，很抱歉幫不上忙。\n若有需要全域IP封鎖例外權，請參考Meta-Wiki上的說明'
          ) +
          '[LINK:https://meta.wikimedia.org/wiki/IP_block_exempt/zh]' +
          this.resULS('来申请。\n', '來申請。\n');
      }

      if (pleaseProvide.length === 1) {
        text += this.resULS('请告知', '請告知') + pleaseProvide[0];
      } else if (pleaseProvide.length > 1) {
        if (pleaseProvideHeader) {
          text += pleaseProvideHeader;
        } else {
          text += this.resULS('请告知以下信息：\n', '請告知以下資訊：\n');
        }
        for (let i = 0; i < pleaseProvide.length; i++) {
          text += '　' + (i + 1) + '. ' + pleaseProvide[i];
        }
        text += this.resULS(
          '以便我们做下一步处理（复制您看到的文字对我们处理较为方便，请避免使用截图）。\n',
          '以便我們做下一步處理（複製您看到的文字對我們處理較為方便，請避免使用截圖）。\n'
        );
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
      text +=
        this.resULS(
          '请在回复邮件时确保收件者包含 unblock-zh@lists.wikimedia.org ，否则可能无法收到回复（可使用邮件软件的“回复所有人”功能）',
          '請在回覆郵件時確保收件者包含 unblock-zh@lists.wikimedia.org ，否則可能無法收到回覆（可使用郵件軟體的「回覆所有人」功能）'
        ) + '\n\n';
      text += 'User:' + mw.config.get('wgUserName');

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
    this.SUMMARY_SUFFIX = '（使用[[User:Xiplus/js/unblock-zh-helper|unblock-zh-helper]]）';
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
        alert(wgULS('IP地址或封禁ID格式错误', 'IP地址或封鎖ID格式錯誤'));
        return;
      }

      if (this.archiveUrl) {
        let m = this.archiveUrl.match(
          /https?:\/\/lists\.wikimedia\.org\/hyperkitty\/(list\/unblock-zh@lists\.wikimedia\.org\/(?:message|thread)\/[^/]+\/?)/
        );
        if (m) {
          this.summary = '[[listarchive:' + m[1] + '|unblock-zh' + this.wgULS('申请', '申請') + ']]';
        } else {
          alert(wgULS('邮件存档URL格式错误', '郵件存檔URL格式錯誤'));
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
            self.usernameBannedDetail = wgULS('包含不允许的字符。', '包含不允許的字元。');
          } else if ('cancreateerror' in user) {
            self.usernameStatus = self.ACCST_NOT_EXISTS;
            let cancreateerror = user['cancreateerror'][0];
            if (cancreateerror.code === 'userexists') {
              self.usernameStatus = self.ACCST_NEEDS_LOCAL;
            } else if (cancreateerror.code === 'invaliduser') {
              self.usernameStatus = self.ACCST_BANNED;
              self.usernameBannedDetail = wgULS(
                '不可使用电子邮件地址作为用户名。',
                '不可使用電子郵件地址作為使用者名稱。'
              );
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
        alert(wgULS('没什么好做的', '沒什麼好做的'));
        return;
      }
      if (
        this.actionOptions.includes(this.ACTOP_RESETPASSWORDUSERNAME) &&
        this.actionOptions.includes(this.ACTOP_RESETPASSWORDEMAIL)
      ) {
        alert(wgULS('重置密码操作仅能选取一个', '重設密碼操作僅能選取一個'));
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
        alert(wgULS('请输入日志摘要', '請輸入日誌摘要'));
        return;
      }
      if (this.actionOptions.includes(this.ACTOP_CREATEACCOUNT) && !this.email) {
        alert(wgULS('没有提供电子邮件地址', '沒有提供電子郵件地址'));
        return;
      }

      let tm = new Morebits.taskManager();
      tm.add(this.createAccount, []);
      tm.add(this.createLocal, []);
      tm.add(this.grantIpbe, [this.createAccount, this.createLocal]);
      tm.add(this.NoticeIpbe, [this.grantIpbe], () => {
        if (this.actionOptions.includes(this.ACTOP_NOTICEIPBE)) {
          this.statusNoticeIpbeType = 'error';
          this.statusNoticeIpbe = wgULS('由于授权失败，此操作已自动取消', '由於授權失敗，此操作已自動取消');
        }
      });
      tm.add(this.RfIpbe, [this.grantIpbe], () => {
        if (this.actionOptions.includes(this.ACTOP_RFIPBE)) {
          this.statusRfIpbeType = 'error';
          this.statusRfIpbe = wgULS('由于授权失败，此操作已自动取消', '由於授權失敗，此操作已自動取消');
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
              self.statusCreateAcccount = wgULS('成功创建', '成功建立');
            } else {
              self.statusCreateAcccountType = 'error';
              self.statusCreateAcccount = wgULS('未知错误，请查看浏览器console', '未知錯誤，請查看瀏覽器console');
            }
            def.resolve();
          })
          .fail(function (code, error) {
            console.error(error);
            self.statusCreateAcccountType = 'error';
            if (error.error && error.error.info) {
              self.statusCreateAcccount = error.error.info;
            } else {
              self.statusCreateAcccount = wgULS('未知错误，请查看浏览器console', '未知錯誤，請查看瀏覽器console');
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
          self.statusCreateLocal = wgULS('成功创建本地账户', '成功建立本地帳號');
          def.resolve();
        })
        .fail(function (code, error) {
          console.error(error);
          self.statusCreateLocalType = 'error';
          if (error.error && error.error.info) {
            self.statusCreateLocal = error.error.info;
          } else {
            self.statusCreateLocal = wgULS('未知错误，请查看浏览器console', '未知錯誤，請查看瀏覽器console');
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
          reason: '+' + wgULS('IP封禁豁免', 'IP封鎖例外') + '，' + self.summary + self.SUMMARY_SUFFIX,
        })
        .done(function () {
          self.statusGrantIpbeType = 'success';
          self.statusGrantIpbe = '成功授予';
          def.resolve();
        })
        .fail(function (code, error) {
          console.error(error);
          self.statusGrantIpbeType = 'error';
          if (error.error && error.error.info) {
            self.statusGrantIpbe = error.error.info;
          } else {
            self.statusGrantIpbe = wgULS('未知错误，请查看浏览器console', '未知錯誤，請查看瀏覽器console');
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
              .create(
                usertalk,
                { summary: wgULS('授予IP封禁豁免权通知', '授予IP封鎖例外權通知') + self.SUMMARY_SUFFIX },
                message
              )
              .done(function () {
                self.statusNoticeIpbeType = 'success';
                self.statusNoticeIpbe = '成功通知';
                def.resolve();
              })
              .fail(function (code, error) {
                console.error(error);
                self.statusNoticeIpbeType = 'error';
                if (error.error && error.error.info) {
                  self.statusNoticeIpbe = error.error.info;
                } else {
                  self.statusNoticeIpbe = wgULS('未知错误，请查看浏览器console', '未知錯誤，請查看瀏覽器console');
                }
                def.reject();
              });
          } else if (page.contentmodel == 'flow-board') {
            api
              .postWithEditToken({
                action: 'flow',
                page: usertalk,
                submodule: 'new-topic',
                nttopic: wgULS('授予IP封禁豁免权通知', '授予IP封鎖例外權通知'),
                ntcontent: message,
                ntformat: 'wikitext',
              })
              .done(function () {
                self.statusNoticeIpbeType = 'success';
                self.statusNoticeIpbe = '成功通知';
                def.resolve();
              })
              .fail(function (code, error) {
                console.error(error);
                self.statusNoticeIpbeType = 'error';
                if (error.error && error.error.info) {
                  self.statusNoticeIpbe = error.error.info;
                } else {
                  self.statusNoticeIpbe = wgULS('未知错误，请查看浏览器console', '未知錯誤，請查看瀏覽器console');
                }
                def.reject();
              });
          } else {
            api
              .edit(usertalk, function (revision) {
                return {
                  text: (revision.content + '\n\n' + message).trim(),
                  summary: wgULS('授予IP封禁豁免权通知', '授予IP封鎖例外權通知') + self.SUMMARY_SUFFIX,
                };
              })
              .done(function () {
                self.statusNoticeIpbeType = 'success';
                self.statusNoticeIpbe = '成功通知';
                def.resolve();
              })
              .fail(function (code, error) {
                console.error(error);
                self.statusNoticeIpbeType = 'error';
                if (error.error && error.error.info) {
                  self.statusNoticeIpbe = error.error.info;
                } else {
                  self.statusNoticeIpbe = wgULS('未知错误，请查看浏览器console', '未知錯誤，請查看瀏覽器console');
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
            '{{subst:rfp|' +
            self.normalizedUsername +
            '|2=' +
            wgULS('经由', '經由') +
            self.summary +
            wgULS('的授权备案', '的授權備案') +
            '。|status=+}}';
          let summary =
            '[[Special:UserRights/' +
            self.normalizedUsername +
            '|' +
            '授予' +
            self.normalizedUsername +
            wgULS('IP封禁豁免权', 'IP封鎖例外權') +
            ']]' +
            wgULS('备案', '備案');
          return {
            text: revision.content + '\n\n' + content,
            summary: summary + self.SUMMARY_SUFFIX,
          };
        })
        .done(function () {
          self.statusRfIpbeType = 'success';
          self.statusRfIpbe = wgULS('成功备案', '成功備案');
          def.resolve();
        })
        .fail(function (code, error) {
          console.error(error);
          self.statusRfIpbeType = 'error';
          if (error.error && error.error.info) {
            self.statusRfIpbe = error.error.info;
          } else {
            self.statusRfIpbe = wgULS('未知错误，请查看浏览器console', '未知錯誤，請查看瀏覽器console');
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
            self.statusResetPasswordUsername = wgULS('成功重置密码', '成功重設密碼');
          } else {
            self.statusResetPasswordUsernameType = 'error';
            self.statusResetPasswordUsername = wgULS('未知错误，请查看浏览器console', '未知錯誤，請查看瀏覽器console');
          }
          def.resolve();
        })
        .fail(function (code, error) {
          console.error(error);
          self.statusResetPasswordUsernameType = 'error';
          if (error.error && error.error.info) {
            self.statusResetPasswordUsername = error.error.info;
          } else {
            self.statusResetPasswordUsername = wgULS('未知错误，请查看浏览器console', '未知錯誤，請查看瀏覽器console');
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
            self.statusResetPasswordEmail = wgULS('成功重置密码', '成功重設密碼');
          } else {
            self.statusResetPasswordEmailType = 'error';
            self.statusResetPasswordEmail = wgULS('未知错误，请查看浏览器console', '未知錯誤，請查看瀏覽器console');
          }
          def.resolve();
        })
        .fail(function (code, error) {
          console.error(error);
          self.statusResetPasswordEmailType = 'error';
          if (error.error && error.error.info) {
            self.statusResetPasswordEmail = error.error.info;
          } else {
            self.statusResetPasswordEmail = wgULS('未知错误，请查看浏览器console', '未知錯誤，請查看瀏覽器console');
          }
          def.resolve();
        });
      return def;
    },
    resULS(hans, hant) {
      if (this.mailOptionsVariant === 'hans') {
        return hans;
      }
      return hant;
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
        mw.notify(wgULS('复制失败', '複製失敗'), { type: 'error' });
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
