let count;
let oldCount;
let check;

nodeCounter = function () {
    count = document.querySelectorAll('*').length - document.querySelectorAll('div.highlighter').length;
    chrome.storage.sync.get('count', function() {
        check = count;
    });
    if (count !== check) {
        chrome.storage.sync.set({'count': count }, function () {
            return
        });
    }    
}

firstNodeCounter = function () {
    oldCount = document.querySelectorAll('*').length;
    chrome.storage.sync.set({'oldCount': count}, function() {
        return
    });
}

window.onload = firstNodeCounter()

setInterval(nodeCounter, 100)


