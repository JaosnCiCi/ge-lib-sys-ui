<template>
  <div>
    <!-- 平行 优化第一步 -->
    <el-dialog
      v-dialogDrag
      v-if="dialogParOpt"
      :visible.sync="dialogParOpt"
      :close-on-click-modal="false"
      :title="projectType == '01' ? '选择平行标记' : '选择优化项目'"
      center
      @close="closeShow"
    >
      <!-- button -->
      <el-row style="display:flex">
        <el-button
          type="primary"
          @click="selectProject"
        >
          {{
            projectType == "01" ? "平行标记" : "优化项目"
          }}
        </el-button>
        <el-button
          type="primary"
          @click="clear"
        >清除所选内容</el-button>
      </el-row>
      <div style="margin-top:20px" />
      <!-- table -->
      <el-row>
        <vxe-table
          ref="process"
          :data="parOptTableData"
          :sort-config="{ defaultSort:{field: 'sampleIdLims', order: 'asc'} }"
          :checkbox-config="projectType == '02' ? { checkMethod: selectableRow ,trigger: 'row', highlight: true, range: true} : {}"
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
          @current-change="handleSelectionChangeType01"
          @checkbox-change="handleSelectionChange"
          @checkbox-all="handleSelectionChange"
          @checkbox-range-change="handleSelectionChange"
        >
          <vxe-table-column
            v-if="projectType == '02'"
            type="checkbox"
            align="center"
            width="55"
          />
          <vxe-table-column
            field="sampleIdLims"
            title="明细表LIMS号"
            align="center"
          />
          <vxe-table-column
            v-if="step == 'libquant'"
            field="poolingName"
            title="富集名称"
            align="center"
          />
          <vxe-table-column
            v-else
            field="sampleIdLab"
            title="实验室号"
            align="center"
          />
          <vxe-table-column
            :title="projectType == '01' ? '平行标记' : '优化项目'"
            field="projectId"
            align="center"
          />
        </vxe-table>
      </el-row>

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="closeShow">取消</el-button>
        <el-button
          type="primary"
          @click="sure"
        >确定</el-button>
      </span>
    </el-dialog>
    <!-- 平行优化项目 下一步 -->
    <el-dialog
      v-dialogDrag
      v-if="dialogParOptSelect"
      :visible.sync="dialogParOptSelect"
      :close-on-click-modal="false"
      :title="projectType == '01' ? '平行标记' : '优化项目'"
      center
    >
      <el-row>
        <el-col :span="projectType == '01'? 17:11">
          <div style="display:flex;">
            <el-input v-model.trim="query">
              <template slot="prepend">项目编号</template>
            </el-input>
            <el-button
              type="primary"
              style="z-index:999"
              @click="searchProject"
            >搜索</el-button>
            <div style="padding-left:10px;display:flex;align-items:center">
              <el-checkbox
                v-model="autoSet"
                v-if="projectType == '01'"
              >为之后的样本自动配置平行标记</el-checkbox>
            </div>
          </div>
        </el-col>
      </el-row>
      <div style="margin-top:20px;" />
      <el-row>
        <vxe-table
          :data="projects"
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
          @current-change="handleSelectedProject"
          @cell-dblclick="cellDblclick"
        >
          <vxe-table-column
            field="id"
            title="项目编号"
            align="center"
          />
          <vxe-table-column
            field="name"
            title="名称"
            align="center"
          />
        </vxe-table>
      </el-row>

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogParOptSelect = false">取消</el-button>
        <el-button
          type="primary"
          @click="selectSure"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { findIndex } from 'shelljs/commands'
