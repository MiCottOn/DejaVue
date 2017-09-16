// Can use
// chrome.devtools.*
// chrome.extension.*

// Create a tab in the devtools area. Optional callback accepted.

// This is the devtools script, which is called when the user opens the
// Chrome devtool on a page. We check to see if we global hook has detected
// Vue presence on the page. If yes, create the Vue panel; otherwise poll
// for 10 seconds.


chrome.devtools.panels.create('DejaVue', 'assets/img/logo.png', 'index.html', function (extensionPanel) {
    // determine theme color in order to use correct colors for devtool
    const themeColor = chrome.devtools.panels.themeName;

    // if user is time traveling stop recording state to prevent repeats
    chrome.storage.sync.set({
        'traveledThroughTime': false
    });

    // initialize empty states array
    chrome.storage.local.set({
        'states': '[]'
    });
    let testHTML = 1;
    let newData = [];
    let sidebarAdded = 0;
    let count;
    let oldCount;

    // retrieve previous node count from content script in order to check against new node count to prevent unnecessary running of below functions
    chrome.storage.sync.get('oldCount', function (data) {
        oldCount = data.oldCount
    });

    // append timetravel slider to devtool    
    chrome.devtools.inspectedWindow.eval(`
        let addDVChecker = inspect($$('body'))[0];
        addDVChecker.classList.add('DejaVue');
        let timeTravel = document.createElement("div"); 
        timeTravel.classList.add("timeTravel"); 
        timeTravel.setAttribute("style", "width:90%; height: 90vh; position: absolute; top: 0; left: 0; z-index: 99; display: none"); 
        addDVChecker.append(timeTravel);
        `, function () {
        return
    })

    var show = new Promise(function (resolve, reject) {
        extensionPanel.onShown.addListener(function (panelWindow) {
            resolve(panelWindow);
        });
    });

    show.then(function (_panelWindow) {
        const appNode = _panelWindow.document.getElementById('app')
        // set appropriate color theme based off devtool theme
        if (themeColor === 'default') {
            appNode.classList.add('defaultTheme')
        } else {
            appNode.classList.add('darkTheme')
        }

        // append stop button once time travel has started, set time traveling to false to resume capturing state
        const stopTimeTravel = function () {
            hideButton();
            let evaluation2 = 'inspect($$(".timeTravel"))[0].setAttribute("style", "width:100%; height: 100vh; background-color: #FFF; position: absolute; top: 0; left: 0; z-index: 99; display: none")'
            chrome.devtools.inspectedWindow.eval(evaluation2, function () {
                return
            })
            chrome.storage.sync.set({
                'traveledThroughTime': false
            }, function () {
                return
            });
        }

        // append stop time travel button        
        let timeTravelButton = document.createElement("button");
        timeTravelButton.setAttribute("id", "timeTravelButton")
        timeTravelButton.innerHTML = 'Resume App';

        // append time travel slider and move to most recent state after stopping time travel
        let slider = document.createElement("input");
        slider.setAttribute('id', 'slider');
        slider.setAttribute('type', 'range');
        slider.setAttribute('step', '1');
        slider.setAttribute('max', '0');
        slider.setAttribute('value', '0');
        slider.setAttribute('style', 'width: 350px');
        slider.addEventListener('focus', showButton);
        _panelWindow.document.getElementById('treeContainer').appendChild(slider)

        // append stop time travel button
        function showButton() {
            let treeviz = _panelWindow.document.getElementById('treeVisualization');
            _panelWindow.document.getElementById('treeContainer').insertBefore(timeTravelButton, treeviz);
        }

        // remove stop time travel button
        function hideButton() {
            _panelWindow.document.getElementById('treeContainer').removeChild(timeTravelButton);
        }

        // add listeners to time travel slider        
        function onRangeChange(rangeInputElmt, listener) {
            var inputEvtHasNeverFired = true;
            var rangeValue = {
                current: undefined,
                mostRecent: undefined
            };

            rangeInputElmt.addEventListener("input", function (evt) {
                inputEvtHasNeverFired = false;
                rangeValue.current = evt.target.value;
                console.log(rangeValue.current, rangeValue.mostRecent)
                if (rangeValue.current !== rangeValue.mostRecent) {
                    listener(rangeValue.current);
                }
                rangeValue.mostRecent = rangeValue.current;
            });

            rangeInputElmt.addEventListener("change", function (evt) {
                if (inputEvtHasNeverFired) {
                    listener(evt.target.value);
                }
            });
        }

        // add listener to stop time travel button        
        function onButtonClick(rangeInputElmt, listener) {
            rangeInputElmt.addEventListener("click", function (evt) {
                listener(evt.target.value);
            });
        }

        // initialize state html and background color of page        
        let newHTML;
        let pageBgColor;

        // grab page's background color for state injection
        chrome.storage.sync.get('backgroundColor', function (result) {
            pageBgColor = result.backgroundColor
        })

        // time travel function. receives selected state index. sets time traveling to true to prevent state capture. redraws tree and application to selected state.
        const timeTravel = function (index) {
            chrome.storage.sync.set({
                'traveledThroughTime': true
            }, function () {
                return
            });
            chrome.storage.local.get('states', function (result) {
                // console.log('get data', result.states)
                drawTree(result.states, _panelWindow, index)
                var newHTML = result.states[index][1].html;
                var stringHTML = JSON.stringify(newHTML);
                let evaluation = 'inspect($$(".timeTravel"))[0].innerHTML=' + stringHTML + ';'
                chrome.devtools.inspectedWindow.eval(evaluation, function () {
                    return
                })
                let evaluation2 = 'inspect($$(".timeTravel"))[0].setAttribute("style", "width:100%; height: 100vh; background-color: ' + pageBgColor + '; position: absolute; top: 0; left: 0; z-index: 999999;")'
                chrome.devtools.inspectedWindow.eval(evaluation2, function () {
                    return
                })
            })

        }

        // add event listeners
        onRangeChange(slider, timeTravel);
        onButtonClick(timeTravelButton, stopTimeTravel);
        let data = []

        // check node counts to determine if eval function should be run
        function updater() {
            let poller = setInterval(function () {
                chrome.storage.sync.get('count', function (data) {
                    count = data.count
                })
                if (count !== oldCount) {
                    oldCount = count;
                    chrome.devtools.inspectedWindow.eval(
                        `                        
    domNodes = inspect($$('body'));

// primary function to grab, transform and construct data for visualization and inspection
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
    } else {
        let keysArray = Object.keys(node.children);
        for (let i = 0; i < keysArray.length; i++) {
        if (!rootNodes.includes(node.children[keysArray[i]])) findRoots(node.children[keysArray[i]]);
        }
    }
    };
    findRoots(domNodes[0]);

// traverses a domNode to push all vue components into components array
    function findComponents(node) {
        let childrenArray;
        if (rootNodes.includes(node)) {

// fix for apps that have a root with vue$3 instead of __vue__
        components.push(rootNodes[0].__vue__); 
        childrenArray = node.__vue__.$children;
    }
    else {
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

    console.log(components)

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

            if(node.$slots.default) 
            {
                dvComponents[dvComponents.length - 1].slots.push(node.$slots.default[0].text);
            }    
            
            compElem = Object.keys(node._data);
            compVals = Object.values(node._data);
            for (let j = 0; j < compElem.length; j++) {
                if (typeof compVals[j] === 'function') dvComponents[dvComponents.length - 1].variables.push(compElem[j] + ': Function');
                else if (Array.isArray(compVals[j])) dvComponents[dvComponents.length - 1].variables.push(compElem[j] + ': ' + JSON.stringify(compVals[j]));
                else if (typeof compVals[j] === 'string') dvComponents[dvComponents.length - 1].variables.push(compElem[j] + ': "' + compVals[j].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") +'"');
                else dvComponents[dvComponents.length - 1].variables.push(compElem[j] + ': ' + compVals[j]);
            }

            let methodKeys = Object.keys(node).filter((el) => {
                if(el[0] === '_' || el[0] === '$') return false
                else if(typeof node[el] === 'function') return true;
                else return false;
            })

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
    };
    createDvComps(components);
    
// add initial root node for D3 visualization 
    data = [new treeNode({name: 'Vuee', parent: undefined})]

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
    dvComponents.forEach(function(node) {
        data.push(new treeNode(node))
    })
// grabs HTML of current state for time travel to overlay on application - html only added to one object to prevent unnecessary storage
    data[1].html = domNodes[0].innerHTML.slice(0, domNodes[0].innerHTML.length - 110);
                                
    return data
}
createDV()`,
                        function (data) {
                            // push the latest state changes to the state store
                            newData.push(data)
                            // save the latest state store to local storage
                            chrome.storage.local.set({
                                'states': newData
                            });
                            // redraw tree with latest state from local storage
                            chrome.storage.local.get('states', function (result) {
                                drawTree(result.states, _panelWindow)
                            })
                        })
                }
            }, 100);
        }
        updater()
    });


    let dataCompare = -1;

    // function to render tree visualization. takes in state store, chrome panel and selected state for time travel or most recent state if not time traveling

    const drawTree = (data, panel, dataIndex = data.length - 1) => {

        // set timetravel slider position all the way to the right
        let maxLength = data.length - 1;
        let slider = panel.document.getElementById("slider");
        slider.setAttribute('max', maxLength);
        slider.value = dataIndex;

        // check to see if new index has been selected in order to prevent unnecessary rendering       
        if (dataCompare === dataIndex) return;
        else if (dataCompare !== dataIndex) {

            dataCompare = dataIndex;

            // run diffing algorithm to identify and capture state changes on individual components
            if (data[dataIndex - 1]) {
                function compareDiff(data) {
                    let flag = true;
                    let current = data[dataIndex];
                    let compare = data[dataIndex - 1];

                    for (let i = 0; i < current.length; i += 1) {

                        for (let j = 0; j < compare.length; j += 1) {
                            if (current[i].name === compare[j].name) {
                                flag = (JSON.stringify(current[i]) === JSON.stringify(compare[j])) ? true : false;
                                if (!flag) {
                                    let differences = DeepDiff(current[i], compare[j]);
                                    // remove positioning changes which are not state related
                                    current[i].changes = differences.filter((el) => {
                                        if (el.path.indexOf('top') > -1 || el.path.indexOf('bottom') > -1 || el.path.indexOf('left') > -1 || el.path.indexOf('right') > -1) return false
                                        else return true
                                    })
                                }
                                break;
                            }
                        }
                    }
                    return flag;
                }
            }
            // reassign d3 functions to work within the devtoolk panel
            d3 = panel.d3
            data = data[dataIndex];
            // d3 tree creation   
            // create a new object with parent/child relationships
            var dataMap = data.reduce(function (map, node) {
                map[node.name] = node;
                return map;
            }, {});

            // create the tree array
            let treeData = [];
            // remove old visualization to prevent rendering over it
            d3.select("svg#treeVisualization").remove()
            data.forEach(function (node) {
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

            // set svg dimensions and margins            
            var margin = {
                    top: 20,
                    right: 90,
                    bottom: 30,
                    left: 90
                },
                width = 500,
                height = 600;

            // append the svg object to the body of the page
            // appends a 'group' element to 'svg'
            // moves the 'group' element to the top left margin
            const svg = d3.select("#treeContainer").append("svg")
                .attr('id', 'treeVisualization')
                .attr("width", "100%")
                .attr("height", height + margin.top + margin.bottom)
                .call(d3.zoom().on("zoom", function () {
                    svg.attr("transform", d3.event.transform)
                }))
                .on("dblclick.zoom", null)
                .append("g")
                .style("overflow", "visible")
                .attr("transform", "translate(" +
                    margin.left + "," + margin.top + ")");

            let i = 0,
                duration = 0,
                root;

            // declares a tree layout and assigns the size
            const treemap = d3.tree().size([height, width])
                .separation(function separation(a, b) {
                    return a.parent == b.parent ? 1 : 2;
                });;

            // assigns parent, children, height, depth
            root = d3.hierarchy(treeData, function (d) {
                return d.children;
            });
            root.x0 = height / 4;
            root.y0 = 0;

            // run function to render new visualization
            update(root);

            // collapse the node and all it's children
            function collapse(d) {
                if (d.children) {
                    d._children = d.children
                    d._children.forEach(collapse)
                    d.children = null
                }
            }

            function update(source) {

                // assigns the x and y position for the nodes
                const treeData = treemap(root);

                // compute the new tree layout
                const nodes = treeData.descendants(),
                    links = treeData.descendants().slice(1);

                // normalize for fixed-depth
                nodes.forEach(function (d) {
                    d.y = d.depth * 90
                });

                // ****************** Nodes section ***************************

                // update the nodes...
                let node = svg.selectAll('g.node')
                    .data(nodes, function (d) {
                        return d.id || (d.id = ++i);
                    });

                // enter any new modes at the parent's previous position
                const nodeEnter = node.enter().append('g')
                    .attr('class', 'node')
                    .attr("transform", function (d) {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                    })

                // add Circle for the nodes and add blue border if state has changed
                let highlight;
                let removal;
                let changeDiv = panel.document.createElement('div')
                changeDiv.setAttribute('style', 'width:200px; height:200px; background-color: #FFF; color: #000')
                changeDiv.innerHTML = function (d) {
                    return JSON.stringify(d.data.changes)
                }

                nodeEnter.append('circle')
                    .attr('class', 'node')
                    .attr('r', 1e-6)
                    .style("fill", function (d) {
                        return d._children ? "#42b983" : "#fff";
                    })
                    .style('stroke', function (d) {
                        if (d.data.changes && d.data.changes.length > 0) return 'rgba(44, 62, 80, .90)';
                    })
                    .style('stroke-width', function (d) {
                        if (d.data.changes && d.data.changes.length > 0) return '5';
                    })
                    .on('click', click)
                    .on("mouseover", function (d) {

                        // highlight component on application on node hover using components dimensions and coordinates
                        chrome.devtools.inspectedWindow.eval(`highlight = document.createElement("div");
                            highlight.setAttribute('style', 'position: absolute; width: ${d.data.width}px; height: ${d.data.height}px; top: ${d.data.top}px; left: ${d.data.left}px; background-color: rgba(137, 196, 219, .6); border: 1px dashed rgb(137, 196, 219); z-index: 99999;')
                            highlight.setAttribute('id', '${d.data.name}');
                            highlight.setAttribute('class', 'highlighter');
                            document.body.appendChild(highlight)
                            `);
                        // remove highlight
                    }).on("mouseout", function (d) {
                        chrome.devtools.inspectedWindow.eval(`
                                removal = document.getElementById('${d.data.name}')
                                removal.parentNode.removeChild(removal);
                            `);
                    });

                // add labels for the nodes
                nodeEnter.append('text')
                    .attr("dy", ".35em")
                    .attr("x", function (d) {
                        return d.children || d._children ? -13 : 13;
                    })
                    .attr("text-anchor", function (d) {
                        return d.children || d._children ? "end" : "start";
                    })
                    .style('fill', function (d) {
                        if (themeColor === 'default') {
                            return 'black'
                        } else {
                            return 'white'
                        }
                    })
                    .on("click", function (d) {
                        clickHandler(d);
                        let pathToRoot = d.links();
                        pathToRoot.forEach((el) => el.attr('opacity', '.4'))
                    })
                    .on("mouseover", function (d) {
                        // highlight component on application on text hover using components dimensions and coordinates
                        chrome.devtools.inspectedWindow.eval(`highlight = document.createElement("div");
                            highlight.setAttribute('style', 'position: absolute; width: ${d.data.width}px; height: ${d.data.height}px; top: ${d.data.top}px; left: ${d.data.left}px; background-color: rgba(137, 196, 219, .6); border: 1px dashed rgb(137, 196, 219); z-index: 99999;')
                            highlight.setAttribute('id', '${d.data.name}');
                            highlight.setAttribute('class', 'highlighter');
                            document.body.appendChild(highlight)
                            `);
                    })
                    .on("mouseout", function (d) {
                        // remove highlight
                        chrome.devtools.inspectedWindow.eval(`
                                removal = document.getElementById('${d.data.name}')
                                removal.parentNode.removeChild(removal);
                            `);
                    })
                    .text(function (d) {
                        return d.data.name.slice(0, d.data.name.lastIndexOf("-"))
                    });

                // color path to root for clicked node
                d3.selectAll("path").style("stroke", function (d) {
                    if (d.color) {
                        return d.color; //if the value is set
                    } else {
                        return "rgba(211, 211, 211, .6)"
                    }
                })

                // coloring of circles based on what node is clicked
                d3.selectAll("circle").style("opacity", function (d) {
                    if (d.color) {
                        return "1"; //if the value is set
                    } else {
                        return ".8"
                    }
                })

                // coloring of text based on what node is clicked
                d3.selectAll("text").style("opacity", function (d) {
                    if (d.color) {
                        return "1"; //if the value is set
                    } else {
                        return ".8"
                    }
                })

                // UPDATE
                let nodeUpdate = nodeEnter.merge(node);

                // transition to the proper position for the node
                nodeUpdate.transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });

                // update the node attributes and style
                nodeUpdate.select('circle.node')
                    .attr('r', 8)
                    .style("fill", function (d) {
                        return d._children ? "#42b983" : "#fff";
                    })

                    .attr('cursor', 'pointer');


                // remove any exiting nodes
                const nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        return "translate(" + source.y + "," + source.x + ")";
                    })
                    .remove();

                // on exit reduce the node circles size to 0
                nodeExit.select('circle')
                    .attr('r', 1e-6);

                // on exit reduce the opacity of text labels
                nodeExit.select('text')
                    .style('fill-opacity', 1e-6);

                // ****************** links section ***************************

                // update the links...
                const link = svg.selectAll('path.link')
                    .data(links, function (d) {
                        return d.id;
                    });

                // enter any new links at the parent's previous position
                const linkEnter = link.enter().insert('path', "g")
                    .attr("class", "link")
                    .attr('d', function (d) {
                        var o = {
                            x: source.x0,
                            y: source.y0
                        }
                        return diagonal(o, o)
                    });

                // UPDATE
                const linkUpdate = linkEnter.merge(link);

                // transition back to the parent element position
                linkUpdate.transition()
                    .duration(duration)
                    .attr('d', function (d) {
                        return diagonal(d, d.parent)
                    });

                // remove any exiting links
                const linkExit = link.exit().transition()
                    .duration(duration)
                    .attr('d', function (d) {
                        var o = {
                            x: source.x,
                            y: source.y
                        }
                        return diagonal(o, o)
                    })
                    .remove();

                // store the old positions for transition.
                nodes.forEach(function (d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });

                // creates a curved (diagonal) path from parent to the child nodes
                function diagonal(s, d) {
                    path = `M ${s.y} ${s.x}
                        C ${(s.y + d.y) / 2} ${s.x},
                        ${(s.y + d.y) / 2} ${d.x},
                        ${d.y} ${d.x}`

                    return path
                }

                // toggle children on click.
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

                // handle multiple events for node clicks (highlighting path to root and opening component inspector)
                function clickHandler(d) {

                    //highlight path from node to root
                    function flatten(root) {
                        var nodes = [],
                            i = 0;

                        function recurse(node) {
                            if (node.children) node.children.forEach(recurse);
                            if (node._children) node._children.forEach(recurse);
                            if (!node.id) node.id = ++i;
                            nodes.push(node);
                        }

                        recurse(root);
                        return nodes;
                    }

                    var select = d.data.name;

                    //find selected data from flattened root record
                    var find = flatten(root).find(function (d) {
                        if (d.data.name == select)
                            return true;
                    });

                    //reset all the data to have color undefined.
                    flatten(root).forEach(function (d) {
                        d.color = undefined;
                    })

                    //iterate over the selected node and set color as green until it reaches it reaches the root
                    while (find.parent) {
                        find.color = "#42b983";
                        find = find.parent;
                    }
                    update(find);

                    // if the component inspector is already open, remove it and create a new one
                    if (panel.document.getElementById('sidebar')) {
                        closeSidebar();
                    }
                    const sidebar = document.createElement('section');
                    sidebar.setAttribute('id', 'sidebar');

                    const topLink = panel.document.getElementById('viz-link');
                    topLink.innerHTML = "<a href='#'>Component Inspector</a>";
                    topLink.classList.add('active');

                    // populate the section with our headings
                    const contentdiv = document.createElement('div');
                    contentdiv.setAttribute('id', 'app_content');
                    contentdiv.innerHTML = `
                            <a href="#" id="close_sidebar"></a>
                            <h3>${d.data.name.slice(0, d.data.name.lastIndexOf("-"))}</h3>
                            <h4><a href="#" id="methods_handler">Methods</a><span></span></h4>
                            <ul id="${d.data.name}Methods" class="methods-list">

                            </ul>
                            <h4><a href="#" id="props_handler">Props</a><span></span></h4>
                            <ul id="${d.data.name}Props" class="props-list">

                            </ul>
                            <h4><a href="#" id="vars_handler">Variables/Data</a><span></span></h4>
                            <ul id="${d.data.name}Variables" class="vars-list">

                            </ul>
                            <h4 id='slot_handler'>Slot</h4>
                            <ul id="slot-list" class="slot-list opened">
                                <li><p>${(d.data.slots) ? d.data.slots : "No slot/data"}</p></li>
                            </ul>
                        `;
                    panel.document.getElementById('contentContainer').appendChild(sidebar);
                    panel.document.getElementById('sidebar').appendChild(contentdiv);
                    panel.document.getElementById('props_handler').addEventListener('click', propToggle);
                    panel.document.getElementById('vars_handler').addEventListener('click', varToggle);
                    panel.document.getElementById('methods_handler').addEventListener('click', methodToggle);

                    // click handlers for sidebar sections
                    function propToggle(e) {
                        e.preventDefault();
                        panel.document.getElementById('props_handler').classList.toggle('active-sidebar');
                        var element = panel.document.querySelector('.props-list').classList.toggle('opened');
                    }

                    function methodToggle(e) {
                        e.preventDefault();
                        panel.document.getElementById('methods_handler').classList.toggle('active-sidebar');
                        var element = panel.document.querySelector('.methods-list').classList.toggle('opened');
                    }

                    function varToggle(e) {
                        e.preventDefault();
                        panel.document.getElementById('vars_handler').classList.toggle('active-sidebar');
                        panel.document.querySelector('.vars-list').classList.toggle('opened');
                    }

                    // add an event listener to close sidebar button
                    panel.document.getElementById('close_sidebar').addEventListener('click', closeSidebar)

                    // populate methods on sidebar
                    let methodList = panel.document.getElementById(d.data.name + "Methods");
                    if (d.data.methods === "undefined") {
                        let method = document.createElement("li");
                        method.setAttribute('id', d.data.name + 'MethodUndefined');
                        method.innerHTML = "undefined";
                        method.appendChild(method);
                    } else {
                        for (let i = 0; i < d.data.methods.length; i += 1) {
                            let method = document.createElement("li");
                            method.setAttribute('id', d.data.name + 'Method');
                            method.innerHTML = d.data.methods[i];
                            methodList.appendChild(method);
                        }
                        const methodLength = document.createElement('span');
                        methodLength.innerHTML = ` (${d.data.methods.length})`;
                        panel.document.getElementById('methods_handler').appendChild(methodLength);
                    };

                    //popular variables on sidebar
                    let variableList = panel.document.getElementById(d.data.name + "Variables");
                    if (d.data.variables === "undefined") {
                        let variable = document.createElement("li");
                        variable.setAttribute('id', d.data.name + 'VariableUndefined');
                        variable.innerHTML = "undefined";
                        variableList.appendChild(variable);
                    } else {
                        for (let i = 0; i < d.data.variables.length; i += 1) {
                            let variable = document.createElement("li");
                            variable.setAttribute('id', d.data.name + 'Variable');
                            variable.innerHTML = d.data.variables[i];
                            variableList.appendChild(variable);
                        }
                        const varLength = document.createElement('span');
                        varLength.innerHTML = ` (${d.data.variables.length})`;
                        panel.document.getElementById('vars_handler').appendChild(varLength);
                    };

                    //populate props on sidebar
                    let propList = panel.document.getElementById(d.data.name + "Props");
                    if (d.data.props === "undefined") {
                        let prop = document.createElement("li");
                        prop.setAttribute('id', d.data.name + 'PropUndefined');
                        prop.innerHTML = "undefined";
                        propList.appendChild(prop);
                    } else {
                        for (let i = 0; i < d.data.props.length; i += 1) {
                            const propListItem = document.createElement("li");
                            const formattedProp = d.data.props[i[0]]: JSON.stringify(d.data.props[i[1]])
                            propListItem.setAttribute('id', d.data.name + 'Prop');
                            propListItem.innerHTML = d.data.props[i];
                            propList.appendChild(propListItem);
                        }
                        const propLength = document.createElement('span');
                        propLength.innerHTML = ` (${d.data.props.length})`;
                        panel.document.getElementById('props_handler').appendChild(propLength);
                    };

                    function closeSidebar() {
                        const remove = panel.document.getElementById("sidebar");
                        const topLink = panel.document.getElementById('viz-link');
                        topLink.innerHTML = "<a href='#'>App Visualization</a>";
                        topLink.classList.remove('active');
                        panel.document.getElementById('contentContainer').removeChild(remove);
                    }

                    // only runs if there are changes to the component
                    // create array of strings of state changes - e.g. 'CommentCount changed from 0 to 1'
                    if (d.data.changes) {
                        let changeArray = [];
                        for (let i = 0; i < d.data.changes.length; i += 1) {
                            let changes = d.data.changes[i];
                            if (changes.path.includes("html") || changes.path.includes("top") || changes.path.includes("bottom") || changes.path.includes("left") || changes.path.includes("right")) {
                                d.data.changes.splice(i, 1)
                            } else {
                                let prop = JSON.stringify(changes.path[0]).slice(1, changes.path[0].length + 1);
                                let oldVal = (typeof changes.rhs === 'number') ? Math.floor(changes.rhs) : changes.rhs.slice(0, changes.rhs.length);
                                let newVal = (typeof changes.lhs === 'number') ? Math.floor(changes.lhs) : changes.lhs.slice(0, changes.lhs.length);
                                let changeText = (prop === 'height' || prop === 'width') ? `${prop} changed from ${oldVal} to ${newVal}` : `${oldVal} changed to ${newVal}`;
                                changeArray.push(changeText)
                            }
                        }

                        // create UL consisting of changes
                        let htmlString = '<ul class="opened">';
                        if (changeArray.length === 0) {
                            return
                        } else {
                            for (let i = 0; i < changeArray.length; i += 1) {
                                htmlString = htmlString + '<li>' + changeArray[i] + '</li>'
                            }
                        }
                        htmlString = htmlString + '</ul>'

                        // attach changes to inspector
                        const changesDiv = document.createElement('div');
                        changesDiv.setAttribute('id', 'change_content');
                        changesDiv.innerHTML = `
                            <h4><a href="#" class="changed active-sidebar">Changes</a></h4>
                            ${htmlString}
                        `;
                        panel.document.getElementById('app_content').appendChild(changesDiv);

                    }

                }
            }
        }
    }
});