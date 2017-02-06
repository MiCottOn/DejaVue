let count;
let oldCount;
let check;

nodeCounter = function () {
    //FIX FOR TIME TRAVEL - MAKE SOME SORT OF CHECK SO NEW STATE ISN'T ADDED
    chrome.storage.sync.get('traveledThroughTime', function (result) {
        if (!result.traveledThroughTime) {
            count = document.querySelectorAll('*').length - document.querySelectorAll('div.highlighter').length;
            chrome.storage.sync.get('count', function () {
                check = count;
            });
            if (count !== check) {
                chrome.storage.sync.set({
                    'count': count
                }, function () {
                    return
                });
            }
        }
    })
}

firstNodeCounter = function () {
    oldCount = document.querySelectorAll('*').length;
    chrome.storage.sync.set({
        'oldCount': count
    }, function () {
        return
    });
}

window.onload = firstNodeCounter()

setInterval(nodeCounter, 100)


var target = window.document;

// create an observer instance
var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        console.log(mutation.type);
    });
});

// configuration of the observer:
var config = {
    attributes: true,
    childList: true,
    subTree: true,
    characterData: true
};

// pass in the target node, as well as the observer options
observer.observe(target, config);

function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}

let test = document.querySelectorAll('*');

for (let i = 0; i < test.length; i += 1) {
	addClass(test[i], 'interaction')
}

var Interactor = function (config) {
    // Call Initialization on Interactor Call
    this.__init__(config);
};

let arr = [];

Interactor.prototype = {

    // Initialization
    __init__: function (config) {

        var interactor = this;
        
        // Argument Assignment          // Type Checks                                                                          // Default Values
        interactor.interactions       = typeof(config.interactions)               == "boolean"    ? config.interations        : true,
        interactor.interactionElement = typeof(config.interactionElement)         == "string"     ? config.interactionElement :'interaction',
        interactor.interactionEvents  = Array.isArray(config.interactionEvents)   === true        ? config.interactionEvents  : ['mouseup', 'touchend'],
        interactor.conversions        = typeof(config.coversions)                 == "boolean"    ? config.conversions        : false,
        interactor.conversionElement  = typeof(config.conversionElement)          == "string"     ? config.conversionElement  : 'conversion',
        interactor.conversionEvents   = Array.isArray(config.conversionEvents)    === true        ? config.conversionEvents   : ['mouseup', 'touchend'],
        interactor.endpoint           = typeof(config.endpoint)                   == "string"     ? config.endpoint           : '/interactions',
        interactor.async              = typeof(config.async)                      == "boolean"    ? config.async              : true,
        interactor.debug              = typeof(config.debug)                      == "boolean"    ? config.debug              : true,
        interactor.records            = [],
        interactor.session            = {},
        interactor.loadTime           = new Date();
        
        // Initialize Session
        interactor.__initializeSession__();
        // Call Event Binding Method
        interactor.__bindEvents__();
        
        return interactor;
    },

    // Create Events to Track
    __bindEvents__: function () {
        
        var interactor  = this;

        // Set Interaction Capture
        if (interactor.interactions === true) {
            for (var i = 0; i < interactor.interactionEvents.length; i++) {
                var ev      = interactor.interactionEvents[i],
                    targets = document.getElementsByClassName(interactor.interactionElement);
                for (var j = 0; j < targets.length; j++) {
                    targets[j].addEventListener(ev, function (e) {
                        e.stopPropagation();
                        interactor.__addInteraction__(e, "interaction");
                    });
                }
            }   
        }

        // Set Conversion Capture
        if (interactor.conversions === true) {
            for (var i = 0; i < interactor.conversionEvents.length; i++) {
                var ev      = interactor.events[i],
                    targets = document.getElementsByClassName(interactor.conversionElement);
                for (var j = 0; j < targets.length; j++) {
                    targets[j].addEventListener(ev, function (e) {
                        e.stopPropagation();
                        interactor.__addInteraction__(e, "conversion");
                    });
                }
            }   
        }

        // Bind onbeforeunload Event
        window.onbeforeunload = function (e) {
            interactor.__sendInteractions__();
        };
        
        return interactor;
    },

    // Add Interaction Object Triggered By Events to Records Array
    __addInteraction__: function (e, type) {
            
        var interactor  = this,

            // Interaction Object
            interaction     = {
                type            : type,
                event           : e.type,
                targetTag       : e.target.nodeName,
                targetClasses   : e.target.className,
                content         : e.target.innerText,
                clientPosition  : {
                    x               : e.clientX,
                    y               : e.clientY
                },
                screenPosition  : {
                    x               : e.screenX,
                    y               : e.screenY
                },
                createdAt       : new Date()
            };
        
        // Insert into Records Array
        interactor.records.push(interaction);

        // Log Interaction if Debugging
        if (interactor.debug) {
            // Close Session & Log to Console
            interactor.__closeSession__();
            console.log("Session:\n", interactor.session);
        }

        return interactor;
    },

    // Generate Session Object & Assign to Session Property
    __initializeSession__: function () {
        var interactor = this;

        // Assign Session Property
        interactor.session  = {
            loadTime        : interactor.loadTime,
            unloadTime      : new Date(),
            language        : window.navigator.language,
            platform        : window.navigator.platform,
            port            : window.location.port,
            clientStart     : {
                name            : window.navigator.appVersion,
                innerWidth      : window.innerWidth,
                innerHeight     : window.innerHeight,
                outerWidth      : window.outerWidth,
                outerHeight     : window.outerHeight
            },
            page            : {
                location        : window.location.pathname,
                href            : window.location.href,
                origin          : window.location.origin,
                title           : document.title
            },
            endoint        : interactor.endpoint
        };

        return interactor;
    },

    // Insert End of Session Values into Session Property
    __closeSession__: function () {

        var interactor = this;

        // Assign Session Properties
        interactor.session.unloadTime   = new Date();
        interactor.session.interactions = interactor.records;
        interactor.session.clientEnd    = {
            name            : window.navigator.appVersion,
            innerWidth      : window.innerWidth,
            innerHeight     : window.innerHeight,
            outerWidth      : window.outerWidth,
            outerHeight     : window.outerHeight
        };

        return interactor;
    },


    // Gather Additional Data and Send Interaction(s) to Server
    __sendInteractions__: function () {
        
        var interactor  = this,
            // Initialize Cross Header Request
            xhr         = new XMLHttpRequest();
            
        // Close Session
        interactor.__closeSession__();

        
        arr.push(JSON.stringify(interactor.session));
    }

};

            var interactions = new Interactor({
                interactions            : true,
                interactionElement      : "interaction",
                interactionEvents       : ["mousedown", "mouseup", "submit", "click"],
                conversions             : true,
                conversionElement       : "conversion",
                conversionEvents        : ["mouseup", "touchend"],
                endpoint                : '/usage/interactions',
                async                   : true,
                debug                   : false
            });