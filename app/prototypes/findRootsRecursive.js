// implement recursion to check if a root node is deeply nested

// gets document.body's child nodes which are direct child html elements
const keysArray = Object.keys(document.body.children);
// initialize empty array to store root node objects
const rootNodes = [];

export const findRoots = (array) => {
  // iterate through keysArray to push only Vue root nodes into rootNodes array
  for (let i = 0; i < array.length; i += 1) {
    const testNode = document.body.children[array[i]]; 

    if (testNode.__vue__ && !rootNodes.includes(testNode)) rootNodes.push(testNode);
    //checks for children and calls findroots on them(recursion)
    if (testNode.$children) return findRoots(testNode.$children);
  }

  return rootNodes
}

