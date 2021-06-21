import Vue from 'vue'
import listError from './listError/index'
import dataChangeReason from './dataChangeReason/index'
const components = [listError, dataChangeReason]
const install = function (Vue, opts = {}) {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}
/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
export default {
  listError,
  dataChangeReason,
  install
}
