domNodes = inspect($$('body'));
function createDV() {
  let rootNodes = [];
  function findRoots(node) {
    if (!rootNodes.includes(node) &&  node.__vue__) {
      rootNodes.push(node);
      console.log('pushed') 
    } else {
      let keysArray = Object.keys(node.children);
      console.log('keysArray', keysArray);
      for (let i = 0; i < keysArray.length; i++) {
        console.log('node.children[keysArray[i]]', node.children[keysArray[i]]);
        console.log('type', Array.isArray(node), 'node', node);
        findRoots(node.children[keysArray[i]]);
      }
    }
  };
  findRoots(domNodes[0]);
  console.log('rootNodes', rootNodes);
};
createDV();


// domNodes = inspect($$('body'));
// function createDV() {
//   let rootNodes = [];
//   let keysArray = Object.keys(domNodes[0].children);
//   console.log(keysArray)
//   function findRoots() {
//       for (let i = 0; i < keysArray.length; i += 1) {
//         const testNode = domNodes[0].children[keysArray[i]];
//         if (!rootNodes.includes(testNode) &&  testNode.__vue__) rootNodes.push(testNode);
//       }
//       return rootNodes;
//   };
//   findRoots();
//   console.log('rootNodes', rootNodes);
// }
// createDV();