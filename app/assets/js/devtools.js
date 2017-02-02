// Can use
// chrome.devtools.*
// chrome.extension.*

// Create a tab in the devtools area. Optional callback accepted.



chrome.devtools.panels.create('DejaVue', 'assets/img/logo.png', 'index.html', function (extensionPanel) {


    chrome.storage.local.set({ 'states': '[]' });
    let newData;
    let sidebarAdded = 0;
    let count;
    let oldCount;
    chrome.storage.sync.get('oldCount', function(data){oldCount = data.oldCount})

    var show = new Promise(function(resolve, reject) {
        extensionPanel.onShown.addListener(function(panelWindow) {                            
            resolve(panelWindow);
        });                
    });

    show.then(function (_panelWindow) {
        let slider = document.createElement("input");
        slider.setAttribute('id', 'slider');
        slider.setAttribute('type', 'range');
        slider.setAttribute('step', '1');
        slider.setAttribute('max', '1');
        slider.setAttribute('style', 'width: 600px');
        _panelWindow.document.getElementById('treeContainer').appendChild(slider)

        let data = []
        function updater() {
            var poller = setInterval(function () {
                chrome.storage.sync.get('count', function(data){count = data.count})
                if (count !== oldCount) {
                    oldCount = count;

        chrome.devtools.inspectedWindow.eval(
            `
                domNodes = inspect($$('body'));
                    
                // main function to grab and plot data on visualization
                    function createDV() {
                // gets document.body's child nodes which are direct child html elements
                    let keysArray = Object.keys(domNodes[0].children);
                            
                // initialize empty arrays to store node objects
                    let rootNodes = [];
                    let components = [];
                    let dvComponents = [];
                    
                // iterate through keysArray to push only Vue root nodes into rootNodes array
                    function findRoots(node) {
                      if (!rootNodes.includes(node) &&  node.__vue__) {
                        rootNodes.push(node);
                        console.log('pushed')
                      } else {
                        let keysArray = Object.keys(node.children);
                        console.log('keysArray', keysArray);
                        for (let i = 0; i < keysArray.length; i++) {
                          console.log('node.children[keysArray[i]]', node.children[keysArray[i]]);
                          if (!rootNodes.includes(node.children[keysArray[i]])) findRoots(node.children[keysArray[i]]);
                        }
                      }
                    };
                    findRoots(domNodes[0]);
                // console.log('rootNodes', rootNodes)
                // traverses a domNode to push all vue components into components array
                    function findComponents(node) {
                        let childrenArray;
                        if (rootNodes.includes(node)) {
                // console.log('findcomponentsroot');
                // fix for apps that have a root with vue$3 instead of __vue__
                        components.push(rootNodes[0].__vue__); 
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
                        this.width = node.$el.getBoundingClientRect().width;
                        this.height = node.$el.getBoundingClientRect().height;
                        this.top = node.$el.getBoundingClientRect().top;
                        this.left = node.$el.getBoundingClientRect().left;
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
                                    dvComponents[dvComponents.length - 1].props.push({[compElem[j]]: node[compElem[j]]});
                                }
                            }
                        }
                        return dvComponents;
                    };
                    createDvComps(components);
                 console.log('rootNodes', rootNodes)
                 console.log('components', components)
                 console.log('deja vue components1', dvComponents)
                    
                // conversion of components array to JSON object for D3 visualization  
                    data = [new treeNode({name: 'Vuee', parent: undefined})]
                    function treeNode(node) {
                        this.name = node.name;
                        this.parent = node.parentName;
                        this.props = node.props;
                        this.variables = node.variables;
                        this.slots = node.slots;
                        this.width = node.width;
                        this.height = node.height;
                        this.top = node.top;
                        this.left = node.left;
                    }
                    dvComponents.forEach(function(node) {
                        data.push(new treeNode(node))
                    })
                    
                 console.log('data', data)
                        
                    return data
                }
                createDV()`
            , function (data) {
                // console.log('returned data', data)


               chrome.storage.local.get(function(result) {newData = result.states}) 

                console.log('new data before push', newData, data)

                newData.push(data)
                chrome.storage.local.set({ 'states': newData }, function (result) {
                    drawTree(newData, _panelWindow)
                    // if (_panelWindow.document.getElementById('slider')) {
                    //     let removal = _panelWindow.document.getElementById('slider')
                    //     _panelWindow.document.getElementById('treeContainer').removeChild(removal)
                    // }

                    const timeTravel = function(index) {
                        console.log('traveled through time!', newData)
                        drawTree(newData[index], _panelWindow)
                    }
                    
                    let maxLength = newData.length - 1;
                    let slider = _panelWindow.document.getElementById("slider");
                    slider.setAttribute('max', maxLength);
                    slider.addEventListener('change', function () { console.log('slider moved'); timeTravel(0) })

                    let travelTo = slider.value;
                    console.log(travelTo)

                    
                }) 
                
                chrome.storage.local.get(function(result) {console.log('local storage', result.states)})

            })
        }
        }, 100);
    }
    updater()        
    });
    
    const drawTree = function(data, panel) {
        console.log('tree rerendered')
        d3 = panel.d3
        //append component data to sidebar
        data = data[data.length - 1]
        // d3 tree creation   
            // create a name: node map
            var dataMap = data.reduce(function (map, node) {
                map[node.name] = node;
                return map;
            }, {});

            // create the tree array
            var treeData = [];
            d3.select("svg#treeVisualization").remove()
            data.forEach(function (node) {
                // add to parent
                var parent = dataMap[node.parent];
                if (parent) {
                // create child array if it doesn't exist
                    (parent.children || (parent.children = []))
                // add node to child array if not already in it (prevents doubling of tree when switching between devtool panels)
                        parent.children.push(node);
                } else {
                // parent is null or missing from treeData - if not already in it (prevents doubling of tree when switching between devtool panels)
                        treeData.push(node);
                }
            });

            treeData = Object.assign({}, treeData)[0];

            // console.log(treeData)
            var margin = { top: 20, right: 90, bottom: 30, left: 90 },
                width = 660 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            // declares a tree layout and assigns the size
            var treemap = d3.tree()
                .size([height, width]);

            // assigns the data to a hierarchy using parent-child relationships
            var nodes = d3.hierarchy(treeData, function (d) {
                return d.children;
            });

            // maps the node data to the tree layout
            nodes = treemap(nodes);
            // Define the div for the tooltip
            var div = d3.select("body").append("div")	
                .attr("class", "tooltip")				
                .style("opacity", 0);
            // append the svg object to the body of the page
            // appends a 'group' element to 'svg'
            // moves the 'group' element to the top left margin
            var svg = d3.select("#treeContainer").append("svg")
                .attr("id", "treeVisualization")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom),
                g = svg.append("g")
                    .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            d3.selection.prototype.first = function () {
                return d3.select(this[0][0]);
            };

            // adds the links between the nodes
            var link = g.selectAll(".link")
                .data(nodes.descendants().slice(1))
                .enter().append("path")
                .attr("class", "link")
                .attr("d", function (d) {
                    return "M" + d.y + "," + d.x
                        + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                        + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                        + " " + d.parent.y + "," + d.parent.x;
                });

            // adds each node as a group
            var node = g.selectAll(".node")
                .data(nodes.descendants())
                .enter().append("g")
                .attr("class", function (d) {
                    return "node" +
                        (d.children ? " node--internal" : " node--leaf");
                })
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });
            let highlight;
            let removal;
            // adds the circle to the node
            node.append("circle")
                .attr("r", 10)
                .on("mouseover", function(d) {
                    chrome.devtools.inspectedWindow.eval(`highlight = document.createElement("div");
                        highlight.setAttribute('style', 'position: absolute; width: ${d.data.width}px; height: ${d.data.height}px; top: ${d.data.top}px; left: ${d.data.left}px; background-color: rgba(137, 196, 219, .6); border: 1px dashed rgb(137, 196, 219); z-index: 99999;')
                        highlight.setAttribute('id', '${d.data.name}');
                        highlight.setAttribute('class', 'highlighter');
                        document.body.appendChild(highlight)`);
                        console.log('moused over');
                    // div.transition()
                    //     .duration(200)
                    //     .style("opacity", .9);
                    // div	.html(d.data.width + d.data.name + "<br/>")	
                    //     .style("left", (d3.event.pageX) + "px")		
                    //     .style("top", (d3.event.pageY - 28) + "px");	
                    })
                .on("mouseout", function(d) {
                    chrome.devtools.inspectedWindow.eval(`
                        removal = document.getElementById('${d.data.name}')
                        removal.parentNode.removeChild(removal);
                    `);
                    console.log('moused out')
                    // div.transition()		
                    //     .duration(500)		
                    //     .style("opacity", 0);	
                });

        

        
            // adds the text to the node
            node.append("text")
                .attr("dy", ".35em")
                .attr("x", function (d) { return d.children ? -13 : 13; })
                .on("click", function (d) {
                    clickHandler(d);
                })
                .style("text-anchor", function (d) {
                    return d.children ? "end" : "start";
                })
                // remove component ID when displaying name on tree
                .text(function (d) { return d.data.name.slice(0, d.data.name.lastIndexOf("-")) });

            //dejavue custom d3 functionality
        
            //click handler function for node text
            function clickHandler(d) {
                if (panel.document.getElementById("compdata")) {
                    let removal = _panelWindow.document.getElementById("compdata");
                    panel.document.getElementById("componentInfo").removeChild(removal)
                }
                
                    let divv = document.createElement("div");
                    divv.setAttribute('id', 'compdata');
                    divv.innerHTML = `

                            <h3>${d.data.name}</h3>
                            <h4>Props</h4>
                            <ul id="${d.data.name}Props">

                            </ul>
                            <h4>Vars</h4>
                            <ul id="${d.data.name}Variables">

                            </ul>
                            <h4>Slot</h4>
                            <ul>
                                <li><p>${(d.data.slots) ? d.data.slots : "No slot/data"}</p></li>
                            </ul>

                        `;
                
                    panel.document.getElementById("componentInfo").appendChild(divv);
                
                //populate variables on sidebar
                    let variableList = panel.document.getElementById(d.data.name + "Variables");
                    if (d.data.variables === "undefined") {
                            let variable = document.createElement("li");
                            variable.setAttribute('id', d.data.name + 'VariableUndefined');
                            variable.innerHTML = "undefined";
                            variableList.appendChild(variable);
                    }
                    else {
                        for (let i = 0; i < d.data.variables.length; i += 1) {
                            for (key in d.data.variables[i]) {
                                let variable = document.createElement("li");
                                variable.setAttribute('id', d.data.name[key] + 'Variable');
                                variable.innerHTML = (typeof d.data.variables[i][key] === 'object') ? key + ": Function" : key + ": " + d.data.variables[i][key];
                                variableList.appendChild(variable);
                            }
                        }
                    };
                
                //populate props on sidebar
                    let propList = panel.document.getElementById(d.data.name + "Props");
                    if (d.data.props === "undefined") {
                            let prop = document.createElement("li");
                            prop.setAttribute('id', d.data.name + 'PropUndefined');
                            prop.innerHTML = "undefined";
                            propList.appendChild(prop);
                    }
                    else {
                        for (let i = 0; i < d.data.props.length; i += 1) {
                            for (key in d.data.props[i]) {
                                console.log(typeof d.data.props[i][key])
                                let prop = document.createElement("li");
                                prop.setAttribute('id', d.data.name[key] + 'Prop');
                                prop.innerHTML = (typeof d.data.props[i][key] === 'object') ? key + ": Function" : key + ": " + d.data.props[i][key];
                                propList.appendChild(prop);
                            }
                        }
                    };

            }
        }
});

