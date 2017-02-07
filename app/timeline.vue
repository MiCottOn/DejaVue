<template>
  <div id="treeContainer">
    <div id="tabSwitcher">
      <div id="timelinePage">Page</div>      
      <div id="timelineTree">Tree</div>      
    </div>

    <iframe width="100%" height="700px" id="timelineFrame">


    </iframe>
  </div>


  
</template>

<script>
 
export default {
  name: 'timeline',

  data () {
    return {
      title: 'Timeline'
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