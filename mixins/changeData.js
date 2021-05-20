
var _ = require('lodash')
import {
  createNamespacedHelpers
} from 'vuex'
const {
  mapActions: mapActions
} = createNamespacedHelpers('dataChange')
var mixinMethod = {
  props: {
    rowData: {
      type: Array,
      default: () => {
        return []
      }
    },
    taskDetail: {
      type: Object,
      default: () => {
        return {}
      }
    },
    reasonParams: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      dataChangeStatus: false,
      dataChangeBtnName: '数据修改',
      dataChangeBtnNameSubmit: '发起修改',
      dataChangeBtnNameCancel: '取消修改',
      dataChangeReasonVisible: false,
      dataChangeTableVisible: false,
      dataChangeBy: '',
      dataChangeByName: '',
      dataChangeReason: '',
      abnormalityVisible: false,
      qcResultVisible: false,
      reasonParamOut: {},
      editColumns: {
        'preparation-item': ['actualSampleAmt', 'actualSamplePkgAmt'],
        'preparation-result': ['qcResult', 'expSampleAbnormalityTList', 'remarks'],
        'extraction-item': ['actualSampleAmt', 'usedSampleAmt', 'actualSamplePkgAmt', 'samplePkgAmtUnit', 'remarks', 'fTSampleDesc', 'fTSampleUvDesc'],
        'extraction-result': ['nanodropConsistenceAmt', 'od260280', 'od260230', 'qcResult', 'expSampleAbnormalityTList', 'remarks', 'rinValue', 'dnaConcentration', 'dilutionFactor', 'dnaPollutionRate', 'extractedPerMlAmt'],
        'ultrafrac-item': ['actualConsistenceAmt', 'actualVolumeAmt', 'actualTotalAmt', 'actualSamplePkgAmt', 'samplePkgAmt', 'usedVolumeAmt', 'usedTotalAmt', 'remarks'],
        'ultrafrac-result': ['usedVolumeAmt', 'usedTotalAmt', 'qcResult', 'expSampleAbnormalityTList', 'remarks']
      },
      tableRulesDataChange: [],
      listErrorVisible: false,
      listErrorList: [],
      listErrorDescription: '以下样本已提交修改，请重新勾选要修改的样本：'
    }
  },
  watch: {
    dataChangeStatus: function (val) {
      this.selection = []
      this.selectTable = []
      this.$refs && this.$refs.xTable && this.$refs.xTable.clearSelection()
      this.$refs && this.$refs.resultTable && this.$refs.resultTable.clearSelection()
      this.$refs && this.$refs.itemListTable && this.$refs.itemListTable.clearSelection()
    }
  },
  methods: {
    ...mapActions(['checkDoingTask']),
    submitDataChange () {
      if (this.selection.length == 0) {
        this.showErrorMessage('请至少选择一条数据')
        return
      }
      var list = []
      this.selection.map(x => {
        list.push(x.sampleIdLims)
      })
      var params = {}
      params.list = list
      params.taskId = this.$route.query.taskCode
      this.checkDoingTask(params).then(res => {
        if (res.status == '2000') {
          if (res.list.length == 0) {
            this.dataChangeReasonVisible = true
          } else {
            this.listErrorList = res.list
            this.listErrorVisible = true
          }
        } else {
          this.showErrorMessage('操作失败刷新重试')
        }
      })
    },
    handleReasonNext (query) {
      this.dataChangeBy = query.nextProcessorId
      this.dataChangeByName = query.nextProcessorName
      this.dataChangeReason = query.reason
      this.reasonParamOut = query
      this.dataChangeReasonVisible = false
      this.dataChangeTableVisible = true
    },
    handleReasonCancel (query) {
      this.dataChangeReasonVisible = false
    },
    handleDataChangeSubmit (rows) {

    },
    handleDataChangeCancel () {

    },
    sureDataChangeParams () {
      var contentBeforeModify = this.rowData
      var contentAfterModify = this.getDataChangeTableData()
      var result = this.validate(contentAfterModify, this.tableRulesDataChange)
      if (!result.checked) {
        this.$refs && this.$refs.xTable && this.$refs.xTable.updateData()
        this.$refs && this.$refs.resultTable && this.$refs.resultTable.updateData()
        this.$refs && this.$refs.itemListTable && this.$refs.itemListTable.updateData()
        this.$refs && this.$refs.tableReference && this.$refs.tableReference.updateTable && this.$refs.tableReference.updateTable()
        this.$message({
          message: '请完善页面信息',
          type: 'error'
        })
        return
      }
      var taskDetail = this.taskDetail
      var modifyDataTaskT = {}
      modifyDataTaskT.modifyReason = this.reasonParams.reason
      modifyDataTaskT.nextProcessorId = this.reasonParams.nextProcessorId
      modifyDataTaskT.nextProcessorName = this.reasonParams.nextProcessorName
      modifyDataTaskT.lastAuditedBy = this.reasonParams.nextProcessorId
      modifyDataTaskT.lastAuditedByName = this.reasonParams.nextProcessorName
      modifyDataTaskT.srcTaskId = taskDetail.taskId
      modifyDataTaskT.srcTaskType = taskDetail.taskType
      modifyDataTaskT.srcTaskTypeName = taskDetail.taskTypeName
      modifyDataTaskT.modifySubModule = this.modifySubModule
      modifyDataTaskT.modifyModule = this.modifyModule
      var params = {}
      params.modifyModule = this.modifyModule
      params.modifySubModule = this.modifySubModule
      params.contentBeforeModify = contentBeforeModify
      params.contentAfterModify = contentAfterModify
      contentAfterModify.map((item, index) => {
        this.editColumns[this.stepTable].map(x => {
          if (item[x] instanceof Array) {
            if (_.difference(item[x], contentBeforeModify[index][x]).length != 0 || _.difference(contentBeforeModify[index][x], item[x]).length != 0) {
              item[x + 'DataChange'] = true
            }
          } else {
            if (item[x] != contentBeforeModify[index][x]) {
              item[x + 'DataChange'] = true
            }
          }
        })
      })

      // this.changeCodeToName(params.contentBeforeModify)
      // this.changeCodeToName(params.contentAfterModify)
      var obj = {}
      obj.modifyDataTaskT = modifyDataTaskT
      obj.list = []
      obj.list.push(params)
      this.saveTask(obj).then(res => {
        if (res.status == '2000') {
          this.showSuccessMessage('提交成功')
          this.dialogVisible = false
          var that = this
          this.$emit('confirm', that)
        } else {
          this.showErrorMessage('提交失败')
        }
      })
    },
    changeCodeToName (list = []) {
      var that = this
      list.map(row => {
        that.changeCodeToNameList.map(col => {
          col.code = col.code || 'code'
          col.label = col.label || 'userNameCn'
          col[col.field + 'Name'] = that.filterFunction.getDirName(
            col.field,
            that[col.dirName],
            col.code,
            col.label
          )
        })
      })
    },
    setDataChangeSelections () {
      this.selections = this.$refs['tableReference'].getSelections() || []
    },
    getDataChangeTableData () {
      return this.$refs['tableReference'].getTableData() || []
    },
    clearDataChangeSelection () {
      this.$refs['tableReference'].clearSelections()
    },
    experimentData () {
      this.setDataChangeSelections()
      if (this.selections.length == 0) {
        this.showErrorMessage('至少选择一条数据')
        return
      }
      this.multiDataVisible = true
    },
    handleIs_qc_pass (command) {
      this.setDataChangeSelections()
      if (this.selections.length == 0) {
        this.showErrorMessage('至少选择一条数据')
        return
      }
      this.selections.forEach(item => {
        item.qcResult = command
      })
    },
    changeAbnormality () {
      this.setDataChangeSelections()
      if (this.selections.length == 0) {
        this.showErrorMessage('至少选择一条数据')
        return
      }
      this.abnormalityVisible = true
    },
    toChangeData () {
      this.dataChangeStatus = true
    }
  }
}
export default mixinMethod
