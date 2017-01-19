// Can use
// chrome.devtools.*
// chrome.extension.*

// Create a tab in the devtools area. Optional callback accepted.
chrome.devtools.panels.create('DejaVue', 'assets/img/logo.png', 'index.html', () => {

});

const inspection = function() {

    // gets document.body's child nodes which are direct child html elements
    const keysArray = Object.keys(document.body.children);
    // initialize empty array to store root node objects
    const rootNodes = [];

  const findRoots = () => {

    // iterate through keysArray to push only Vue root nodes into rootNodes array
    for (let i = 0; i < keysArray.length; i += 1) {
      const testNode = document.body.children[keysArray[i]];
      if (testNode.__vue__ && !rootNodes.includes(testNode)) rootNodes.push(testNode);
    }

    return rootNodes
  }

  const roots = findRoots()

    let components = [];
    let componentNames = [];

  const findComponents = (rootNode) => {

    const childrenArray = rootNode.__vue__.$children[0].$children;
    childrenArray.forEach((child) => {
      components.push(child);
      componentNames.push(child.$vnode.tag.replace(/vue-component-\d-/g, ''));
    });

    return components
  };



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
    // this.directives = [];
  };

  const fullComponents = findComponents(rootNodes[0])
  let dvComponents = [];

  const createDvComps = (fullComponents) => {

    for(let i = 0; i < fullComponents.length; i += 1) {

      node = fullComponents[i]

      dvComponents.push(new CompConstructor(node));

      let varKeys = Object.keys(node.$data).filter((key) => {
        if (key.match(/\s/g)) return false;
        return true;
      })

      varKeys.forEach((variable) => {
        if(variable) dvComponents[dvComponents.length-1].variables.push({ [variable]: node.$data[variable] });
      })
      
      let propKeys = node.$options._propKeys;

      propKeys.forEach((prop) => {
        dvComponents[dvComponents.length-1].props.push({ [prop]: true })
      })

    }
    return dvComponents
  }

  console.log(createDvComps(fullComponents))

}

chrome.devtools.inspectedWindow.eval(
    "Testing inspection",
      console.log('inspected the window!')
)();