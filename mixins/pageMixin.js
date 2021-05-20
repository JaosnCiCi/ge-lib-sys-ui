/**
 *
 */
import visibleMiXin from './visibleMiXin'
var mixinMethod = {
  mixins: [visibleMiXin],
  props: {

  },
  data () {
    return {
      currentPage: 1,
      currentPageSize: 10,
      total: 0
    }
  },
  methods: {
    handleSizeChange (pageSize) {
      this.currentPageSize = pageSize
      var params = Object.assign({}, this.query)
      this.fetch(params)
    },
    // table翻页
    handleCurrentPageChange (pageIndex) {
      this.currentPage = pageIndex
      var params = Object.assign({}, this.query)
      params.pageSize = this.currentPageSize
      params.pageIndex = this.currentPage
      this.fetch(params)
    }
  }
}
export default mixinMethod
