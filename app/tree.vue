<template>
  <div id="treeContainer">
    <h1>{{title}}</h1>
    <h2>{{tagline}}</h2>
  </div>
  
</template>

<script>
 
export default {
  name: 'tree',
  data () {
    return {
      title: 'Tree',
      tagline: 'Tree Visualization'
    }
  }
}
</script>
