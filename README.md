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
const cytoscape = require('cytoscape');
cytoscape.use(require('cytoscape-node-html'));
```

AMD:
```js
require(['cytoscape', 'cytoscape-node-html'], function (cytoscape, registerNodeHtml) {
  cytoscape.use(registerNodeHtml)
});
```


## API

`attachHtmlToNodes` parameter is an array of options:

```js
cy.attachHtmlToNodes([
  {
    query: 'node', // cytoscape query selector
    halign: 'center', // title vertical position. Can be 'left',''center, 'right'
    valign: 'center', // title vertical position. Can be 'top',''center, 'bottom'
    halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
    valignBox: 'center', // title relative box vertical position. Can be 'top',''center, 'bottom'
    cssClass: '', // any classes will be as attribute of <div> container for every title
    tpl(data) {
      return '<span>' + data + '</span>'; // your html template or HTMLElement
    }
  }
]);
```

To make links clickable inside your labels, you need to pass `enablePointerEvents: true` as the 3rd argument to `attachHtmlToNodes`:

```js
cy.attachHtmlToNodes([
  {
    // ...
  }
], {
  enablePointerEvents: true
});
```

## Usage example

Code example:
```js
var cy = cytoscape({
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
cy.attachHtmlToNodes([
  {
      query: '.l1',
    valign: "top",
    halign: "left",
    valignBox: "top",
    halignBox: "left",
    tpl(data) {
      return '<p class="cy-title__p1">' + data.id + '</p>' + '<p  class="cy-title__p2">' + data.name + '</p>';
    }
  },
  {
    query: '.l2',
    tpl(data) {
      const node = document.createElement('div');
      node.textContent = `${data.name} (${data.id})`;
      return node;
    }
  }
]);
```


## How to build and develop:
1) Create change in src/node-html.ts
1) When finished => `npm test`
1) Prepare js and min files: `npm run build`
1) `git commit`

Then, for version update and publish:
1) Create new npm version: `npm version patch`, `npm version minor` or `npm version major`
1) `npm publish`
