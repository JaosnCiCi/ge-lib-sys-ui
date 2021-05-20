/**
 *
 */
var mixinMethod = {
  created () {
  },
  data () {
    return {
      fileList: [],
      uploadVisible: false,
      uploadLoading: false,
      fileTypeArr: ['text/csv', 'application/vnd.ms-excel', 'text/xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      allFileTypePass: false,
      fileTypeMessage: '上传文件只能是csv文件',
      fileSize: 1024 * 1024,
      fileSizeMessage: '只能上传小于1M的文件!'
    }
  },
  methods: {
    // 导入CSV
    importCSV () {
      this.$set(this, 'fileList', [])
      this.$set(this, 'uploadVisible', true)
    },
    submitUpLoad () {
      var el = this.$refs.upload1
      if (el.uploadFiles && el.uploadFiles.length > 0) {
        this.setLoading(true)
        el.submit()
      } else {
        this.$message({
          type: 'error',
          message: '请选择需要上传的文件'
        })
      }
    },
    handleChange (file, fileListArg) {
      if (fileListArg.length > 0) {
        this.fileList = [fileListArg[fileListArg.length - 1]] // 这一步，是 展示最后一次选择的csv文件
      }
    },
    /**
         * 上传前对上传文件的
         */
    beforeAvatarUpload (file) {
      var typeNameArr = file.name.split('.')
      var typeName = typeNameArr[typeNameArr.length - 1]
      const isCSV = this.allFileTypePass || this.fileTypeArr.includes(file.type) || this.fileTypeArr.includes(typeName)
      // file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || file.type === 'text/xlsx' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      if (!isCSV) {
        this.$message.error(this.fileTypeMessage)
        this.setLoading(false)
        return false
      }
      const isFitSize = file.size / this.fileSize < 1
      if (!isFitSize) {
        this.$message.error(this.fileSizeMessage)
        this.setLoading(false)
        return false
      }
      this.setLoading(true)
    },
    // 文件上传失败
    uploadError () {
      this.$alert('上传失败，请重试')
      this.$set(this, 'uploadVisible', false)
      this.$set(this, 'uploadLoading', false)
      this.$set(this, 'importIndexVisible', false)
      this.$set(this, 'fileList', [])
      this.setLoading(false)
    }
  }
}
export default mixinMethod
