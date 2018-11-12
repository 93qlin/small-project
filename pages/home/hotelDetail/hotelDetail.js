  Page({
    data: {
      serviceList:[],
      storeMsg:{}
    },
    onLoad: function (options) {
      this.setData({ storeMsg:JSON.parse(options.query) })
      this.hotelServer()
    },
    // 提供服务处理
    hotelServer() {
      if (!this.data.storeMsg.service) {return false}
      let server = this.data.storeMsg.service.split(',')
      this.setData({ serviceList: server })
    },
    // 打电话
    makePhoneCall(){
      wx:wx.makePhoneCall({
        phoneNumber: this.data.storeMsg.phone,
      })
    }
  })