// 基础配置
module.exports = {
  appKey: 'obV8U0UnAuzSaClTU3JIvc6d9_Vs7', // 应用id
  serverUrl: 'http://fu.xinbalian.com/apis/',
  // serverUrl: 'https://api.lianying.me/apis/',
  //serverUrl: 'http://127.0.0.1:8360/',
  authPath: '/pages/auth/auth/auth?session=', // 授权路径
  wxloginUrl: 'core/auth/wxlogin', // 微信授权登录地址
  wxregUrl: 'core/auth/wxregister', // 微信授权注册地址
  wxsendUrl: 'core/auth/wxsendcode', // 微信授权短信验证地址
  apiRoomUrl: 'hotel/view/room/list',
  apiStoreUrl: 'hotel/view/hotel/list',
  apiCommentUrl: 'hotel/view/comment/list',
  apiCommentAddUrl: 'hotel/view/comment/add',
  apiEditOrderUrl: 'hotel/view/order/edit',
  apiAddOrderUrl: 'hotel/view/order/add',
  apiDetailHotelUrl: 'hotel/view/hotel/info',
  apiDetailRoomUrl: 'hotel/view/room/info',
  apiOrderListUrl: 'hotel/view/order/list',
  apihotelPayUrl: 'pay/order/unified',
  apiPayStatusUrl: 'core/order/orderPayStatus',
  apiPaySuccess: 'hotel/view/order/paySuccess',
  orderPayDeal: 'hotel/view/order/orderPayDeal',
  getPayStatus: 'hotel/view/order/getPayStatus',
  getAdvert: 'hotel/view/ad/list',
  getHotelCity: 'hotel/view/hotelCity/list',
}