import { createNamespacedHelpers } from 'vuex'
const {
  mapState: mapStateU,
  mapActions: mapActionsU
} = createNamespacedHelpers('difeiUtil')
export default {
  name: 'GeParOptDialog',
  props: {
    parOptTableData: {
      // row
      type: Array,
      default: function () {
        return []
      }
    },
    dialogParOpt: {
      // 显示
      type: Boolean,
      default: function () {
        return false
      }
    },
    projectType: {
      // 项目类型 02优化 01平行
      type: String,
      default: function () {
        return '01' // 平行
      }
    },
    taskId: {
      type: String,
      default: function () {
        return '' // 任务单
      }
    },
    step: {
      type: String,
      default: function () {
        return 'extraction' // 步骤
      }
    }
  },
  data () {
    return {
      selectTable: [],
      projects: [],
      dialogParOptSelect: false,
      selectedProject: {},
      query: '',
      autoSet: false,
      selectIndex: undefined
    }
  },
  watch: {
    dialogParOpt: function () {
      this.selectTable = []
      this.query = ''
      this.projects = []
      this.selectedProject = {}
      this.autoSet = false
      this.selectIndex = undefined
    }
  },
  methods: {
    ...mapActionsU(['getOptimizeProject', 'updateProjectInfo']),
    clear () {
      if (this.selectTable.length == 0) {
        this.$message({
          message: '请至少选择一条数据',
          type: 'error'
        })
        return
      }
      this.selectTable.forEach(element => {
        element.projectId = ''
      })
      this.updateTable()
    },
    selectProject () {
      if (this.selectTable.length == 0) {
        this.$message({
          message: '请至少选择一条数据',
          type: 'error'
        })
        return
      }
      if (this.projectType == '01') {
        var params = {
          name: 'orderProjectInfos',
          type: '4028914a68a914a80168ea8383e80268'
        }
        this.getOptimizeProject(params).then(res => {
          this.projects = res.list
        })
      } else {
        var params = {
          name: 'orderProjectInfos',
          projectTypeCode: '02'
        }
        this.getOptimizeProject(params).then(res => {
          this.projects = res.list
        })
      }
      this.dialogParOptSelect = true
      this.selectedProject = {}
      this.autoSet = false
    },
    selectSure () {
      if (!this.checkSeletedRow()) return
      let id = this.selectedProject.id
      this.selectTable.forEach(element => {
        element.projectId = id
      })
      if (this.projectType == '01') {
        if (this.autoSet) {
          var params = {
            name: 'orderProjectInfos',
            type: '4028914a68a914a80168ea8383e80268'
          }
          this.getOptimizeProject(params).then(res => {
            const allProjects = res.list
            // 给当前选中样本排在该样本之后的所有样本自动配置平行标记
            let id_1 = id.substr(2, 2)
            // 判断后两位是纯数字还是字母
            let isAlp = /[a-z]/i.test(id_1) ? true : false
            if (isAlp) {
              // 字母形式
              // 前三位
              let id_2 = id.substr(0, 3)
              let id_3 = id.substr(3, 1)
              let ii = 1
              this.parOptTableData.every((item, index) => {
                if (index > this.selectIndex) {
                  let tempId = id_2 + String.fromCharCode(id_3.charCodeAt(0) + ii)
                  if (allProjects.findIndex(item => item.id === tempId) === -1) {
                    this.$message({
                      type: 'error',
                      message: '平行标记' + tempId + '不存在，请先在项目主数据中创建'
                    })
                    return false
                  } else {
                    item.projectId = tempId
                    ii++
                    return true
                  }
                } else {
                  return true
                }
              })
            } else {
              // 数字格式
              // 前两位
              let id_2 = id.substr(0, 2)
              let id_1_num = parseInt(id_1)
              this.parOptTableData.every((item, index) => {
                if (index > this.selectIndex) {
                  id_1_num++
                  let tempId = id_2 + this.numPaddingZero(id_1_num)
                  if (allProjects.findIndex(item => item.id === tempId) === -1) {
                    this.$message({
                      type: 'error',
                      message: '平行标记' + tempId + '不存在，请先在项目主数据中创建'
                    })
                    return false
                  } else {
                    item.projectId = tempId
                    return true
                  }
                } else {
                  return true
                }
              })
            }
            this.updateTable()
            this.dialogParOptSelect = false
          })
        } else {
          this.updateTable()
          this.dialogParOptSelect = false
        }
      } else {
        this.updateTable()
        this.dialogParOptSelect = false
      }
    },
    numPaddingZero (num) {
      let length = num.toString().length
      if (length === 2) {
        return num + ''
      } else {
        return '0' + num
      }
    },
    updateTable () {
      this.parOptTableData.push({})
      this.parOptTableData.pop()
    },
    sure () {
      const param = {
        step: this.step, // 步骤名
        taskId: this.taskId, // 任务单号
        projectType: this.projectType, // 01平行02优化
        sampleProjectTList: this.parOptTableData
      }
      this.updateProjectInfo(param).then(res => {
        this.dialogParOpt = false
        this.$emit('rollback')
        this.$emit('closeShow')
      })
      // console.log(this.parOptTableData)
      // var arr = []
      // this.parOptTableData.forEach(item => {
      //   var arr1 = item.projectId.split(',')
      //   arr1.forEach(e => {
      //     if (e !== '') {
      //       var obj = JSON.parse(JSON.stringify(item))
      //       obj.projectId = e
      //       arr.push(obj)
      //     }
      //   })
      // })
      // console.log(arr)
      // const param = {
      //   step: this.step, // 步骤名
      //   taskId: this.taskId, // 任务单号
      //   projectType: this.projectType, // 01平行02优化
      //   sampleProjectTList: arr
      // }
      // this.updateProjectInfo(param).then(res => {
      //   this.dialogParOpt = false
      //   this.$emit('rollback')
      //   this.$emit('closeShow')
      // })
    },
    checkSeletedRow () {
      if (Object.keys(this.selectedProject).length == 0) {
        this.$message.error('请选择一条数据')
        return false
      }
      return true
    },
    handleSelectionChangeType01 ({ row, rowIndex }) {
      if (this.projectType === '02') return
      this.selectIndex = rowIndex
      this.selectTable = [row]
    },
    handleSelectionChange (selects) {
      if (this.projectType === '01') return
      this.selectTable = selects.records
    },
    handleSelectedProject ({ row }) {
      this.selectedProject = row
    },
    cellDblclick ({ row }) {
      this.selectedProject = row
      this.selectSure()
    },
    searchProject () {
      if (this.projectType == '01') {
        var params = {
          name: 'orderProjectInfos',
          type: '4028914a68a914a80168ea8383e80268',
          id: this.query
        }
        this.getOptimizeProject(params).then(res => {
          this.projects = res.list
          if (this.query) {
            this.projects = this.projects.filter(x => {
              return x.id.indexOf(this.query) > -1
            })
          }
        })
      } else {
        var params = {
          name: 'orderProjectInfos',
          projectTypeCode: '02',
          id: this.query
        }
        this.getOptimizeProject(params).then(res => {
          this.projects = res.list
          if (this.query) {
            this.projects = this.projects.filter(x => {
              return x.id.indexOf(this.query) > -1
            })
          }
        })
      }
      this.selectedProject = {}
      this.selectIndex = undefined
    },
    closeShow () {
      this.dialogParOpt = false
      this.$emit('closeShow')
    },
    numberLimit (e) {
      const key = e.key
      // 不允许输入'e'和'.'
      if (key === 'e' || key === '.') {
        e.returnValue = false
        return false
      }
      return true
    },
    selectableRow ({ row }) {
      if (row.isValid == '0') {
        return false
      } else {
        return true
      }
    }
  }
}
</script>
