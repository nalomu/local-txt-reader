<template>
  <div id="app">
    <div class="bookmark-container">
      <button class="show-bookmark btn" @click="showBookmarks = !showBookmarks">书签</button>
      <transition name="fade">
        <div
          v-if="showBookmarks"
          class="bookmark-panel"
        >
          <transition-group
            name="list-complete"
            tag="ul"
            class="md-scrollbar md-content bookmark-list"
            mode="out-in"
          >
            <li
              v-for="(bookmark, index) in bookmarks"
              :key="index + '|' + bookmark.index"
              class="list-complete-item bookmark-item"
            >
              <span>第{{ bookmark.index }}行</span>
              <span>{{ bookmark.desc | textFilter }}</span>
              <a style="float: right" @click="handleJump(bookmark.index)">跳转</a>
              <a style="float: right" @click="bookmarks.splice(index, 1)">x</a>
            </li>
            <li v-if="bookmarks.length <= 0">没有书签</li>
          </transition-group>
        </div>
      </transition>
    </div>
    <button
      class="btn"
      @click="drawerOpen = true"
      style="position:absolute;"
    >目录
    </button>
    <div :class="['drawer-container',drawerOpen?'open':'']">
      <div :class="['drawer-left', 'left-bar']">
        <ul class="episodes">
          <li
            v-for="episode in episodes"
            :key="episodes.index"
            @click="handleJump(episode.index)"
            v-html="episode.line"
          />
        </ul>
      </div>
      <div class="drawer-mask" @click="drawerOpen = false" :style="{ display:drawerOpen?'block':'none' }"></div>
    </div>
    <div class="content" ref="content">
      <!--为了减少内存占用重用组件-->
      <div v-for="(line, index) in showLines" :key="index">
        <span v-html="line.line" />
        <button class="bookmark-add btn" @click="addBookmark(line)">
          添加书签
        </button>
      </div>
    </div>
    <div class="slider-container tooltip">
      <input
        type="range"
        min="0"
        :value="start"
        :max="lines.length-1"
        class="slider"
        @input="handleRange"
      >
      <span class="tooltip-text">
        <span v-html="textFilter(lines[start].line)" /><br>
        {{ ((start / (lines.length-1)).toFixed(2) * 100).toFixed(0) }}%/100%
      </span>
    </div>
  </div>
</template>

<script>
import { bookmarks, throttle, lines } from '@/bootstrap'

export default {
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
      prevHeight: 0,
      episodes: [],
      drawerOpen: false
    }
  },
  methods: {
    throttle,
    addBookmark(line) {
      this.bookmarks.push({ index: line.index, desc: line.line })
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
          if (this.end < this.lines.length - 1) {
            this.start = this.end
          }
          this.resetPrev()
          break
        case 'ArrowLeft':
          if (this.start > 0) {
            if (this.start - Number((this.height / 39).toFixed(0)) < 0) {
              this.start = 0
            } else {
              this.start -= Number((this.height / 39).toFixed(0))
            }
          }
          this.resetPrev()
          break
      }
    },
    handleJump(index) {
      console.log(index)
      this.start = index
      this.resetPrev()
    },
    resetPrev() {
      this.prev = null
      this.prevHeight = null
      this.end = this.start + Number((this.$el.clientHeight / 39).toFixed(0))
      this.checkHeight()
    },
    handleRange(e) {
      this.start = Number(e.target.value)
      this.resetPrev()
    },
    textFilter(text) {
      return text.length > 20 ? (text.substring(0, 20) + '...') : text
    },
    async checkEpisodes() {
      this.lines.forEach((line, index) => {
        const matched = /^\s*第?([\d一二三四五六七八九十]+)[章话卷]/igs.exec(line.line)
        if (matched) {
          this.episodes.push(line)
        }
      })
      return Promise.resolve()
    }
  },
  filters: {
    textFilter(text) {
      return text.length > 20 ? (text.substring(0, 20) + '...') : text
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
      return this.lines.slice(this.start, this.end).filter(item => item)
    }
  },
  mounted() {
    this.prev = this.end = this.start + Number((this.height / 39).toFixed(0))
    const observer = new MutationObserver(this.throttle(this.checkHeight))
    observer.observe(this.$refs.content, { childList: true, subtree: true })
    window.addEventListener('resize', this.resetPrev)
    window.addEventListener('keydown', this.handlePage)
    this.checkEpisodes()
  },
  watch: {
    bookmarks: async(newValue) => {
      GM_setValue(location.pathname, JSON.stringify(newValue))
    }
  }
}
</script>

<style scoped>

</style>
