          domNodes = inspect($$('body'));
          
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
              // console.log('findcomponentsroot');
              // rootNodes.push(node);
              childrenArray = node.__vue__.$children;
            }
            else {
              // console.log('findcomponentschild');
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
          if (rootNodes[0].__vue__ !== null) components.shift(); 

          function CompConstructor(node) {
        // -> _uid
            this.id = node._uid;
        // $vnode -> .tag -> replace(/vue-component-\d-/g, '')
            if(node.$options._componentTag === undefined) this.name = "root"
            else this.name = node.$options._componentTag;
        // $parent -> _uid
            this.parentID = node.$parent._uid;
            if(node.$parent.$vnode === undefined) this.parentName = undefined;
            else if (node.$parent.$options._componentTag !== undefined) this.parentName = node.$parent.$options._componentTag;
            else this.parentName = "root";
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

            if(node.$slots.default) {
                dvComponents[dvComponents.length - 1].slots.push(node.$slots.default[0].text);
            }    

            // components.forEach((compElem) => {
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
            return dvComponents;
          };

          createDvComps(components);

          console.log('deja vue components1', dvComponents)
          
          let data = []

          function treeNode(node) {
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

          treeData = Object.assign({}, treeData)[0];

          console.log(treeData)
          var margin = {top: 20, right: 90, bottom: 30, left: 90},
            width = 660 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

          // declares a tree layout and assigns the size
          var treemap = d3.tree()
            .size([height, width]);
          // show what we've got
          // Set the dimensions and margins of the diagram
          //  assigns the data to a hierarchy using parent-child relationships
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
              .text(function(d) { return d.data.name; });

          ;
          }
    
          createDV()