<template>
  <div id="app">
    <div class="bookmark-container">
      <button
        class="show-bookmark btn"
        @click="showBookmarks = !showBookmarks"
      >
        书签
      </button>
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
              <span>{{ textFilter(bookmark.desc) }}</span>
              <a
                style="float: right"
                @click="handleJump(bookmark.index)"
              >跳转</a>
              <a
                style="float: right"
                @click="bookmarks.splice(index, 1)"
              >x</a>
            </li>
            <li v-if="bookmarks.length <= 0">
              没有书签
            </li>
          </transition-group>
        </div>
      </transition>
    </div>
    <button
      class="btn"
      style="position:absolute;"
      @click="drawerOpen = true"
    >
      目录
    </button>
    <div :class="['drawer-container',drawerOpen?'open':'']">
      <div :class="['drawer-left', 'left-bar']">
        <ul class="episodes">
          <li
            v-for="episode in episodes"
            :key="episode.index"
            @click="handleJump(episode.index)"
            v-html="episode.line"
          />
        </ul>
      </div>
      <div
        class="drawer-mask"
        :style="{display: drawerOpen?'block':'none'}"
        @click="drawerOpen = false"
      />
    </div>
    <div
      ref="content"
      class="content"
    >
      <!--为了减少内存占用重用组件-->
      <transition-group mode="">
        <div ref="prev" :key="prevPageLines.length ? prevPageLines[0].index : -1" class="page prev">
          <template v-for="(line, index) in prevPageLines">
            <div v-if="line" :key="index">
              <span v-html="line.line" />
              <button class="bookmark-add btn" @click="addBookmark(line)">
                添加书签
              </button>
            </div>
          </template>
        </div>
        <div ref="current" :key="showLines.length ? showLines[0].index : 0" class="page current">
          <template v-for="(line, index) in showLines">
            <div v-if="line" :key="index">
              <span v-html="line.line" />
              <button class="bookmark-add btn" @click="addBookmark(line)">
                添加书签
              </button>
            </div>
          </template>
        </div>
        <div ref="next" :key="nextPageLines.length ? nextPageLines[0].index : -2" class="page next">
          <template v-for="(line, index) in nextPageLines">
            <div v-if="line" :key="index">
              <span v-html="line.line" />
              <button class="bookmark-add btn" @click="addBookmark(line)">
                添加书签
              </button>
            </div>
          </template>
        </div>
      </transition-group>
    </div>
    <div class="slider-container tooltip">
      <input
        type="range"
        min="0"
        :value="currentPage.start"
        :max="lines.length-1"
        class="slider"
        @input="handleRange"
      >
      <span class="tooltip-text">
        <span v-html="textFilter(lines[currentPage.start].line)" /><br>
        {{ ((currentPage.start / (lines.length-1)).toFixed(2) * 100).toFixed(0) }}%/100%
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { bookmarks, throttle, getLines } from '@/bootstrap.js'
import { Watch } from 'vue-property-decorator'

interface IPage {
  start: number
  end: number
  prev: number | null
  prevHeight: number | null
  mountedKey: 'start' | 'end'
  readonly height: number
}

interface ILine {
  line: string
  index: number
}

interface IBookmark {
  desc: string
  index: number
}

@Component({})
export default class App extends Vue {
  constructor() {
    super()
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    this.currentPage = {
      start: 0,
      end: 0,
      prev: 0,
      prevHeight: null,
      mountedKey: 'start',
      get height() {
        return (self.$refs.current as HTMLElement).clientHeight
      }
    }
    this.prevPage = {
      start: 0,
      get end() {
        return self.currentPage.start
      },
      prev: 0,
      prevHeight: null,
      mountedKey: 'end',
      get height() {
        return (self.$refs.prev as HTMLElement).clientHeight
      }
    }

    this.nextPage = {
      get start() {
        return self.currentPage.end
      },
      end: 0,
      prev: 0,
      prevHeight: null,
      mountedKey: 'start',
      get height() {
        return (self.$refs.next as HTMLElement).clientHeight
      }
    }
  }

  currentPage: IPage
  prevPage: IPage
  nextPage: IPage

  bookmarks: IBookmark[] = bookmarks
  lines: ILine[] = getLines()
  episodes: ILine[] = []

  drawerOpen = false
  showBookmarks = false

  get contentHeight() {
    console.log(this.$el.clientHeight)
    return this.$el.clientHeight
  }

  throttle: Function = throttle

  addBookmark(line: ILine): void {
    this.bookmarks.push({ index: line.index, desc: line.line })
    alert('添加成功')
  }

