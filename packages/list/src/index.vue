<template>
  <div ref="medicalList" class="app-container">
    <slot name="buttion-list">
      <div class="filter-container">
        <el-button type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="creatNewTask">新建</el-button>
        <el-button type="primary" icon="el-icon-edit" @click="handleEdit">编辑</el-button>
        <el-button type="primary" icon="el-icon-delete" @click="handleDelate">删除</el-button>
      </div>
    </slot>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row>
          <el-col :span="3">
            <div class="vertical_line" style="color:#1C7EBD">{{ title }}</div>
          </el-col>
        </el-row>
      </div>
      <div class="sample_receive_detail">
        <el-table
          ref="orderTable"
          v-loading="loading"
          :data="tableData"
          max-height="600"
          stripe
          border
          highlight-current-row
          show-overflow-tooltip="true"
          empty-text="当前暂无搜索结果"
          @row-click="handleRowClick"
          @row-dblclick="handleDBRowClick"
          @sort-change="sortChange"
        >
          <slot name="column" />
        </el-table>
        <div style="text-align:center;margin-top:20px">
          <el-pagination
            :current-page="currentPage"
            :page-sizes="[10, 50, 100, 200]"
            :page-size="currentPageSize"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
    <!-- 搜索 -->
    <slot name="search-dialog" />
  </div>
</template>
<script>
var _ = require('lodash')
export default {
  name: 'GeList',
  provide() {
    return {
      GeList: this
    }
  },
  props: {
     action: {
      type: Function,
      default: () => {
        return new Promise()
      }
     },
    finishJumpUrl: {
      type: String,
      default: () => {
        return ''
      }
     },
     defaultJumpUrl: {
      type: String,
      default: () => {
        return ''
      }
     }
  },
  data () {
    return {
      dialogTableVisible: false,
      currentPageSize: 200,
      currentPage: 1,
      currentRow: {},
      query: {
      },
      loading: false,
      total: 0,
      tableData: []

    }
  },
  created () {
    this.getBasicDir('pathology_type')
    this.changePageSize(200)
    this.changePageIndex(1)
    var params = {}
    params.order = 'desc'
    params.order_by = 'taskId'
    this.orderChange(params)
    this.search()
  },
  methods: {
    search () {
      this.loading = true
      var params = Object.assign({}, this.query)
      this.action(params).then(res => {
        if (res.status == 2000) {
          this.tableData = res.list
          this.total = res.total
        }
      })
    },
    setQuery(query) {
      this.$set(this, 'query', query)
    },
    // table显示多少列
    handleSizeChange (pageSize) {
      this.currentPageSize = pageSize
      this.changePageSize(pageSize)
      this.search()
    },
    // table翻页
    handleCurrentChange (pageIndex) {
      this.currentPage = pageIndex
      this.changePageIndex(pageIndex)
      this.search()
    },
    // 查询订单弹框
    handleFilter () {
      this.dialogTableVisible = true
      this.clearAll()
    },
    // 搜索
    onSearch () {
      this.search()
      this.currentRow = {}
      this.$set(this, 'dialogTableVisible', false)
    },
    // 编辑任务单
    handleEdit () {
      var currentRow = this.currentRow
      if (_.isNil(currentRow.taskId)) {
        this.$message({
          type: 'error',
          message: '请至少选择一条数据'
        })
      } else {
        if (currentRow.taskStatus == '03') {
          this.$router.push({
            path: this.defaultJumpUrl,
            query: {
              taskCode: currentRow.taskId
            }
          })
        } else {
          this.$router.push({
            path: this.finishJumpUrl,
            query: {
              taskCode: currentRow.taskId
            }
          })
        }
      }
    },
    handleDelate () {
      var currentRow = this.currentRow
      if (_.isNil(currentRow.taskId)) {
        this.$message({
          type: 'error',
          message: '请至少选择一条数据'
        })
        return
      }

      this.deleteTask(currentRow.taskId).then(res => {
        if (res.status == '2000') {
          this.$message({
            type: 'success',
            message: '任务单删除成功'
          })
          this.currentRow = []
          this.search()
        } else if (res.status == 'LIMS005') {
          this.$message({
            type: 'error',
            message: '该任务单中存在已选样本，无法删除'
          })
        }
      })
    },
    // 新建任务单
    creatNewTask () {
      this.$router.push({
        path: 'sequencing-detail',
        query: {
          taskCode: '',
          type: 'created'
        }
      })
    },
    // 单击选择某条数据
    handleRowClick (row, column, event) {
      if (row == this.currentRow) {
        this.currentRow = {}
        this.$refs.orderTable.setCurrentRow()
      } else {
        this.currentRow = row
      }
    },
    // 双击选择某条数据
    handleDBRowClick (row) {
      console.log(row)
      if (row.taskStatus == '03') {
        this.$router.push({
          path: 'sequencing-qcResult',
          query: {
            taskCode: row.taskId
          }
        })
      } else {
        this.$router.push({
          path: 'sequencing-detail',
          query: {
            taskCode: row.taskId
          }
        })
      }
    },
    // 排序
    sortChange (obj) {
      this.currentRow = {}
      const params = {}
      if (obj.order == 'ascending') {
        params.order = 'asc'
      } else if (obj.order == 'descending') {
        params.order = 'desc'
      } else {
        params.order = ''
      }
      params.order_by = obj.prop
      if (obj.prop == null) {
        params.order_by = ''
      }
      this.orderChange(params)
      this.search()
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
    handleSelect (item) {
      this.query.createdBy = item
      this.query.createdByName = this.filterFunction.getDirName(
        this.query.createdBy,
        this.experimenterList,
        'username',
        'usernameCn'
      )
    }
  }
}
</script>
