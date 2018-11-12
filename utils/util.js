const formatTime = (date, flag) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  if(flag){
    return [year, month, day].map(formatNumber).join('-')
  }
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/*获取当前页url*/
function getPageUrl(){
  var pages = getCurrentPages()    //获取加载的页面
  var currentPage = pages[pages.length-1]    //获取当前页面的对象
  var url = '/' + currentPage.route    //当前页面url
  return url
}

/*获取当前页带参数的url*/
function getPageUrlWithArgs(){
  var url = getPageUrl()    //当前页面url
  var options = currentPage.options    //如果要获取url中所带的参数可以查看options
  //拼接url的参数
  var urlWithArgs = url + '?'
  for(var key in options){
      var value = options[key]
      urlWithArgs += key + '=' + value + '&'
  }
  urlWithArgs = '/' + urlWithArgs.substring(0, urlWithArgs.length-1)
  return urlWithArgs
}
// 获取时间差即天数
function getTotalDays(a,b){
  let gap = Math.abs(a-b)
  return gap /(1000 * 24 * 3600)
}
function add0(m) { return m < 10 ? '0' + m : m }
function stampsToTime(stamp){
  //stamp是整数，否则要parseInt转换
  var time = new Date(stamp);
  var y = time.getFullYear();
  var m = time.getMonth() + 1;
  var d = time.getDate();
  var h = time.getHours();
  var mm = time.getMinutes();
  var s = time.getSeconds();
  return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
  
}
function getWeek(dateString) {
  var date;
  if (!dateString) {
    date = new Date();
  } else {
    var dateArray = dateString.split("-");
    date = new Date(dateArray[0], parseInt(dateArray[1] - 1), dateArray[2]);
  }
  var weeks = ["日", "一", "二", "三", "四", "五", "六"]
  return "星期" + weeks[date.getDay()]
  
};
function showModal(msg) {
  wx.showModal({
    content: msg + '',
    showCancel: false,
  })
}

function showErrorToast(msg) {
  wx.showToast({
    title: msg + '',
    image: '/image/icon_error.png'
  })
}

module.exports = {
  showModal,
  showErrorToast,
  formatTime,
  getPageUrl,
  getPageUrlWithArgs,
  getTotalDays,
  stampsToTime,
  getWeek
}
