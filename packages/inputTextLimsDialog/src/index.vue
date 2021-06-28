<template>
  <div>
    <el-dialog
      v-if="visible"
      v-dialogDrag
      :visible.sync="visible"
      :close-on-click-modal="false"
      :append-to-body="true"
      title="批量选中样本"
      center
      @close="handlerCancel"
    >
      <div>
        <el-input
          v-model="textareaValue"
          v-focus
          :autosize="{ minRows: 20, maxRows: 20 }"
          type="textarea"
          placeholder="将要核对的LIMS号复制或录入到当前区域..."
          autofocus
        />
      </div>*
      <el-popover placement="left" width="800" trigger="hover">
        <!-- 图片放大-->
        <el-image :src="imgSrc" />
        <a slot="reference">查看录入内容、格式、规则。</a>
      </el-popover>
      <span slot="footer" class="dialog-footer">
        <el-button
          @click="
            textareaValue = '';
            sampleIdLimsList = [];
          "
        >清 空</el-button>
        <el-button @click="handlerCancel">取 消</el-button>
        <el-button type="primary" @click="handlerConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import batchEntity from '../../../mixins/batchEntity'
export default {
  name: 'GeInputTextLimsDialog',
  mixins: [batchEntity],
  data () {
    return {
      textareaValue: '',
      sampleIdLimsList: [],
      imgSrc: 'https://geneseeq-statics-bakhz.oss-cn-hangzhou.aliyuncs.com/4e0dbed87469411a677ca955ca473b7.png'
    }
  },
  methods: {
    handlerCancel () {
      this.textareaValue = ''
      this.$emit('cancel')
    },
    handlerConfirm () {
      if (this.textareaValue == '') {
        this.$message({
          type: 'error',
          message: '请录入相关内容'
        })
        return
      }
      this.textareaValue = this.textareaValue.replace(/\n/g, '-')
      this.textareaValue = this.textareaValue.replace(/,|，/g, '')
      var arr = this.textareaValue.split('-')
      this.sampleIdLimsList = []
      var sampleIdLimsList = []
      arr.map(item => {
        if (item.trim() != '') {
          sampleIdLimsList.push(item.trim())
        }
      })
      this.sampleIdLimsList = sampleIdLimsList
      this.$emit('confirm', this.sampleIdLimsList)
      this.handlerCancel()
    }
  }
}
</script>
