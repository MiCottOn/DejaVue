<template>
  <div id="treeContainer">

    <a href="#" class="toggle-drawer" @click="toggleDrawer">{{toggleMessage}}</a>
    <div id="sidebar" class="hidden" v-if="open">
      <ul class="components">
        <h2>Components</h2>
        <li class="component">
          <h3><a href="#">Root</a></h3>
        </li>
        <li>
          <h3><a href="#">DemoHeader</a></h3>
        </li>
        <li>
          <h3><a href="#">PostForm</a></h3>
        </li>
        <li>
          <h3><a href="#" @click="toggleVisible">PostList*</a></h3>
          <div class="layer-1" v-if="visible">
            <h4>Props</h4>
            <ul>
              <li>
                <p>Prop 1</p>
              </li>
              <li>
                <p>Prop 2</p>
              </li>
              <li>
                <p>Prop 3</p>
              </li>
            </ul>
            <h4>Vars</h4>
            <ul>
              <li><p>Var 1</p></li>
              <li><p>Var 2</p></li>
              <li><p>Var 3</p></li>
            </ul>
            <h4>Slots</h4>
            <ul>
              <li><p>Slot 1</p></li>
              <li><p>Slot 2</p></li>
            </ul>
          </div>
        </li>
        <li>
          <h3><a href="#">DemoPost</a></h3>
        </li>
        <li>
          <h3><a href="#">CommentList</a></h3>
        </li>
        <li>
          <h3><a href="#">CommentBox</a></h3>
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
