//hotel.js
import timeFormat from '../../utils/util.js'
var config = require('../../utils/config');
var request = require('../../utils/request')
//获取应用实例
const app = getApp()
let choose_year = null,
    choose_month = null
var Week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];  
Page({
  data: {
    dateArr: ['',''],
    weekArr: ['',''],
    totalNight: 1,
    curCity: '',
    searchVal: '',
    showCalendar: false,
    hasEmptyGrid: false,
    showPicker: false,
    imgUrls: [],
    city: [
      {
        name: '全部',
        id: 0
      }
    ],
    isOpenCalendar: false
  },
  onLoad() {
    // 获取当前时间日期默认值
    var myDate = new Date()
    let week = myDate.getDay()
    let start = new Date(myDate.getTime())
    let near = new Date(myDate.getTime() + 86400000)
    let startdays = timeFormat.formatTime(start, true)
    let lastdays = timeFormat.formatTime(near, true)
    let startStr = 'dateArr[0]'
    let lastStr ='dateArr[1]'
    let weekStart = Week[week]
    let weekEnd = Week[(week + this.data.totalNight) % 7]
    let newArr = []
    newArr[0] = weekStart
    newArr[1] = weekEnd 
    this.setData({
      [startStr]: startdays,
      [lastStr]: lastdays,
      weekArr: newArr
    })
    let that = this
    //缓存入住时间
    wx.setStorage({
        key: 'dateArr',
        data: this.data.dateArr
    })
    wx.setStorage({
        key: 'weekArr',
        data: this.data.weekArr
    })
    wx.setStorage({
        key: 'totalNight',
        data: this.data.totalNight
    })
    //获取轮播图
    request.request(config.getAdvert).then(ret => {
      if (ret.data.length > 0) {
        that.setData({
          imgUrls: ret.data
        })
      }
    })
    //获取城市
    request.request(config.getHotelCity).then(ret => {
      if (ret.data.length > 0) {
        that.setData({
          city: ret.data
        })
      }
    })
  },
  // 打开日历
  openCalendar(e) {
    this.setData({ isOpenCalendar: true })
  },
  // 日历选择
  handleDatePicker(e) {
    let startObj = e.detail.startDate
    let endObj = e.detail.endDate
    let startDate = startObj.year + '-' + startObj.month + '-' + startObj.day
    let endDate = endObj.year + '-' + endObj.month + '-' + endObj.day
    let dateArr = [startDate, endDate]
    let week = ['周日','周一','周二','周三','周四','周五','周六']
    let weekArr = [week[startObj.data_of_week],week[endObj.data_of_week]]
    let totalNight = e.detail.daySpan
    this.setData({ dateArr, weekArr, totalNight })
    wx.setStorage({
      key: 'dateArr',
      data: this.data.dateArr,
    })
    wx.setStorage({
      key: 'weekArr',
      data: this.data.weekArr
    })
    wx.setStorage({
      key: 'totalNight',
      data: this.data.totalNight,
    })
  },
  // 获取搜索关键字
  getSearchVal: function (e) {
    this.setData({ searchVal: e.detail.value })
  },
  // 开始搜索
  startSearch: function () {
    let data = {
      page: 1,
      size: 10,
      address:this.data.curCity,
      title:this.data.searchVal
    }
    wx.navigateTo({
      url: '/pages/home/list/list?query=' + JSON.stringify(data)
    })
  },
  // 选择城市
  selectCity(e) {
    let pickedCity = this.data.city[e.detail.value]
      // 全部
    if (pickedCity.id == 0) {
      this.setData({ curCity: '' })
      wx.setStorage({
        key: "city",
        data: ""
      })
    }else{
      // 分地区
      this.setData({ curCity: pickedCity.name })
      wx.setStorage({
        key: "city",
        data: this.data.curCity
      })
    }
  },
  //附近酒店
  nearHotel() {
    this.startSearch()
  }
})