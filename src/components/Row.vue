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
      :margin="[4, 4]"
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
    },

    handleDragend (event) {
      // 根据id标识拖拽目标
      const _id = event.currentTarget.getAttribute('i')
      const _target = findTargetById(this.layout, _id)
      if (this.isInsideContainer(document.getElementById('content2'), event)) {

      } else {
        console.log(_target)
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
    }
  },

  mounted () {
    // document.getElementById('content2').addEventListener("dragend", function (e) {
    //   console.log(e)
    // }, false);
  }
}
</script>

<style lang="css">
.vue-grid-item {
  background: #e1e1e1;
}
</style>
