domNodes = inspect($$('body'));

// primary function to grab, transform and construct data for visualization and inspection
function createDV() {
	// gets document.body's child nodes which are direct child html elements
  const keysArray = Object.keys(domNodes[0].children);

	// initialize empty arrays to store node objects
  const rootNodes = [];
  const components = [];
  const dvComponents = [];

	// iterate through keysArray to push only Vue root nodes into rootNodes array
  function findRoots(node) {
    if (!rootNodes.includes(node) && node.__vue__) {
      rootNodes.push(node);
    } else {
      const keysArray = Object.keys(node.children);
      for (let i = 0; i < keysArray.length; i++) {
        if (!rootNodes.includes(node.children[keysArray[i]]))					{ findRoots(node.children[keysArray[i]]); }
      }
    }
  }
  findRoots(domNodes[0]);

	// traverses a domNode to push all vue components into components array
  function findComponents(node) {
    let childrenArray;
    if (rootNodes.includes(node)) {
			// fix for apps that have a root with vue$3 instead of __vue__
      components.push(rootNodes[0].__vue__);
      childrenArray = node.__vue__.$children;
    } else {
      childrenArray = node.$children;
    }
    childrenArray.forEach((child) => {
      components.push(child);
      if (child.$children.length > 0) findComponents(child);
    });
  }

  console.log(components)

  for (let i = 0; i < rootNodes.length; i += 1) {
    findComponents(rootNodes[i]);
  }

  let count = 0;
  while (components[0].$parent === undefined) {
    components.shift();
    count += 1;
  }
  while (components[0] === components[1]) components.shift();

	// constructor for each component to grab data DejaVue cares about

  function CompConstructor(node) {
		// -> _uid
    this.id = node._uid;
		// assigns name to node - if router-link attempts to get text content as name otherwise uses component tag as name - removes "vue-component-" and adds unique ID to end in case components have the same name (fixes parent/child relationships)
    if (node.$options._componentTag !== undefined) {
      if (node.$options._componentTag.includes('router-link'))				{
        node.$slots.default[0].text
					? (this.name = `${node.$slots.default[0].text} link -${node._uid}`)
					: (this.name = `router-link-${node._uid}`);
      } else this.name = `${node.$options._componentTag}-${node._uid}`;
    } else if (node.$vnode.tag) {
      let temp = node.$vnode.tag.slice(16);
      while (temp[0] === '-' || typeof temp[0] === 'number') {
        temp = temp.slice(1);
      }
      this.name = `${temp}-${node._uid}`;
    }
		// if(node.$options._componentTag === undefined) this.name = "root"
		// $parent -> _uid
    this.parentID = node.$parent._uid;

		// $parent -> $options -> _componentTag
		// assigns parent name to node - removes "vue-component-" and adds unique ID to end in case components have the same name (fixes parent/child relationships)
    if (node.$parent.$vnode === undefined) this.parentName = 'Vuee';
    else if (node.$parent.$options._componentTag !== undefined)			{ this.parentName = `${node.$parent.$options._componentTag}-${node.$parent._uid}`; } else {
      let temp = node.$parent.$vnode.tag.slice(16);
      while (temp[0] === '-' || typeof temp[0] === 'number') {
        temp = temp.slice(1);
      }
      this.parentName = `${temp}-${node.$parent._uid}`;
    }
		// will be filled by d3 object mapper
    this.children = [];
    this.variables = [];
    this.props = [];
    this.slots = [];
    this.methods = [];
    this.width = node.$el.getBoundingClientRect().width;
    this.height = node.$el.getBoundingClientRect().height;
    this.top = node.$el.getBoundingClientRect().top;
    this.left = node.$el.getBoundingClientRect().left;
  }

	// run each component through the CompConstructor to create DejaVue objects

  function createDvComps(components) {
    for (let i = 0; i < components.length; i += 1) {
      node = components[i];
      dvComponents.push(new CompConstructor(node));

      if (node.$slots.default) {
        dvComponents[dvComponents.length - 1].slots.push(node.$slots.default[0].text);
      }

      compElem = Object.keys(node._data);
      compVals = Object.values(node._data);
      for (let j = 0; j < compElem.length; j++) {
        if (typeof compVals[j] === 'function')					{ dvComponents[dvComponents.length - 1].variables.push(`${compElem[j]}: Function`); } else if (Array.isArray(compVals[j]))					{
          dvComponents[dvComponents.length - 1].variables.push(
						`${compElem[j]}: ${JSON.stringify(compVals[j])}`,
					);
        } else if (typeof compVals[j] === 'string')					{
          dvComponents[dvComponents.length - 1].variables.push(
						`${compElem[j]
							}: "${
							compVals[j]
								.replace(/&/g, '&amp;')
								.replace(/</g, '&lt;')
								.replace(/>/g, '&gt;')
							}"`,
					);
        } else dvComponents[dvComponents.length - 1].variables.push(`${compElem[j]}: ${compVals[j]}`);
      }

      const methodKeys = Object.keys(node).filter((el) => {
        if (el[0] === '_' || el[0] === '$') return false;
        else if (typeof node[el] === 'function') return true;
        return false;
      });

      if (methodKeys) {
        methodKeys.forEach((method) => {
          if (method) dvComponents[dvComponents.length - 1].methods.push(method);
        });
      }

      console.log(node.$options.propsData)

      const propsData = node.$options.propsData;

      const props = propsData ? Object.entries(propsData) : [];

      dvComponents[dvComponents.length - 1].props = props;

    }
    return dvComponents;
  }
  createDvComps(components);

	// add initial root node for D3 visualization
  data = [new treeNode({ name: 'Vuee', parent: undefined })];

	// constructor for D3 compatible objects
  function treeNode(node) {
    this.name = node.name;
    this.parent = node.parentName;
    this.props = node.props;
    this.variables = node.variables;
    this.slots = node.slots;
    this.methods = node.methods;
    this.width = node.width;
    this.height = node.height;
    this.top = node.top;
    this.left = node.left;
  }
	// creates D3 compatible objects for each component
  dvComponents.forEach((node) => {
    data.push(new treeNode(node));
  });
	// grabs HTML of current state for time travel to overlay on application - html only added to one object to prevent unnecessary storage
  data[1].html = domNodes[0].innerHTML.slice(0, domNodes[0].innerHTML.length - 110);

  return data;
}
createDV();
