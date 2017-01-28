//USE TO SEE JS OUTSIDE OF TEMPLATE LITERAL STRING TO DEVTOOLS

domNodes = inspect($$('body'));
    console.log('Tree rerendered')
    
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
// console.log('rootNodes', rootNodes)
// traverses a domNode to push all vue components into components array
    function findComponents(node) {
        let childrenArray;
        if (rootNodes.includes(node)) {
// console.log('findcomponentsroot');
// fix for apps that have a root with vue$3 instead of __vue__
        if (components.includes(rootNodes[0].__vue__))            
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
//assigns name to node - if router-link attempts to get text content as name otherwise uses component tag as name - removes "vue-component-" and adds unique ID to end in case components have the same name (fixes parent/child relationships)
        if(node.$options._componentTag !== undefined) {
            if(node.$options._componentTag.includes("router-link")) node.$slots.default[0].text? this.name = node.$slots.default[0].text + ' link -' + node._uid : this.name = 'router-link-' + node._uid;
            else this.name = node.$options._componentTag + '-' + node._uid;
        }
        else if (node.$vnode.tag) {
            let temp = node.$vnode.tag.slice(16);
            while(temp[0] === "-" || typeof temp[0] === 'number') {
                temp = temp.slice(1);
            }
            this.name = temp + '-' + node._uid;
        }
// console.log(this.name)
// if(node.$options._componentTag === undefined) this.name = "root"
// $parent -> _uid
        this.parentID = node.$parent._uid;
        
// $parent -> $options -> _componentTag
        //assigns parent name to node - removes "vue-component-" and adds unique ID to end in case components have the same name (fixes parent/child relationships)
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
// console.log('vue components', components)
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
            
            compElem = Object.keys(node);
            for (let j = 0; j < compElem.length; j++) {
                if (compElem[j][0] !== '_' && compElem[j][0] !== '$') {
                    dvComponents[dvComponents.length - 1].props.push(compElem[j]);
                }
            }
          }
        return dvComponents;
    };
    createDvComps(components);
// console.log('deja vue components1', dvComponents)
    
// conversion of components array to JSON object for D3 visualization  
    data = [new treeNode({name: 'Vuee', parent: undefined})]
    function treeNode(node) {
        this.name = node.name;
        this.parent = node.parentName;
        this.props = node.props;
        this.variables = node.variables;
        this.slots = node.slots;
    }
    dvComponents.forEach(function(node) {
        data.push(new treeNode(node))
    })
    
// console.log('data', data)
        
    return data
}
createDV()