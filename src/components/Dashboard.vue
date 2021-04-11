<template>
  <div>
    <div>
      <div class="layoutJSON">
        Displayed as <code>[x, y, w, h]</code>:
        <div class="columns">
          <div class="layoutItem" v-for="(item, index) in layout" :key="item + '_' +index">
            <b>{{ item.i }}</b
            >: [{{ item.x }}, {{ item.y }}, {{ item.w }}, {{ item.h }}]
          </div>
        </div>
      </div>
    </div>
    <br />
    <div
      @drag="drag"
      @dragend="dragend"
      class="droppable-element"
      draggable="true"
      unselectable="on"
    >
      外部拖拽释放元素 (Drag me!)
    </div>
    <button @click="btnAdd">add</button>
    <div id="content" @mousemove="handleMouseMove">
      <grid-layout
        ref="gridlayout"
        :layout.sync="layout"
        :col-num="8"
        :row-height="80"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :margin="[4, 4]"
        :use-css-transforms="true"
        :autoSize="true"
      >
        <!-- 容器元素不允许拖拽缩放 -->
        <grid-item
          :key="item.i"
          v-for="item in layout"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :isResizable="!item.children"
          dragIgnoreFrom=".drag-ignore"
          @container-resized="containerResizedEvent"
        >
          <span
            class="drag-ignore remove"
            @click="rootRemoveItem(item.i)">x
          </span>
          <Row
            v-if="item.children && item.children.length"
            class="drag-ignore"
            :items="item.children"
            @row:mouseUp="handleMouseUp"
            @row:mouseDown="handleMouseDown">
          </Row>
          <span
            :i="item.i" 
            class="drag-ignore text"
            draggable="true"
            @drag="handleItemDrag"
            @dragend="handleItemDragend">{{ item.i }}</span>
        </grid-item>
      </grid-layout>
    </div>
  </div>
</template>

<script>
import { GridLayout, GridItem } from "vue-grid-layout"
import { findTargetById } from '../utils/extendFind.js'
import Row from './Row'

let mouseXY = { "x": null, "y": null };
let DragPos = { "x": null, "y": null, "w": 1, "h": 1, "i": null };


