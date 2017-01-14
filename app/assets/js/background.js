//javascript that is always running in the background

chrome.contextMenus.create({
  title: 'DejaVue right click menu for no reason!',
  id: 'selectFromContextMenu',
  contexts: ['all'],
}, () => {
  const error = chrome.runtime.lastError;
  if (error) {
    console.log(error);
  }
  else {
    console.log('Context menu created');
  }
});
