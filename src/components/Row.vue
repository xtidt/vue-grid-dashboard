<template>
  <div id="content2">
    <grid-layout
      ref="gridlayoutRow"
      :layout.sync="layout"
      :col-num="8"
      :row-height="80"
      :is-draggable="true"
      :is-resizable="true"
      :vertical-compact="true"
      :margin="[0, 0]"
      :use-css-transforms="true"
      :autoSize="true"
      @layout-updated="layoutUpdatedEvent"
    >
      <grid-item
        :key="item.i"
        v-for="item in layout"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        dragIgnoreFrom=".drag-ignore">
        <span
          :i="item.i"
          class="drag-ignore text"
          draggable="true"
          @dragend="handleDragend"
          >
            {{ item.i }}
        </span>
        <span
          class="drag-ignore remove"
          @click="removeItem(layout, item.i)">x
        </span>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script>
import { GridLayout, GridItem } from 'vue-grid-layout'
import { findTargetById } from '../utils/extendFind.js'
export default {
  name: 'Row',
  components: {
    GridLayout,
    GridItem
  },
  
  props: ['items'],
  data() {
    return {
      layout: this.items
    }
  },
  methods: {
    handleMouseUp (event){
      this.$emit('row:mouseUp', event)
    },
    handleMouseDown (event){
      this.$emit('row:mouseDown', event)
    },
    layoutUpdatedEvent: function(newLayout){
      // TODO:改变容器大小时，需要触发外层容器缩放
      console.log("Updated layout-改变容器大小时，需要触发外层容器缩放: ", newLayout)
      this.$emit('row:update')
    },
    handleDragend (event) {
      // 根据id标识拖拽目标
      const _id = event.currentTarget.getAttribute('i')
      const _target = findTargetById(this.layout, _id)
      if (this.isInsideContainer(document.getElementById('content2'), event)) {
      } else {
        const _target = findTargetById(this.layout, _id)
        // 拖拽目标从小容器中移除
        this.removeItem(this.layout, _id)
        // 通知外部容器接收将被移除的元素
        this.$emit('row:removeItem', _target)
      }
    },
    // 单个对象是否在容器内部
    isInsideContainer (dom, event) {
      let parentRect = dom.getBoundingClientRect()
      let _foo = false
      if (event.clientY > parentRect.top
        && event.clientY < (parentRect.top + parentRect.height)
        && event.clientX > parentRect.left
        && event.clientX < (parentRect.left + parentRect.width)) 
      {
        _foo = true
      }
      return _foo
    },
    // 移除元素
    removeItem: function (arrayTarget, val) {
      const index = arrayTarget.map(item => item.i).indexOf(val);
      arrayTarget.splice(index, 1);
    }
  },
  mounted () {}
}
</script>

<style lang="css">
.vue-grid-item {
  background: #e1e1e1;
}

#content2 .vue-grid-item:not(.vue-grid-placeholder) {
  border-color: palevioletred !important;
}
</style>