export default {
  name: 'Layout',
  components: {
    GridLayout,
    GridItem,
    Row
  },
  data () {
    return {
      isMouseMove: false,
      layout: [
        { "x": 0, "y": 0, "w": 8, "h": 4, "i": "1", "id": "1", "l":1,
          children: [
            { "x": 0, "y": 0, "w": 4, "h": 4, "i": "11", "id": "11", "l":2 }
          ]
        },
        { "x": 4, "y": 4, "w": 2, "h": 4, "i": "2", "id": "2", "l":1 },
        { "x": 0, "y": 8, "w": 8, "h": 4, "i": "3", "id": "3", "l":1 }
      ],
    }
  },
  mounted () {
    document.getElementById('content').addEventListener("dragover", function (e) {
      mouseXY.x = e.clientX;
      mouseXY.y = e.clientY;
    }, false);
  },

  methods: {
    drag: function (event) {
      let parentRect = document.getElementById('content').getBoundingClientRect();
      let mouseInGrid = false;
      if (((mouseXY.x > parentRect.left) && (mouseXY.x < parentRect.right)) && ((mouseXY.y > parentRect.top) && (mouseXY.y < parentRect.bottom))) {
        mouseInGrid = true;
      }
      if (mouseInGrid && (this.layout.findIndex(item => item.i === 'drop')) === -1) {
        this.layout.push({
          x: (this.layout.length * 2) % (this.colNum || 12),
          y: this.layout.length + (this.colNum || 12), // puts it at the bottom
          w: 1,
          h: 1,
          i: 'drop',
        });
      }

      let index = this.layout.findIndex(item => item.i === 'drop');
      if (index > -1) {
        try {
          this.$refs.gridlayout.$children[this.layout.length].$refs.item.style.display = "none";
        } catch {
          console.log('error')
        }
        let el = this.$refs.gridlayout.$children[index];
        el.dragging = { "top": mouseXY.y - parentRect.top, "left": mouseXY.x - parentRect.left };
        let new_pos = el.calcXY(mouseXY.y - parentRect.top, mouseXY.x - parentRect.left);

        if (mouseInGrid) {
          this.$refs.gridlayout.dragEvent('dragstart', 'drop', new_pos.x, new_pos.y, 1, 1);
          DragPos.i = String(index);
          DragPos.x = this.layout[index].x;
          DragPos.y = this.layout[index].y;
        }
        if (!mouseInGrid) {
          this.$refs.gridlayout.dragEvent('dragend', 'drop', new_pos.x, new_pos.y, 1, 1);
          this.layout = this.layout.filter(obj => obj.i !== 'drop');
        }
      }
    },
    dragend: function (event) {
      let parentRect = document.getElementById('content').getBoundingClientRect();
      let mouseInGrid = false;
      if (((mouseXY.x > parentRect.left) && (mouseXY.x < parentRect.right)) && ((mouseXY.y > parentRect.top) && (mouseXY.y < parentRect.bottom))) {
        mouseInGrid = true;
      }
      if (mouseInGrid === true) {
        this.$refs.gridlayout.dragEvent('dragend', 'drop', DragPos.x, DragPos.y, 1, 1);
        this.layout = this.layout.filter(obj => obj.i !== 'drop');

        // UNCOMMENT below if you want to add a grid-item
        this.layout.push({
            x: DragPos.x,
            y: DragPos.y,
            w: 1,
            h: 1,
            i: DragPos.i,
        })
      }
    },

    // 容器添加元素 
    comAddItem (arrayTarget, item) {
      arrayTarget.children.push(item)
      // 需要判断待添加元素是否超出了容器宽度,
      // 判断容器里最后一行所能承载的最大宽度，超出则需要将元素容器以元素高度为准做高度递增
      arrayTarget.h += item.h
    },

    // 行组件添加元素
    rootAddItem(item) {
      // this.layout.push(item)
    },

    // 移除元素
    rootRemoveItem (val) {
      this.removeItem(this.layout, val)
    },
    removeItem: function (arrayTarget, val) {
      const index = arrayTarget.map(item => item.i).indexOf(val);
      index && arrayTarget.splice(index, 1);
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

    handleMouseUp (event) {
      this.isMouseMove = false
      // 根据id标识拖拽目标
      const _id = event.currentTarget.getAttribute('i')
      const _target = findTargetById(this.layout, _id)
      if (this.isInsideContainer(document.getElementById('content2'), event)) {
        // TODO:判断元素若还在容器组件中则Return
        // 拖拽目标移除
        this.removeItem(this.layout, _id)
        // TODO:目标容器添加
        this.comAddItem(this.layout[0], _target)
      } else {
        // 拖拽目标移除
        this.removeItem(this.layout[0].children, _id)
        this.rootAddItem(this.layout, _target)
      }
    },

    // 鼠标移动时
    handleMouseMove (event) {
      if (!this.isMouseMove) return
      const _foo = this.isInsideContainer(document.getElementById('content2'), event)
      console.log(_foo)
      // 判断是否移动到了目标容器，移入则控制容器样式
    },

    handleMouseDown (event) {
      this.isMouseMove = true
      console.log('handleMouseDown', event)
    },

     /**
     * @param i the item id/index
     * @param newH new height in grid rows 
     * @param newW new width in grid columns
     * @param newHPx new height in pixels
     * @param newWPx new width in pixels
     */
    containerResizedEvent: function(i, newH, newW, newHPx, newWPx){
        console.log("CONTAINER RESIZED i=" + i + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx);
    },

    //////////////
    btnAdd() {
      // debugger
      var r = Math.floor(Math.random()*1000)
      this.rootAddItem({ "x": 4, "y": 0, "w": 2, "h": 4, "i": r, "index": r })
      // this.removeItem('1')
      // this.$refs.gridlayout.resizeEvent()
      // this.addItem(this.layout[0], { "x": 4, "y": 0, "w": 2, "h": 4, "i": Math.floor(Math.random()*1000), "index": Math.floor(Math.random()*1000) })
      // this.layout[0].children.push({ "x": 4, "y": 0, "w": 2, "h": 4, "i": Math.floor(Math.random()*1000) })
    },

    handleDrag (event) {
      console.log(event)
    },

    handleDragend (event) {
      console.log(event)
    },

    handleItemDrag (event) {
      // console.log(event)
    },

    handleItemDragend (event) {
      // 根据id标识拖拽目标
      const _id = event.currentTarget.getAttribute('i')
      const _target = findTargetById(this.layout, _id)
      if (this.isInsideContainer(document.getElementById('content2'), event)) {
        // TODO:判断元素若还在容器组件中则Return
        // 拖拽目标移除
        this.removeItem(this.layout, _id)
        // TODO:目标容器添加
        this.comAddItem(this.layout[0], _target)
      }
    }
  }
}
</script>

<style scoped>
.vue-grid-item:not(.vue-grid-placeholder) {
  background: #c7c7c7;
}

.vue-grid-layout {
  background: #e2ecd9;
}
</style>
