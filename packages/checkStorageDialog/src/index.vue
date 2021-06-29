<template>
  <div>
    <el-dialog
      v-dialogDrag
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
      width="70%"
      title="填写入库信息"
      center
      class="dialog"
      @close="handelCancel"
    >
      <div v-if="row1.length > 0" style="font-size: 15px;">
        <div style="margin: 10px 0;">以下样本入库，请填写相关库位信息</div>
        <el-dropdown @command="handleCommand">
          <el-button type="primary" class="border_size" size="mini">
            目标库位类型
            <i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="item in deposit_type"
              :key="item.code"
              :command="item.code"
              :disabled="item.isValid=='0'"
            >{{ item.nameCn }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button type="primary" class="border_size" size="mini" @click="showDialog_Sample">选择样本盒</el-button>
        <el-button type="primary" class="border_size" size="mini" @click="showDialog_Box">批量粘贴样本盒</el-button>
        <el-button type="primary" class="border_size" size="mini" @click="judge">批量粘贴盒内位置</el-button>
        <el-button
          type="primary"
          class="border_size"
          size="mini"
          @click="inputTextLimsVisible = true"
        >批量选中样本</el-button>
        <div style="float:right">
          <v-select-count :selection="selectTable" :total="row1.length" />
        </div>
        <div style="margin:10px" />

        <vxe-table
          ref="xtable"
          :data="row1"
          :edit-config="{
            trigger: 'click',
            autoselect: true,
            mode: 'cell',
            activeMethod: activeMethod,
            showIcon: false
          }"
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
          :cell-class-name="tableCellClassName"
          max-height="420"
          stripe
          border
          show-overflow-tooltip="true"
          empty-text="当前暂无结果"
          @checkbox-all="handleSelectionChange"
          @checkbox-change="handleSelectionChange"
        >
          <vxe-table-column type="checkbox" align="center" width="50" />
          <vxe-table-column field="sampleIdLims" label="LIMS号" align="center" width="150" />
          <vxe-table-column
            v-if="!['libquant','sequencing','sequencingAdjusted'].includes(step)"
            label="实验室号"
            align="center"
            width="200"
            field="sampleIdLab"
          />
          <vxe-table-column
            v-if="['sequencing','sequencingAdjusted'].includes(step)"
            label="上机批次号（实验）"
            align="center"
            width="150"
            field="sqcGroupNum"
          />
          <vxe-table-column
            v-if="['libquant'].includes(step)"
            label="富集名称"
            align="center"
            width="150"
            field="poolingName"
            sortable
          />
          <vxe-table-column
            :edit-render="{
              name: '$select',
              options: deposit_type,
              optionProps: { value: 'code', label: 'nameCn' },
              events:{change:handleStorageType}
            }"
            field="targetStorageType"
            header-class-name="column_header_edit"
            label="目标库位类型*"
            align="center"
          />
          <vxe-table-column field="storageName" label="目标库位" align="center" />
          <vxe-table-column field="boxName" label="目标样本盒" align="center" />
          <vxe-table-column
            :edit-render="{
              name: '$input',
              autoselect:true,
              immediate: true,
              props: {
                clearable: true,
                maxlength:300
              },
            }"
            field="positionInBox"
            title="盒内位置"
            align="center"
            sortable
            header-class-name="column_header_edit"
          />
        </vxe-table>
      </div>
      <div v-if="row2.length > 0" style="margin: 20px;font-size: 15px;">
        <div>以下样本还未提交，请先进行提交操作，具体如下：</div>
        <div class="rowClass">
          <!-- <div v-for="(item, index) in row2" :key="index">{{ item.sampleIdLims }}</div> -->
          <div
            v-if="row2.length <=6"
            style="display: flex;justify-content: space-between;flex-wrap: wrap;"
          >
            <span
              v-for="(item, idx) of row2"
              :key="idx"
              style="padding:0 20px"
            >{{ item.sampleIdLims + " " }}</span>
          </div>
          <div v-else>
            <v-showMore style="margin-top: 20px" :content="row2" />
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handelCancel">取 消</el-button>
        <el-button
          v-if="row1.length == 0 && row2.length !== 0"
          type="primary"
          @click="handelEnsure"
        >确 定</el-button>
        <el-button v-else type="primary" @click="handelEnsure">下一步</el-button>
      </div>
    </el-dialog>
    <v-boxSearch ref="dialogSearchSapleBox" :storage-type="'00'" @doSure="doSure" />
    <v-positionBoxCopy
      :visible.sync="inputTextAreaDialogVisible"
      :rows="courseTable"
      title="批量粘贴盒内位置"
      sub-title="*请将excel中的两列（LIMS号，盒内位置）直接复制粘贴进该文本框。"
      @confim="handleAddBoxPosition"
    />
    <v-dialogSampleBoxCopy
      :visible.sync="sampleBoxCopyVisible"
      :rows="courseTable"
      title="批量粘贴样本盒"
      sub-title="*请将excel中的两列（LIMS号，样本盒）直接复制粘贴进该文本框。"
      @handelCancel="sampleBoxCopyVisible = false"
      @confim="handleAddBoxPosition"
    />
    <el-dialog
      v-dialogDrag
      :visible.sync="dialogNext"
      :close-on-click-modal="false"
      :append-to-body="true"
      width="30%"
      title="提示"
      center
      class="dialog"
      @close="
        query.nextProcessorName = '';
        query.nextProcessorId = '';
      "
    >
      <el-row>
        <div class="item-group">
          <div class="item-left">以下{{ arr2.length }}个样本即将入永久库，请选择实验室审核人：</div>
          <div class="item-right">
            <el-select
              v-model="query.nextProcessorId"
              :remote-method="querySearchAsync"
              :loading="loading"
              filterable
              remote
              reserve-keyword
              placeholder="请输入内容"
              @change="handleSelect"
            >
              <el-option
                v-for="item in experimenterList"
                :key="item.username"
                :label="item.usernameCn"
                :value="item.username"
                :disabled="item.isValid=='0'"
              />
            </el-select>
          </div>
        </div>
      </el-row>
      <el-row>
        <div style="display: flex;flex-wrap: wrap;justify-content: space-around;margin-top: 20px;">
          <div v-for="item in arr2" :key="item">{{ item.sampleIdLims }}</div>
        </div>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handelBack">上一步</el-button>
        <el-button type="primary" @click="handelNextProcessor">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 批量选中样本 -->
    <v-inputTextLimsDialog
      :visible="inputTextLimsVisible"
      @cancel="inputTextLimsVisible = false"
      @confirm="confirmSelect($event)"
    />
  </div>
