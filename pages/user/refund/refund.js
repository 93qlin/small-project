import check from '../../../utils/check.js'
Page({
  data: {
    orderMsg: {},
    types: ["仅退款", "退款并退货", "退款不退货"],
    typeIndex: 0,  // 退款类型
    refundment:''  // 退款申明
  },
  onLoad(options){
    let obj = JSON.parse(options.query)
    this.setData({
      orderMsg: obj,
      typeIndex:obj.typeIndex,
      refundment: obj.refundment
    })
  },
  // 选择退款类型
  bindTypeChange: function (e) {
    this.setData({ typeIndex: e.detail.value })
  },
  // 获取退款说明的内容
  getContent(e){
    let value = e.detail.value
    if (check.checkIsNotNull(value)){
      this.setData({ refundment:value })
    }else{
      wx.showModal({ title: '退款说明不能为空' })
    }
  },
  //提交退款
  refund(){
    let obj = Object.assign(this.data.orderMsg, { typeIndex: this.data.typeIndex, refundment: this.data.refundment})
    wx.navigateTo({
      url: '/pages/user/refundDetail/refundDetail?query='+JSON.stringify(obj)
    })  
  }
});