
import { formatTime } from '../../../utils/util'

var config = require('../../../utils/config');
var request = require('../../../utils/request')
// 总页数
var totalPages = 0   
Page({
  data: {
    starStatus:[0,0,0,0,0],
    curPage:1,
    size:10,
    sid:0,
    commentList:[],
    show: true
  },
  onLoad: function (options) {
    this.setData({ sid:options.sid })
    this.reqComment()
  },
  // 加载评论列表
  reqComment(){
    let data = {
      page:this.data.curPage,
      size:this.data.size,
      sid:this.data.sid
    }
    let commentList = this.data.commentList
    request.request(config.apiCommentUrl, data).then(res => {
      if(res.errno === 0){
        totalPages = res.data.totalPages
        res.data.data.forEach( val => {
          if (val.created_at) {
            let res = new Date(val.created_at)
            val.created_at = formatTime(res).slice(0, -9)
          }
        })
        this.setData({
          commentList: [...commentList, ...res.data.data],
          show: true
        })
        if (res.data.data.length == 0){
          this.setData({ show: false })
        }
      }
    })
    wx.hideLoading()
  },
  //上拉刷新页面
  onReachBottom: function () {
    if(totalPages > this.data.curPage){
      wx.showLoading({ title: '加载评论中......' })
      this.data.curPage++
      this.reqComment()
    } else {
      wx.showToast({
        title:'已经到底了哦',
        image: '/image/icon_error.png'
      })
    }
  }
})
