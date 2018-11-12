var config = require('../../../utils/config');
var request = require('../../../utils/request');
Page({
  data: {
    curPage: 1, // 页数
    size: 10,
    flag: false,  // 标记用户搜索
    curCity:'',  // 地址
    keyWord:'',  // 关键字
    hotelList: [],  
    inLevel: false, //按价格星级搜索
    isShowMask: false, //是否显示遮罩
    inCapacity: false, //按优先级搜索
    clickPrice: false, //是否点击价格搜索按钮
    clickPriority: false,
    isSelected: false,
    level: 0,  // 星级默认值
    priceSort: [-1], // 价格默认值
    sort: '',
    sortname: '智能排序', 
    priorityType: [
        { type: "智能排序", isSelected: false, sort: 'id DESC' },
        { type: "好评优先", isSelected: false, sort: 'score Desc' },
        { type: "低价优先", isSelected: false, sort: 'price Asc' },
        { type: "高价优先", isSelected: false, sort: 'price Desc' },
        { type: "人气优先", isSelected: false, sort: 'comm_count Desc' }
    ],
    starLevelType: [
        { type: "经济型", isSelected: false, value: 4 },
        { type: "舒适/三星", isSelected: false, value: 3 },
        { type: "高档/四星", isSelected: false, value: 2 },
        { type: "豪华/五星", isSelected: false, value: 1 }
    ],
    priceType: [
      { type: "不限", isSelected: false, value: "[-1]" },
      { type: "150以下", isSelected: false, value: "[0,150]"},
      { type: "150-300", isSelected: false, value: "[150, 300]" },
      { type: "300-450", isSelected: false, value: "[300, 450]" },
      { type: "450-600", isSelected: false, value: "[450, 600]" },
      { type: "600-1000", isSelected: false, value: "[600, 1000]" },
      { type: "1000以上", isSelected: false, value: "[1000]"}
    ],
    hotelType: {
      "1": "豪华/ 五星", "2": "高档/ 四星", "3": "舒适/ 三星", "4": "经济型"
    }
  },
  //初始化搜索字段值
  onLoad: function (options) {
    this.setData({ hotelList: [] })
    let data = JSON.parse(options.query)
    if (data.address || data.title){
      this.setData({
        curCity: data.address,
        keyWord: data.title,
        flag: true
      })
      this.searchList(data)
    }else{
      this.searchList(data)
    }
  },
  // 标记初始化
  onHide: function(){
    this.setData({ flag: false })
  },
  // 符合条件的酒店列表 
  searchList(data) {
    wx.showLoading({ title: '加载中' })
    request.request(config.apiStoreUrl, data).then(res => {
      if( res.errno === 0){
        if (data.page > res.data.totalPages) {
          wx.showToast({
            title: '没有更多了',
            image: '/image/icon_error.png',
            duration: 2000
          })
          wx.stopPullDownRefresh()  
          return false
        }
        //设置计算星星类型
        res.data.data.forEach((item, index) => {
          item.star = [0, 0, 0, 0, 0]
          let score = item.score - 0
          item.star.forEach((val, i) => {
            if (i < score && 0.5 <= score - i) { item.star[i] = 1 }
            if (0.5 < score - i < 1) { item.star[i] = 0.5 }
            if (score - i < 0.5 ) { item.star[i] = 0 }
          })
        })
        this.setData({
          hotelList: [...this.data.hotelList, ...res.data.data],
          inLevel: false,
          inCapacity: false
        })
        wx.hideLoading()
      }
    })
  },
  //打开搜索价格和星级面板
  showPriceSort(e) {
    this.reset()    
    this.setData({
      inCapacity: false,
      inLevel: true,
      isShowMask: true,
      clickPrice: true,
      clickPriority: false
    })
  },
  // 打开智能排序面板
  showPrioritySort() {
    this.reset() 
    this.setData({
      inCapacity: true,
      inLevel: false,
      isShowMask: true,
      clickPriority: true,
      clickPrice: false,
    })
      
  },
  // 搜索星级
  selectStar(e) {
    let item = e.target.dataset.item
    let _index
    this.data.starLevelType.forEach((val, i) => {
      let str = "starLevelType[" + i + "].isSelected";
      if (val.type == item.type) { _index = i }
      this.setData({ [str]: false })
    })
    let selected = false
    let up = "starLevelType[" + _index + "].isSelected";
    if (item.isSelected) {
      selected = false
      item.value = 0
    }else{
      selected = true
    }
    this.setData({
      [up]: selected,
      level: item.value
    })
  },
  // 搜索价格
  selectPrice(e) {
    let item = e.target.dataset.item
    let _index
    this.data.priceType.forEach((val, i) => {
      let str = "priceType[" + i + "].isSelected";
      if (val.type == item.type) { _index = i }
      this.setData({ [str]: false })
    })
    let up = "priceType[" + _index + "].isSelected";
    let selected = false
    if (item.isSelected) {
      selected = false
      item.value = ''
    } else {
      selected = true
    }
    this.setData({
      [up]: selected,
      priceSort: item.value
    })
  },
  // 排序搜索
  selectPriority(e) {
    let index = e.currentTarget.dataset.index
    let arr = this.data.priorityType
    arr.forEach(val => {
      val.isSelected = false
    })
    arr[index].isSelected = true
    this.setData({
      priorityType:arr,
      clickPrice:false,
      sort: arr[index].sort,
      sortname: arr[index].type
    })
    this.confirm()
  },
   // 重置筛选条件
  reset() {
    // 页面选择清空
    this.data.starLevelType.forEach((item, index) => {
      let up = "starLevelType[" + index + "].isSelected";
      this.setData({ [up]: false })
    })
    this.data.priceType.forEach((item, index) => {
      let up = "priceType[" + index + "].isSelected";
      this.setData({ [up]: false })
    })
    // 参数数据初始化
    this.setData({
      level: 0,
      price: [-1],
      sort: '',
      address: '',
      type: 0,
      title: '',
      keyWord: '',
      hotelList: []
    })
  },
  // 关闭搜索条件
  closeMask() {
    this.setData({
      isShowMask: false,
      inCapacity: false,
      inLevel: false,
    })
  },
  // 条件筛选完成按钮
  confirm() {
    let data = {
      page: 1,
      size: this.data.size,
      sort: this.data.sort,
      title: this.data.keyWord,
      address:this.data.curCity,
      type: this.data.level,
      price: this.data.priceSort
    }
    this.setData({
      curPage: 1,
      hotelList:[],
      isShowMask: false
    })
    this.searchList(data)
  },
  //上拉刷新页面
  onReachBottom: function () {
    this.data.curPage++
    // 首页传值情况下的分页
    if (this.data.flag) {
      let data = {
        page: this.data.curPage,
        size: this.data.size,
        address: this.data.curCity,
        title: this.data.keyWord
      }
      this.searchList(data)
    } else {
      // 正常筛选情况下的分页
      let data = {
        page: this.data.curPage,
        size: this.data.size,
        title: this.data.keyWord,
        address: this.data.curCity,
        sort: this.data.sort,
        type: this.data.level,
        price: this.data.priceSort
      }
      this.searchList(data)
    }  
  }
})