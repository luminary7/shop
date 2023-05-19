import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.scss'
// 导入字体图标
import './assets/fonts/iconfont.css'
import axios from 'axios';
// import { config } from 'vue/types/umd'
axios.defaults.baseURL = 'http://www.tangxiaoyang.vip:8888/api/v2/'
axios.interceptors.request.use(config => {
  // console.log(config)
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
  config.headers.Authorization = userInfo ? userInfo.token : ''
  return config
})

Vue.prototype.$http = axios
Vue.config.productionTip = false
// 全局注册第三方的表格组件
import ZkTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', ZkTable)

// 导入工具库
import utils from './libs/utils';
Vue.prototype.$utils = utils

// 引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(VueQuillEditor, /* { default global options } */)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
