<template>
  <div id="app">
    <header id="headerContainer">
      <div id="headerLeft">
        <h2><router-link to="/">DejaVue</router-link></h2>
      </div>
      <div id="headerRight">
        <ul>
          <li id="viz-link"><router-link to="/tree">App Visualization</router-link></li>
          <!--<li v-bind:class="{active: c}" @click="toggleActive"><router-link to="/timeline">Time Traveler</router-link></li>-->
          <!--<li v-bind:class="{active: b}" @click="toggleActive"><router-link to="/render">Stress Testing</router-link></li>-->
        </ul>
      </div>
    </header>    

    <section id="contentContainer"> 
      <keep-alive>
          <router-view></router-view>
      </keep-alive>
    </section>
    <p><a href="https://github.com/MiCottOn/DejaVue/issues" target="_blank">Submit an issue on Github</a></p>
  </div>
</template>

<script>  
import Home from './home.vue';
import Tree from './tree.vue';
import Testing from './testing.vue';
// import { findProps } from './parseLogic/findProps';
// ^ we should do something like this for best practice

export default {
  name: 'DejaVue',
  components: { Tree, Testing },
  data () {
    return {
      title: 'DejaVue',
      tagline: 'Vue component visualizer',
    }
  }
}
</script>
