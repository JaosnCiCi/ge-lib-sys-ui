
var mixinMethod = {
  data () {
    return {
      order: '',
      order_by: ''
    }
  },
  methods: {
    handlerSearchBefore (queryParams = {}) {
      var queryP = queryParams.SearchParams || this.query
      var params = Object.assign(queryP)
      params.pageSize = this.currentPageSize
      params.pageIndex = this.currentPage
      params.order = this.order
      params.order_by = this.order_by
      return params
    },
    // table翻页
    handleCurrentPageChange (pageIndex) {
      this.currentPage = pageIndex
      this.doSearch()
    },
    handleSizeChange (pageSize) {
      this.currentPage = 1
      this.doSearch()
    },
    // 排序
    headerCellClickEvent ({
      column,
      triggerResizable,
      triggerSort,
      triggerFilter
    }) {
      // 如果触发了列的其他功能按钮
      if (column.sortable && triggerSort) {
        var params = {}
        this.order = params.order = column.order
        this.order_by = params.order_by = column.property
        if (this.page) {
          this.storeSortCondition(this.page, params, [])
        }
        this.doSearch()
      }
    }
  }
}
export default mixinMethod
