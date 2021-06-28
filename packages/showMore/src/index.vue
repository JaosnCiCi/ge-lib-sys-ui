<template>
  <div class="wrapper-container">
    <!-- overflow: hidden：清除子元素相对父元素的超界溢出 -->
    <div style="overflow: hidden" :style="{height : showMore ? 'auto': showHeight + 'px'}">
      <div ref="content">
        <slot>
          <!-- 当外界 <show-more> 标签中有元素时，使用 <show-more> 标签中的元素进行渲染，否则使用下面这个 div 进行渲染 -->
          <div style="display: flex;justify-content: space-between;flex-wrap: wrap;">
            <span
              v-for="(item, idx) of content"
              :key="idx"
              style="padding:0 20px"
            >{{ item.sampleIdLims == undefined?item: item.sampleIdLims }}</span>
          </div>
        </slot>
      </div>
    </div>

    <div v-show="isLongContent" class="control" :class="{'show-more' : showMore}">
      <el-button type="text" @click="_toggleShowMore">{{ showMore ? '收起' : '显示更多' }}</el-button>
    </div>
  </div>
</template>
<style lang="scss">
.wrapper-container {
  position: relative;
  padding-bottom: 40px;

  .control {
    // [滑稽]这里的代码是从 CSDN 那复制过来的，毕竟人家的渐变遮罩层写好了我就不重复发明轮子了
    position: absolute;
    bottom: 0;
    width: 100%;
    padding-top: 40px;
    text-align: center;
    background-image: linear-gradient(
      -180deg,
      rgba(255, 255, 255, 0) 0%,
      #fff 70%
    );

    &.show-more {
      padding-top: 0;
      background: none;
    }
  }
}
</style>

<script>
export default {
  name: 'GeShowMore',
  props: {
    showHeight: {
      type: Number,
      required: true,
      default: 45
    },
    content: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      showMore: false,
      isLongContent: true
    }
  },
  methods: {
    refresh () {
      this._calculateHeight()
    },
    _calculateHeight () {
    },
    _toggleShowMore () {
      this.showMore = !this.showMore
    }
  }
}
</script>
