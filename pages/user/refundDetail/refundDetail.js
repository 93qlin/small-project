// pages/user/refundDetail/refundDetail.js
Page({
  data: {
    orderMsg:{}
  },
  onLoad: function (options) {
    let orderMsg = JSON.parse(options.query)
    console.log(orderMsg)
    
    this.setData({ orderMsg })
  },
  // 撤销退款申请
  revocation() {
    console.log('退款')
  },
  //修改退款申请
  edit(){
    console.log('修改申请')
    wx.navigateTo({
      url: '/pages/user/refund/refund?query='+JSON.stringify(this.data.orderMsg)
    })
  }
})