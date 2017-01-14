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
