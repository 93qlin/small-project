let startDate = {},
    endDate = {},
    isStartDatePicked = false
const dayMsec = 1000 * 60 * 60 * 24
Component({
  properties: {
    dayStamp: {    //日数戳
      type: Number,
      value: 60,
      observer: function (newVal, oldVal) { }
    },
    isCalendarShow: { //是否显示日历
      type: Boolean,
      value: true,
      observer(newVal, oldVal) { }
    },
    maxDaySpan: {  //最大日期区间
      type: Number,
      value: 365,
      observer(newVal, oldVal) { }
    }
  },
  data: {
    hasEmptyGrid: false,
    arriveTime: {},
    leaveTime: {}
  },
  attached: function () {
    const date = new Date()
    const deadDate = new Date(date.getTime() + this.data.dayStamp * dayMsec)
    const deadYear = deadDate.getFullYear()
    const deadMonth = deadDate.getMonth() + 1
    const deadDay = deadDate.getDate()
    const cur_year = date.getFullYear()
    const cur_month = date.getMonth() + 1
    const cur_day = date.getDate()
    const weeks_ch = ['日', '一', '二', '三', '四', '五', '六']
    this.setData({
      cur_year,
      cur_month,
      weeks_ch,
      nowYear: cur_year,
      nowMonth: cur_month,
      nowDay: cur_day,
      deadYear,
      deadMonth,
      deadDay
    })
    this.calculateEmptyGrids(cur_year, cur_month)
    this.calculateDays(cur_year, cur_month)
  },
  methods: {
    cancel(e) {
      this.setData({
        isCalendarShow: false
      })
    },
    getThisMonthDays(year, month) {
      return new Date(year, month, 0).getDate()
    },
    getFirstDayOfWeek(year, month) {
      return new Date(Date.UTC(year, month - 1, 1)).getDay()
    },
    calculateEmptyGrids(year, month) {
      const firstDayOfWeek = this.getFirstDayOfWeek(year, month)
      let empytGrids = []
      if (firstDayOfWeek > 0) {
        for (let i = 0; i < firstDayOfWeek; i++) {
          empytGrids.push(i)
        }
        this.setData({
          hasEmptyGrid: true,
          empytGrids
        })
      } else {
        this.setData({
          hasEmptyGrid: false,
          empytGrids: []
        })
      }
    },
    calculateDays(year, month) {
      let days = []
      const nowYear = this.data.nowYear
      const nowMonth = this.data.nowMonth
      const nowDay = this.data.nowDay
      const deadYear = this.data.deadYear
      const deadMonth = this.data.deadMonth
      const deadDay = this.data.deadDay
      const thisMonthDays = this.getThisMonthDays(year, month)

      //获取入住时间信息
      wx.getStorage({
        key: 'dateArr',
        success: function (res) {
          let starttime = res.data[0].split("-")
          let endtime = res.data[1].split("-")
          startDate.year = parseInt(starttime[0])
          startDate.month = parseInt(starttime[1])
          startDate.day = parseInt(starttime[2])
          endDate.year = parseInt(endtime[0])
          endDate.month = parseInt(endtime[1])
          endDate.day = parseInt(endtime[2])
        }
      })
      let choosed = false
      for (let i = 1; i <= thisMonthDays; i++) {
        if ((year === startDate.year && month === startDate.month && i === startDate.day) || (year === endDate.year && month === endDate.month && i === endDate.day)){
          choosed = true
        }else{
          choosed = false
        }
        days.push({
          day: i,
          choosed: choosed,
          negative: (year === nowYear && month === nowMonth && i < nowDay) || (year === deadYear && month === deadMonth && i >= deadDay)
        })
      }

      this.setData({
        days
      })
    },
    handleCalendar(e) {
      const handle = e.currentTarget.dataset.handle
      const cur_year = this.data.cur_year
      const cur_month = this.data.cur_month
      const deadYear = this.data.deadYear
      const deadMonth = this.data.deadMonth
      const deadDay = this.data.deadDay
      const nowYear = this.data.nowYear
      const nowMonth = this.data.nowMonth
      if (handle === 'prev') {
        let newMonth = cur_month - 1
        let newYear = cur_year
        if (newMonth < 1) {
          newYear = cur_year -1
          newMonth = 12
        }
        if (newYear < nowYear || (newYear === nowYear && newMonth > cur_month)) return
        this.calculateDays(newYear, newMonth)
        this.calculateEmptyGrids(newYear, newMonth)
        this.setData({
          cur_year: newYear,
          cur_month: newMonth
        })
      } else {
        let newMonth = cur_month + 1
        let newYear = cur_year
        if (newMonth >= 12) {
          newYear = cur_year + 1
          newMonth = 1
        }
        if (newYear > deadYear || (newYear === deadYear && newMonth > deadMonth)) return
        this.calculateDays(newYear, newMonth)
        this.calculateEmptyGrids(newYear, newMonth)
        this.setData({
          cur_year: newYear,
          cur_month: newMonth
        })
      }
    },
    tapDayItem(e) {
      let num = 0
      let odays = this.data.days
      for (let i = 0; i < odays.length; i++) {
        if (odays[i].choosed) {
          num++
        }
      }
      if (num >= 2) {
        for (let i = 0; i < odays.length; i++) {
          odays[i].choosed = false
        }
      }
      this.setData({
        days: odays
      })
      const idx = e.currentTarget.dataset.idx
      const days = this.data.days
      const pickedDay = days[idx]
      const maxDaySpan = this.data.maxDaySpan
      if (pickedDay.negative) return
      if (pickedDay.choosed) {
        pickedDay.choosed = false
        this.reset()
        this.setData({
          days,
        })
        return
      }      
      if (!isStartDatePicked) {
        let startDay = new Date(this.data.cur_year, this.data.cur_month - 1, pickedDay.day)
        startDate = {
          date: startDay,
          data_of_week: startDay.getDay(),
          year: this.data.cur_year,
          month: this.data.cur_month,
          day: pickedDay.day
        }
        pickedDay.choosed = true
        isStartDatePicked = true
      } else {
        
        let endDay = new Date(this.data.cur_year, this.data.cur_month - 1, pickedDay.day)
        let daySpan = (endDay - startDate.date) / (dayMsec)
        if (daySpan > maxDaySpan) {
          let maxDate = new Date(+startDate.date + maxDaySpan * dayMsec)
          endDate = {
            date: maxDate,
            data_of_week: maxDate.getDay(),
            year: maxDate.getFullYear(),
            month: maxDate.getMonth() + 1,
            day: maxDate.getDate()
          }
          daySpan = maxDaySpan
        } else {
          endDate = {
            date: endDay,
            data_of_week: endDay.getDay(),
            year: this.data.cur_year,
            month: this.data.cur_month,
            day: pickedDay.day
          }
        } 
        if (endDate.date < startDate.date) {
          days[startDate.day - 1].choosed = false
          pickedDay.choosed = true
          this.setData({
            days
          })
          startDate = endDate
          isStartDatePicked = true
          return
        }
        this.triggerEvent('pickDateSpan', { startDate, endDate, daySpan })
        days[endDate.day - 1].choosed = false
        this.reset()
        this.setData({
          isCalendarShow: false
        })
      }
      this.setData({
        days
      })
    },
    reset() {
      isStartDatePicked = false
      startDate = {}
      endDate = {}
      // 清空选择状态
      this.data.days.forEach( item => {
        item.choosed = false
      })
    },
  }
})