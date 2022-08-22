<template>
  <div>
    <!-- 样本分管 下一步 -->
    <el-dialog
      v-dialogDrag
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      title="样本分管"
      center
    >
      <el-row style="display:flex">
        <el-col :span="3" :offset="1" v-if="step !== 'expPooling'">
          <el-dropdown @command="handlesample_workflow">
            <el-button type="primary" class="border_size" size="mini">
              最后步骤
              <i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="item in sample_workflow"
                :key="item.code"
                :command="item.code"
                :disabled="item.isValid == '0'"
                >{{ item.nameCn }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
        <el-col :span="3" style="marginLeft: 14px">
          <el-button
            type="primary"
            class="border_size"
            size="mini"
            @click="openProjectDialog"
            >修改项目信息</el-button
          >
        </el-col>
      </el-row>
      <div style="margin-top:20px" />
      <!-- table -->
      <el-row>
        <vxe-table
          ref="process"
          :data="dividedNextTableData"
          :edit-config="{
            trigger: 'click',
            autoselect: true,
            mode: 'cell',
            activeMethod: activeMethod,
            showIcon: false,
          }"
          :checkbox-config="{
            checkMethod: selectableRow,
            trigger: 'row',
            highlight: true,
            range: true,
          }"
          :keyboard-config="{
            isClip: true,
            isFNR: true,
            isArrow: true,
            isDel: true,
            isEnter: true,
            isTab: true,
            isEdit: true,
            editMethod: editMethod,
          }"
          :scroll-x="{ gt: 20 }"
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
          @checkbox-range-change="handleSelectionChange"
        >
          <vxe-table-column type="checkbox" align="center" width="55" />
          <vxe-table-column
            field="sampleIdLab"
            title="实验室号"
            align="center"
            sortable
          />
          <vxe-table-column
            field="sampleTypeName"
            title="样本类型"
            align="center"
          />
          <vxe-table-column
            v-if="step == 'expExtraction'"
            :edit-render="{
              name: '$select',
              options: is_ultrafrac,
              optionProps: { value: 'code', label: 'nameCn' },
            }"
            field="isTwiceCfDna"
            title="是否生成二次洗脱提取产物*"
            align="center"
            header-class-name="column_header_edit"
          >
            <template slot-scope="scope">{{
              scope.row.isTwiceCfDna | getDirName(is_ultrafrac)
            }}</template>
            <template v-slot:edit="scope">
              <vxe-select v-model="scope.row.isTwiceCfDna" placeholder="请选择">
                <vxe-option
                  v-for="item in is_ultrafrac"
                  :key="item.code"
                  :label="item.nameCn"
                  :value="item.code"
                  :disabled="item.isValid == '0'"
                />
              </vxe-select>
            </template>
          </vxe-table-column>
          <vxe-table-column
            :edit-render="{
              name: '$select',
              options: sample_workflow,
              optionProps: { value: 'value', label: 'label' },
            }"
            field="lastStep"
            title="最后步骤*"
            align="center"
            header-class-name="column_header_edit"
          >
            <template slot-scope="scope">{{
              scope.row.lastStep | getDirName(sample_workflow_step)
            }}</template>
            <template v-slot:edit="scope">
              <vxe-select
                v-if="
                  scope.row.isUltrafrac == '1' || scope.row.isUltrafrac == null
                "
                v-model="scope.row.lastStep"
                placeholder="最后步骤"
                @change="changeLastStep(scope.row)"
              >
                <vxe-option
                  v-for="item in sample_workflow1"
                  :key="item.code"
                  :label="item.nameCn"
                  :value="item.code"
                  :disabled="item.isValid == '0'"
                />
              </vxe-select>
              <vxe-select
                v-else
                v-model="scope.row.lastStep"
                placeholder="最后步骤"
                @change="changeLastStep(scope.row)"
              >
                <vxe-option
                  v-for="item in sample_workflow"
                  :key="item.code"
                  :label="item.nameCn"
                  :value="item.code"
                  :disabled="item.isValid == '0'"
                />
              </vxe-select>
            </template>
          </vxe-table-column>

          <vxe-table-column
            v-if="step == 'expExtraction'"
            :edit-render="{}"
            field="libconstructionType"
            title="建库类型"
            align="center"
            header-class-name="column_header_edit"
          >
            <template slot-scope="scope">{{
              scope.row.libconstructionType | getDirName(libconstruction_type)
            }}</template>
            <template v-slot:edit="scope">
              <vxe-select
                v-model="scope.row.libconstructionType"
                placeholder="请选择"
              >
                <vxe-option
                  v-for="item in libconstruction_type"
                  :key="item.code"
                  :label="item.nameCn"
                  :value="item.code"
                  :disabled="item.isValid == '0'"
                />
              </vxe-select>
            </template>
          </vxe-table-column>
          <vxe-table-column
            v-if="step == 'expExtraction' || step == 'expLibconstruction'"
            :edit-render="{
              name: '$input',
              autoselect: true,
              immediate: true,
              props: {
                type: 'number',
                clearable: true,
                maxlength: '300',
                controls: false,
              },
            }"
            field="preinstallThroughput"
            label="预设通量"
            header-class-name="column_header_edit"
            align="center"
          />
          <vxe-table-column
            v-if="step == 'expExtraction' || step == 'expLibconstruction'"
            :edit-render="{}"
            field="throughputUnit"
            label="通量单位"
            header-class-name="column_header_edit"
            align="center"
          >
            <template slot-scope="scope">{{
              scope.row.throughputUnit | getDirName(throughput_unit)
            }}</template>
            <template v-slot:edit="scope">
              <vxe-select
                v-model="scope.row.throughputUnit"
                placeholder="请选择"
              >
                <vxe-option
                  v-for="item in throughput_unit"
                  :key="item.code"
                  :label="item.nameCn"
                  :value="item.code"
                  :disabled="item.isValid == '0'"
                />
              </vxe-select>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="originProject"
            title="原项目信息"
            align="center"
          />
          <vxe-table-column
            field="newProject"
            title="分管后项目信息"
            align="center"
          />
          <vxe-table-column
            field="orderCode"
            title="订单号"
            align="center"
            sortable
          />
          <vxe-table-column
            field="orderProjectListStr"
            title="订单项目"
            align="center"
          />
        </vxe-table>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sureDialogDividedNext"
          >确定</el-button
        >
      </span>
    </el-dialog>
    <select-project
      v-if="showProject"
      :visible="showProject"
      :list="selectProjectList"
      @save="saveProject"
      @handelClosed="showProject = false"
    />
  </div>
