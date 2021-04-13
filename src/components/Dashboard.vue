<template>
  <div>
    <div>
      <div class="layoutJSON">
        {{layout}}
      </div>
    </div>
    <br />
    <button @click="btnAdd">外部容器添加组件元素</button>
    <button @click="btnChildAdd">内部容器添加组件元素</button><br /><br />
    <div id="content">
      <grid-layout
        ref="gridlayout"
        :layout.sync="layout"
        :col-num="colNum "
        :row-height="80"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :margin="[0, 0]"
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
            :items="item.children"
            @row:removeItem="rootAddItem"
            @row:update="handleUpdateRow(item)">
          </Row>
          <span
            :i="item.i" 
            class="drag-ignore text"
            draggable="true"
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

const MAX_ROW_NUM = 8

let mouseXY = { "x": null, "y": null };
let DragPos = { "x": null, "y": null, "w": 1, "h": 1, "i": null };


const initData = [
  { "x": 0, "y": 0, "w": 8, "h": 4, "i": "1", "id": "1", "l":1,
    children: [
      { "x": 0, "y": 0, "w": 4, "h": 4, "i": "11", "id": "11", "l":2 }
    ]
  },
  { "x": 4, "y": 4, "w": 2, "h": 4, "i": "2", "id": "2", "l":1 }
]

export default {
  name: 'Layout',
  components: {
    GridLayout,
    GridItem,
    Row
  },
  data () {
    return {
      index: 11,
      isMouseMove: false,
      layout: initData,
      colNum : MAX_ROW_NUM
    }
  },
  mounted () {
    document.getElementById('content').addEventListener("dragover", function (e) {
      mouseXY.x = e.clientX;
      mouseXY.y = e.clientY;
    }, false);
  },

  methods: {
    // 容器添加元素 
    comAddItem (arrayTarget, item) {
      // 需要判断待添加元素是否超出了容器宽度,
      // 判断容器里最后一行所能承载的最大宽度，超出则需要将元素容器以元素高度为准做高度递增
      // 最大行高
      const _targetMaxY = _.maxBy(arrayTarget.children, 'y')
      // 最后一行的cols
      const _rows = arrayTarget.children.filter(item => item.y === _targetMaxY.y)
      // 列宽统计
      let sumCol = 0
      if (_rows.length > 1) {
        sumCol = _rows.reduce((pre, cur, index) => {
          return pre + cur.w
        }, 0)
      } else if (_rows.length === 1)  {
        sumCol = _rows[0].w
      }

      // 内容溢出
      if (sumCol + item.w > MAX_ROW_NUM) {
        item.x = 0
        item.y = _targetMaxY.y + _targetMaxY.h
        arrayTarget.h += item.h
      } else {
        item.x = sumCol
        item.y = _targetMaxY.y
      }

      // 添加
      arrayTarget.children.push(item)
    },

    // 行组件添加元素
    rootAddItem(item) {
      // TODO:组件添加的位置信息需要放置在结尾处
      const _targetMaxY = _.maxBy(initData, 'y')
      item.x = 0
      item.y = _targetMaxY.y + _targetMaxY.h
      this.layout.push(item)
    },

    // 移除元素
    rootRemoveItem (val) {
      this.removeItem(this.layout, val)
    },
    removeItem: function (arrayTarget, val) {
      const index = arrayTarget.map(item => item.i).indexOf(val);
      arrayTarget.splice(index, 1);
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

    handleItemDragend (event) {
      // 根据id标识拖拽目标
      const _id = event.currentTarget.getAttribute('i')
      const _target = findTargetById(this.layout, _id)
      if (this.isInsideContainer(document.getElementById('content2'), event)) {
        // TODO:判断元素若还在容器组件中则Return
        // 拖拽元素在大容器中移除
        this.rootRemoveItem(_id)
        // TODO:目标容器添加拖拽元素
        this.comAddItem(this.layout[0], _target)
      }
    },

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    btnAdd() {
      const _r = String(++this.index)
      const cell = {
        x: (this.layout.length * 2) % this.colNum,
        y: this.layout.length + this.colNum,
        w: 2,
        h: 4,
        i: _r,
        id: _r,
      }
      this.rootAddItem(cell)
    },

    btnChildAdd () {},

    // 更新行组件高度
    handleUpdateRow (row) {
      const _targetMaxY = _.maxBy(row.children, 'y')
      row.h = _targetMaxY.h + _targetMaxY.y
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
