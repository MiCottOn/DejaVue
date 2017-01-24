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
 
import Home from './home.vue';
import Tree from './tree.vue';
import Render from './render.vue';
// import { findProps } from './parseLogic/findProps';
// ^ we should do something like this for best practice

export default {
  name: 'app',
  components: { Tree, Render },
  methods: {
      inspectDOM: function() {  
        let domNodes;
        chrome.devtools.inspectedWindow.eval(
          `                    
          //returns rootNodes of dom including expando properties
          domNodes = inspect($$('body'));

          
          // main function to grab and plot data on visualization
          function createDV() {
          // gets document.body's child nodes which are direct child html elements
          let keysArray = Object.keys(domNodes[0].children);
                    
          // initialize empty arrays to store node objects
          let rootNodes = [];
          let components = [];
          let dvComponents = [];
            
          // iterate through keysArray to push only Vue root nodes into rootNodes array
          function findRoots() {
            for (let i = 0; i < keysArray.length; i += 1) {
              const testNode = domNodes[0].children[keysArray[i]];
            if (!rootNodes.includes(testNode) &&  testNode.__vue__) rootNodes.push(testNode);
          }

            return rootNodes;
          };

          findRoots();

          console.log('rootNodes', rootNodes)
          // traverses a domNode to push all vue components into components array

          function findComponents(node) {
            let childrenArray;

            if (rootNodes.includes(node)) {

              console.log('findcomponentsroot');
        // fix for apps that have a root with vue$3 instead of __vue__
          if (components.includes(rootNodes[0].__vue__)) console.log('rooooot')            
              components.unshift(rootNodes[0].__vue__); 

              childrenArray = node.__vue__.$children;
            }
            else {
              // console.log('findcomponentschild');
              childrenArray = node.$children;
            }

            childrenArray.forEach((child) => {
              components.push(child);
              if(child.$children.length > 0) findComponents(child)
            });

          };

          for (let i = 0; i < rootNodes.length; i += 1) {
            findComponents(rootNodes[i])
          }   

          let count = 0;
          while(components[0].$parent === undefined) {
            components.shift();
            count += 1;
          } 
          while(components[0] === components[1]) components.shift();


        // constructor for each component to grab data DejaVue cares about
          function CompConstructor(node) {
        // -> _uid
            this.id = node._uid;

        // $options -> _componentTag
            if(node.$options._componentTag !== undefined) this.name = node.$options._componentTag + '-' + node._uid;
            else if (node.$vnode.tag) {
              let temp = node.$vnode.tag.slice(16);
              while(temp[0] === "-" || typeof temp[0] === 'number') {
                temp = temp.slice(1);
              }
              this.name = temp + '-' + node._uid;
            }
            console.log(this.name)
            // if(node.$options._componentTag === undefined) this.name = "root"

        // $parent -> _uid
            this.parentID = node.$parent._uid;
            
        // $parent -> $options -> _componentTag   
            if(node.$parent.$vnode === undefined) this.parentName = 'Vuee';
            else if (node.$parent.$options._componentTag !== undefined) this.parentName = node.$parent.$options._componentTag + '-' + node.$parent._uid;
            else {
              let temp = node.$parent.$vnode.tag.slice(16);
              while(temp[0] === "-" || typeof temp[0] === 'number') {
                temp = temp.slice(1);
              }
              this.parentName = temp + '-' + node.$parent._uid;
            }
        // to be filled by d3 object mapper
            this.children = [];

        // grab _data object 
            this.variables = [];
            this.props = [];
            this.slots = [];
        // this.directives = [];
          }

          console.log('vue components', components)

        // run each component through the DVconstructor
          function createDvComps(components) {

            for (let i = 0; i < components.length; i += 1) {
              node = components[i];
              dvComponents.push(new CompConstructor(node));

              let varKeys = Object.keys(node.$data).filter((key) => {
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

            //------PROPS---------
            let propsArr = [];
            compElem = Object.keys(node);
            for (let j = 0; j < compElem.length; j++) {
              if (compElem[j][0] !== '_' && compElem[j][0] !== '$') {
                propsArr.push(compElem[j]);
              }
            }
            console.log(propsArr);
            dvComponents[i].props = propsArr;
            }
            //-----PROPS--------

            return dvComponents;
          };

          createDvComps(components);

          console.log('deja vue components1', dvComponents)
          
        // conversion of components array to JSON object for D3 visualization  
          let data = [new treeNode({name: 'Vuee', parent: undefined})]

          function treeNode(node) {
        // add unique ids to names in order to distinguish between components with the same name - to be spliced at out display
            this.name = node.name;
            this.parent = node.parentName;
            this.props = node.props;
          }

          dvComponents.forEach(function(node) {
            data.push(new treeNode(node))
          })
          
          // console.log('data', data)
                

        // create a name: node map
          var dataMap = data.reduce(function(map, node) {
              map[node.name] = node;
              return map;
          }, {});

        // create the tree array
          var treeData = [];
          data.forEach(function(node) {
              // add to parent
              var parent = dataMap[node.parent];
              if (parent) {
                  // create child array if it doesn't exist
                  (parent.children || (parent.children = []))
                      // add node to child array
                      .push(node);
              } else {
                  // parent is null or missing
                  treeData.push(node);
              }
          });
          console.log(treeData)

          treeData = Object.assign({}, treeData)[0];

          console.log(treeData)
          var margin = {top: 20, right: 90, bottom: 30, left: 90},
            width = 660 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // declares a tree layout and assigns the size
          var treemap = d3.tree()
            .size([height, width]);

        // assigns the data to a hierarchy using parent-child relationships
            var nodes = d3.hierarchy(treeData, function(d) {
              return d.children;
              });

        // maps the node data to the tree layout
            nodes = treemap(nodes);

        // append the svg object to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
            var svg = d3.select("body").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom),
              g = svg.append("g")
                .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");
                  
          d3.selection.prototype.first = function() {
            return d3.select(this[0][0]);
          };
          
         // adds the links between the nodes
            var link = g.selectAll(".link")
              .data( nodes.descendants().slice(1))
              .enter().append("path")
              .attr("class", "link")
              .attr("d", function(d) {
                return "M" + d.y + "," + d.x
                + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                + " " + d.parent.y + "," + d.parent.x;
                });

          // adds each node as a group
            var node = g.selectAll(".node")
              .data(nodes.descendants())
              .enter().append("g")
              .attr("class", function(d) { 
                return "node" + 
                (d.children ? " node--internal" : " node--leaf"); })
              .attr("transform", function(d) { 
                return "translate(" + d.y + "," + d.x + ")"; });

          // adds the circle to the node
            node.append("circle")
              .attr("r", 10);

          // adds the text to the node
            node.append("text")
              .attr("dy", ".35em")
              .attr("x", function(d) { return d.children ? -13 : 13; })
              .style("text-anchor", function(d) { 
              return d.children ? "end" : "start"; })
          // remove component ID when displaying name on tree
              .text(function(d) { return d.data.name.slice(0, d.data.name.lastIndexOf("-")) });
          ;
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

.node circle {
  fill: #fff;
  stroke: steelblue;
  stroke-width: 3px;
}

.node text {
  font: 12px sans-serif;
}

.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 2px;
}

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