// promise 封装 Request
var utils = require('../utils/util')
var wapi = require('../utils/wapi')
var config = require('../utils/config')

function httpPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        if (res.statusCode === 200) { //成功
         if (res.data.errno == 401) {
            //需要登录后才可以操作
            let code = null;
            return wapi.wxLogin().then((res) => {
              code = res.code;
              return wapi.wxGetUserInfo();
            }).then((userInfo) => {
              //登录远程服务器
              request(config.wxloginUrl, { code: code, userInfo: userInfo }, 'POST').then(res => {
                if (res.errno === 0) {
                  //存储用户信息
                  wx.setStorageSync('userInfo', res.data.userInfo);
                  wx.setStorageSync('token', res.data.token);
                  resolve(res);
                  wx.reLaunch({ url: '/pages/home/home' })
                } else {
                  if (res.errno === 1005) {
                    wx.navigateTo({
                      url: config.authPath + res.errmsg
                    })
                  } else {
                    utils.showModal(res.errmsg)      
                    reject(res);
                  }
                }
              }).catch((err) => {
                reject(err);
              });
            }).catch((err) => {
              reject(err);
            })
          } else {
            resolve(res.data);
          }
        } else {
          utils.showModal('服务器出了点问题哦')        
        }
        resolve(res) 
      }
      obj.fail = function (res) { //失败
        utils.showModal('您的网络好像有点问题哦')        
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

/*
 *
 * 请求方法
 * url
 * data 以对象的格式传入
 * method
 */
function request(url, data = {}, method = "GET") {
  var token = getStorage('token')
  var wxRequest = httpPromisify(wx.request)
  return wxRequest({
    url: config.serverUrl + url,
    method: method,
    data: data,
    header: {
      'Content-Type': 'application/json',
      'appkey': config.appKey,
      'authorization': token
    }
  })
}

// 必须同步获取授权令牌
function getStorage(key = 'token') {
  var token = null
  try {
    token = wx.getStorageSync(key)
  } catch (e) {
    // Do something when catch error
  }
  return token
}

/**
 * 判断用户是否登录
 */
function checkLogin() {
  return new Promise(function (resolve, reject) {
    if (getStorage('userInfo') && getStorage('token')) {
      wapi.wxCheckSession().then(() => {
        resolve(true);
      }).catch(() => {
        resolve(false);
      });
    } else {
      resolve(false);
    }
  });
}

module.exports = {
  request: request,
  checkLogin: checkLogin
}