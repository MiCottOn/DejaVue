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
        
    
    let config = {
      container: "#tree-simple"
    };

    let simple_chart_config = [config]

    function createTreeArray(dvComponents) {

      let dj = [];

      function nodeName(name) {
        this.name = name;
      }
      
      function treeNode(name, parent) {
        this.parent = parent;
        this.text = new nodeName(name);
      }

      for (let i = 0; i < dvComponents.length; i += 1) {
        dj[dvComponents[i].id] = new treeNode(dvComponents[i].name, dj[dvComponents[i].parent])
      }
      console.log(simple_chart_config.concat(dj))
      console.log(JSON.stringify(simple_chart_config.concat(dj)))

    }

    createTreeArray(createDV())



    // simple_chart_config = {
    //       chart: {
    //           container: "#tree-simple"
    //       },
          
    //       nodeStructure: {
    //           text: { name: "Parent node" },
    //           children: [
    //               {
    //                   text: { name: "First child" }
    //               },
    //               {
    //                   text: { name: "Second child" }
    //               }
    //           ]
    //       }
    //   };

    //       for (let i = 0; i < dvComponents.length; i += 1) {
    //         let parentID = dvComponents[i].parent
    //       }