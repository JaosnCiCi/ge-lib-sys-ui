/**
 *
 */
import {
  createNamespacedHelpers
} from 'vuex'
const {
  mapActions
} = createNamespacedHelpers('report')
var mixinMethod = {
  created () {
  },
  data () {
    return {

    }
  },
  methods: {
    ...mapActions([
      'checkExportReportTask'
    ]),
    convertDate (item, formatter) {
      item = this.emptyString(item) ? '' : this.$moment(item).format(formatter)
      return item
    },
    paramsConvert (params) {
      params.preinstallPoolingDate = this.convertDate(params.preinstallPoolingDate)
      params.lastPoolingDate = this.convertDate(params.lastPoolingDate)
      params.lastSequencingDate = this.convertDate(params.lastSequencingDate)
      params.lastSampleRcvDate = this.convertDate(params.lastSampleRcvDate)
      params.assignmentDate = this.convertDate(params.assignmentDate)
    },
    reportExportList (query, forPage, paramsConvert) {
      var params = Object.assign({}, this.query)
      paramsConvert.call(this, params)
      params.forPage = forPage
      var str = ''
      var arr = Object.keys(params)
      arr.map((item, index) => {
        const preAttr = index === 0 ? '?' : '&'
        str += preAttr + item + '=' + params[item]
      })
      var url = '/lims/file/report/checkExportReportTask' + str
      this.checkExportReportTask(url).then(res => {
        if (res.status == '2000') {
          var url = '/lim/api/lims/file/report/exportReportTask' + str
          window.open(url)
        } else {
          this.showErrorMessage('请先检索数据后再进行导出')
          return
        }
      })
    }
  }
}
export default mixinMethod
