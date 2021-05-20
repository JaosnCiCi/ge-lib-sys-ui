const ExportJsonExcel = require('js-export-excel')
var mixinMethod = {
  methods: {
    exportCSV(fileName, tableHeader = [], row = [], tableData = []) {
      var option = {}
      option.fileName = fileName || 'excel'
      option.datas = []
      var sheetObj = {}
      sheetObj.sheetHeader = tableHeader
      sheetObj.sheetData = []
      tableData.map(td => {
        var sheetDataObj = []
        row.map(r => {
          sheetDataObj.push(td[r] || '')
        })
        sheetObj.sheetData.push(sheetDataObj)
      })
      var toExcel = new ExportJsonExcel(option) // new
      toExcel.saveExcel() // 保存
    }
  }
}
export default mixinMethod
