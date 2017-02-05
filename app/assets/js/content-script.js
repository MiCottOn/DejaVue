let count;
let oldCount;
let check;

nodeCounter = function () {
        //FIX FOR TIME TRAVEL - MAKE SOME SORT OF CHECK SO NEW STATE ISN'T ADDED
    chrome.storage.local.get('traveledThroughTime', function (result) {
        console.log(result.traveledThroughTime)
        if (!result.traveledThroughTime) {
            count = document.querySelectorAll('*').length - document.querySelectorAll('div.highlighter').length;
            chrome.storage.sync.get('count', function () {
                check = count;
            });
            if (count !== check) {
                chrome.storage.sync.set({ 'count': count }, function () {
                    return
                });
            }
        }
    })
}    

firstNodeCounter = function () {
    oldCount = document.querySelectorAll('*').length;
    chrome.storage.sync.set({'oldCount': count}, function() {
        return
    });
}

window.onload = firstNodeCounter()

setInterval(nodeCounter, 100)


var target = window.document;
 
// create an observer instance
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    console.log(mutation.type);
  });    
});
 
// configuration of the observer:
var config = { attributes: true, childList: true, subTree: true, characterData: true };
 
// pass in the target node, as well as the observer options
observer.observe(target, config);