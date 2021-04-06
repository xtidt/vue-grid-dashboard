<template>
  <div>
    <grid-layout
      ref="gridlayout"
      :layout.sync="layout"
      :col-num="3"
      :row-height="80"
      :is-draggable="true"
      :is-resizable="true"
      :vertical-compact="true"
      :use-css-transforms="true"
    >
      <grid-item :key="item.i" v-for="item in layout" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i">
        <span class="text">{{ item.i }}</span>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script>
import { GridLayout, GridItem } from 'vue-grid-layout'

export default {
  components: {
    GridLayout,
    GridItem
  },
  name: 'Row',
  data() {
    return {
      layout: [
        { x: 0, y: 0, w: 1, h: 2, i: '1' }
      ]
    }
  }
}
</script>
