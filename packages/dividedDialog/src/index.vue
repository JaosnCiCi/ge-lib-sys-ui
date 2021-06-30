<template>
  <div>
    <!-- 样本分管 -->
    <el-dialog
      v-dialogDrag
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      title="样本分管"
      width="70%"
      center
      @close="handleCancel"
    >
      <!-- button -->
      <el-form
        ref="vitroNumber"
        :model="query"
        :rules="rules"
        label-position="right"
        label-width="0px"
      >
        <el-row>
          <el-col :span="10" :offset="10">
            <el-form-item prop="vitroNumber">
              <el-input v-model.trim="query.vitroNumber" size="small">
                <template slot="prepend">分管数量*</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="3" :offset="1">
            <el-button type="primary" size="small" @click="batch">批量填入</el-button>
          </el-col>
        </el-row>
      </el-form>

      <div style="margin-top:20px" />
      <!-- table -->
      <el-row>
        <vxe-table
          ref="process"
          :data="dividedTableData"
          :edit-config="{
            trigger: 'click',
            autoselect: true,
            mode: 'cell',
            activeMethod: activeMethod,
            showIcon: false
          }"
          :sort-config="{ sortMethod: handleSortChange,remote:true }"
          :checkbox-config="{ checkMethod: selectableRow ,trigger: 'row', highlight: true, range: true}"
          :keyboard-config="{
            isClip: true,
            isFNR: true,
            isArrow: true,
            isDel: true,
            isEnter: true,
            isTab: true,
            isEdit: true,
            editMethod: editMethod
          }"
          :scroll-x="{ gt: 10 }"
          :scroll-y="{ gt: 30 }"
          :cell-class-name="tableCellClassName"
          header-row-class-name="height_50"
          row-class-name="height_50"
          highlight-current-row
          height="600"
          border
          resizable
          @checkbox-change="handleSelectionChange"
          @checkbox-all="handleSelectionChange"
          @sort-change="handleSortChange"
          @checkbox-range-change="handleSelectionChange"
        >
          <vxe-table-column type="checkbox" field="select" align="center" fixed="left" width="55" />
          <vxe-table-column
            v-if="step == 'expSequencing'"
            field="sampleIdLims"
            title="LIMS号"
            align="center"
          />
          <vxe-table-column
            v-if="step !== 'expLibquant'"
            field="sampleIdLab"
            title="实验室号"
            align="center"
          />
          <vxe-table-column
            v-if="step == 'expLibquant'"
            field="poolingName"
            title="富集名称"
            align="center"
          />
          <vxe-table-column
            v-if="step !== 'expSequencing'"
            field="sampleTypeName"
            title="样本类型"
            align="center"
          />
          <vxe-table-column
            :edit-render="{ name: '$input', autoselect:true,immediate: true,attrs: { type: 'text', maxlength: '300' }}"
            field="vitroNumber"
            title="分管数量*"
            align="center"
            header-class-name="column_header_edit"
          />
        </vxe-table>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button
          v-if="
            step == 'expPooling' ||
              step == 'expLibquant' ||
              step == 'expSequencing'
          "
          type="primary"
          @click="handleExpPooling"
        >确 定</el-button>
        <el-button v-else type="primary" @click="handleDividedNext">下一步</el-button>
      </span>
    </el-dialog>
    <!-- 样本分管 下一步 -->
    <v-dividedNextDialog
      :visible.sync="dialogDividedNextVisible"
      :entity="entity"
      :step="step"
      :task-type="taskType"
      :divided-next-table-data="dividedNextTableData"
      @sureDialogDividedNext="sureDialogDividedNext"
      @sureDialogDividedNextTcr="sureDialogDividedNextTcr"
      @cancel="dialogDividedNextVisible = false"
    />
  </div>
