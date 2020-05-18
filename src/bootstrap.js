/**
 * @function GM_getValue
 * @param {String} name
 * @return {String}
 */
/**
 * @function GM_setValue
 * @param {String} name
 * @param {String} value
 * @return {String}
 */
/**
 *
 * @param obj
 */
const freezeObj = function(obj) {
  Object.freeze(obj)
  Object.keys(obj).forEach(function(key, value) {
    if (typeof obj[key] === 'object') {
      freezeObj(obj[key]) //递归方法，继续调用
    }
  })
}, throttle = function(fn, delay, mustRunDelay) {
  let timer = null
  let t_start
  return function() {
    let context = this, args = arguments, t_curr = +new Date()

    // 清除定时器
    clearTimeout(timer)

    // 函数初始化判断
    if (!t_start) {
      t_start = t_curr
    }

    // 超时（指定的时间间隔）判断
    if (t_curr - t_start >= mustRunDelay) {
      fn.apply(context, args)
      t_start = t_curr
    } else {
      timer = setTimeout(function() {
        fn.apply(context, args)
      }, delay)
    }
  }
}
let bookmarks,
  store = GM_getValue(location.pathname)
try {
  bookmarks = (store && JSON.parse(store)) || []
} catch (e) {
  console.error(e)
  bookmarks = []
}
let text = document.querySelector('body').innerText.replace(/&#.+?;/g, function(t) {
    let temp = document.createElement('div')
    temp.innerHTML = t
    let output = temp.innerText || temp.textContent
    temp = null
    return output
  }),
  lines = text.split('\n')
    .map((line, index) => ({ line, index }))
freezeObj(lines)

export { bookmarks, freezeObj, throttle, lines }
