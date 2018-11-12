import comCheck from '../../../utils/check'
var config = require('../../../utils/config');
var request = require('../../../utils/request')
Page({
  data: {
    imgUrls: [],
    roomList: [], // 所有房型
    serviceList: [], // 标签信息列表
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    curPage: 1,
    txtType: true,
    curPage: 1,
    size: 10,
    isDetailShow: false,
    sid:'',
    arriveTime:'',
    leaveTime:'',
    totalNight:'',
    showRoom: [], // 展现的房型列表
    gallerysList: [], // 房型相册默认
    isOpenCalendar:false, // 房型详情开关
    storeInfo: {},  //酒店详情
    roomDetail: {} // 选中房型详情
  },
  onLoad: function(options) {
    //获取酒店详细信息
    request.request(config.apiDetailHotelUrl, { id: options.sid}).then( res => {
      if(res.errno === 0){
        let serviceList = JSON.parse(res.data.service)
        this.setData({ 
          storeInfo: res.data,
          serviceList,
          sid: res.data.id,
          imgUrls: res.data.gallerys
        })
      }
    })
    let that = this
    //获取房型列表数据
    request.request(config.apiRoomUrl, { sid: options.sid }).then(res => {
      if (res.errno === 0) {
        this.setData({ roomList: res.data })        
        if (res.data.length > 5) {
          let showRoom = res.data.slice(0,2)
          this.setData({ showRoom, txtType: true })
        }else{
          this.setData({
            showRoom: res.data,
            txtType: false
          })          
        }
      }
    })
    //获取入住时间信息
    wx.getStorage({
      key: 'dateArr',
      success: function (res) {
        that.setData({
          arriveTime:res.data[0],
          leaveTime:res.data[1]
        })
      }
    })
    wx.getStorage({
      key: 'totalNight',
      success: function (res) {
        that.setData({
          totalNight:res.data
        })
      }
    })  
  },
  // 查看更多房型
  lookMore() {
    this.setData({ showRoom: this.data.roomList})
  },
  // 房间详情滑块
  toggleDetail(e) {
    let isDetailShow = !this.data.isDetailShow
    let roomDetail = e.currentTarget.dataset.detail
    if (typeof (roomDetail) != 'undefined') {
      let gallerysList = this.data.storeInfo.gallerys.filter(item => {
        return item.rid === roomDetail.id
      })
      this.setData({ isDetailShow, roomDetail })
      if (gallerysList.length != 0) { this.setData({ gallerysList }) }    
    } else {
      this.setData({ isDetailShow: false })
    }
  },
  // 关闭滑块
  hiddenDetail(){
    this.setData({ isDetailShow: false })
  },
  // 跳转预定的房间订单
  order(e){
    let detail = e.currentTarget.dataset.item
    detail.hotelname = this.data.storeInfo.title
    console.log(detail)
    wx.navigateTo({
      url: '/pages/user/order/order?flag=booking&query='+JSON.stringify(detail)
    })
  },
  //打开地图
  openMap() {
    if (this.data.storeInfo.latitude && this.data.storeInfo.longitude) {
      wx.openLocation({
        latitude: parseFloat(this.data.storeInfo.latitude),
        longitude: parseFloat(this.data.storeInfo.longitude),
        name: this.data.storeInfo.title,
        address: this.data.storeInfo.area_desc + this.data.storeInfo.address,
        scale: 28
      })
    }
  },
  // 打开日历
  openCalendar(){
    this.setData({ isOpenCalendar:true })
  },
  // 日历计算
  handleDatePicker(e) {
    let startObj = e.detail.startDate
    let endObj = e.detail.endDate
    let startDate = `${startObj.year}-${startObj.month}-${startObj.day}`
    let endDate = `${endObj.year}-${endObj.month}-${endObj.day}`
    let week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    let weekArr = [week[startObj.data_of_week], week[endObj.data_of_week]]
    let totalNight = e.detail.daySpan
    this.setData({
      arriveTime: startDate,
      leaveTime:endDate,
      totalNight: totalNight
    })
    var dates = [];
    dates.push(startDate)
    dates.push(endDate)
    wx.setStorage({
      key: 'dateArr',
      data: dates,
    })
    wx.setStorage({
      key: 'weekArr',
      data: this.data.weekArr
    })
    wx.setStorage({
      key: 'totalNight',
      data: totalNight
    })
  }
})