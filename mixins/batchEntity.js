/**
 *
 */
import Vue from 'vue'
window.Vue = Vue
import visibleMiXin from './visibleMiXin'
import pageIndexMiXin from './pageMixin'
import ruleMiXin from './ruleMiXin'
import errorMessage from './errorMessage'
import regMixin from './regMixin'
import importCSV from './importCSV'
import tableSearchHighLight from './tableSearchHighLight'
import Emitter from 'element-ui/src/mixins/emitter'
import changeData from './changeData'
import {
  Loading
} from 'element-ui'
import {
  createNamespacedHelpers
} from 'vuex'
const {
  mapGetters: mapGettersU,
  mapState: mapStateU
} = createNamespacedHelpers('util')
var mixinMethod = {
  mixins: [Emitter, visibleMiXin, pageIndexMiXin, changeData, ruleMiXin, errorMessage, regMixin, importCSV, tableSearchHighLight],
  props: {

  },
  data () {
    return {
      dialogVisible: false, // 是否显示
      loading: false,
      selection: [], // 多选项
      currentRow: null, // 当前行
      entity: {},
      peopleList: [],
      query: {},
      order: '',
      showSimple: '',
      loadingInstance1: {},
      order_by: ''
    }
  },
  computed: {
    // 是否是库管，接样管理员
    ...mapGettersU(['isStoreManage', 'isSampleTaskManage']),
    ...mapStateU(['packing_unit', 'is_qc_pass'])

  },
  watch: {
    selectTable: (val) => {
      if (val instanceof Array && val.length == 0) {
        this.selection = val
        this.selection1 = val
      }
    }
  },
  methods: {
    // 至少选择一条数据
    checkMustSelect () {
      if (!this.selection || this.selection.length == 0) {
        this.showErrorMessage('请至少选择一条数据')
        return false
      }
      return true
    },
    // 勾选当前数据
    checkMustSelectCurrent () {
      if (!this.currentRow) {
        this.showErrorMessage('请选择一条数据')
        return false
      }
      return true
    },
    resetAll () {
      this.selection = [], // 多选项
        this.currentRow = null, // 当前行
        this.entity = {},
        this.query = {}
      if (typeof this.initData === 'function') {
        this.initData()
      }
    },
    /** 已经删除的列不显示 */
    tableRowClassName ({
      row,
      rowIndex
    }) {
      if (row.isValid == 0) {
        return 'hiddenRow'
      }
      if (typeof this.effectRowClass === 'function') {
        return this.effectRowClass({
          row,
          rowIndex
        })
      }
      return ''
    },
    /** 单元格标红 */
    tableCellClassName ({
      row,
      column,
      rowIndex,
      columnIndex
    }) {
      var _className = ' '
      if (column.property) {
        var item = column.property + 'Error'
        var item1 = column.property + 'IsDisable'
        var item2 = column.property + 'Match'
        var item3 = column.property + 'MatchCurrent'
        if (row[item] === true) {
          _className += 'errCell '
        }
        if (row[item1] === true) {
          _className += 'disableCell '
        }
        if (row[item2] === true) {
          _className += 'matchCell '
        }
        if (row[item3] === true) {
          _className += 'matchCellCurrent '
        }
      }
      if (typeof this.effectCellClass === 'function') {
        _className += this.effectCellClass({
          row,
          rowIndex
        }) + ' '
      }
      return _className
    },
    /** 单元格标红 */
    getTableCellClassName ({
      row,
      column,
      rowIndex,
      columnIndex
    }) {
      var _className = ' '
      if (column.property) {
        var item = column.property + 'Error'
        var item1 = column.property + 'IsDisable'
        var item2 = column.property + 'Match'
        var item3 = column.property + 'MatchCurrent'
        var item4 = column.property + 'DataChange'
        if (row[item] === true) {
          _className += 'errCell '
        }
        if (row[item1] === true) {
          _className += 'disableCell '
        }
        if (row[item2] === true) {
          _className += 'matchCell '
        }
        if (row[item3] === true) {
          _className += 'matchCellCurrent '
        }
        if (row[item4] === true) {
          _className += 'dataChangeCell'
        }
      }
      if (typeof this.effectCellClass === 'function') {
        _className += this.effectCellClass({
          row,
          rowIndex
        }) + ' '
      }
      return _className
    },
    /** 选中行 */
    handleSelectionChange (val) {
      this.selection = val && (val.records instanceof Array) ? val.records : val
      this.selectTable = this.selection
    },
    /** 选中当前行*/
    handleCurrentChange (val) {
      this.currentRow = val
    },
    handleRowClick (val) {
      this.currentRow = val
    },
    /** input获取焦点*/
    handleFocus (el) {
      if (el && el.select && typeof el.select === 'function') {
        el.select()
      }
    },
    // 是否为空
    emptyString (str) {
      str = typeof str === 'string' ? str : typeof str === 'number' ? str + '' : str
      if (str == '' || str == null || str == undefined) {
        return true
      }
      return false
    },
    showDialog (dialogVisible) {
      this.$set(this, dialogVisible, true)
    },
    // 返回
    backFunction () {
      this.$router.push({
        path: this.backPath
      })
    },
    // 判断是否为空
    checkRequire (tableList = [], requireArray = []) {
      var checked = true
      tableList.map((item) => {
        requireArray.map(x => {
          var col = x + 'Error'
          if (this.emptyString(item[x])) {
            item[col] = true
            checked = false
          } else {
            item[col] = false
          }
        })
      })
      return checked
    },
    updateTable (tableData, colName = 'sampleIdLims') {
      var tableDataE = tableData || this.tableData || []
      tableDataE.push([])
      tableDataE.pop([])
    },
    clearAll () {
      this.initQuery()
    },
    // 设置获取人员信息List，
    setPeopleList (entity) {
      var peopleList = []
      peopleList.push({
        nextProcessorId: entity.nextProcessorId,
        nextProcessorName: entity.nextProcessorName
      })
      this.$set(this, 'peopleList', peopleList)
    },
    // 排序
    sortChange (obj) {
      const params = {}
      if (obj.order == 'ascending') {
        params.order = 'asc'
      } else if (obj.order == 'descending') {
        params.order = 'desc'
      } else {
        params.order = ''
      }
      params.order_by = obj.prop
      if (obj.prop == null) {
        params.order_by = ''
      }
      this.orderChange(params)
      this.fetch(this.query)
    },
    orderChange (params) {
      this.order = params.order
      this.order_by = params.order_by
    },
    // 报表打开
    handleCommandPrint (command) {
      var task_id = this.$route.query.taskCode
      var url = command + '&task_id=' + task_id
      window.open(url, '_blank', '')
    },
    setLoading (val) {
      if (val) {
        this.loadingInstance1 = Loading.service({
          fullscreen: true,
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.loadingInstance1.openLoading()
      } else {
        (typeof this.loadingInstance1.close === 'function') && this.loadingInstance1.close()
      }
    },
    // 根据实验室核心号排序
    generatedSortNo (tableData) {
      if (!(tableData instanceof Array)) {
        tableData = this.tableData
      }
      var arr = [].concat(tableData)
      var sortArr = arr.sort((x, y) => {
        var yearA = x.sampleIdLabCore.slice(0, 2)
        var yearB = y.sampleIdLabCore.slice(0, 2)
        var monthA = x.sampleIdLabCore.slice(2, 3)
        var monthB = y.sampleIdLabCore.slice(2, 3)
        var dayA = x.sampleIdLabCore.slice(3, 4)
        var dayB = y.sampleIdLabCore.slice(3, 4)
        var seqA = x.sampleIdLabCore.slice(4, 8)
        var seqB = y.sampleIdLabCore.slice(4, 8)
        // 月和天的0 assic(48)修改为58
        monthA = monthA.charCodeAt() == 48 ? 58 : monthA.charCodeAt()
        monthB = monthB.charCodeAt() == 48 ? 58 : monthB.charCodeAt()
        dayA = dayA.charCodeAt() == 48 ? 58 : dayA.charCodeAt()
        dayB = dayB.charCodeAt() == 48 ? 58 : dayB.charCodeAt()
        if (yearA < yearB) {
          return -1
        }
        if (yearA > yearB) {
          return 1
        }
        if (monthA < monthB) {
          return -1
        }
        if (monthA > monthB) {
          return 1
        }
        if (dayA < dayB) {
          return -1
        }
        if (dayA > dayB) {
          return 1
        }
        if (seqA < seqB) {
          return -1
        }
        if (seqA > seqB) {
          return 1
        }
        return x.sampleTypeName > y.sampleTypeName ? -1 : 1
      })
      sortArr.map((item, index) => {
        item.sortNo = index + 1
      })
    },
    handleCollapse (step, str = '') {
      var params = {
        expStep: step,
        taskId: this.taskDetail.taskId + str
      }
      return this.exportItemList(params)
    },
    handleCollapseResult (step, str = '') {
      var params = {
        expStep: step,
        taskId: this.taskDetail.taskId + str
      }
      return this.exportResultList(params)
    },
    // 缓存sort条件
    storeSortCondition (pageName, sortConfig, otherCondition) {
      localStorage.setItem(pageName + '_order', sortConfig.order)
      localStorage.setItem(pageName + '_order_by', sortConfig.order_by)
      otherCondition.map(x => {
        localStorage.setItem(pageName + '_' + x, sortConfig[x])
      })
    },
    // 获取缓存的sort
    getSearchCondition (pageName, params, sortColumns = []) {
      params.order = localStorage.getItem(pageName + '_order') == 'null' ? '' : localStorage.getItem(pageName + '_order')
      params.order_by = localStorage.getItem(pageName + '_order_by') == 'null' ? '' : localStorage.getItem(pageName + '_order_by')
      sortColumns.map(x => {
        params[x] = localStorage.getItem(pageName + '_' + x)
      })
    },
    downLoadReportByOssKey (ossKey) {
      ossKey = ossKey.replace('+', '%2B')
      var url = '/lim/api/lims/file/fileUrl/downloadByOssKey/?fileKey=' + ossKey + '&downloadType=download'
      window.$.fileDownload(url)
    },
    // 是否可以编辑
    activeMethod ({
      row,
      rowIndex,
      column,
      columnIndex
    }) {
      return true
    },
    selectableRow (row, index) {
      if (row.isValid != '0') {
        return true
      } else {
        return false
      }
    },
    querySearchPeople (queryString = '') {

    },
    setNotEmptyValue (originProp, targetValue, row) {
      if (!this.emptyString(targetValue)) {
        row[originProp] = targetValue
      }
    },
    handleDataChangeAfterSubmit () {
      this.selection = []
      this.selectTable = []
      this.$refs && this.$refs.xTable && this.$refs.xTable.clearSelection()
      this.$refs && this.$refs.resultTable && this.$refs.resultTable.clearSelection()
      this.$refs && this.$refs.itemListTable && this.$refs.itemListTable.clearSelection()
      this.dataChangeTableVisible = false
      this.dataChangeReasonVisible = false
    }
  }
}
export default mixinMethod
