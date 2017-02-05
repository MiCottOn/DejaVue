<template>
  <div id="app">
    <header id="headerContainer">
      <div id="headerLeft">
        <h1><router-link to="/">DejaVue</router-link></h1>
      </div>
      <div id="headerRight">
        <ul>
          <li v-bind:class="{active: a}" @click="toggleActive"><router-link to="/tree">Component Tree</router-link></li>
          <li v-bind:class="{active: b}" @click="toggleActive"><router-link to="/render">Render Tests</router-link></li>
        </ul>
      </div>
    </header>    

    <section id="contentContainer"> 
      <keep-alive>
          <router-view></router-view>
      </keep-alive>
    </section>
  </div>
</template>

<script>
import Home from './home.vue';
import Tree from './tree.vue';
import Render from './render.vue';
// import { findProps } from './parseLogic/findProps';
// ^ we should do something like this for best practice

export default {
  name: 'app',
  components: { Tree, Render },
  data () {
    return {
      title: 'DejaVue',
      tagline: 'Vue component visualizer',
      a: true,
      b: false
    }
  }, 
  methods: {
    toggleActive: function() {
      if (this.a) {
        this.a = false;
        this.b = true;
      }
      else {
        this.b = false;
        this.a = true;
      }
    }
  }
}
</script>
