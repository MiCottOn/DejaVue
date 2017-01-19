// implement recursion to check if a root node is deeply nested

export const findRoots = () => {
  // gets document.body's child nodes which are direct child html elements
  const keysArray = Object.keys(document.body.children);
  // initialize empty array to store root node objects
  const rootNodes = [];

  // iterate through keysArray to push only Vue root nodes into rootNodes array
  for (let i = 0; i < keysArray.length; i += 1) {
    const testNode = document.body.children[keysArray[i]];
    if (testNode.__vue__ && !rootNodes.includes(testNode)) rootNodes.push(testNode);
  }

  return rootNodes
}

