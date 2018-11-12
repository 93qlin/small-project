 /*
* @Name: Promisify 插件（把官方api方法封装成Promisi）
* @Author: leeson
* @Last Modified time: 2017-12-29 02:11:33
*/

function wxPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        //成功
        resolve(res)
      }
      obj.fail = function (res) {
        //失败
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
  )
}

/**
 * 微信用户登录,获取code
 */
function wxLogin() {
  return wxPromisify(wx.login)
}

/**
 * 检查微信会话是否过期
 */
function wxCheckSession() {
  return wxPromisify(wx.checkSession)
}

/**
 * 获取微信用户信息
 * 注意:须在登录之后调用
 */
function wxGetUserInfo() {
  return wxPromisify(wx.getUserInfo)
}

/**
 * 获取系统信息
 */
function wxGetSystemInfo() {
  return wxPromisify(wx.getSystemInfo)
}

/**
 * 本地存储-写入
 */
function wxSetStorage() {
  return wxPromisify(wx.setStorage)
}

module.exports = {
  wxLogin: wxLogin(),
  wxCheckSession: wxCheckSession(),
  wxGetUserInfo: wxGetUserInfo(),
  wxGetSystemInfo: wxGetSystemInfo(),
  wxSetStorage: wxSetStorage()
}