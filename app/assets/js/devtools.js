// Can use
// chrome.devtools.*
// chrome.extension.*

// Create a tab in the devtools area. Optional callback accepted.



chrome.devtools.panels.create('DejaVue', 'assets/img/logo.png', 'index.html', function (extensionPanel) {
    chrome.storage.local.set({ 'states': '[]' });
    let newData = [];
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
        slider.setAttribute('max', '0');
        slider.setAttribute('value', '0');
        slider.setAttribute('style', 'width: 600px');
        _panelWindow.document.getElementById('treeContainer').appendChild(slider)

        let data = []
        function updater() {
            let poller = setInterval(function () {
                chrome.storage.sync.get('count', function(data){count = data.count})
                if (count !== oldCount) {
                    oldCount = count;
                    chrome.devtools.inspectedWindow.eval(
                `domNodes = inspect($$('body'));
                
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
                            compVals = Object.values(node);
                            for (let j = 0; j < compElem.length; j++) {
                                if (compElem[j][0] !== '_' && compElem[j][0] !== '$') {
                                    if (typeof compVals[j] === 'function') dvComponents[dvComponents.length - 1].props.push(compElem[j] + ': Function');
                                    else if (Array.isArray(compVals[j])) dvComponents[dvComponents.length - 1].props.push(compElem[j] + ': ' + compVals[j]);
                                    else dvComponents[dvComponents.length - 1].props.push(compElem[j] + ': ' + compVals[j]);
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
                newData.push(data)
                console.log('new data after push', newData)
                let slider = _panelWindow.document.getElementById("slider");

                chrome.storage.local.set({ 'states': newData });

                chrome.storage.local.get('states', function (result) {
                    console.log('get data', result.states)
                    drawTree(result.states, _panelWindow)
                })

                function onRangeChange(rangeInputElmt, listener) {

                    var inputEvtHasNeverFired = true;

                    var rangeValue = {current: undefined, mostRecent: undefined};
                    
                    rangeInputElmt.addEventListener("input", function(evt) {
                        inputEvtHasNeverFired = false;
                        rangeValue.current = evt.target.value;
                        if (rangeValue.current !== rangeValue.mostRecent) {
                            console.log('current does not equal most recent')
                            listener(rangeValue.current);
                        }
                        rangeValue.mostRecent = rangeValue.current;
                    });

                    rangeInputElmt.addEventListener("change", function(evt) {
                        if (inputEvtHasNeverFired) {
                            listener(evt.target.value);
                        }
                    }); 

                }                    

                const timeTravel = function(index) {
                    chrome.storage.local.get('states', function (result) {
                        console.log('get data', result.states)
                        drawTree(result.states, _panelWindow, index)
                    })
                }

                onRangeChange(slider, timeTravel);

            })
        }
        }, 100);
    }
    updater()        
    });

    let dataCompare = -1;
    
    const drawTree = (data, panel, dataIndex = data.length - 1) => {
        console.log('tree should rerender if nums diff: ', dataCompare, 'data', dataIndex)
        let maxLength = data.length - 1;
        let slider = panel.document.getElementById("slider");
        slider.setAttribute('max', maxLength);
        slider.value = dataIndex;

        if (dataCompare === dataIndex) return;
        else if (dataCompare !== dataIndex) {

            dataCompare = dataIndex;
        
            console.log('tree rendering this', data)
            d3 = panel.d3
            //append component data to sidebar
            data = data[dataIndex];
            // d3 tree creation   
            // create a name: node map
            var dataMap = data.reduce(function (map, node) {
                map[node.name] = node;
                return map;
            }, {});

            // create the tree array
            let treeData = [];
            // if (document.getElementById('treeVisualization')) {
            //     let removal = document.getElementById('treeVisualization')
            //     removal.parentNode.removeChild(removal);
            // }
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
                width = 500,
                height = 500;

            // append the svg object to the body of the page
            // appends a 'group' element to 'svg'
            // moves the 'group' element to the top left margin
            const svg = d3.select("#treeContainer").append("svg")
                .attr('id', 'treeVisualization')
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate("
                + margin.left + "," + margin.top + ")");

            let i = 0,
                duration = 0,
                root;

            // declares a tree layout and assigns the size
            const treemap = d3.tree().size([height, width])
                .separation(function separation(a, b) {
                    return a.parent == b.parent ? 1 : 2;
                });;

            // Assigns parent, children, height, depth
            root = d3.hierarchy(treeData, function (d) { return d.children; });
            root.x0 = height / 4;
            root.y0 = 0;

            // Collapse after the second level
            // root.children.forEach(collapse);

            update(root);

            // Collapse the node and all it's children
            function collapse(d) {
                if (d.children) {
                    d._children = d.children
                    d._children.forEach(collapse)
                    d.children = null
                }
            }

            function update(source) {

                // Assigns the x and y position for the nodes
                const treeData = treemap(root);

                // Compute the new tree layout.
                const nodes = treeData.descendants(),
                    links = treeData.descendants().slice(1);

                // Normalize for fixed-depth.
                nodes.forEach(function (d) { d.y = d.depth * 90 });

                // ****************** Nodes section ***************************

                // Update the nodes...
                let node = svg.selectAll('g.node')
                    .data(nodes, function (d) { return d.id || (d.id = ++i); });

                // Enter any new modes at the parent's previous position.
                const nodeEnter = node.enter().append('g')
                    .attr('class', 'node')
                    .attr("transform", function (d) {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                    })

                // Add Circle for the nodes
                let highlight;
                let removal;
                nodeEnter.append('circle')
                    .attr('class', 'node')
                    .attr('r', 1e-6)
                    .style("fill", function (d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    })
                    .on('click', click)
                    .on("mouseover", function (d) {
                        chrome.devtools.inspectedWindow.eval(`highlight = document.createElement("div");
                        highlight.setAttribute('style', 'position: absolute; width: ${d.data.width}px; height: ${d.data.height}px; top: ${d.data.top}px; left: ${d.data.left}px; background-color: rgba(137, 196, 219, .6); border: 1px dashed rgb(137, 196, 219); z-index: 99999;')
                        highlight.setAttribute('id', '${d.data.name}');
                        highlight.setAttribute('class', 'highlighter');
                        document.body.appendChild(highlight)
                        `);
                    }).on("mouseout", function (d) {
                        chrome.devtools.inspectedWindow.eval(`
                            removal = document.getElementById('${d.data.name}')
                            removal.parentNode.removeChild(removal);
                        `);
                    });

                // Add labels for the nodes
                nodeEnter.append('text')
                    .attr("dy", ".35em")
                    .attr("x", function (d) {
                        return d.children || d._children ? -13 : 13;
                    })
                    .attr("text-anchor", function (d) {
                        return d.children || d._children ? "end" : "start";
                    })
                    .on("click", function (d) {
                        clickHandler(d);
                    })
                    .text(function (d) { return d.data.name.slice(0, d.data.name.lastIndexOf("-")) });

                // UPDATE
                let nodeUpdate = nodeEnter.merge(node);

                // Transition to the proper position for the node
                nodeUpdate.transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });

                // Update the node attributes and style
                nodeUpdate.select('circle.node')
                    .attr('r', 10)
                    .style("fill", function (d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    })

                    .attr('cursor', 'pointer');


                // Remove any exiting nodes
                const nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        return "translate(" + source.y + "," + source.x + ")";
                    })
                    .remove();

                // On exit reduce the node circles size to 0
                nodeExit.select('circle')
                    .attr('r', 1e-6);

                // On exit reduce the opacity of text labels
                nodeExit.select('text')
                    .style('fill-opacity', 1e-6);

                // ****************** links section ***************************

                // Update the links...
                const link = svg.selectAll('path.link')
                    .data(links, function (d) { return d.id; });

                // Enter any new links at the parent's previous position.
                const linkEnter = link.enter().insert('path', "g")
                    .attr("class", "link")
                    .attr('d', function (d) {
                        var o = { x: source.x0, y: source.y0 }
                        return diagonal(o, o)
                    });

                // UPDATE
                const linkUpdate = linkEnter.merge(link);

                // Transition back to the parent element position
                linkUpdate.transition()
                    .duration(duration)
                    .attr('d', function (d) { return diagonal(d, d.parent) });

                // Remove any exiting links
                const linkExit = link.exit().transition()
                    .duration(duration)
                    .attr('d', function (d) {
                        var o = { x: source.x, y: source.y }
                        return diagonal(o, o)
                    })
                    .remove();

                // Store the old positions for transition.
                nodes.forEach(function (d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });

                // Creates a curved (diagonal) path from parent to the child nodes
                function diagonal(s, d) {
                    path = `M ${s.y} ${s.x}
                    C ${(s.y + d.y) / 2} ${s.x},
                    ${(s.y + d.y) / 2} ${d.x},
                    ${d.y} ${d.x}`

                    return path
                }

                // Toggle children on click.
                function click(d) {
                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    } else {
                        d.children = d._children;
                        d._children = null;
                    }
                    update(d);
                }
            function clickHandler(d) {
							// if it's already open, remove it and create a new one
                if (panel.document.getElementById('sidebar')){
                    closeSidebar();
                }
                const sidebar = document.createElement('section');
                sidebar.setAttribute('id', 'sidebar');

								// populate the section with our headings
                const contentdiv = document.createElement('div');
								contentdiv.setAttribute('id', 'app_content');
                contentdiv.innerHTML = `
                        <a href="#" id="close_sidebar"></a>
                        <h2>Component Inspector</h2>
                        <h3>${d.data.name.slice(0, d.data.name.lastIndexOf("-"))}</h3>
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
                panel.document.getElementById('contentContainer').appendChild(sidebar);
                panel.document.getElementById('sidebar').appendChild(contentdiv);

                // add an event listener
                panel.document.getElementById('close_sidebar').addEventListener('click', closeSidebar)
                
								// populate the headings with the component data
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
                        let prop = document.createElement("li");
                        prop.setAttribute('id', d.data.name + 'Prop');
                        prop.innerHTML = d.data.props[i];
                        propList.appendChild(prop);
                    }
                };
				function closeSidebar() {
				    const remove = panel.document.getElementById("sidebar");
                    panel.document.getElementById('contentContainer').removeChild(remove);
				}
        	}
        }
    }
}
});