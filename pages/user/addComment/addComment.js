var config = require('../../../utils/config');
var request = require('../../../utils/request')
Page({
  data: {
    score: 0,
    scoreText: ['糟糕', '很差', '一般', '很好', '极好'],
    commContent:'',
    roomMsg:{},
    isShowmsg: false,
    message: ''
  },
  onLoad(options) {
    this.setData({ roomMsg: JSON.parse(options.query) })
  },
  //选择星星
  setScore(e) {
    this.setData({
      score: e.target.dataset.score
    })
  },
  //获取用户评价内容
  getContent(e){
    this.setData({ commContent:e.detail.value })
  },
  //消息
  showMessage(message) {
    this.setData({ message: message, isShowmsg: true })
    setTimeout(() => {
      this.setData({ message: '', isShowmsg: false })
    }, 1500)
  },
  // 提交评论
  addComment(){
    let data = {
      sid:this.data.roomMsg.sid,
      oid:this.data.roomMsg.id,
      score:+this.data.score,
      content: this.data.commContent
    }
    request.request(config.apiCommentAddUrl, data, 'POST').then(res => {
      if (res.errno === 0){
        wx.reLaunch({ url: '../orderList/orderList' })
      }
    })
  }
})