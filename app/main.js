import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './app.vue'
import Tree from './tree.vue'
import Render from './render.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    {path: '/home', component: App},
    {path: '/tree', component: Tree},
    {path: '/render', component: Render},
  ]
})

new Vue({
  router,
  el: '#app',
  render: h => h(App)
})