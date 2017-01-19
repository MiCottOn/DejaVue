<template>
  <div id="treeContainer">
    <h1>{{title}}</h1>
    <div id="rootObject">{{findRootNodes}}</div>
    <div id="componentsObject">componentsObject</div>
  </div>
  
</template>

<script>
 
export default {
  name: 'testing',

  data () {
    return {
      title: 'Testing',
      findRootNodes: function() {
        const keysArray = Object.keys(document.body.children);
        const rootNodes = [];
        const findRoots = (array) => {
          for (let i = 0; i < array.length; i += 1) {
            const testNode = document.body.children[array[i]]; 

            if (testNode.__vue__ && !rootNodes.includes(testNode)) rootNodes.push(testNode);
            if (testNode.$children) return findRoots(testNode.$children);
          }

          return rootNodes.join(',')
        }
        return findRoots(keysArray)
      }()
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