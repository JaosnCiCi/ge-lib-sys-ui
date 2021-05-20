
var mixinMethod = {
  props: {
    visible: {
      type: Boolean,
      default: () => {
        return false
      }
    }
  },
  data () {
    return {
      dialogVisible: false
    }
  },
  watch: {
    visible (val) {
      if (val == true) {
        this.$set(this, 'dialogVisible', true)
        if (typeof this.doAfterShow === 'function') {
          this.doAfterShow()
        }
      }
    },
    dialogVisible (val) {
      if (val == false) {
        this.$emit('update:visible', false)
        if (typeof this.doBeforeHidden === 'function') {
          this.doBeforeHidden()
        }
      }
    }
  },
  methods: {
    onSearch (query = {}, params = {}) {

    }
  }
}
export default mixinMethod
