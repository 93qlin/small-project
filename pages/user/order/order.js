
import { getTotalDays, formatTime } from '../../../utils/util'
import check from '../../../utils/check.js'
var config = require('../../../utils/config')
var pay = require('../../../services/pay.js')
var request = require('../../../utils/request')
var start, end
Page({
  data: {
    checkboxItems: [
      { name: '微信支付', value: '1', checked: 'true'},
      { name: '到店支付', value: '2' }
    ],
    orderMsg: {},
    flag: false,    
    pay_type: 1,
    totalNight:1,
    starttime: '',
    endtime: '',
    leavetime: '',
    price: 0,
    count: 1,
    username: '',
    mobile: ''
  },
  onLoad(options) {
    let data = JSON.parse(options.query)
    let totalNight
    let that = this
    //获取用户信息
    let userInfoall = wx.getStorageSync("userInfo")
    //获取酒店住宿的总时间
    wx.getStorage({
      key: 'totalNight',
      success: function (res) {
        totalNight = res.data
        that.setData({
          totalNight: totalNight
        })
      },
    })
    if (options.flag) {
      // 处理默认时间
      var myDate = new Date()
      let start = new Date(myDate.getTime())
      let near = new Date((myDate.getTime() + 86400000))
      let startdays = formatTime(start, true)
      let lastdays = formatTime(near, true)
      let hours = this.addZero(myDate.getHours())
      let minutes = this.addZero(myDate.getMinutes())
      wx.getStorage({
        key: 'dateArr',
        success: function(res) {
          if(res.data){
            that.setData({
              starttime: res.data[0],
              endtime: hours + ':' + minutes,
              leavetime: res.data[1],
              username: userInfoall.nickname,
              mobile: userInfoall.mobile,
            })
          }else{
            that.setData({
              starttime: startdays,
              endtime: hours + ':' + minutes,
              leavetime: lastdays,
              username: userInfoall.nickname,
              mobile: userInfoall.mobile,
            })
          }
        }
      })
      // 处理默认订单价格
      let price = data.price
      this.setData({
        username: userInfoall.nickname || '',
        mobile: userInfoall.mobile || '',
        price,
        orderMsg: data,
        flag: true
      })
    } else {
      // 处理预计到店时间
      let estimate = data.estimate.split(' ')
      this.setData({ 
        orderMsg: data,
        starttime: estimate[0],
        endtime: estimate[1],
        flag: false,
        orderSN: '',
        num: 0
      })
    }
  },
  // 处理时间加0
  addZero(time){
    if (time < 10){
      return "0" + time
    }else{
      return time
    }
  },
  // 到店时间
  bindDateChange: function (e) {
    this.setData({ starttime: e.detail.value })
    if (this.data.flag) {
      let num = this.data.leavetime
      let night = this.days(e.detail.value, num)
      this.setData({ 
        totalNight: night,
        price:this.data.count * this.data.orderMsg.price * night
      })
    }
  },
  // 点击时分秒
  bindDateTimeChange: function (e) {
    this.setData({ endtime: e.detail.value })
  }, 
  // 离店时间
  bindleaveTimeChange(e){
    this.setData({ leavetime: e.detail.value })
    if (this.data.flag) {
      let num = this.data.starttime
      let night = this.days(num, e.detail.value)
      this.setData({ 
        totalNight: night,
        price: this.data.count * this.data.orderMsg.price * night
      })
    }
  },
  // 计算天数
  days(heard, footer) {
    if (heard && footer) {
      start = new Date(heard).getTime()
      end = new Date(footer).getTime()
      let result = (end - start) / 86400000
      return result
    }
  },
  // 编辑房间数量 
  editCount(e) {
    if (e.detail.value < 1){
      wx.showModal({
        content: '房间数量不能为空哦~',
        showCancel: false
      })
      return false
    }
    if (this.data.flag) {
      this.setData({
        count: e.detail.value,
        price: e.detail.value * this.data.orderMsg.price * this.data.totalNight
      })
    } else {
      // 更改订单
      let strs = 'orderMsg.count'
      this.setData({ [strs]: e.detail.value })
    }
  },
  // 编辑入住姓名
  editUser(e) {
    if (e.detail.value){
      if (this.data.flag){
        this.setData({ username: e.detail.value })
      }else{
        let str = 'orderMsg.guest'      
        this.setData({ [str]: e.detail.value })
      }
    }else{
      wx.showModal({
        content: '用户名不能为空哦~',
        showCancel: false
      })
    }
  },
  // 编辑手机号
  editMobile(e) {
    let reg = /^1[3|4|5|7|8|9]\d{9}$/ 
    if (reg.test(e.detail.value)){
      if(this.data.flag) {
        this.setData({ mobile: e.detail.value })
      }else{
        let str = 'orderMsg.mobile'
        this.setData({ [str]: e.detail.value})
      }
    }else {
      wx.showModal({
        content: '请输入正确的手机号码哦~',
        showCancel: false
      })
    }
  },
  // 提交订单
  addOrder() {
    // 查看订单入口 修改订单
    if(!this.data.flag) {
      let data = {
        id: this.data.orderMsg.id,
        guest: this.data.orderMsg.guest,
        sid: this.data.orderMsg.sid,
        rid: this.data.orderMsg.rid,
        count: this.data.orderMsg.count,
        mobile: this.data.orderMsg.mobile,
        check: this.data.orderMsg.check,
        departure: this.data.orderMsg.departure,
        pay_type: this.data.orderMsg.pay_type,
        price: this.data.orderMsg.price,
        estimate: new Date(this.data.orderMsg.estimate).getTime()
      }
      request.request(config.apiEditOrderUrl, data, 'POST').then(res => {
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000
        })
        wx.reLaunch({url: '/pages/user/orderList/orderList'})
      })
    }else{
      // 提交订单
      let that = this
      let data = {
        guest: that.data.username,
        sid: that.data.orderMsg.sid,
        rid: that.data.orderMsg.id,
        count: that.data.count,
        mobile: that.data.mobile,
        check: that.data.starttime,
        departure: that.data.leavetime,
        pay_type: that.data.pay_type,
        price: that.data.price,
        pay_type: that.data.pay_type,
        estimate: new Date(that.data.starttime + ' ' + that.data.endtime).getTime()
      }
      // 未输入手机号和姓名的处理
      if (!that.data.username || !that.data.username){
        wx.showModal({
          content: '请别忘了输入姓名或手机号哦~',
          showCancel: false
        })
        return false
      }
      var number = ''
      request.request(config.apiAddOrderUrl, data, 'POST').then(res => {
        if(res.errno === 0){
          wx.showToast({
            title: '下单成功',
            icon: 'success',
            duration: 2000
          })
          if (that.data.pay_type == 2) {
            wx.showToast({
              title: '请尽快到店支付',
              icon: 'success',
              duration: 2000
            })
            setTimeout(() => {
              wx.reLaunch({ url: '/pages/user/orderList/orderList' })
            }, 2000)
            return 
          }
          let hotelname = that.data.orderMsg.hotelname
          let roomname = that.data.orderMsg.title
          let data = {
            orderSN: res.data.number,
            goods: '预订' + hotelname + ' 房型：' + roomname + ' 数量:' + that.data.count + '间',
            amount: that.data.price * 100
          }
          pay.payOrder(data).then(res => {
            request.request(config.getPayStatus, { orderSN: data.orderSN }, 'get').then(ret => {
              if (ret.data > 0) {
                wx.showToast({ title: '支付成功' })
                setTimeout(() => {
                  wx.reLaunch({ url: '/pages/user/orderList/orderList' })
                }, 2000)
              } else {
                wx.showToast({ title: '支付失败' })
              }
            })
            wx.showToast({
              title: '支付成功',
              icon: 'success'
            })
            wx.reLaunch({ url: '/pages/user/orderList/orderList' })
          }).catch(res => {
            wx.reLaunch({ url: '/pages/user/orderList/orderList' })
          })
        } else {
          wx.showToast({
            title: '下单失败',
            icon: 'none'
          })
        }
      })
    }
  },
  // 选择支付方式
  checkboxChange: function (e) {
    let checkboxItems = this.data.checkboxItems,
        value = e.detail.value;
    checkboxItems.forEach(element => {
      element.checked = element.value === value
    });
    this.setData({
      checkboxItems: checkboxItems,
      pay_type: value
    })
  },
})