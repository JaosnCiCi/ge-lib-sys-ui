<template>
  <div>
    <el-dialog
      v-dialogDrag
      :visible.sync="visible"
      :close-on-click-modal="false"
      title="所属项目"
      class="dialog"
      center
      @closed="closeDialog"
    >
      <vxe-table
        :checkbox-config="{trigger: 'row', highlight: true, range: true}"
        :data="list"
        border
        height="400"
        resizable
        @checkbox-change="handleSelectionChange"
        @checkbox-all="handleSelectionChange"
        @checkbox-range-change="handleSelectionChange"
      >
        <vxe-table-column type="checkbox" width="80"/>
        <vxe-table-column field="projectId" title="项目编号"/>
      </vxe-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="confirmDialog">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: function () {
        return false;
      }
    },
    list: {
      type: Boolean,
      default: []
    }
  },
  data() {
    return {
      selection: []
    }
  },
  methods: {
    handleSelectionChange (val) {
      this.selection = val.records
    },
    closeDialog() {
      this.$emit('handelClosed')
    },
    confirmDialog() {
      if (this.selection && this.selection.length > 0) {
        this.$emit('save', this.selection)
      } else {
        this.$message('请选择数据')
      }
    }
  }
};
</script>
