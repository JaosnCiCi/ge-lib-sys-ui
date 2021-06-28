<template>
  <div>
    <el-dialog
      v-dialogDrag
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :title="title"
      center
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
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleBack()">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog v-dialogDrag :visible.sync="unMatchLimsIdDialogVisible" title="提示">
      <div>以下LIMS号未被匹配到，请核实后重新录入</div>
      <div style="display: flex;flex-wrap: wrap;justify-content: center;">
        <span v-for="item in unMatchLimsId" :key="item" style="margin:15px">
          {{
            item
          }}
        </span>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="unMatchLimsIdDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import batchEntity from '../../../mixins/batchEntity'
export default {
  name: 'GePositionBoxCopy',
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
  methods: {
    doAfterShow() {
      this.textareaValue = ''
    },
    handleBack () {
      if (this.textareaValue.length == 0) {
        this.$message({
          type: 'error',
          message: '请录入盒内位置'
        })
        return
      }
      var val = this.textareaValue
      val = val.replace(/\n/g, '*')
      val = val.replace(/\t/g, '$')
      var arr = val.split('*')
      // 在多一个回车的情况下，会出现一个空字段，做特殊处理
      var arr = arr.filter(x => {
        return x !== ''
      })
      var arr1 = []
      arr.map(x => {
        var xs = x.split('$')
        var obj = { limsID: xs[0], positionInBox: xs[1] }
        arr1.push(obj)
      })
      arr1 = _.uniqWith(arr1, (arrVal, othVal) => {
        return arrVal.limsID === othVal.limsID
      })
      var limsIdUnMatch = []
      arr1.map(x => {
        var row = this.rows.filter(item => {
          return item.sampleIdLims == x.limsID
        })
        console.log(x)
        if (row.length > 0) {
          if (row[0].targetStorageType !== '00') {
            row[0].positionInBox = x.positionInBox
            row[0].positionInTmpBox = x.positionInBox
          }
        } else {
          limsIdUnMatch.push(x.limsID)
        }
      })
      if (limsIdUnMatch.length > 0) {
        this.$set(this, 'unMatchLimsId', limsIdUnMatch)
        this.$set(this, 'unMatchLimsIdDialogVisible', true)
      } else {
        this.$message({ type: 'success', message: '录入成功' })
      }
      this.$emit('handlerConfirm', 'arr1')
      this.$set(this, 'dialogVisible', false)
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
