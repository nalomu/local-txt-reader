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
      <div ref="current" class="page current">
        <template v-for="(line, index) in episodes">
          <div v-if="line" :key="index">
            <span v-html="line.line" />
            <button class="bookmark-add btn" @click="addBookmark(line)">
              添加书签
            </button>
          </div>
        </template>
      </div>
    </div>
    <div class="slider-container tooltip">
      <input
        type="range"
        min="0"
        :value="episode"
        :max="lines.length-1"
        class="slider"
        @input="handleRange"
      >
      <span class="tooltip-text">
        <span v-html="textFilter(episode.title)" /><br>
        {{ ((currentPage.start / (lines.length-1)).toFixed(2) * 100).toFixed(0) }}%/100%
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { bookmarks, getLines, throttle } from '@/bootstrap.js'
import { Watch } from 'vue-property-decorator'

interface ILine {
  line: string
  index: number
}

interface IEpisode {
  lines: ILine[]
  title: string
  index: number
}

interface IBookmark {
  desc: string
  episode: number
}

@Component({})
export default class App extends Vue {
  page = 0
  activeEpisode = 0

  bookmarks: IBookmark[] = bookmarks
  lines: ILine[] = getLines()
  episodes: IEpisode[] = []

  drawerOpen = false
  showBookmarks = false
  throttle: Function = throttle

  get episode(): IEpisode {
    return this.episodes[this.activeEpisode]
  }

  addBookmark(episode: IEpisode): void {
    this.bookmarks.push({ episode: episode.index, desc: episode.lines[0]?.line })
    alert('添加成功')
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
    if (this.page >= this.maxPage) {
      this.nextEpisode()
    }
    this.page++
  }

  jumpPrevPage() {
    if (this.page <= 0) {
      this.prevEpisode()
    }
    this.page--
  }

  get maxPage(): number {
    return (this.$refs.current as HTMLElement).clientWidth
  }

  handleJump(index: number): void {
    this.activeEpisode = index
  }

  handleRange(e: InputEvent): void {
    this.jumpEpisodes(Number((e.target as HTMLInputElement).value))
  }

  textFilter(text: string): string {
    return text.length > 20 ? (text.substring(0, 20) + '...') : text
  }

  async checkEpisodes() {
    const matchedPoint: ILine[] = []
    this.lines.forEach((line: ILine) => {
      const matched = /^\s*第?([\d一二三四五六七八九十百千万]+)[章话話卷]/igs.exec(line.line)
      if (matched) {
        matchedPoint.push(line)
      }
    })
    let startPoint = 0
    for (let i = 0; i < matchedPoint.length; i++) {
      this.episodes.push({
        index: i,
        title: matchedPoint[i].line,
        lines: this.lines.slice(startPoint, matchedPoint[i].index)
      })
      startPoint = matchedPoint[i].index + 1
    }
  }

  mounted() {
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

  nextEpisode() {
    this.jumpEpisodes(this.activeEpisode + 1)
  }

  prevEpisode() {
    this.jumpEpisodes(this.activeEpisode - 1)
  }

  jumpEpisodes(episode: number) {
    console.log(episode)
    this.activeEpisode = episode
  }
}
</script>
