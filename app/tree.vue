<template>
  <div id="treeContainer">

    <a href="#" class="toggle-drawer" @click="toggleDrawer">{{toggleMessage}}</a>
    <div id="sidebar" class="hidden" v-if="open">
      <ul>
        <li>
          <p>One</p>
        </li>
        <li>
          <p>Two</p>
        </li>
        <li>
          <p>Three</p>
        </li>
        <li>
          <p>Four</p>
        </li>
        <li>
          <p>Five</p>
        </li>
      </ul>
    </div>
  </div>
  
</template>

<script>
 
export default {
  name: 'tree',
  data () {
    return {
      open: false,
      toggleMessage: "open sidebar"
    }
  },
  methods: {
    toggleDrawer: function() {
      if(!this.open) {
        this.open = true;
        this.toggleMessage = "close sidebar"
      } else {
        this.open = false;
        this.toggleMessage = "open sidebar"
      }
    }
  }
}
</script>
