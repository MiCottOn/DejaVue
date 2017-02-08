# DejaVue - Documentation

## Installation
<h3>Click here to download the extension!</h3>
(Only a Chrome devtools extension is currently available)

## Manual Installation 

Make sure you are using Node 6+ and NPM 3+
<p>1. Clone this repo</p>
<p>2. <code>npm run build</code></p>
<p>3. Open Chrome extension page</p>
<p>4. Check "developer mode"</p>
<p>5. Click "load unpacked extension", and choose the root folder.</p>

## Using DejaVue
<p>1. Run your application in developer mode on localhost</p>
<p>2. Open Chrome Dev Tools and select the DejaVue tab</p>
<p>3. Start using your application and DejaVue will dynamically update and save changes so you can "time travel"</p>

## Features
<p>1. Hover over a node and the component will be highlighted on your application</p>
<p>2. Click a node to close and open it's children group</p>
<p>3. Click a node's text to view it's path to the root component, it's props, variables and slots, and any changes to state.</p>
<p>4. A node encompassed by a thick blue border has had it's state changed. Click the text to view the changes.</p>
<p>5. Use the slider at the top of the tool to travel through time and see the tree and your app update in realtime.</p>
