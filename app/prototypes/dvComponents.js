import { findComponents } from './findComponents';

// constructor class for dejavue storage - composed of vue components

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
