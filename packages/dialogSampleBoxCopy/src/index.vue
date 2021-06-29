<template>
  <div>
    <el-dialog
      v-dialogDrag
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :title="title"
      center
      @close="cancel"
    >
      <div class="dialog-body">
        <h3>{{ subTitle }}</h3>
        <el-input
          v-model="textareaValue"
          :autosize="{ minRows: 10,maxRows: 10,maxRows: 10 }"
          type="textarea"
          placeholder="请输入内容"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="handleBack">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog v-dialogDrag :visible.sync="unMatchLimsIdDialogVisible" title="提示" center>
      <div>以下LIMS号未被匹配到，请核实后重新录入</div>
      <div style="display: flex;flex-wrap: wrap;justify-content: center;">
        <span v-for="item in unMatchLimsId" :key="item" style="margin:15px">{{ item }}</span>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="unMatchLimsIdDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapActions } = createNamespacedHelpers('sampleBox')
import batchEntity from '../../../mixins/batchEntity'
var _ = require('loadsh')
export default {
  name: 'PositionBoxCopy',
  mixins: [batchEntity],
  props: {
    title: {
      type: String,
      default: () => {
        return ''
      }
    },
    subTitle: {
      type: String,
      default: () => {
        return ''
      }
    },
    rows: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      textareaValue: '',
      unMatchLimsId: [],
      unMatchLimsIdDialogVisible: false
    }
  },
  watch: {
    unMatchLimsId (val, oldVal) {
      if (oldVal.length !== 0 && val.length == 0) {
        this.$message({ type: 'success', message: '录入成功' })
      }
      if (val.length !== 0) {
        this.$set(this, 'unMatchLimsIdDialogVisible', true)
      }
    }
  },
  created () { },
  methods: {
    ...mapActions([
      'getBoxList'
    ]),
    doAfterShow() {
      this.textareaValue = ''
    },
    handleBack () {
      if (this.textareaValue.length == 0) {
        this.$message({
          type: 'error',
          message: '请录入样本盒'
        })
        return
      }
      var val = this.textareaValue
      val = val.replace(/\n/g, '*')
      val = val.replace(/\t/g, '$')
      var arr = val.split('*')
      // 在多一个回车的情况下，会出现一个空字段，做特殊处理
      arr = arr.filter(x => {
        return x !== ''
      })
      var arr1 = []
      arr.map(x => {
        var xs = x.split('$')
        var obj = { limsID: xs[0], boxName: xs[1] }
        arr1.push(obj)
      })
      arr1 = _.uniqWith(arr1, (arrVal, othVal) => {
        return arrVal.limsID === othVal.limsID
      })
      console.log(arr1)
      this.unMatchLimsId = []
      arr1.forEach(element => {
        var params = { 'storageName': '', 'drawerNo': '', 'positionInDrawer': '', 'boxName': element.boxName, 'storageType': '00', 'pageSize': 10, 'pageIndex': 1, 'order': 'desc' }
        this.getBoxList(params).then(res => {
          if (res.status == '2000') {
            element.storageId = res.list.length !== 0 ? res.list[0].storageId : ''
            element.storageName = res.list.length !== 0 ? res.list[0].storageName : ''
            element.boxId = res.list.length !== 0 ? res.list[0].boxId : ''
            element.boxName = res.list.length !== 0 ? res.list[0].boxName : ''
            var row = this.rows.filter(item => {
              return item.sampleIdLims == element.limsID
            })
            if (row.length > 0) {
              row[0].storageId = element.storageId
              row[0].storageName = element.storageName
              row[0].boxId = element.boxId
              row[0].boxName = element.boxName
              row[0].positionInBox = ''
            } else {
              this.unMatchLimsId.push(element.limsID)
            }
          }
        })
      })

      this.$emit('handelCancel')
      this.$set(this, 'dialogVisible', false)
    },
    cancel () {
      this.$emit('handelCancel')
    }
  }
}
</script>
<style scoped>
.dialog-body {
  margin-left: 2rem;
  margin-right: 2rem;
}
</style>
