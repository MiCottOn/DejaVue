let count;
let oldCount;
let check;

nodeCounter = function () {
    count = document.querySelectorAll('*').length;
    chrome.storage.sync.get({'count': count}, function() {
        check = count;
    });
    if (count !== check) {
        chrome.storage.sync.set({'count': count }, function () {
            // Notify that we saved.
        });
    }    
}

firstNodeCounter = function () {
    oldCount = document.querySelectorAll('*').length;
    chrome.storage.sync.set({'oldCount': count}, function() {
        // Notify that we saved.
    });
}

window.onload = firstNodeCounter()

setInterval(nodeCounter, 100)


