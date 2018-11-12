// promise 封装 Request
var Promise = require('../plugins/es6-promise.auto.min.js')
var utils = require('../utils/util.js')
var config = require('../utils/config.js')

function wxPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        if (res.statusCode === 200) { //成功
          if (res.data.status == '401') {
            wx.navigateTo({
              url: '/pages/accout/accout?back_url=' + utils.getPageUrl() // 需要的授权跳转到授权页
            })
          }
        } else {
          wx.showModal({
            content: '服务器偷懒了',
            showCancel: false
          })
        }
        resolve(res)
      }
      obj.fail = function (res) { //失败
        wx.showModal({
          content: '您的网络好像有点问题哦',
          showCancel: false
        })
        reject(res)
      }
      fn(obj)
    })
  }
}

//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};

// 必须同步获取授权令牌
function getAuthToken() {
  var token = null
  try {
    var value = wx.getStorageSync('token')
    if (value) {
      token = 'Bearer ' + value
    }
  } catch (e) {
    // Do something when catch error
  }
  return token
}

/**
 * get方法 (无需授权)
 * url
 * data 以对象的格式传入
 */
function _getRequest(url, data) {
  var _getRequest = wxPromisify(wx.request)
  return _getRequest({
    url: config.serverUrl + url,
    method: 'GET',
    data: data,
    header: {
      'Content-Type': 'application/json'
    }
  })
}
/**
 * get方法
 * url
 * data 以对象的格式传入
 */
function getRequest(url, data) {
  var authkey = getAuthToken()
  var getRequest = wxPromisify(wx.request)
  return getRequest({
    url: config.serverUrl + url,
    method: 'GET',
    data: data,
    header: {
      'Content-Type': 'application/json',
      'Authorization': authkey // 出示授权令牌
    }
  })
}

/**
 * post方法
 * url
 * data 以对象的格式传入
 */
function postRequest(url, data) {
  var authkey = getAuthToken()
  var postRequest = wxPromisify(wx.request)
  return postRequest({
    url: config.serverUrl + url,
    method: 'POST',
    data: data,
    header: {
      "content-type": "application/json",
      "Authorization": authkey // 出示授权令牌
    }
  })
}

/**
 * put, delelte方法
 * url
 * id 以字符串的格式传入
 * _method 需要传入请求方法
 */
function otherRequest(url, id, _method) {
  var otherRequest = wxPromisify(wx.request)
  return otherRequest({
    url: config.serverUrl + url + '/' + id,
    method: _method,
    header: {
      "content-type": "application/x-www-form-urlencoded",
      'Authorization': token // 出示授权令牌
    }
  })
}

module.exports = {
  _Get: _getRequest,
  Post: postRequest,
  Get: getRequest,
  other: otherRequest
}