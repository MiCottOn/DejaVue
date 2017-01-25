<template>
  <div id="treeContainer">
    <h1>{{title}}</h1>
    <h2>{{tagline}}</h2>
    <home></home>
  </div>
  
</template>

<script>
   import Home from './home.vue'
export default {
  components: { Home },
  name: 'app2',
  data () {
    return {
      title: 'App2',
      tagline: 'Second Root Node'
    }
  }
}
</script>