</template>

<script>
import {
  createNamespacedHelpers
} from 'vuex'
const {
  mapState: mapStateU,
  mapActions: mapActionsU
} = createNamespacedHelpers('difeiUtil')
const {
  mapActions: mapActionsO
} = createNamespacedHelpers('orderRecod')
import inputTextLimsDialog from '../../inputTextLimsDialog'
import boxSearch from '../../boxSearch'
import positionBoxCopy from '../../positionBoxCopy'
import showMore from '../../showMore'
import dialogSampleBoxCopy from '../../dialogSampleBoxCopy'
import batchEntity from '../../../mixins/batchEntity'
export default {
  name: 'GeCheckStorageDialog',
  mixins: [batchEntity],
  props: {
    row: {
      type: Array,
      default: () => {
        return []
      }
    },
    sourceTaskId: {
      type: Array,
      default: () => {
        return []
      }
    },
    step: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      row1: [],
      row2: [],
      arr1: [],
      arr2: [],
      selectTable: [],
      courseTable: [],
      inputTextAreaDialogVisible: false,
      experimenterList: [],
      sampleDepositTaskTError: '',
      dialogNext: false,
      query: {
        nextProcessorName: '',
        nextProcessorId: ''
      },
      loading: false,
      inputTextLimsVisible: false,
      sampleBoxCopyVisible: false
    }
  },
  computed: {
    ...mapStateU(['deposit_type'])
  },
  components: {
    'v-boxSearch': boxSearch,
    'v-positionBoxCopy': positionBoxCopy,
    'v-inputTextLimsDialog': inputTextLimsDialog,
    'v-showMore': showMore,
    'v-dialogSampleBoxCopy': dialogSampleBoxCopy
  },
  mounted () {
    var baseArr = ['deposit_type']
    baseArr.map(item => {
      this.getBasicDir(item)
    })
  },
  methods: {
    ...mapActionsU(['getBasicDir', 'itemTableStorageSubmit']),
    ...mapActionsO(['userInfo']),
    doAfterShow () {
      this.arr1 = []
      this.arr2 = []
      this.selectTable = []
      this.courseTable = []
      this.experimenterList = []
      this.sampleDepositTaskTError = ''

      this.row1 = this.row.filter(item => {
        return item.submitStatus == '02'
      })
      this.row2 = this.row.filter(item => {
        return item.submitStatus == '01'
      })
      this.query.nextProcessorName = ''
      this.query.nextProcessorId = ''
    },
    handelCancel () {
      this.$emit('handelCancel')
      this.dialogVisible = false
      this.dialogNext = false
    },
    handelEnsure () {
      var error = false
      this.row1.forEach(item => {
        this.$set(item, 'targetStorageTypeError', false)
        this.$set(item, 'storageNameError', false)
        this.$set(item, 'boxNameError', false)
        this.$set(item, 'positionInBoxError', false)
        if (item.targetStorageType == null) {
          this.$set(item, 'targetStorageTypeError', true)
          error = true
        }
        if (item.targetStorageType == '01') {
          if (item.storageName == null || item.storageName == '') {
            this.$set(item, 'storageNameError', true)
            this.$set(item, 'boxNameError', true)
            error = true
          }
          if (item.positionInBox == null || item.positionInBox == '') {
            this.$set(item, 'positionInBoxError', true)
            error = true
          }
        }
      })
      if (error) {
        this.$message({
          type: 'error',
          message: '请完善页面信息'
        })
        this.updateTable()
        return
      }
      this.arr1 = this.row1.filter(item => item.targetStorageType == '01')
      this.arr2 = this.row1.filter(item => item.targetStorageType == '02')
      if (this.row1.length == 0 && this.row2.length !== 0) {
        this.handelCancel()
        return
      }
      if (this.arr2.length > 0) {
        this.dialogNext = true
        return
      }
      this.handelNextProcessor()
    },
    handleSelectionChange (data) {
      this.selectTable = data.records
    },
    handleCommand (command) {
      if (this.selectTable.length == 0) {
        this.$message({
          type: 'error',
          message: '请至少选择一条数据'
        })
        return false
      }
      this.selectTable.map(x => {
        if (command == '02') {
          this.$set(x, 'storageId', '')
          this.$set(x, 'boxId', '')
          this.$set(x, 'storageName', '')
          this.$set(x, 'boxName', '')
          this.$set(x, 'positionInBox', '')
        }
        this.$set(x, 'targetStorageType', command)
      })
    },
    showDialog_Sample () {
      if (this.selectTable.length == 0) {
        this.$message({
          type: 'error',
          message: '请至少选择一条数据'
        })
        return false
      }
      var arr1 = this.selectTable.filter(
        item => item.targetStorageType !== null && item.targetStorageType !== ''
      )
      if (arr1.length == 0) {
        this.$message({
          type: 'error',
          message: '请先填写目标库位类型'
        })
        return
      }
      var arr2 = arr1.filter(item => item.targetStorageType == '01')
      if (arr2.length == 0) {
        this.$message({
          type: 'error',
          message: '请为入临时库的样本选择样本盒'
        })
        return
      }
      this.courseTable = arr2
      this.$refs.dialogSearchSapleBox.dialogVisible = true
    },
    showDialog_Box () {
      if (this.selectTable.length == 0) {
        this.$message({
          type: 'error',
          message: '请至少选择一条数据'
        })
        return false
      }
      var arr1 = this.selectTable.filter(
        item => item.targetStorageType !== null && item.targetStorageType !== ''
      )
      if (arr1.length == 0) {
        this.$message({
          type: 'error',
          message: '请先填写目标库位类型'
        })
        return
      }
      var arr2 = arr1.filter(item => item.targetStorageType == '01')
      if (arr2.length == 0) {
        this.$message({
          type: 'error',
          message: '请为入临时库的样本粘贴样本盒'
        })
        return
      }
      this.courseTable = arr2
      this.sampleBoxCopyVisible = true
    },
    doSure (query) {
      this.courseTable.forEach(item => {
        item.storageId = query.storageId
        item.storageName = query.storageName
        item.boxId = query.boxId
        item.boxName = query.boxName
      })
    },
    judge () {
      var arr1 = this.row1.filter(
        item => item.targetStorageType !== null && item.targetStorageType !== ''
      )
      if (arr1.length == 0) {
        this.$message({
          type: 'error',
          message: '请先填写目标库位类型'
        })
        return
      }
      var arr2 = arr1.filter(item => item.targetStorageType == '01')
      if (arr2.length == 0) {
        this.$message({
          type: 'error',
          message: '请为入临时库的样本粘贴盒内位置'
        })
        return
      }
      this.courseTable = arr2
      this.inputTextAreaDialogVisible = true
    },
    handleStorageType ({
      row
    }) {
      if (row.targetStorageType == '02') {
        row.storageId = ''
        row.boxId = ''
        row.storageName = ''
        row.boxName = ''
        row.positionInBox = ''
      }
    },
    tableCellClassName ({
      row,
      column,
      rowIndex,
      columnIndex
    }) {
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
      this.row1.push({})
      this.row1.pop()
    },
    handleAddBoxPosition () {
      this.updateTable()
    },
    handleSelect (item) {
      console.log(window.userid, item)
      if (window.userid == item) {
        this.$message({
          type: 'error',
          message: '审核人不可选择自己'
        })
        this.query.nextProcessorId = ''
        this.query.nextProcessorName = ''
        return
      }

      this.query.nextProcessorId = item
      this.query.nextProcessorName = this.filterFunction.getDirName(
        this.query.nextProcessorId,
        this.experimenterList,
        'username',
        'usernameCn'
      )
    },
    querySearchAsync (queryString = '') {
      if (queryString !== '') {
        this.loading = true

        var params = {
          name: queryString
        }
        this.userInfo(params).then(res => {
          if (res.status == '2000') {
            this.loading = false
            this.experimenterList = res.list
          }
        })
      } else {
        this.experimenterList = []
      }
    },
    handelBack () {
      this.query.nextProcessorName = ''
      this.query.nextProcessorId = ''
      this.dialogNext = false
    },
    handelNextProcessor () {
      this.sampleDepositTaskTError = ''
      if (this.arr2.length != 0 && this.query.nextProcessorId == '') {
        this.sampleDepositTaskTError = '请填写实验室审核人'
        this.$message({
          message: '请填写实验室审核人',
          type: 'error'
        })
        return
      }
      var params = {}
      params.expTaskType = this.step
      params.sampleDepositOperationVO = []
      var obj = {}
      if (this.arr1.length !== 0) {
        obj = {}
        obj.sampleDepositTaskT = {
          depositType: '01',
          sourceTaskId: this.sourceTaskId
        }
        obj.sampleDepositItemTS = this.arr1
        params.sampleDepositOperationVO.push(obj)
      }
      if (this.arr2.length !== 0) {
        obj = {}
        obj.sampleDepositTaskT = {
          depositType: '02',
          sourceTaskId: this.sourceTaskId,
          nextProcessorId: this.query.nextProcessorId,
          nextProcessorName: this.query.nextProcessorName
        }
        obj.sampleDepositItemTS = this.arr2
        params.sampleDepositOperationVO.push(obj)
      }
      console.log(params)
      this.itemTableStorageSubmit(params).then(res => {
        switch (res.status) {
          case '2000':
            this.$message({
              message: '样本入库成功',
              type: 'success'
            })
            this.$emit('initialize')
            this.handelCancel()
            break
          case 'SSE50002':
            this.handelCancel()
            break
          case 'LIMSBOX102':
            this.$message({
              message: '当前入库的部分样本包装量之和大于选中的样本盒剩余孔位数量，请核实后再提交。' +
                res.message.replace('[', '').replace(']', ''),
              type: 'error'
            })
            break
          case 'LIMSBOX103':
            this.$message({
              message: '当前入库的部分样本包装量之和大于选中的样本盒剩余孔位数量，请核实后再提交。',
              type: 'error'
            })
            break
          default:
            this.$message({
              message: '操作失败，请重新再试',
              type: 'error'
            })
            break
        }
      })
    },
    confirmSelect (e) {
      var arr = []
      var arr1 = []
      var err = []
      this.row1.forEach(x => {
        arr.push(x.sampleIdLims)
      })
      e.forEach(item => {
        if (arr.indexOf(item) == -1) {
          err.push(item)
        } else {
          arr1.push(item)
        }
      })
      console.log(err, arr1)
      this.row1.forEach(x => {
        arr1.forEach(y => {
          if (x.sampleIdLims == y) {
            arr.push(x)
          }
        })
      })
      if (err.length !== 0) {
        this.$message({
          type: 'error',
          message: '部分或全部的LIMS未匹配到对应到内容，请检查'
        })
      }
      this.selectTable = arr
      this.$refs.xtable.clearCheckboxRow()
      // this.$refs.xTable.setCheckboxRow(arr, true)
      arr.forEach(item => {
        this.$refs.xtable.toggleCheckboxRow(item, true)
      })
    },
    sortByDate (obj1, obj2) {
      const val1 = obj1.positionInBox
      const val2 = obj2.positionInBox
      return val1 - val2
    },
    // 是否可以编辑
    activeMethod ({
      row,
      rowIndex,
      column,
      columnIndex
    }) {
      if (column.property == 'positionInBox') {
        console.log(row)
        if (row.targetStorageType !== '01') {
          return false
        }
        return true
      }
      return true
    }
  }
}
</script>

<style>
.rowClass {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.errCell {
  border: 1px solid #e6686e !important;
  margin: 0px 0px -1px -1px;
}
</style>
