cytoscape-node-html
================================================================================


## Description

This extension provides ability to add labels for Cytoscape nodes. Simple example:

`cyInstance.registerNodeHtml( [{ tpl: d => '<div>' + d + '</div>' }] );`


## Features
- optimized for high performance with high number of nodes, for smooth panning and zooming.
- customizable labels with different templates.


## Usage instructions

Download the library:
 * via npm: `npm install cytoscape-node-html`,
 * via bower: `bower install cytoscape-node-html`, or
 * via direct download from the repository (probably from a tag).

#### Plain HTML/JS has extension registered for you automatically:
```html
<script src="http://cytoscape.github.io/cytoscape.js/api/cytoscape.js-latest/cytoscape.min.js"></script>
<script src="cytoscape-node-html.js"></script>
```

#### RequireJs approach:
`require()` the library as appropriate for your project:

CommonJS:
```js
var cytoscape = require('cytoscape');
var registerNodeHtml = require('cytoscape-node-html');
registerNodeHtml( cytoscape ); // register extension
```

AMD:
```js
require(['cytoscape', 'cytoscape-node-html'], function( cytoscape, registerNodeHtml ){
  registerNodeHtml( cytoscape ); // register extension
});
```


## API

`registerNodeHtml` parameter is an array of options:

```js
cyInstance.registerNodeHtml([
  {
    query: 'node', // cytoscape query selector
    halign: 'center', // title vertical position. Can be 'left',''center, 'right'
    valign: 'center', // title vertical position. Can be 'top',''center, 'bottom'
    halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
    valignBox: 'center', // title relative box vertical position. Can be 'top',''center, 'bottom'
    cssClass: '', // any classes will be as attribute of <div> container for every title
    tpl(data) {
      return '<span>' + data + '</span>'; // your html template here
    }
  }
]);
```

To make links clickable inside your labels, you need to pass `enablePointerEvents: true` as the 3rd argument to `registerNodeHtml`:

```js
cyInstance.registerNodeHtml([
  {
    ...
  }
], {
  enablePointerEvents: true
});
```

## Usage example

Code example:
```js
// create Cy instance
var cyInstance = cytoscape({
    container: document.getElementById('cy'),
    layout: {
        name: 'random'
    },
    elements: [ // your cy elements
        { group: "nodes", data: { id: 'a1', name: 'a10' }, classes: 'l1' },
        { group: "nodes", data: { id: 'a1', name: 'a10' }, classes: 'l1' },
        { group: "nodes", data: { id: 'a1', name: 'a10' }, classes: 'l1' },
        { group: "nodes", data: { id: 'a5', name: 'a5' }, classes: 'l2' }
    ]
});

// set registerNodeHtml for your Cy instance
cyInstance.registerNodeHtml([{
        query: '.l1',
        valign: "top",
        halign: "left",
        valignBox: "top",
        halignBox: "left",
        tpl: function(data) {
            return '<p class="cy-title__p1">' + data.id + '</p>' + '<p  class="cy-title__p2">' + data.name + '</p>';
        }
    },
    {
        query: '.l2',
        tpl: function(data) {
            return '<p class="cy-title__p1">' + data.id + '</p>' + '<p  class="cy-title__p2">' + data.name + '</p>';
        }
    }
]);
```


## How to build and develop:
1) Run `npm start`
1) Create change in src/cytoscape-node-html.ts
1) When finished => `npm run test`
1) Prepare js and min files: `npm run build`
1) `git commit`

Then, for version update and publish:
1) Create new npm version: `gulp patch`, `gulp feature` or `gulp release`
1) `npm publish`
