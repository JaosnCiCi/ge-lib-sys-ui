<template>
  <!-- 搜索 -->
  <el-dialog
    v-dialogDrag
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    title="选择样本盒"
    width="70%"
    center
  >
    <el-form :model="query" label-position="right">
      <el-row>
        <el-col :span="10">
          <el-form-item>
            <el-input v-model.trim="query.storageName" v-focus autofocus clearable maxlength="50">
              <template slot="prepend">目标库位</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="10" :offset="1">
          <el-form-item>
            <el-input v-model.trim="query.drawerNo" v-focus autofocus clearable maxlength="50">
              <template slot="prepend">目标屉位</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="1" :offset="1">
          <el-button type="primary" @click="fetch">搜索</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item>
            <el-input
              v-model.trim="query.positionInDrawer"
              v-focus
              autofocus
              clearable
              maxlength="50"
            >
              <template slot="prepend">目标盒位</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="10" :offset="1">
          <el-form-item>
            <el-input v-model.trim="query.boxName" v-focus autofocus clearable maxlength="50">
              <template slot="prepend">目标样本盒</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- table -->
    <div>
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="boxList"
        tooltip-effect="dark"
        style="width: 100%"
        highlight-current-row
        height="400"
        border
        max-height="40vh"
        @current-change="handleCurrentChange"
        @row-dblclick="handleRowDblclick"
      >
        <el-table-column prop="storageName" label="目标库位" align="center" show-overflow-tooltip />
        <el-table-column
          prop="drawerNo"
          label="目标屉位"
          align="center"
          show-overflow-tooltip
          width="100"
        />
        <el-table-column
          prop="positionInDrawer"
          label="目标盒位"
          align="center"
          show-overflow-tooltip
          width="100"
        />
        <el-table-column prop="boxName" label="目标样本盒" align="center" show-overflow-tooltip />
        <el-table-column
          prop="boxSpecification"
          label="样本盒规格"
          align="center"
          show-overflow-tooltip
          width="100"
        />
        <el-table-column prop label="剩余孔位数" align="center" show-overflow-tooltip width="100">
          <template slot-scope="scope">
            {{
              parseInt(scope.row.maxHoleNum) - parseInt(scope.row.usedHoleNum)
            }}
          </template>
        </el-table-column>
      </el-table>
      <div style="text-align:center;margin-top:20px;position:relative">
        <el-pagination
          :current-page="pageIndex"
          :page-sizes="[10, 50, 100, 200]"
          :page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentPageChange"
        />
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="doSure">确定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { createNamespacedHelpers } from 'vuex'
const { mapActions } = createNamespacedHelpers('sampleBox')
import batchEntity from '../../../mixins/batchEntity'
export default {
  name: 'GeBoxSearch',
  mixins: [batchEntity],
  props: {
    storageType: {
      type: String,
      default: () => {
        return ''
      }
    }
  },
  data () {
    return {
      query: {
        storageName: '',
        drawerNo: '',
        positionInDrawer: '',
        boxName: ''
      },
      selectTable: null,
      loading: false,
      boxList: [],
      total: 0
    }
  },
  mounted() {
    this.initQuery()
    this.query.storageType = this.storageType
    this.fetch()
  },
  methods: {
    ...mapActions(['fetchBoxList']),
    fetch () {
      this.query.storageType = this.storageType
      this.query.pageSize = this.currentPageSize
      this.query.pageIndex = this.currentPage
      this.fetchBoxList(this.query).then(res => {
        if (res.status == '2000') {
          this.boxList = res.list
          this.total = res.total
        }
      })
    },
    doAfterShow () {
      this.initQuery()
      this.query.storageType = this.storageType
      this.fetch()
    },
    initQuery () {
      var entity = {
        storageName: '',
        drawerNo: '',
        positionInDrawer: '',
        boxName: ''
      }
      Object.assign(this.query, entity)
      this.$set(this, 'query', entity)
    },
    handleRowDblclick (row, column, event) {
      this.dialogVisible = false
      this.$emit('doSure', row)
    },
    doSure () {
      if (this.currentRow == null) {
        this.$message('请至少选择一条数据')
        return
      }
      this.dialogVisible = false
      this.$emit('doSure', this.currentRow)
    }
  }
}
</script>
