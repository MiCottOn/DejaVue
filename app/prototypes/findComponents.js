// on each root node -> children -> $options -> name
import { findRoots } from './findRoots';

const rootNodes = findRoots();
const components = [];
const componentNames = [];

// iterates through children of a rootnode to push components into array
const findComponents = (rootNode) => {
  const childrenArray = rootNode.__vue__.$children[0].$children;
  childrenArray.forEach((child) => {
    components.push(child);
    componentNames.push(child.$vnode.tag.replace(/vue-component-\d-/g, ''));
  });

  return components

};

