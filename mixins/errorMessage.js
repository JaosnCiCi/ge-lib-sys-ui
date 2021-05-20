var mixinMethod = {
  methods: {
    showErrorMessage (message) {
      this.$message({
        message: message,
        type: 'error'
      })
    },
    showSuccessMessage (message) {
      this.$message({
        message: message,
        type: 'success'
      })
    },
    showSuccessResult (res, message) {
      if (res.status == '2000') {
        this.$message({
          message: message,
          type: 'success'
        })
        return true
      }
      return false
    },
    showErrorMessageImport (res) {
      if (['DVS50001', 'DVS50002', 'DVS50003',
        'DVS5000A', 'DVS5000D', 'DVS5000G', 'DVS5000H',
        'DVS5000I', 'DVS5000K', 'DVS5000L', 'DVS5000M', 'DVS5000N', 'DVS5000Q', 'DVS5000R',
        'DVS5000S', 'DVS5000T', 'DVS5000W', 'DVS50005'].includes(res.status)) {
        this.showErrorMessage(res.message)
      } else {
        this.showErrorMessage('上传失败，请重试')
      }
    },
    showErrorMessageDefault (errCode) {
      var errorMessage = ''
      switch (errCode) {
        case 'DVS50001': errorMessage = '部分样本无默认建库类型，请手动选择填入'; break
        case 'DVS50002': errorMessage = '只对建库节点有效。用户在选择一个或多个建库节点样本时此按钮可点击'; break
        // case '': errorMessage ="以下样本之前已完成过审核并加入主数据，无法删除"
        default: '操作失败'
      }
      this.showErrorMessage(errorMessage)
    },
    showErrorMessageBox (res, params = {
      arr: [],
      colName: 'samplePkgAmtError'
    }) {
      var arr = params.arr
      var colName = params.colName
      var checked = true
      if (res.status === 'LIMSBOX101') {
        this.$message({
          message: '盒内位置重复',
          type: 'error'
        })
        checked = false
      }
      if (res.status === 'LIMSBOX102') {
        this.$message({
          message: '当前入库的部分样本包装量之和大于选中的样本盒剩余孔位数量，请核实后再提交。' + res.message.replace('[', '').replace(']', ''),
          type: 'error'
        })
        checked = false
      }
      if (res.status === 'LIMSBOX103') {
        this.$message({
          message: '当前入库的部分样本包装量之和大于选中的样本盒剩余孔位数量，请核实后再提交。',
          type: 'error'
        })
        checked = false
      }
      if (res.status === 'LIMSSAM004') {
        this.$message({
          message: '样本正在处理中',
          type: 'error'
        })
        checked = false
      }
      if (res.status === 'LIMSPAT002') {
        this.$message({
          message: '以下样本配置有病理任务，请先删除病理任务后再做入库操作。' + res.message.replace('[', '').replace(']', ''),
          type: 'error'
        })
        checked = false
      }
      if (res.status === 'LIMSLSR011') {
        this.$message({
          message: '以下样本之前已完成过审核并加入主数据，无法删除：' + res.message.replace('[', '').replace(']', ''),
          type: 'error'
        })
        checked = false
      }
      if (res.status === 'DVS5002') {
        this.$message({
          message: '操作失败,请刷新重试',
          type: 'error'
        })
        checked = false
      }
      if (!checked) {
        arr.map(item => {
          if (res.message.indexOf(item.sampleIdLims) > -1) {
            item[colName] = true
          }
        })
        this.updateTable()
      }
      return checked
    },
    showSrError (res) {
      if (res.status == 'Lims50002') {
        return true
      }
      return false
    },
    showSaveErrResult (res) {
      if (res.status == 'CE50002') {
        var str = '以下样本已被其他实验单选中：' + res.entity + '无法添加到本任务单中，请检查'
        this.$confirm(str)
        return
      }
      this.$message({
        type: 'error',
        message: '操作失败，请重新再试'
      })
    }
  }
}
export default mixinMethod
