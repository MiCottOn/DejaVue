//CAPTURE EVENTS ON PAGES - START OF SCRIPT/ALG
let actions = []
$(document).ready(function () {
    $('a').on('click', function (e) {
        actions.push({
            'Click': [e, $(this)]
        });
        console.log(actions)

        chrome.storage.local.set({
            'macros': actions
        }, function () {
            return
        });

        chrome.storage.local.get('macros', function (result) {
            if (result.macros) {
                console.log('macros', result.macros);
            }
        });
    })
});



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

        window.onload = firstNodeCounter();

        setInterval(nodeCounter, 100)