var config = require('../../../utils/config');
var request = require('../../../utils/request')
var pay = require('../../../services/pay.js')
import { getTotalDays } from '../../../utils/util'

Page({
  data: {
    tabs: [
      { name: '全部', val: '0' },
      { name: "待付款", val: '1' }, 
      { name: "待入住", val: '2' },
      { name: "待评价", val:'3'},
      { name: "已退款", val: '4' }
      ],
    activeIndex: 0,    //选中索引
    sliderOffset: 0,   //slider偏移
    sliderWidth: 0,
    orderList:[],
    curPage:1,
    size:5,
    show: true,
    isMessageShow: false,
    message: '',
    flag: false,
    totalPages: 1
  },
  onLoad(options) {
    this.setData({ sliderWidth: 20 / (this.data.tabs.length) })
    this.reqOrder({state:0})
  },
  //订单请求
  reqOrder(data){
    wx.showLoading({ title: '加载中' })
    request.request(config.apiOrderListUrl, data).then(res => {
      this.data.totalPages = res.data.totalPages
      //加入住宿天数
      let list = res.data.data || []
      list.forEach( detail => {
        let startStamp = Date.parse(new Date(detail.check))
        let endStamp = Date.parse(new Date(detail.departure))
        let totalNight = getTotalDays(startStamp, endStamp)
        detail.totalNight = totalNight
      })
      this.setData({
        orderList: [...this.data.orderList, ...list], 
        show: true
      })
      if (res.data.count == 0){
        this.setData({ show: false })
      }
      //停止加载动画
      wx.hideLoading()
    })
  },
  //切换tab栏搜索订单 
  tabClick: function (e) {
    let sliderOffset = e.currentTarget.offsetLeft
    let activeIndex = e.currentTarget.id
    this.setData({
      sliderOffset,
      activeIndex,
      orderList: [],
      state: activeIndex,
      curPage: 1
    })
    this.reqOrder({
      page: this.data.curPage,
      size: this.data.size,
      state: activeIndex
    })
  },
  // 消息
  showMessage(message) {
    this.setData({ message: message, isMessageShow: true })
    setTimeout(() => {
      this.setData({ message: '', isMessageShow: false })
    }, 1500)
  },
  // 上拉加载
  onReachBottom(e){
    let curPage = this.data.curPage
    let totalPages = this.data.totalPages
    if (totalPages > curPage){
      this.data.curPage++
      let data = {
        page: this.data.curPage,
        size: this.data.size,
        state: this.data.activeIndex
      }
      this.reqOrder(data)
    }else{
      wx.stopPullDownRefresh()
      this.showMessage('没有更多订单')
      return false
    }
  },
  //跳转到订单详情页面
  linkTo(e){
    let detail = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/user/orderDetail/orderDetail?query='+JSON.stringify(detail),
    })
  },
  //跳转到付款界面
  payOrder(e){
    const that = this
    let detail = e.currentTarget.dataset.item
    let hotelname = ''
    let roomname = ''
    request.request(config.apiDetailHotelUrl, { id: detail.sid }, 'get').then(ret => {
      hotelname = ret.data.title
      request.request(config.apiDetailRoomUrl, { id: detail.rid }, 'get').then(ret => {
        roomname = ret.data.title
        let data = {
          orderSN: detail.number,
          goods: '预订' + hotelname + '房型：' + roomname + '数量:' + detail.count + '间',
          amount: detail.price * 100
        }
        pay.payOrder(data).then(res => {
          request.request(config.getPayStatus, { orderSN: detail.number }, 'get').then(ret => {
            if (ret.data.type == 'ok') {
              wx.showToast({ title: ret.data.msg })
              setTimeout(() => {
                wx.reLaunch({ url: '/pages/user/orderList/orderList' })
              }, 2000);
            } else {
              wx.showToast({ title: ret.data.msg })
            }
          })
          wx.showToast({
            title: '支付成功',
            icon: 'success'
          })
          wx.reLaunch({ url: '/pages/user/orderList/orderList' })
        }).catch(res => {
          if (res.status == 2) {
            //查询订单状态确定支付在继续完成支付
            request.request(config.getPayStatus, { orderSN: detail.number }, 'get').then(ret => {
              if (ret.data > 0) {
                wx.showToast({ title: '支付成功' })
                setTimeout(() => {
                  wx.reLaunch({ url: '/pages/user/orderList/orderList' })
                }, 2000);
              } else {
                wx.showToast({ title: '支付失败' })
              }
            })
          }
          wx.showToast({
            title: res.errmsg,
            icon: 'none'
          })
        })
      })
    })
  },
  //跳转到添加评论界面
  addComment(e){
    let detail = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/user/addComment/addComment?query=' + JSON.stringify(detail)
    })
  },
  //查看退款详情
  lookDetail(e){
    let detail = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/user/refundDetail/refundDetail?query=' + JSON.stringify(detail)
    })
  },
  // 即将入住
  buyMore(e){
    let detail = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/user/orderDetail/orderDetail?query=' + JSON.stringify(detail),
    })
  }
})