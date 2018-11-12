import { formatTime } from '../../../utils/util'
var config = require('../../../utils/config')
var request = require('../../../utils/request')
var pay = require('../../../services/pay.js')
Page({
  data: {
    txt: '',
    orderMsg:{},
    store:{},
    room: {}
  },
  onLoad(options) {
    // 订单信息
    let order = JSON.parse(options.query)
    order.estimate = formatTime(new Date(order.estimate)).slice(0, -3)
    order.created_at = formatTime(new Date(order.created_at))
    order.pay_time = formatTime(new Date(order.pay_time))
    this.setData({ orderMsg: order })
    // 酒店信息
    request.request(config.apiDetailHotelUrl, {'id':order.sid}).then(res => {
      if (res.errno === 0 ){
        this.setData({ store: res.data })
      }
    })
    // 房间信息
    request.request(config.apiDetailRoomUrl, { 'id': order.rid }).then(res => {
      if (res.errno === 0) {
        this.setData({ room: res.data })
      }
    })
  },
  //打电话
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.store.phone
    })
  },
  //支付
  orderPay(){
    this.data.orderMsg.store = this.data.store
    this.data.orderMsg.room = this.data.room
    let state = this.data.orderMsg.state
    let pay_state = this.data.orderMsg.pay_state
    let url 
    if(state == 1){
      let hotelname = this.data.orderMsg.store.title
      let roomname = this.data.orderMsg.room.title
      let data = {
        orderSN: this.data.orderMsg.number,
        goods: '预订' + hotelname + ' 房型：' + roomname + ' 数量:' + this.data.orderMsg.count + '间',
        amount: this.data.orderMsg.price * 100
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
      return
    } else if (state == 2) {
      return false
    } else if(state == 3){
      url = '/pages/user/addComment/addComment?query=' + JSON.stringify(this.data.orderMsg)
    }else if(state == 4){
      url = '/pages/user/refundDetail/refundDetail?query=' + JSON.stringify(this.data.orderMsg)
    }
    wx.navigateTo({ url: url })
  },
  //退款
  cancelOrder(){
    wx.navigateTo({
      url: '/pages/user/refund/refund?query=' + JSON.stringify(this.data.orderMsg)
    })
  }
})