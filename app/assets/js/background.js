//javascript that is always running in the background

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.from == 'content_script') {
    console.log('The request has been received from the content script.');
  }
});