  checkHeight(): void {
    // console.log(this.current.height)
    for (const key of ['prevPage', 'currentPage', 'nextPage']) {
      // for (const key of ['prevPage', 'nextPage']) {
      // for (const key of ['currentPage']) {
      if (this.currentPage.mountedKey === 'start') {
        if (this[key].height > this.contentHeight) {
          this[key].prev = this[key].end--
        } else if (this[key].end + 1 !== this[key].prev &&
          this[key].prevHeight !== this[key].height) {
          this[key].prev = this[key].end++
        }
      } else {
        if (this[key].height > this.contentHeight) {
          this[key].prev = this[key].start++
        } else if (this[key].start - 1 !== this[key].prev &&
          this[key].prevHeight !== this[key].height) {
          if (this[key].start <= 0) {
            if (key === 'currentPage') {
              this.currentPage.mountedKey = 'start'
              this.resetPrev()
            }
          } else {
            this[key].prev = this[key].start--
          }
        }
      }
      this[key].prevHeight = this[key].height
    }
  }

  handlePage(event: KeyboardEvent | WheelEvent): void {
    if (event instanceof KeyboardEvent) {
      switch (event.key) {
        case 'ArrowRight':
          this.jumpNextPage()
          break
        case 'ArrowLeft':
          this.jumpPrevPage()
          break
        case 'Escape':
          if (this.drawerOpen) {
            this.drawerOpen = false
          }
          break
      }
    } else if (event instanceof WheelEvent) {
      if (event.deltaY > 0) {
        this.jumpNextPage()
      } else if (event.deltaY < 0) {
        this.jumpPrevPage()
      }
    }
  }

  jumpNextPage() {
    if (this.currentPage.end < this.lines.length - 1) {
      this.currentPage.mountedKey = 'start'
      // this.currentPage.start = this.currentPage.end
      const start = this.currentPage.end
      this.currentPage.end = this.nextPage.end
      this.currentPage.start = start
    }
    this.resetPrev(true)
  }

  jumpPrevPage() {
    if (this.currentPage.start > 0) {
      this.currentPage.mountedKey = 'end'
      // this.currentPage.end = this.currentPage.start
      const end = this.currentPage.start
      this.currentPage.start = this.prevPage.start
      this.currentPage.end = end
    }
    this.resetPrev(true)
  }

  handleJump(index: number): void {
    this.currentPage.mountedKey = 'start'
    this.currentPage.start = index
    this.resetPrev()
  }

  resetPrev(dontResetCurrent?: boolean | Event): void {
    let keys
    if (dontResetCurrent instanceof Event) {
      keys = ['prevPage', 'currentPage', 'nextPage']
    } else {
      keys = dontResetCurrent ? ['prevPage', 'nextPage'] : ['prevPage', 'currentPage', 'nextPage']
    }
    // for (const key of ['prevPage', 'currentPage', 'nextPage']) {
    for (const key of keys) {
      // for (const key of ['currentPage']) {
      this[key].prev = null
      this[key].prevHeight = null
      if (this[key].mountedKey === 'start') {
        this[key].end = Number(Number(this[key].start + this.$el.clientHeight / 39).toFixed(0))
      } else {
        let temp = Number(Number(this[key].end - this.$el.clientHeight / 39).toFixed(0))
        temp = temp < 0 ? 0 : temp
        this[key].start = temp
      }
    }
    this.checkHeight()
  }

  handleRange(e: InputEvent): void {
    this.currentPage.mountedKey = 'start'
    this.currentPage.start = Number((e.target as HTMLInputElement).value)
    this.resetPrev()
  }

  textFilter(text: string): string {
    return text.length > 20 ? (text.substring(0, 20) + '...') : text
  }

  async checkEpisodes() {
    this.lines.forEach((line: ILine) => {
      const matched = /^\s*第?([\d一二三四五六七八九十百千万]+)[章话話卷]/igs.exec(line.line)
      if (matched) {
        this.episodes.push(line)
      }
    })
  }

  get showLines(): ILine[] {
    return this.lines.slice(this.currentPage.start, this.currentPage.end).filter(item => item)
  }

  get prevPageLines(): ILine[] {
    return this.lines.slice(this.prevPage.start, this.prevPage.end).filter(item => item)
  }

  get nextPageLines(): ILine[] {
    return this.lines.slice(this.nextPage.start, this.nextPage.end).filter(item => item)
  }

  get probablyLine(): number {
    return Number((this.contentHeight / 39).toFixed(0))
  }

  mounted() {
    this.currentPage.prev = this.currentPage.end =
      this.currentPage.start + this.probablyLine
    this.nextPage.end = this.nextPage.start + this.probablyLine

    const observer = new MutationObserver(this.throttle(this.checkHeight, 50))
    observer.observe((this.$refs.content as HTMLElement), { childList: true, subtree: true })
    window.addEventListener('resize', this.resetPrev)
    window.addEventListener('keydown', throttle(this.handlePage, 1))
    ;(this.$refs.content as HTMLElement).addEventListener('wheel', this.handlePage)
    this.checkEpisodes()
  }

  @Watch('bookmarks')
  async onBookmarksChange(newValue: IBookmark) {
    // @ts-ignore
    // eslint-disable-next-line no-undef
    GM_setValue(location.pathname, JSON.stringify(newValue))
  }
}
</script>
