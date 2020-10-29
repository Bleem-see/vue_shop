import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入 treeTable
import TreeTable from 'vue-table-with-tree-grid'

// 引入axios
import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 配置 axios 请求拦截器, 保证拥有获取数据的权限
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})
Vue.prototype.$http = axios
// Vue.prototype.$axios = axios

Vue.config.productionTip = false

// 全局注册 treeTable
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
