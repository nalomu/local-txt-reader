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
import Vue from 'vue/dist/vue.esm'
import App from './App.vue'
// import { MdContent } from 'vue-material/dist/components'
// import 'vue-material/dist/vue-material.min.css'
// import 'vue-material/dist/theme/default.css'
// Vue.use(MdContent)

unsafeWindow.Vue = Vue;

(async() => {
  document.querySelector('body').innerHTML = '<div id="app"></div>'
  document.querySelector('head').innerHTML += `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">`
  new Vue({
    ...App
  }).$mount('#app')
  // GM_xmlhttpRequest({
  //   method: 'get',
  //   url: 'http://localhost:8098',
  //   onload: function(response) {
  //     window.eval(response.responseText)
  //   }
  // })
})()
