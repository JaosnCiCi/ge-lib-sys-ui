<template>
  <div>
    <el-dialog
      v-dialogDrag
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
      title="提示"
      width="50%"
      center
      class="dialog"
    >
      <div>{{ description }}</div>
      <div style="display: flex;flex-wrap: wrap;justify-content: center;">
        <span v-for="item in list" :key="item" style="margin:15px">{{ item }}</span>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import batchEntity from '../../../mixins/batchEntity'
export default {
  name: 'GeListError',
  mixins: [batchEntity],
  props: {
    description: {
      type: String,
      default: ''
    },
     list: {
      type: Array,
      default: () => {
        return []
      }
    }
  }
}
</script>