</template>

<script>
import { values } from 'xe-utils/methods'
import { createNamespacedHelpers } from 'vuex'
const {
  mapState: mapStateU,
  mapActions: mapActionsU,
} = createNamespacedHelpers('difeiUtil')
import batchEntity from '../../../mixins/batchEntity'
import selectProject from './dialogSelectProject'
export default {
  mixins: [batchEntity],
  props: {
    dividedNextTableData: {
      type: Array,
      default: function() {
        return []
      },
    },
    step: {
      type: String,
      default: function() {
        return ''
      },
    },
    entity: {
      type: Object,
      default: function() {
        return {}
      },
    },
    taskType: {
      type: String,
      default: function() {
        return ''
      },
    },
  },
  components: { selectProject },
  data() {
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
      editColumn: ['vitroNumber'],
      query: {
        vitroNumber: '',
      },
      rules: {
        vitroNumber: [
          {
            validator: validatePass,
            message: '请填写50以内的正整数',
            trigger: 'blur',
          },
        ],
      },
      selection: [],
      rowList: ['expLibconstruction'],
      showProject: false,
      selectProjectList: [],
    }
  },
  created() {
    var baseArr = [
      'sample_workflow_step',
      'is_ultrafrac',
      'libconstruction_type',
      'throughput_unit',
    ]
    baseArr.map((item) => {
      this.getBasicDir(item)
    })
  },
  computed: {
    ...mapStateU([
      'is_ultrafrac',
      'sample_workflow_step',
      'libconstruction_type',
      'throughput_unit',
    ]),
    sample_workflow: function() {
      var arr = []
      if (this.step == 'expExtraction') {
        var arr1 = ['核酸提取', '文库构建', '上机']
      } else if (this.step == 'expUltrafrac') {
        var arr1 = ['文库构建', '上机']
      } else if (this.step == 'expLibconstruction') {
        var arr1 = ['文库构建', '上机']
      } else if (this.step == 'expPooling') {
        var arr1 = ['上机']
      } else if (this.step == 'expLibquant') {
        var arr1 = ['上机']
      } else if (this.step == 'expSequencing') {
        var arr1 = ['上机']
      }
      this.sample_workflow_step.forEach((item) => {
        if (arr1.indexOf(item.nameCn) !== -1) {
          arr.push(item)
        }
      })
      return arr
    },
    sample_workflow1: function() {
      var arr = []
      if (this.step == 'expExtraction') {
        var arr1 = ['核酸提取', '文库构建', '上机']
      } else if (this.step == 'expUltrafrac') {
        var arr1 = ['文库构建', '上机']
      } else if (this.step == 'expLibconstruction') {
        var arr1 = ['文库构建', '上机']
      } else if (this.step == 'expPooling') {
        var arr1 = ['上机']
      }
      this.sample_workflow_step.forEach((item) => {
        if (arr1.indexOf(item.nameCn) !== -1) {
          arr.push(item)
        }
      })
      return arr
    },
  },
  methods: {
    ...mapActionsU(['getBasicDir', 'separteFromItemTable']),
    doAfterShow() {
      console.log(this.sample_workflow1)
    },
    batch() {
      if (this.selection.length == 0) {
        this.$message({
          type: 'error',
          message: '请至少选择一条数据',
        })
        return
      }
      this.$refs.vitroNumber.validate((valid) => {
        if (valid) {
          this.selection.map((element) => {
            console.log(this.query.vitroNumber)
            element.vitroNumber = this.query.vitroNumber
          })
          this.query.vitroNumber = ''
          this.updateTable()
        } else {
          this.$message({
            type: 'error',
            message: '请填写50以内的正整数',
          })
        }
      })
    },
    tableCellClassName({ row, column, rowIndex, columnIndex }) {
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
    updateTable() {
      this.dividedTableData.push({})
      this.dividedTableData.pop()
      this.dividedNextTableData.push({})
      this.dividedNextTableData.pop()
    },
    handleCancel() {
      this.$emit('cancel')
    },
    judgeRules() {
      var error = false
      this.dividedTableData.forEach((element) => {
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
          message: '请填写50以内的正整数',
        })
      }
      return error
    },
    handlesample_workflow(command) {
      if (this.selection.length == 0) {
        this.$message({
          type: 'error',
          message: '请至少选择一条数据',
        })
        return
      }
      if (this.step == 'expExtraction') {
        this.selection.map((item) => {
          item.libconstructionType = ''
          if (command == 'sequencing') {
            item.throughputUnit = '04'
          } else {
            item.throughputUnit = ''
          }
        })
      }
      if (this.step == 'expLibconstruction') {
        this.selection.map((item) => {
          if (command == 'sequencing') {
            item.throughputUnit = '04'
          } else {
            item.throughputUnit = ''
          }
        })
      }
      this.selection.map((item) => {
        item.lastStep = command
        item.preinstallThroughput = ''
      })
    },
    handleIsUltrafrac(command) {
      if (this.selection.length == 0) {
        this.$message({
          type: 'error',
          message: '请至少选择一条数据',
        })
        return
      }
      this.selection.map((item) => {
        item.isUltrafrac = command
        item.lastStep = ''
      })
    },
    handleExpPooling() {
      if (this.judgeRules()) {
        return
      }
      var arr = []
      this.dividedTableData.forEach((item) => {
        item.isUltrafrac = null
        item.lastStep = ''
        for (let index = 0; index < item.vitroNumber; index++) {
          arr.push(JSON.parse(JSON.stringify(item)))
        }
      })
      arr.forEach((item) => {
        item.estimatedSqcTime = item.estimatedSqcTime
          ? this.$moment(item.estimatedSqcTime)
          : ''
      })
      var params = {}
      params.step = this.step
      params.expTaskT = this.entity
      params.sampleList = arr
      console.log(params)
      this.separteFromItemTable(params).then((res) => {
        if (res.status == '2000') {
          this.$message({
            type: 'success',
            message: '样本分管成功',
          })
          this.handleCancel()
          this.$emit('sureDialogDividedNext')
        } else if (res.status == 'LIMSSEP001') {
          this.$message({
            type: 'error',
            message: res.message,
          })
        } else {
          this.$message({
            type: 'error',
            message: '操作失败，请重新再试',
          })
        }
      })
    },
    sureDialogDividedNext() {
      var error = false
      this.dividedNextTableData.forEach((item) => {
        // if (item.isUltrafrac == null || item.isUltrafrac == '') {
        //   this.$set(item, 'isUltrafracError', true)
        //   error = true
        // }
        if (item.lastStep == null || item.lastStep == '') {
          this.$set(item, 'lastStepError', true)
          error = true
        } else {
          this.$set(item, 'lastStepError', false)
        }
        if (this.step == 'expExtraction') {
          if (
            (item.lastStep == 'libconstruction' ||
              item.lastStep == 'sequencing') &&
            (item.libconstructionType == null || item.libconstructionType == '')
          ) {
            this.$set(item, 'libconstructionTypeError', true)
            error = true
          } else {
            this.$set(item, 'libconstructionTypeError', false)
          }
        }
        if (this.step == 'expLibconstruction' || this.step == 'expExtraction') {
          if (item.lastStep == 'sequencing') {
            if (item.preinstallThroughput !== '') {
              if (item.preinstallThroughput >= 0) {
                this.$set(item, 'preinstallThroughputError', false)
              } else {
                this.$set(item, 'preinstallThroughputError', true)
                error = true
              }
            } else {
              this.$set(item, 'preinstallThroughputError', false)
            }
          }
        }
      })
      if (error) {
        this.updateTable()
        this.$message({
          type: 'error',
          message: '请完善页面信息',
        })
        return
      }
      var params = {}
      params.step = this.step
      params.expTaskT = this.entity
      params.sampleList = this.dividedNextTableData
      params.sampleList.forEach((item) => {
        item.isUltrafrac = '0'
        item.isMpcr = '0'
      })
      console.log(params)
      this.separteFromItemTable(params).then((res) => {
        if (res.status == '2000') {
          this.$message({
            type: 'success',
            message: '样本分管成功',
          })
          this.handleCancel()
          this.dialogVisible = false
          if (this.taskType == '') {
            this.$emit('sureDialogDividedNext')
          } else {
            this.$emit('sureDialogDividedNextTcr')
          }
        } else if (res.status == 'LIMSSEP001') {
          this.$message({
            type: 'error',
            message: '不可对接样分出来的样本再分管',
          })
        } else {
          this.$message({
            type: 'error',
            message: '操作失败，请重新再试',
          })
        }
      })
    },
    changeIsUltrafrac(val, row) {
      row.lastStep = ''
    },
    // 是否可以编辑
    activeMethod({ row, rowIndex, column, columnIndex }) {
      if (column.property == 'isTwiceCfDna' && row.typeCode !== 'P') {
        return false
      }
      if (this.step == 'expExtraction') {
        if (
          column.property == 'libconstructionType' &&
          row.lastStep !== 'libconstruction' &&
          row.lastStep !== 'sequencing'
        ) {
          return false
        }
        if (
          (column.property == 'throughputUnit' ||
            column.property == 'preinstallThroughput') &&
          row.lastStep !== 'sequencing'
        ) {
          return false
        }
      }
      if (this.step == 'expLibconstruction') {
        if (
          (column.property == 'throughputUnit' ||
            column.property == 'preinstallThroughput') &&
          row.lastStep !== 'sequencing'
        ) {
          return false
        }
      }
      // if (column.property == 'isUltrafrac' && this.step == 'expUltrafrac') {
      //   return false
      // }
      return true
    },
    changeLastStep(row) {
      console.log(row)
      if (this.step == 'expExtraction') {
        row.libconstructionType = ''
      }
      row.preinstallThroughput = ''
      if (row.lastStep == 'sequencing') {
        row.throughputUnit = '04'
      } else {
        row.throughputUnit = ''
      }
    },
    openProjectDialog() {
      if (this.selection.length == 0) {
        this.$message({
          type: 'error',
          message: '请至少选择一条数据',
        })
        return
      }
      // 如果用户选中的样本属于超过一个订单，则提示“不同订单的样本无法批量修改项目信息，请确保选中的样本属于相同的订单。”
      const orderList = []
      this.selection.map((item) => {
        if (item.orderCode && orderList.indexOf(item.orderCode) === -1) {
          orderList.push(item.orderCode)
        }
      })
      if (orderList.length > 1) {
        this.$message.error(
          '不同订单的样本无法批量修改项目信息，请确保选中的样本属于相同的订单。'
        )
        return
      }
      this.selectProjectList = this.selection[0].orderProjectListStr
        .split(',')
        .map((projectId) => {
          return {
            projectId,
          }
        })
      this.showProject = true
    },
    saveProject(projectArr) {
      const str = projectArr
        .map((project) => {
          return project.projectId
        })
        .join(',')
      this.selection.map((item) => {
        item.newProject = str
        item.basProjectInfoTList = projectArr
      })
      this.showProject = false
    },
  },
}
</script>

<style>
.errCell {
  border: 1px solid #e6686e !important;
  margin: 0px 0px -1px -1px;
}
</style>
