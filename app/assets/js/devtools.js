// Can use
// chrome.devtools.*
// chrome.extension.*

// Create a tab in the devtools area. Optional callback accepted.



chrome.devtools.panels.create('DejaVue', 'assets/img/logo.png', 'index.html', function (extensionPanel) {
    let sidebarAdded = 0;
    let count;
    let oldCount;
    chrome.storage.sync.get('oldCount', function(data){oldCount = data.oldCount})

    var show = new Promise(function(resolve, reject) {
        extensionPanel.onShown.addListener(function(panelWindow) {                            
            resolve(panelWindow);
        });                
    });

    show.then(function(_panelWindow) {
        let data = []
        function updater() {
            var poller = setInterval(function () {
                chrome.storage.sync.get('count', function(data){count = data.count})
                if (count !== oldCount) {
                    oldCount = count;
        //returns rootNodes of dom including expando properties
        chrome.devtools.inspectedWindow.eval(
            `   //USE TO SEE JS OUTSIDE OF TEMPLATE LITERAL STRING TO DEVTOOLS

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
                        this.variables = JSON.stringify(node.variables);
                        this.slots = node.slots;
                    }
                    dvComponents.forEach(function(node) {
                        data.push(new treeNode(node))
                    })
                    
                // console.log('data', data)
                        
                    return data
                }
                createDV()`
            , function (data) {
                d3 = _panelWindow.d3;

            //append component data to sidebar
                if (_panelWindow.document.getElementById("compdata")) {
                    let removal = _panelWindow.document.getElementById("compdata");
                    _panelWindow.document.getElementById("componentInfo").removeChild(removal)
                }
                    let nodeData = `
                        
                            <h3><a href="#" @click="toggleVisible">${data[7].name}</a></h3>
                            <h4>Props</h4>
                            <ul>
                            <li>
                                <p>${data[7].props}</p>
                            </li>
                            </ul>
                            <h4>Vars</h4>
                            <ul>
                            <li><p>${data[7].variables}</p></li>
                            </ul>
                            <h4>Slots</h4>
                            <ul>
                            <li><p>${data[7].slots}</p></li>
                            </ul>
                        
                    `
                    let divv = document.createElement("li");
                    divv.setAttribute('id', 'compdata');
                    divv.innerHTML = nodeData;
                    _panelWindow.document.getElementById("componentInfo").appendChild(divv);
                


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

                    // adds the circle to the node
                    node.append("circle")
                        .attr("r", 10)
                        .on("mouseover", function(d) {		
                            div.transition()		
                                .duration(200)		
                                .style("opacity", .9);		
                            div	.html(d.data.props + "<br/>")	
                                .style("left", (d3.event.pageX) + "px")		
                                .style("top", (d3.event.pageY - 28) + "px");	
                            })					
                        .on("mouseout", function(d) {		
                            div.transition()		
                                .duration(500)		
                                .style("opacity", 0);	
                        });

                

                
                    // adds the text to the node
                    node.append("text")
                        .attr("dy", ".35em")
                        .attr("x", function (d) { return d.children ? -13 : 13; })
                        .style("text-anchor", function (d) {
                            return d.children ? "end" : "start";
                        })
                        // remove component ID when displaying name on tree
                        .text(function (d) { return d.data.name.slice(0, d.data.name.lastIndexOf("-")) });


            })
        }
        }, 100);
    }
    updater()        
        });
});

