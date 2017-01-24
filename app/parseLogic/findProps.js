// this takes element from components array, 
// finds the props, and then returns an array of the prop names

function findProps(compElem) {
  let propsArr = [];
  compElem = Object.keys(compElem);
  compElem.forEach((key) => {
    if (key.includes('get ')) propsArr.push(key.slice(4))
  })
  return propsArr;
}

export { findProps };

// ISN't DOING ANYTHING RIGHT NOW//