</template>
<script>
import { createNamespacedHelpers } from 'vuex'
const {
  mapState: mapStateU,
  mapActions: mapActionsU
} = createNamespacedHelpers('difeiUtil')
import batchEntity from '../../../mixins/batchEntity'
import dividedNextDialog from './dividedNextDialog'
export default {
  name: 'GeDividedDialog',
  components: {
    'v-dividedNextDialog': dividedNextDialog
  },
  mixins: [batchEntity],
  props: {
    row: {
      type: Array,
      default: function () {
        return []
      }
    },
    step: {
      type: String,
      default: function () {
        return ''
      }
    },
    entity: {
      type: Object,
      default: function () {
        return {}
      }
    },
    taskType: {
      type: String,
      default: function () {
        return ''
      }
    }
  },
  data () {
    var validatePass = (rule, value, callback) => {
      var reg = /^[1-9]*[0-9][0-9]*$/
      if (!reg.test(value)) {
        callback(new Error('请填写50以内的正整数'))
      } else {
        if (value > 50) {
          callback(new Error('请填写50以内的正整数'))
        } else {
          callback()
        }
      }
    }
    return {
      dividedTableData: [],
      dialogDividedNextVisible: false,
      editColumn: ['vitroNumber'],
      dividedNextTableData: [],
      query: {
        vitroNumber: ''
      },
      rules: {
        vitroNumber: [
          {
            validator: validatePass,
            message: '请填写50以内的正整数',
            trigger: 'blur'
          }
        ]
      },
      selection: [],
      rowList: ['expUltrafrac', 'expLibconstruction']
    }
  },
  created () {
    var baseArr = ['sample_workflow_step', 'is_ultrafrac']
    baseArr.map(item => {
      this.getBasicDir(item)
    })
  },
  computed: {
    ...mapStateU(['is_ultrafrac', 'sample_workflow_step']),
    sample_workflow: function () {
      var arr1 = []
      switch (this.step) {
        case 'expExtraction':arr1 = ['核酸提取', '文库构建', '上机']; break
        case 'expUltrafrac':
        case 'expLibconstruction':arr1 = ['文库构建', '上机']; break
        case 'expPooling':
        case 'expLibquant':
        case 'expSequencing':arr1 = ['上机']; break
      }
      return this.sample_workflow_step.filter(item => {
         return arr1.indexOf(item.nameCn) > -1
      })
    },
    sample_workflow1: function () {
      var arr1 = []
      switch (this.step) {
        case 'expExtraction':arr1 = ['核酸提取', '文库构建', '上机']; break
        case 'expUltrafrac':
        case 'expLibconstruction':arr1 = ['文库构建', '上机']; break
      }
      return this.sample_workflow_step.filter(item => {
         return arr1.indexOf(item.nameCn) > -1
      })
    }
  },
  methods: {
    ...mapActionsU(['getBasicDir', 'separteFromItemTable']),
    doAfterShow() {
      this.dividedTableData = this.row
       this.selection = []
      if (this.$refs.process && this.$refs.process.clearCheckboxRow instanceof Object) {
          this.$refs.process.clearCheckboxRow()
      }
      this.dividedTableData.map(item => {
        item.vitroNumber = '1'
      })
      this.query.vitroNumber = ''
      if (this.taskType == 'TCR') {
        this.handleDividedNext()
      }
    },
    batch () {
      if (this.selection.length == 0) {
        this.$message({
          type: 'error',
          message: '请至少选择一条数据'
        })
        return
      }
      this.$refs.vitroNumber.validate(valid => {
        if (valid) {
          this.selection.map(element => {
            console.log(this.query.vitroNumber)
            element.vitroNumber = this.query.vitroNumber
          })
          this.query.vitroNumber = ''
          this.updateTable()
        } else {
          this.$message({
            type: 'error',
            message: '请填写50以内的正整数'
          })
        }
      })
    },
    tableCellClassName ({ row, column, rowIndex, columnIndex }) {
      if (column.property) {
        var item = column.property + 'Error'
        if (row[item] == true) {
          return 'errCell'
        } else {
          row[item] == false
        }
        return ''
      }
      return ''
    },
    updateTable () {
      this.dividedTableData.push({})
      this.dividedTableData.pop()
      this.dividedNextTableData.push({})
      this.dividedNextTableData.pop()
    },
    handleCancel () {
      this.$emit('cancel')
      this.dialogVisible = false
      // this.dialogDividedNextVisible = false
    },
    judgeRules () {
      var error = false
      this.dividedTableData.forEach(element => {
        element.vitroNumberError = false
        var reg = /^\+?[1-9][0-9]*$/
        if (!reg.test(element.vitroNumber)) {
          element.vitroNumberError = true
          error = true
        } else {
          if (element.vitroNumber > 50) {
            element.vitroNumberError = true
            error = true
          } else {
            element.vitroNumberError = false
          }
        }
      })
      if (error) {
        this.updateTable()
        this.$message({
          type: 'error',
          message: '请填写50以内的正整数'
        })
      }
      return error
    },
    handleDividedNext () {
      if (this.judgeRules()) {
        return
      }
      this.handleCancel()
      this.dialogDividedNextVisible = true
      this.selection = []
      var arr = []
      this.dividedTableData.forEach(item => {
        item.isUltrafrac = null
        item.lastStep = ''
        for (let index = 0; index < item.vitroNumber; index++) {
          arr.push(JSON.parse(JSON.stringify(item)))
        }
      })
      if (this.step == 'expUltrafrac') {
        arr.forEach(item => {
          item.isUltrafrac = '1'
        })
      }
      if (this.step == 'expLibconstruction') {
        arr.forEach(item => {
          if (item.sampleIdLims.slice(-4, -3) == 'B') {
            item.isUltrafrac = '0'
          } else {
            item.isUltrafrac = '1'
          }
        })
      }
      if (this.step == 'expExtraction') {
        arr.forEach(item => {
          if (item.typeCode !== 'P') {
            item.isTwiceCfDna = ''
          } else {
            item.isTwiceCfDna = '1'
          }
        })
      }
      this.dividedNextTableData = arr
    },
    handlesample_workflow (command) {
      if (this.selection.length == 0) {
        this.$message({
          type: 'error',
          message: '请至少选择一条数据'
        })
        return
      }
      this.selection.map(item => {
        if (item.isUltrafrac == '1') {
          item.lastStep = command
        } else if (item.isUltrafrac == '0' && command !== 'ultrafrac') {
          item.lastStep = command
        }
      })
    },
    handleIsUltrafrac (command) {
      if (this.selection.length == 0) {
        this.$message({
          type: 'error',
          message: '请至少选择一条数据'
        })
        return
      }
      this.selection.map(item => {
        item.isUltrafrac = command
        if (command == '0') {
          item.lastStep = ''
        }
      })
    },
    handleExpPooling () {
      if (this.judgeRules()) {
        return
      }
      var arr = []
      this.dividedTableData.forEach(item => {
        item.isUltrafrac = null
        item.lastStep = ''
        for (let index = 0; index < item.vitroNumber; index++) {
          arr.push(JSON.parse(JSON.stringify(item)))
        }
      })
      arr.forEach(item => {
        item.estimatedSqcTime = item.estimatedSqcTime
          ? this.$moment(item.estimatedSqcTime)
          : ''
      })
      var params = {}
      params.step = this.step
      params.expTaskT = this.entity
      params.sampleList = arr
      console.log(params)
      this.separteFromItemTable(params).then(res => {
        if (res.status == '2000') {
          this.$message({
            type: 'success',
            message: '样本分管成功'
          })
          this.dialogDividedNextVisible = false
          this.handleCancel()
          this.$emit('initialize')
        } else if (res.status == 'LIMSSEP001') {
          this.$message({
            type: 'error',
            message: res.message
          })
        } else {
          this.$message({
            type: 'error',
            message: '操作失败，请重新再试'
          })
        }
      })
    },
    sureDialogDividedNext () {
      this.$emit('initialize')
      return
    },
    sureDialogDividedNextTcr () {
      this.$emit('initializeTcr')
      return
    },
    changeIsUltrafrac (val, row) {
      if (val == '0') {
        row.lastStep = ''
      }
    }
  }
}
</script>

<style>
.errCell {
  border: 1px solid #e6686e !important;
  margin: 0px 0px -1px -1px;
}
</style>
