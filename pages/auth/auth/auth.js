var utils = require('../../../utils/util');
var config = require('../../../utils/config');
var request = require('../../../utils/request')

var app = getApp();
var maxTime = 80 // 间隔时间可重发
var phoneNo = null
var cachePhone = []
var interval = null
var currentTime = maxTime //倒计时的事件,单位：s
Page({
  data: {
    mobile: '',
    regid: '',
    verifyMobilePass: false,
    verifyCodePass: false,
    mobileCode: '',
    loading: false,
    verifyBtnText: "获取验证码",
    verifydisabled: false,
    codefocus: false,
    time: currentTime
  },
  onLoad: function (options) {
    this.setData({ regid: options.session }); // 获取注册标识
    request.checkLogin().then(res => { // 如果是登录状态则跳出该页
      if (res) wx.navigateBack({ delta: 1 })
    })
  },
  onHide: function () {
    clearInterval(interval) // 清理计时器
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
    clearInterval(interval) // 清理计时器
  },
  // 检测手机号
  bindMobileInput: function (e) {
    phoneNo = e.detail.value
    this.setData({mobile: e.detail.value})  
    if (/^1[34578]\d{9}$/.test(phoneNo)) {
      this.setData({ verifyMobilePass: true })
      wx.hideKeyboard() // 关闭键盘
      if (cachePhone.length) { // 发送验证码后更改了手机号码
        currentTime = maxTime
        clearInterval(interval)
        if (cachePhone.indexOf(phoneNo) == -1) { // 没有请求过验证码的手机号
          this.setData({
            verifyBtnText: "获取验证码",
            verifydisabled: false,            
            verifyCodePass: false // 隐藏验证码输入框
          })                     
        } else { // 请求过验证码的手机号初始化时间重新计时
          this.funInterval() // 重新计时
          this.setData({
            codefocus: true,
            mobileCode: '',
            verifyCodePass: true // 显示验证码输入框
          })           
        }
      }      
    } else {
      this.setData({verifyCodePass: false})                             
      if (!cachePhone.length) { // 首次验证，没有修改过手机号码
        this.setData({ // 手机号码验证失败隐藏发送短信按钮
          verifyMobilePass: false
        })
      }
    }       
  },
  // 发送验证码
  bindSendCode: function () {
    var gdata = {
      mobile: phoneNo,  // 手机号码
      regid: this.data.regid // 注册标识
    }
    var that = this
    request.request(config.wxsendUrl, gdata,'POST').then(function (res) {
      if (res.errno == 0) {
        that.funInterval() // 开启计时器
        cachePhone.push(phoneNo) // 保存发送记录
        that.setData({
          verifyCodePass: true
        });        
        wx.showModal({
          content: res.data +'',
          showCancel: false,
          success: function (res) {
            that.setData({ codefocus: true })
          }          
        })        
      } else {
        utils.showModal(res.errmsg)
      }
    }).catch(() => {
      utils.showModal('发送验证码失败')
    })
  },
  // 输入验证码
  bindMobileCodeInput: function (e) {
    this.setData({
      mobileCode: e.detail.value
    });
  },
  // 提交注册
  startRegister: function () {
    if (!this.data.mobileCode || !this.data.mobileCode.length) {
      utils.showErrorToast('请输入验证码')
      this.setData({ codefocus: true })
      return
    }
    var that = this;
    const gdata = {
      mobile: phoneNo, // 手机号
      code: this.data.mobileCode, // 验证码
      regid: this.data.regid // 注册标识
    }
    that.setData({ loading: true })    
    request.request(config.wxregUrl, gdata,'POST').then(function (res) {
      that.setData({ loading: false })      
      if (res.errno == 0) {
        that.setData({ verifyCodePass: true });
        wx.setStorageSync('userInfo', res.data.userInfo)
        wx.setStorage({
          key: "token",
          data: res.data.token,
          success: function () {
            // wx.navigateBack({ delta: 1 })
            wx.reLaunch({ url: '../../home/home' })
          }
        });        
      } else {
        utils.showErrorToast(res.errmsg)
      }
    })
  },
  // 计数器方法
  funInterval: function () {
    if(interval !== null){
      clearInterval(interval)
    }
    var that = this
    interval = setInterval(function () {
      currentTime--;
      that.setData({
        time: currentTime,
        verifyBtnText: currentTime + "S",
        verifydisabled: true
      })
      if (currentTime < 0) { // 清除
        clearInterval(interval)
        currentTime = maxTime
        that.setData({
          time: currentTime,
          verifyBtnText: "获取验证码",
          verifydisabled: false
        })
      }
    }, 1000)    
  },        
  // 清空input的内容
  clearInput: function (e) {
    switch (e.currentTarget.id) {
      case 'clear-mobile':
        this.setData({
          mobile: ''
        });
        break;
      case 'clear-mobilecode':
        this.setData({
          mobileCode: ''
        });
        break;
    }
  }
})