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
          <li><router-link to="/testing">Go to Testing</router-link></li>
        </ul>
      </div>
    </div>    

    <div id="contentContainer"> 
      <router-view></router-view>
    </div>
    <button @click="inspectDOM()"> Console log Vue Components </button>
    <div id="footerContainer">
      <ul>
        <li><a v-on:click="inspectDOM()">GitHub</a></li>
        <li><a href="http://vuex.vuejs.org/" target="_blank">Submit Issue</a></li>
        <li><a href="http://vue-loader.vuejs.org/" target="_blank">Submit Request</a></li>
        <li><a href="https://github.com/vuejs/awesome-vue" target="_blank">DejaVue.com</a></li>
      </ul>
    </div>
    
  </div>
</template>

<script>
 
import Home from './home.vue'
import Tree from './tree.vue'
import Render from './render.vue'

export default {
  name: 'home',
  components: { Tree, Render },
  methods: {
      inspectDOM: function() {  
        let domNodes;
        chrome.devtools.inspectedWindow.eval(
          `          domNodes = inspect($$('body'));
          
          function createDV() {

          // gets document.body's child nodes which are direct child html elements
          let keysArray = Object.keys(domNodes[0].children);
        
          // console.log('keys', keysArray)
            
          // initialize empty array to store root node objects
          let rootNodes = [];
            
          // iterate through keysArray to push only Vue root nodes into rootNodes array
          function findRoots() {
            for (let i = 0; i < keysArray.length; i += 1) {
              const testNode = domNodes[0].children[keysArray[i]];
            if (!rootNodes.includes(testNode) &&  testNode.__vue__) rootNodes.push(testNode);
          }

            return rootNodes;
          };

          findRoots();

          const components = [];
          // const componentNames = [];
          
          // recursively finds all vue components 
          function findComponents(node) {
            let childrenArray;

            if (rootNodes.includes(node)) {
              console.log('findcomponentsroot');
              // rootNodes.push(node);
              childrenArray = node.__vue__.$children;
            }
            else {
              console.log('findcomponentschild'); 
              childrenArray = node.$children;
            }

            childrenArray.forEach((child) => {
              components.push(child);
              // componentNames.push(child.$vnode.tag.replace(/vue-component-\d-/g, ''));
              if(child.$children.length > 0) findComponents(child)
            });

            };

            for (let i = 0; i < rootNodes.length; i += 1) {
              findComponents(rootNodes[i])
            }   

            if (components.includes(rootNodes[0].__vue__)) console.log('rooooot')            
            if (!components.includes(rootNodes[0].__vue__)) components.unshift(rootNodes[0].__vue__); 

            function CompConstructor(node) {
          // -> _uid
              this.id = node._uid;
          // $vnode -> .tag -> replace(/vue-component-\d-/g, '')
              this.name = node.$vnode.tag.replace(/vue-component-\d-/g, '');
          // $parent -> _uid
              this.parent = node.$parent._uid;
          //
              this.children = [];
          // grab _data object - get keys array - filter keys - forEach on new array to add props to this object
              this.variables = [];
              this.props = [];
              this.slots = [];
          // this.directives = [];
            }

            // const fullComponents = [];
            // console.log('root', rootNodes)



            console.log('vue components', components)
            const dvComponents = [];

            function createDvComps(components) {

              for (let i = 0; i < components.length; i += 1) {

              node = components[i];

              dvComponents.push(new CompConstructor(node));

              const varKeys = Object.keys(node.$data).filter((key) => {
                if (key.match(/\s/g)) return false;
                return true;
              });

              if (varKeys) {
                varKeys.forEach((variable) => {
                  if (variable) dvComponents[dvComponents.length - 1].variables.push({ [variable]: node.$data[variable] });
                });
              }

              if(node.$slots.default) 
                {
                  dvComponents[dvComponents.length - 1].slots.push(node.$slots.default[0].text);
              }    

          }
              return dvComponents;
            };

            createDvComps(components);
            console.log('deja vue components',dvComponents)
            return dvComponents

      }
        
        createDV()
          `
        )
        
    }
  },
  data () {
    return {
      title: 'DejaVue',
      tagline: 'Vue component visualizer',
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