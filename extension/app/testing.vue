<template>
  <div id="renderContainer">
    <h1>{{title}}</h1>
    <h2>{{tagline}}</h2>
  </div>
</template>

<script>
export default {
  name: 'Testing',
  data () {
    return {
      title: 'Testing',
      tagline: 'Component render times',
      zrt: 'Component render times'
    }
  }
}
</script>

