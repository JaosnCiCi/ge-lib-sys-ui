
var mixinMethod = {
  data () {
    return {
      // 正整数，不可为0
      regPositiveInteger: /^[1-9]\d*$/,
      // 正整数包括0
      regPositiveIntegerAnd0: /^([1-9]\d*|0)$/,
      // 正数字，小数
      regPositiveFloatNumber: /^(0|[1-9]\d*).\d+$/

    }
  },
  methods: {
    // 正整数，不可为0
    testRegPositiveInteger (val) {
      val = val + ''
      return this.regPositiveInteger.test(val)
    },
    // 正整数，包括0
    testRegPositiveAnd0 (val) {
      val = val + ''
      return this.regPositiveIntegerAnd0.test(val)
    },
    // 正数数字，包括0
    testRegPositiveNumber (val) {
      val = val + ''
      return this.regPositiveIntegerAnd0.test(val) || this.regPositiveFloatNumber.test(val)
    },
    testNumber (val) {
      return !this.emptyString(val) && (!isNaN(val))
    }
  }
}
export default mixinMethod
