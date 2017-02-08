<template>
  <div id="app">
    <header id="headerContainer">
      <div id="headerLeft">
        <h2><router-link to="/">DejaVue</router-link></h2>
      </div>
      <div id="headerRight">
        <ul>
          <li v-bind:class="{active: a}" @click="toggleActive"><router-link to="/tree">Application Visualization</router-link></li>
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
      a: true,
      b: false,
      c: false
    }
  }, 
  methods: {
    toggleActive: function() {
      if (this.a) {
        this.a = false;
        this.b = true;
        this.c = false;
      }
      else if (this.b) {
        this.b = false;
        this.a = true;
        this.c = false;
      }

      else {
        this.b = false;
        this.a = false;
        this.c = true;
      }
    }
  }
}
</script>
