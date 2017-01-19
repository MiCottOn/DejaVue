<template>
  <div id="treeContainer">
    <h1>{{title}}</h1>
    <h2>{{tagline}}</h2>
  </div>
  
</template>

<script>
 
export default {
  name: 'app3',
  data () {
    return {
      title: 'App3',
      tagline: 'Third Root Node'
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