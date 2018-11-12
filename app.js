//app.js
const request = require('./utils/request')

App({
  onLaunch: function () {
    request.checkLogin().then(res => {
      this.globalData.userInfo = wx.getStorageSync('userInfo');
      this.globalData.token = wx.getStorageSync('token');
    })
  },
  globalData: {
    token: null,
    userInfo: {}
  }
})