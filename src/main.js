window.addEventListener('load', () => {

  let liffID;

  // LIFF ID 有值就執行
  const btnLiffID = document.getElementById('liff-btn');
  btnLiffID.addEventListener('click', () => {
    liffID = document.getElementById('liff-input').value;
    triggerLIFF();
  })

  // 執行範例裡的所有功能
  function triggerLIFF() {

    // LIFF init
    liff.init({
      liffId: liffID
    }).then(() => {
      
      // 取得基本環境資訊
      // 參考：https://engineering.linecorp.com/zh-hant/blog/liff-our-latest-product-for-third-party-developers-ch/
      let language, version, isInClient, isLoggedIn, os, lineVersion;

      language = liff.getLanguage(); // String。引用 LIFF SDK 的頁面，頁面中的 lang 值
      version = liff.getVersion(); // String。LIFF SDK 的版本
      isInClient = liff.isInClient(); // Boolean。回傳是否由 LINE App 存取
      isLoggedIn = liff.isLoggedIn(); // Boolean。使用者是否登入 LINE 帳號。true 時，可呼叫需要 Access Token 的 API
      os = liff.getOS(); // String。回傳使用者作業系統：ios、android、web
      lineVersion = liff.getLineVersion(); // 使用者的 LINE 版本

      const outputBasic = document.getElementById('result-basic');
      outputBasic.value = `language: ${language}\nversion: ${version}\nisInClient: ${isInClient}\nisLoggedIn: ${isLoggedIn}\nos: ${os}\nlineVersion: ${lineVersion}`;



      // 登入
      // redirectUri 是使用者登入後要去到哪個頁面，這個頁面必須要在後台中的「Callback URL」先設定好，不然會 400 error
      const btnLogin = document.getElementById('login');
      btnLogin.addEventListener('click', () => {
        // 先確認使用者未登入
        if(!isLoggedIn) {
          liff.login({
            redirectUri: 'https://letswritetw.github.io/letswrite-liff-init/'
          });
        }
      });

      const btnLogout = document.getElementById('logout');
      btnLogout.addEventListener('click', () => {
        // 先確認使用者是否是登入的狀態
        if(isLoggedIn) {
          liff.logout();
          window.location.reload(); // 登出後重整一次頁面
        }
      });



      // 取得使用者類型資料
      const btnContent = document.getElementById('getContext');
      btnContent.addEventListener('click', () => {
        const context = liff.getContext();
        const outputContent = document.getElementById('result-info');
        outputContent.value = `${JSON.stringify(context)}`
      });

      // 取得使用者資料
      // 後台的「Scopes」要設定開啟 profile, openid
      function getProfile() {
        // 先確認使用者是登入狀態
        if(isLoggedIn) {
          return liff.getProfile().then(profile => profile);
        }
      }
      const btnProfile = document.getElementById('profile');
      btnProfile.addEventListener('click', () => {
        // 先確認使用者是登入狀態
        if(isLoggedIn) {
          liff.getProfile().then(profile => {
            const outputContent = document.getElementById('result-info');
            outputContent.value = `${JSON.stringify(profile)}`
          })
        }
      });

      // 取使用者 email
      const btnEmail = document.getElementById('getEmail');
      btnEmail.addEventListener('click', () => {
        const user = liff.getDecodedIDToken();
        const email = user.email;
        const outputContent = document.getElementById('result-info');
        outputContent.value = `${email}`;
      });



      // 傳送訊息
      const btnMessage = document.getElementById('sendMessage');
      btnMessage.addEventListener('click', () => {
        let message = document.getElementById('message').value;
        liff.sendMessages([
          {
            type: 'text',
            text: message
          }
        ]).then(res => window.alert(res.status))
          .catch(error => window.alert(error));
      });

      // 發送訊息給朋友
      const btnShareTarget = document.getElementById('sendShareTarget');
      btnShareTarget.addEventListener('click', () => {
        let message = document.getElementById('message').value;
        if(isLoggedIn && liff.isApiAvailable('shareTargetPicker')) {
          liff.shareTargetPicker([
            {
              type: "text",
              text: message
            }
          ])
          .then(res => window.alert(res.status))
          .catch(error => window.alert(error))
        }
      });



      // 開啟連結
      const btnOpenWindow = document.getElementById('openWindow');
      btnOpenWindow.addEventListener('click', () => {
        let uri = document.getElementById('uri').value;
        liff.openWindow({
          url: uri,
          external: true
        })
      });

      // 取得當前網址
      const btnLink = document.getElementById('getLink');
      btnLink.addEventListener('click', () => {
        let uriInput = liff.permanentLink.createUrl();
        document.getElementById('result-uri').value = uriInput;
      });



      // 打開 LINE 的 QR code 掃描器
      const btnScan = document.getElementById('qrScan');
      btnScan.addEventListener('click', () => {
        // 先確認使用者要是登入狀態，並且 scanCode 可用
        if(isLoggedIn && liff.scanCode) {
          liff.scanCode()
              .then(result => {
                document.getElementById('result-qr').value = result;
              })
              .catch(error => {
                document.getElementById('result-qr').value = error;
              });
        }
      });



      // 關閉 LIFF
      const btnClose = document.getElementById('closeLIFF');
      btnClose.addEventListener('click', () => {
        // 先確認是否在 LINE App 內
        if(isInClient) {
          liff.closeWindow();
        }
      });

    }).catch(error => {
      console.log(error);
    });
  
  }

})