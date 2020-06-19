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
import Vue from 'vue'
import App from '@/App'

/**
 *
 * @param obj
 */

const freezeObj = function(obj) {
  Object.freeze(obj)
  Object.keys(obj).forEach(function(key) {
    if (typeof obj[key] === 'object') {
      freezeObj(obj[key]) // 递归方法，继续调用
    }
  })
}
const throttle = function(fn, delay, mustRunDelay) {
  let timer = null
  let timerStart
  return function() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this
    // eslint-disable-next-line prefer-rest-params
    const args = arguments
    const timerCurrent = +new Date()
    // 清除定时器
    clearTimeout(timer)

    // 函数初始化判断
    if (!timerStart) {
      timerStart = timerCurrent
    }

    // 超时（指定的时间间隔）判断
    if (timerCurrent - timerStart >= mustRunDelay) {
      fn.apply(context, args)
      timerStart = timerCurrent
    } else {
      timer = setTimeout(function() {
        fn.apply(context, args)
      }, delay)
    }
  }
}
let bookmarks, lines
// eslint-disable-next-line no-undef
const store = GM_getValue(location.pathname)
try {
  bookmarks = (store && JSON.parse(store)) || []
} catch (e) {
  console.error(e)
  bookmarks = []
}

export function init() {
  const text = document.querySelector('body').textContent.replace(/&#.+?;/g, function(t) {
    let temp = document.createElement('div')
    temp.innerHTML = t
    const output = temp.innerText || temp.textContent
    temp = null
    return output
  })
  lines = text.split('\n')
    .map((line, index) => ({ line, index }))
  freezeObj(lines)
  console.log(text.length)
  // @ts-ignore
  document.querySelector('body').innerHTML = '<div id="app"></div>'
  // @ts-ignore
  document.querySelector('head').innerHTML += '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">'
  new Vue({ render: h => h(App) }).$mount('#app')
}

export function getLines() {
  return lines
}

export { bookmarks, freezeObj, throttle }
