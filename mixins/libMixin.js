
var mixinMethod = {
  methods: {
    // 检查是否生成浓度调整后结果
    checkUnSubmit () {
      if (this.checkMustSelect()) {
        var arr = this.selection.filter(item => {
          return item.isAdjusted == '01'
        })
        if (arr.length != 0) {
          this.$set(this, 'isAdjustedError', true)
          return false
        }
      }
      return false
    }
  }
}
export default mixinMethod
