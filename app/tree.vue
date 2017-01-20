<template>
  <div id="treeContainer">
    <h1>{{title}}</h1>
    <h2>{{tagline}}</h2>
    <render></render>
  </div>
  
</template>

<script>
import Render from './render.vue'
 
export default {
  name: 'tree',
  components: {
    Render
  },
  data () {
    return {
      title: 'Tree',
      tagline: 'Tree Visualization'
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>