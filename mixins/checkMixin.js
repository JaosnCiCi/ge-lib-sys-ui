
var mixinMethod = {
  methods: {
    // 至少选择一条数据
    checkMustSelect () {
      if (!this.selection || this.selection.length == 0) {
        this.showErrorMessage('请至少选择一条数据')
        return false
      }
      return true
    },
    checkedList () {
      var chain = []
      return {
        add: function (callBack, params) {
          chain.push({ callBack: callBack, params: params })
        },
        verification: (params) => {
          for (let i = 0; i < chain.length; i++) {
            var result = chain[i](params)
            if (result) {
              continue
            } else {
              return result
            }
          }
        }
      }
    }
  }
}
export default mixinMethod
