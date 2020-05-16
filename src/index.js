/**
 * @method GM_getValue
 * @param key
 * @return String
 */
/**
 * @method GM_setValue
 * @param key
 * @param value
 * @return String
 */

import '@/css/index.css'

import Vue from 'vue/dist/vue.esm'
import waves from './waves'
Vue.use(waves)

let store = GM_getValue(location.pathname)
let bookmarks
try {
  bookmarks = (store && JSON.parse(store)) || []
} catch (e) {
  console.log(e)
  bookmarks = []
}
let text = document.querySelector('pre').innerText.replace(/&#.+?;/g, function(t) {
  let temp = document.createElement('div')
  temp.innerHTML = t
  let output = temp.innerText || temp.textContent
  temp = null
  return output
})
let lines = text.split('\n')
document.querySelector('pre').remove()
document.querySelector('body').innerHTML = '<div id="app"></div>'
new Vue({
  template: `
    <div id="app">
      <div id="bookmarks">
        <button v-waves class="show-bookmark btn" @click="showBookmarks = !showBookmarks">书签</button>
        <transition name="fade">
          <div v-if="showBookmarks">
            <ul>
              <li v-for="(bookmark, index) in bookmarks">
                <span>第{{ bookmark.index }}行</span>
                <span>{{ bookmark.desc }}</span>
                <a :href="'#line'+bookmark.index">跳转</a>
                <a @click="bookmarks.splice(index, 1)">x</a>
              </li>
            </ul>
          </div>
        </transition>
      </div>
      <div class="content">
        <div
          v-for="(line, index) in lines"
          :id="'line' + index"
          :key="index"
        >
          <span>{{ line }}</span>
          <button v-waves class="bookmark btn" @click="addBookmark(line, index)">添加书签</button>
        </div>
      </div>
    </div>`,
  data: {
    bookmarks,
    showBookmarks: false,
    lines
  },
  watch: {
    bookmarks(newValue, oldValue) {
      GM_setValue(location.pathname, JSON.stringify(newValue))
    }
  },
  methods: {
    addBookmark(line, index) {
      const desc = line.substr(0, 10) + '...'
      this.bookmarks.push({ index, desc })
      alert('添加成功')
    }
  }
}).$mount('#app')
