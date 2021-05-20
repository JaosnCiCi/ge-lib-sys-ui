<template>
  <div>
    <el-dialog
      v-dialogDrag
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
      title="数据修改 - 填写修改原因"
      width="50%"
      center
      class="dialog"
    >
      <el-row>
        <div class="item-group">
          <div class="item-left">指定审核人*：</div>
          <div class="item-right">
            <el-select
              v-model="query.nextProcessorId"
              :loading="loading"
              filterable
              remote
              reserve-keyword
              placeholder="请输入内容"
              clearable
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
        <div style="margin-top: 15px;">
          <div class="reason">修改原因*</div>
          <el-input
            v-model="query.reason"
            :autosize="{ minRows: 2, maxRows: 4}"
            maxlength="300"
            type="textarea"
            placeholder
          >
            <template slot="append" />
          </el-input>
        </div>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handelNextProcessor">下一步</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapActions } = createNamespacedHelpers('user')
import batchEntity from '../../../mixins/batchEntity'
export default {
  name: 'GeDataChangeReason',
  mixins: [batchEntity],
  props: {
    step: {
      type: String,
      default: '02'
    },
    rows: {
      type: Array,
      default: () => {
        return []
      }
    },
    changeColumns: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      query: {
        nextProcessorName: '',
        nextProcessorId: ''
      },
      experimenterList: [],
      loading: false
    }
  },
  watch: {},
  created () {
    var params = { name: '', step: '02' }
    this.loading = true
    this.userInfo(params).then(res => {
      if (res.status == '2000') {
        this.loading = false
        this.experimenterList = res.list
      }
    })
  },
  methods: {
    ...mapActions(['userInfo']),
    handleSelect (item) {
      this.query.nextProcessorId = item
      this.query.nextProcessorName = this.filterFunction.getDirName(
        this.query.nextProcessorId,
        this.experimenterList,
        'username',
        'usernameCn'
      )
    },
    doAfterShow () {
      this.query = {
        nextProcessorName: '',
        nextProcessorId: '',
        reason: ''
      }
    },
    handelNextProcessor () {
      if (this.emptyString(this.query.nextProcessorId)) {
        this.showErrorMessage('请填写审核人')
        return
      }
      if (this.emptyString(this.query.reason)) {
        this.showErrorMessage('请填写修改原因')
        return
      }
      this.$emit('confirm', this.query)
      this.rows.map(x => {

      })
      this.dialogVisible = false
    }
  }
}
</script>
<style scoped>
.reason {
  background-color: #f5f7fa;
  color: #909399;
  vertical-align: middle;
  display: table-cell;
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 20px;
  white-space: nowrap;
  /* border-right: 0; */
  /* border-top-right-radius: 0; */
  border-bottom-right-radius: 0;
  line-height: 34px;
}
</style>
