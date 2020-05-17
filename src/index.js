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

import '@/styles/index.scss'

import Vue from 'vue/dist/vue.esm'

var throttle = function(fn, delay, mustRunDelay) {
  var timer = null
  var t_start
  return function() {
    var context = this, args = arguments, t_curr = +new Date()

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
};
(async() => {
  let store = GM_getValue(location.pathname)
  let bookmarks
  try {
    bookmarks = (store && JSON.parse(store)) || []
  } catch (e) {
    console.log(e)
    bookmarks = []
  }
  let text = document.querySelector('body').innerText.replace(/&#.+?;/g, function(t) {
    let temp = document.createElement('div')
    temp.innerHTML = t
    let output = temp.innerText || temp.textContent
    temp = null
    return output
  })
  let lines = text.split('\n')
    .map((line, index) =>
      ({ line, showBookmark: false, index }))
  document.querySelector('body').innerHTML = '<div id="app"></div>'
  document.querySelector('head').innerHTML += `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">`
  new Vue({
    template: `
      <div
        id="app"
      >
        <div id="bookmarks">
          <button class="show-bookmark btn" @click="showBookmarks = !showBookmarks">书签</button>
          <transition name="fade">
            <div
              v-if="showBookmarks"
              class="bookmarks-panel"
            >
              <transition-group
                name="list-complete"
                tag="ul"
                mode="out-in"
              >
                <li
                  v-for="(bookmark, index) in bookmarks"
                  :key="index + '|' + bookmark.index"
                  class="list-complete-item"
                >
                  <span>第{{ bookmark.index }}行</span>
                  <span>{{ bookmark.desc|textFilter }}</span>
                  <a style="float: right" @click="handleJump(bookmark.index)">跳转</a>
                  <a style="float: right" @click="bookmarks.splice(index, 1)">x</a>
                </li>
                <li v-if="bookmarks.length <= 0">没有书签</li>
              </transition-group>
            </div>
          </transition>
        </div>
        <div
          class="content"
          ref="content"
        >
          <div
            v-for="line in showLines"
            :key="line.index"
          >
            <span>{{ line.line }}</span>
            <button class="bookmark btn" @click="addBookmark(line)">
              添加书签
            </button>
          </div>
        </div>
      </div>`,
    filters: {
      textFilter(text) {
        return text.length > 20 ? (text.substring(0, 20) + '...') : text
      }
    },
    data() {
      return {
        start: 0,
        end: 0,
        page: 1,
        bookmarks,
        showBookmarks: false,
        lines,
        timer: false,
        prev: 0,
        prevHeight: 0
      }
    },
    computed: {
      width() {
        return this.$el.clientWidth
      },
      height() {
        return this.$el.clientHeight
      },
      showLines() {
        return this.lines.slice(this.start, this.end)
      }
    },
    mounted() {
      this.prev = this.end = this.start + this.height / 39
      const observer = new MutationObserver(throttle(this.checkHeight))
      observer.observe(this.$refs.content, { childList: true, subtree: true })
      window.addEventListener('resize', this.resetPrev)
      window.addEventListener('keydown', this.handlePage)
    },
    watch: {
      bookmarks: async(newValue) => {
        GM_setValue(location.pathname, JSON.stringify(newValue))
      }
    },
    methods: {
      addBookmark(line) {
        this.bookmarks.push({ index: line.index, desc: line.line })
        // console.log(this.bookmarks)
        alert('添加成功')
      },
      checkHeight() {
        if (this.$refs.content.clientHeight > this.height) {
          this.prev = this.end--
        } else {
          if (this.end + 1 !== this.prev && this.prevHeight !== this.$refs.content.clientHeight)
            this.prev = this.end++
        }
        this.prevHeight = this.$refs.content.clientHeight
      },
      handlePage(event) {
        switch (event.key) {
          case 'ArrowRight':
            if (this.end < this.lines.length) {
              this.start = this.end
            }
            this.resetPrev()
            break
          case 'ArrowLeft':
            if (this.start > 0) {
              if (this.start - this.height / 39 < 0) {
                this.start = 0
              } else {
                this.start -= this.height / 39
              }
            }
            this.resetPrev()
            break
        }
        // console.log(`${this.start}, ${this.end}`)
      },
      handleJump(index) {
        this.start = index
        this.resetPrev()
      },
      resetPrev() {
        this.prev = null
        this.prevHeight = null
        this.end = this.start + this.height / 39
        this.checkHeight()
      }
    }
  }).$mount('#app')
})()
