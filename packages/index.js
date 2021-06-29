import listError from './listError/index'
import dataChangeReason from './dataChangeReason/index'
import checkStorageDialog from './checkStorageDialog/index'
import dividedDialog from './dividedDialog/index'
import parOptDialog from './parOptDialog/index'
const components = [listError, dataChangeReason, checkStorageDialog, dividedDialog, parOptDialog]
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
