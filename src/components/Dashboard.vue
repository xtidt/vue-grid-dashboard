<template>
  <div>
    <div>
      <div class="layoutJSON">
        Displayed as <code>[x, y, w, h]</code>:
        <div class="columns">
          <div class="layoutItem" v-for="(item, index) in layout" :key="item + '_' + index">
            <b>{{ item.i }}</b
            >: [{{ item.x }}, {{ item.y }}, {{ item.w }}, {{ item.h }}]
          </div>
        </div>
      </div>
    </div>
    <br />
    <div @drag="drag" @dragend="dragend" class="droppable-element" draggable="true" unselectable="on">
      Droppable Element (Drag me!)
    </div>
    <div id="content">
      <grid-layout
        ref="gridlayout"
        :layout.sync="layout"
        :col-num="4"
        :row-height="100"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :use-css-transforms="true"
      >
        <grid-item :key="item.i" v-for="item in layout" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i">
          <span class="text">{{ item.i }}</span>
          <Row></Row>
        </grid-item>
      </grid-layout>
    </div>
  </div>
</template>

<script>
import { GridLayout, GridItem } from 'vue-grid-layout'
import Row from './Row.vue'

let mouseXY = { x: null, y: null }
let DragPos = { x: null, y: null, w: 1, h: 1, i: null }
export default {
  components: {
    GridLayout,
    GridItem,
    Row
  },
  data() {
    return {
      layout: [
        { x: 0, y: 0, w: 2, h: 2, i: '0' },
        { x: 2, y: 0, w: 2, h: 2, i: '1' }
      ]
    }
  },
  mounted() {
    document.getElementById('content').addEventListener(
      'dragover',
      function(e) {
        mouseXY.x = e.clientX
        mouseXY.y = e.clientY
      },
      false
    )
  },
  methods: {
    drag: function(e) {
      let parentRect = document.getElementById('content').getBoundingClientRect()
      let mouseInGrid = false
      if (
        mouseXY.x > parentRect.left &&
        mouseXY.x < parentRect.right &&
        mouseXY.y > parentRect.top &&
        mouseXY.y < parentRect.bottom
      ) {
        mouseInGrid = true
      }
      if (mouseInGrid === true && this.layout.findIndex((item) => item.i === 'drop') === -1) {
        this.layout.push({
          x: (this.layout.length * 2) % (this.colNum || 12),
          y: this.layout.length + (this.colNum || 12), // puts it at the bottom
          w: 1,
          h: 1,
          i: 'drop'
        })
      }
      let index = this.layout.findIndex((item) => item.i === 'drop')
      if (index !== -1) {
        try {
          this.$refs.gridlayout.$children[this.layout.length].$refs.item.style.display = 'none'
        } catch {}
        let el = this.$refs.gridlayout.$children[index]
        el.dragging = { top: mouseXY.y - parentRect.top, left: mouseXY.x - parentRect.left }
        let new_pos = el.calcXY(mouseXY.y - parentRect.top, mouseXY.x - parentRect.left)
        if (mouseInGrid === true) {
          this.$refs.gridlayout.dragEvent('dragstart', 'drop', new_pos.x, new_pos.y, 1, 1)
          DragPos.i = String(index)
          DragPos.x = this.layout[index].x
          DragPos.y = this.layout[index].y
        }
        if (mouseInGrid === false) {
          this.$refs.gridlayout.dragEvent('dragend', 'drop', new_pos.x, new_pos.y, 1, 1)
          this.layout = this.layout.filter((obj) => obj.i !== 'drop')
        }
      }
    },
    dragend: function(e) {
      let parentRect = document.getElementById('content').getBoundingClientRect()
      let mouseInGrid = false
      if (
        mouseXY.x > parentRect.left &&
        mouseXY.x < parentRect.right &&
        mouseXY.y > parentRect.top &&
        mouseXY.y < parentRect.bottom
      ) {
        mouseInGrid = true
      }
      if (mouseInGrid === true) {
        this.$refs.gridlayout.dragEvent('dragend', 'drop', DragPos.x, DragPos.y, 1, 1)
        this.layout = this.layout.filter((obj) => obj.i !== 'drop')
        // UNCOMMENT below if you want to add a grid-item
        this.layout.push({
          x: DragPos.x,
          y: DragPos.y,
          w: 1,
          h: 1,
          i: DragPos.i
        })

        /*
        this.$refs.gridLayout.dragEvent('dragend', DragPos.i, DragPos.x,DragPos.y,1,1);
        try {
            this.$refs.gridLayout.$children[this.layout.length].$refs.item.style.display="block";
        } catch {
        }
        */
      }
    }
  }
}
</script>
