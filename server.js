'use strict';

const express = require('express');
const path = require('path');


const app = express();
const PORT = 3000;

//this isn't working for some reason. too lazy to solve right now so did direct request below.
app.use(express.static(path.join(__dirname, 'dejavue')));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'dejavue/app/index.html'));
});

app.get('/dejavue/assets/js/vue.js', function(req, res) {
  res.sendFile(path.join(__dirname, '/dejavue/assets/js/vue.js'));
});

app.listen(PORT, function () {
   console.log("...listening on port", PORT);
});


function createDV() {

    // gets document.body's child nodes which are direct child html elements
  const keysArray = Object.keys(document.body.children);
  
    // initialize empty array to store root node objects
      const rootNodes = [];

      function findRoots() {

    // iterate through keysArray to push only Vue root nodes into rootNodes array
        for (let i = 0; i < keysArray.length; i += 1) {
          const testNode = document.body.children[keysArray[i]];
        if (!rootNodes.includes(testNode) &&  `testNode.__vue__`) rootNodes.push(testNode);
      }

        return rootNodes;
      };

      const roots = findRoots();
      console.log('rootNodes', rootNodes);
}

// console.log(createDV());