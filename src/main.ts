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
 * @property {Window} unsafeWindow
 */

import '@/styles/index.scss'
import 'animate.css/animate.css'
import Vue from 'vue'

import App from './App.vue'
import { init } from '@/bootstrap'
// import { MdContent } from 'vue-material/dist/components'
// import 'vue-material/dist/vue-material.min.css'
// import 'vue-material/dist/theme/default.css'
// Vue.use(MdContent)
const style = document.createElement('style')
style.innerHTML = `pre{display:none;}`
const head = document.getElementsByTagName('head').item(0)
head && head.appendChild(style)

// @ts-ignore
unsafeWindow.Vue = Vue

document.addEventListener('DOMContentLoaded', init)
