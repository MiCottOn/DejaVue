chrome.runtime.sendMessage({ from: 'content_script', message: 'Information from webpage.' });
 
// function createDV() {

//     // gets document.body's child nodes which are direct child html elements
//   const keysArray = Object.keys(document.body.children);
  
//   console.log('keys', keysArray)
//     // initialize empty array to store root node objects
//       const rootNodes = [];

//       function findRoots() {

//     // iterate through keysArray to push only Vue root nodes into rootNodes array
//         for (let i = 0; i < keysArray.length; i += 1) {
//           const testNode = document.body.children[keysArray[i]];
//         console.log('test node for root value', testNode)    
//         if (!rootNodes.includes(testNode) &&  `testNode.__vue__`) rootNodes.push(testNode);
//       }

//         return rootNodes;
//       };

//       const roots = findRoots();

//       const components = [];
//       const componentNames = [];

//       function findComponents(rootNode) {

//         const childrenArray = rootNode.__vue__.$children[0].$children;
//         childrenArray.forEach((child) => {
//       components.push(child);
//       componentNames.push(child._vnode.tag.replace(/vue-component-\d-/g, ''));
//     });

//       };


//       function CompConstructor(node) {
//     // -> _uid
//         this.id = node._uid;
//     // $vnode -> .tag -> replace(/vue-component-\d-/g, '')
//         this.name = node._vnode.tag.replace(/vue-component-\d-/g, '');
//     // $parent -> _uid
//         this.parent = node.$parent._uid;
//     //
//         this.children = [];
//     // grab _data object - get keys array - filter keys - forEach on new array to add props to this object
//         this.variables = [];
//         this.props = [];
//     // this.directives = [];
//       }

//       const fullComponents = [];
//       console.log('root', rootNodes)

//       for (let i = 0; i < rootNodes.length; i += 1) {
//         console.log('hit a root')
//         findComponents(rootNodes[i])
//       }
      
//       console.log('full', components)
//       const dvComponents = [];

//       function createDvComps(fullComponents) {

//         for (let i = 0; i < fullComponents.length; i += 1) {

//       node = fullComponents[i];

//       dvComponents.push(new CompConstructor(node));

//       const varKeys = Object.keys(node.$data).filter((key) => {
//         if (key.match(/\s/g)) return false;
//         return true;
//       });
//       varKeys.forEach((variable) => {
//         if (variable) dvComponents[dvComponents.length - 1].variables.push({ [variable]: node.$data[variable] });
//       });

//       const propKeys = node.$options._propKeys;
//       if (propKeys) {
//         propKeys.forEach((prop) => {
//           dvComponents[dvComponents.length - 1].props.push({ [prop]: true });
//         });
//       }    


//     }
//         return dvComponents;
//       };

//       createDvComps(components);
//       console.log('dv1',dvComponents)
//       return dvComponents

// }
    

//     window.setTimeout(createDV, 5000); 
   
