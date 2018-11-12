/**
 * 支付相关服务
 */
var utils = require('../utils/util')
var config = require('../utils/config')
var request = require('../utils/request')
/**
 * 调起微信支付
 */
function payOrder(orderinfo) {
    return new Promise(function (resolve, reject) {
        request.request(config.apihotelPayUrl, orderinfo, 'POST').then((ret) => {
            if (ret.errno === 0 && ret.data.timeStamp) {
                const payParam = ret.data
                wx.requestPayment({
                    'timeStamp': payParam.timeStamp,
                    'nonceStr': payParam.nonceStr,
                    'package': payParam.package,
                    'signType': payParam.signType,
                    'paySign': payParam.paySign,
                    'success': function (ret) {
                        resolve(ret);
                    },
                    'fail': function (ret) {
                        utils.showErrorToast('支付取消或失败')
                        reject(ret)
                    },
                    'complete': function (ret) {
                        reject(ret);
                    }
                })
            } else if (ret.errno === 0) {
                if (ret.data == '订单已支付') {
                    ret.status = 2
                }
                utils.showErrorToast(ret.data)
                ret.errmsg = ret.data
                reject(ret)
            } else {
                utils.showErrorToast(ret.errmsg)
                reject(ret)
            }
        })
    });
}

module.exports = {
    payOrder,
};











