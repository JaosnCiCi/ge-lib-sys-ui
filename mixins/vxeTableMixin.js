/**
 *
 */
var mixinMethod = {
  methods: {
    // 是否可以编辑
    activeMethod ({
      row,
      rowIndex,
      column,
      columnIndex
    }) {
      const columnList = []
      if (columnList.includes(column.property)) {
        if (row.isSubmit != '1') {
          return true
        }
        return false
      }
      return true
    },
    // 是否可以勾选
    checkMethod ({
      row
    }) {
      return true
    },
    // 勾择改变
    handleSelectionChange (data) {
      this.selection = data.records
    },
    // 单元格样式
    tableCellClassName ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex }) {
      var isDisable = false
      const columnList = []
      if (columnList.includes(column.property)) {
        if (row.isSubmit == '1') {
          isDisable = true
        }
      }
      const classNameCell = isDisable ? 'disableCell' : ''
      if (column.property) {
        var item = column.property + 'Error'
        if (row[item] == true) {
          return classNameCell + ' errCell'
        } else {
          row[item] == false
        }

        return classNameCell
      }
      return classNameCell
    }
  }
}
export default mixinMethod
