import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './app.vue'
import App2 from './app2.vue'
import App3 from './app3.vue'
import Home from './home.vue'
import Tree from './tree.vue'
import Render from './render.vue'
import Testing from './testing.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/index.html', components: { default: Home } },
    { path: '/', component: Home },
    {path: '/tree', component: Tree},
    {path: '/render', component: Render},
    {path: '/testing', component: Testing},
  ]
})

new Vue({
  router,
  el: '#app',
  render: h => h(App)
})
