import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './app.vue'
import Home from './home.vue'
import Tree from './tree.vue'
import Timeline from './timeline.vue'
import Testing from './testing.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/index.html', components: { default: Tree } },
    { path: '/', component: Tree },
    {path: '/tree', component: Tree},
    {path: '/timeline', component: Timeline},
    {path: '/testing', component: Testing},
  ]
})

new Vue({
  router,
  el: '#app',
  render: h => h(App)
})


