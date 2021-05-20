/**
 *
 */
var mixinMethod = {
  data () {
    return {
      tableErrorMessage: new Set(),
      tableErrorMessageString: '',
      tableErrorMessageArr: []
    }
  },
  methods: {
    validate (rows, tableRules) {
      this.tableErrorMessage = new Set()

      tableRules = tableRules || this.tableRules || []
      var result = {
        checked: true,
        message: '',
        type: ''
      }
      rows.map(row => {
        tableRules.map(rule => {
          if (rule.required !== false && this.emptyString(row[rule.prop])) {
            result.checked = false
            result.message = '请完善页面信息'
            result.type = '01'
            row[rule.prop + 'Error'] = true
          } else {
            row[rule.prop + 'Error'] = false
          }
        })
      })
      if (!result.checked) {
        return result
      }
      rows.map(row => {
        tableRules.map(rule => {
          if (rule.otherRules) {
            var that = this
            var ctx = this
            var result1 = rule.otherRules.call(that, row[rule.prop], row, rule.propMsg, rule.prop, ctx)
            if (!result1.checked) {
              result.checked = false
              result.type = '02'
              result.message = result1.message
              this.tableErrorMessage.add(result1.message)
              row[rule.prop + 'Error'] = true
            } else {
              row[rule.prop + 'Error'] = false
            }
          }
        })
      })
      var tableErrorMessageArr = [...this.tableErrorMessage]
      this.tableErrorMessageArr = tableErrorMessageArr
      this.tableErrorMessageString = tableErrorMessageArr.join(',')
      return result
    },
    // table翻页
    handleCurrentPageChange (pageIndex) {
      this.currentPage = pageIndex
      var params = Object.assign({}, this.query)
      params.pageSize = this.currentPageSize
      params.pageIndex = this.currentPage
      this.fetch(params)
    },
    cleanSpelChar (value, $event) {
      console.log(value, value.row[value.column.property], $event)
      value.row[value.column.property] = value.row[value.column.property].replace(/[`~!@#$%^&*()_+<>?:"{},\/;'[\]=-]/g, '')
      value.row[value.column.property] = value.row[value.column.property].replace(/[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/g, '')
    }
  }
}
export default mixinMethod
