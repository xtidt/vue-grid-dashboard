/**
 * 根据组件ID递归查找
 * @param {Object} originalData 被查找数据 目标对象
 * @param {String} id 组件对应的字符串
 * @return {Object} 组件具体参数
 */
export function findTargetById (originalData, id) {
  let _tmp = null
  /**
   * 深度优先递归遍历函数
   * @param {Object} node 节点数据
   * @param {String} id 节点字符标识
   */
  function deepTraversal (node, id) {
    node.children.map((w) => {
      if (w.id === id) {
        _tmp = w
      } else {
        if (w.children) {
          deepTraversal(w, id)
        } else {
          // next
        }
      }
    })
  }

  originalData.map((w) => {
    if (w.id === id) {
      _tmp = w
    } else {
      if (w.children) {
        deepTraversal(w, id)
      }
    }
  })

  return _tmp
}
