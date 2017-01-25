let modificationList = []
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        var observer = new MutationObserver(function(mutations, observer) {
            for(var mutation in mutations){
                modificationList.push(mutation);
                chrome.extension.sendMessage({'reRender': true})
                console.log(modificationList)
            }
        });

        observer.observe(document, {
            subtree: true,
            attributes: true,
            characterData: true,
            childList:true
        });