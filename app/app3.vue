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
  components: { Render },
  name: 'app3',
  data () {
    return {
      title: 'App3',
      tagline: 'Third Root Node'
    }
  }
}
</script>
