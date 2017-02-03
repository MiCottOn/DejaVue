<template>
  <div id="treeContainer">
  </div> 
</template>

<script>
 
export default {
  name: 'tree',
  data () {
    return {
      open: false,
      visible: false,
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
    },
    toggleVisible: function() {
      if(!this.visible) {
        this.visible = true;
      } else {
        this.visible = false
      }
    }
  }
}
</script>
