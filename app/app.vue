<template>
  <div id="app">
    <div id="headerContainer">
      <div id="headerLeft">
        <router-link to="/"><img src="./assets/img/logo.png" style="height: 100px"></router-link>
      </div>
      <div id="headerRight">
        <ul>
          <li><router-link to="/tree">Go to Tree</router-link></li>
          <li><router-link to="/render">Go to Render</router-link></li>
        </ul>
      </div>
    </div>

    <div id="contentContainer"> 
      <router-view id="routerView"></router-view>
    </div>
    
    <div id="footerContainer">
      <ul>
        <li><a href="http://router.vuejs.org/" target="_blank">GitHub</a></li>
        <li><a href="http://vuex.vuejs.org/" target="_blank">Submit Issue</a></li>
        <li><a href="http://vue-loader.vuejs.org/" target="_blank">Submit Request</a></li>
        <li><a href="https://github.com/vuejs/awesome-vue" target="_blank">DejaVue.com</a></li>
      </ul>
    </div>
    
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      title: 'DejaVue',
      tagline: 'Vue component visualizer'
    }
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#headerContainer {
  display: flex;
  flex-direction: row;
  width: 100%;
}

#headerLeft {
  flex: 1 0 0;
  text-align: left;
  padding-left: 20px;
}


#headerRight {
  flex: 1 0 0;
  text-align: right;
  padding-right: 20px;
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