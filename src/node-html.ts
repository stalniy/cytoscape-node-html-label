import * as cytoscape from 'cytoscape';

type IHAlign = "left" | "center" | "right";
type IVAlign = "top" | "center" | "bottom";
type TemplateFunction = (data: any) => string | HTMLElement;

interface CytoscapeNodeHtmlParams {
  query?: string;
  halign?: IHAlign;
  valign?: IVAlign;
  halignBox?: IHAlign;
  valignBox?: IVAlign;
  cssClass?: string;
  tpl?: TemplateFunction
}

interface CytoscapeContainerParams {
  enablePointerEvents?: boolean;
}

interface ICytoscapeNodeHtmlPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ILabelElement {
  data?: any;
  position?: ICytoscapeNodeHtmlPosition;
  node: HTMLElement;
}

class LabelElement {
  public tpl: TemplateFunction;

  private _position: number[];
  private _node: HTMLElement;
  private _align: [number, number, number, number];

  constructor({
                node,
                position = null,
                data = null
              }: ILabelElement,
              params: CytoscapeNodeHtmlParams) {

    this.updateParams(params);
    this._node = node;

    this.initStyles(params.cssClass);

    if (data) {
      this.updateData(data);
    }
    if (position) {
      this.updatePosition(position);
    }
  }

  updateParams({
                 tpl,
                 cssClass = null,
                 halign = "center",
                 valign = "center",
                 halignBox = "center",
                 valignBox = "center"
               }: CytoscapeNodeHtmlParams) {

    const _align = {
      "top": -.5,
      "left": -.5,
      "center": 0,
      "right": .5,
      "bottom": .5
    };

    this._align = [
      _align[halign],
      _align[valign],
      100 * (_align[halignBox] - 0.5),
      100 * (_align[valignBox] - 0.5)
    ];

    this.tpl = tpl;
  }

  updateData(data: any) {
    const html = this.tpl(data)

    if (typeof html === 'string') {
      this._node.innerHTML = html
    } else {
      this._node.innerHTML = ''
      this._node.appendChild(html)
    }
  }

  getNode(): HTMLElement {
    return this._node;
  }

  updatePosition(pos: ICytoscapeNodeHtmlPosition) {
    this._renderPosition(pos);
  }

  private initStyles(cssClass: string) {
    let stl = this._node.style;
    stl.position = 'absolute';
    if (cssClass && cssClass.length) {
      this._node.classList.add(cssClass);
    }
  }

  private _renderPosition(position: ICytoscapeNodeHtmlPosition) {
    const prev = this._position;
    const x = position.x + this._align[0] * position.w;
    const y = position.y + this._align[1] * position.h;

    if (!prev || prev[0] !== x || prev[1] !== y) {
      this._position = [x, y];

      let valRel = `translate(${this._align[2]}%,${this._align[3]}%) `;
      let valAbs = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) `;
      let val = valRel + valAbs;
      let stl = <any>this._node.style;
      stl.webkitTransform = val;
      stl.msTransform = val;
      stl.transform = val;
    }
  }
}

/**
 * LabelContainer
 * Html manipulate, find and upgrade nodes
 * it don't know about cy.
 */
class LabelContainer {
  private _elements: { [key: string]: LabelElement } = {};
  private _node: HTMLElement;

  constructor(node: HTMLElement) {
    this._node = node;
  }

  addOrUpdateElem(id: string, param: CytoscapeNodeHtmlParams, payload: { data?: any, position?: ICytoscapeNodeHtmlPosition } = {}) {
    let cur = this._elements[id];
    if (cur) {
      cur.updateParams(param);
      cur.updateData(payload.data);
      cur.updatePosition(payload.position);
    } else {
      let nodeElem = document.createElement("div");
      this._node.appendChild(nodeElem);

      this._elements[id] = new LabelElement({
        node: nodeElem,
        data: payload.data,
        position: payload.position
      }, param);
    }
  }

  removeElemById(id: string) {
    if (this._elements[id]) {
      this._node.removeChild(this._elements[id].getNode());
      delete this._elements[id];
    }
  }

  updateElemPosition(id: string, position?: ICytoscapeNodeHtmlPosition) {
    let ele = this._elements[id];
    if (ele) {
      ele.updatePosition(position);
    }
  }

  updatePanZoom({pan, zoom}: { pan: { x: number, y: number }, zoom: number }) {
    const val = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
    const stl = <any>this._node.style;
    const origin = "top left";

    stl.webkitTransform = val;
    stl.msTransform = val;
    stl.transform = val;
    stl.webkitTransformOrigin = origin;
    stl.msTransformOrigin = origin;
    stl.transformOrigin = origin;
  }
}

function cytoscapeNodeHtml(_cy: cytoscape.Core, params: CytoscapeNodeHtmlParams[], options?: CytoscapeContainerParams) {
  const _params = (!params || typeof params !== "object") ? [] : params;
  const _lc = createLabelContainer();

  _cy.one("render", (e: any) => {
    createNodesCyHandler(e);
    wrapCyHandler(e);
  });
  _cy.on("add", addCyHandler);
  _cy.on("layoutstop", layoutstopHandler);
  _cy.on("remove", removeCyHandler);
  _cy.on("data", updateDataOrStyleCyHandler);
  _cy.on("style", updateDataOrStyleCyHandler);
  _cy.on("pan zoom", wrapCyHandler);
  _cy.on("position bounds", moveCyHandler); // "bounds" - not documented event

  return _cy;

  function createLabelContainer(): LabelContainer {
    let _cyContainer = _cy.container();
    let _titlesContainer = document.createElement("div");

    let _cyCanvas = _cyContainer.querySelector("canvas");
    let cur = _cyContainer.querySelector("[class^='cy-node-html']");
    if (cur) {
      _cyCanvas.parentNode.removeChild(cur);
    }

    let stl = _titlesContainer.style;
    stl.position = 'absolute';
    stl['z-index'] = 10;
    stl.width = '500px';
    stl.margin = '0px';
    stl.padding = '0px';
    stl.border = '0px';
    stl.outline = '0px';
    stl.outline = '0px';

    if (options && options.enablePointerEvents !== true) {
      stl['pointer-events'] = 'none';
    }

    _cyCanvas.parentNode.appendChild(_titlesContainer);

    return new LabelContainer(_titlesContainer);
  }

  function createNodesCyHandler({cy}: cytoscape.EventObjectNode) {
    _params.forEach(x => {
      cy.elements(x.query).forEach((d: any) => {
        if (d.isNode()) {
          _lc.addOrUpdateElem(d.id(), x, {
            position: getNodePosition(d),
            data: d.data()
          });
        }
      });
    });
  }

  function addCyHandler(ev: cytoscape.EventObjectNode) {
    let target = ev.target;
    let param = _params.slice().reverse().find(x => target.is(x.query));
    if (param) {
      _lc.addOrUpdateElem(target.id(), param, {
        position: getNodePosition(target),
        data: target.data()
      });
    }
  }

  function layoutstopHandler({cy}: cytoscape.EventObjectNode) {
    _params.forEach(x => {
      cy.elements(x.query).forEach((d: any) => {
        if (d.isNode()) {
          _lc.updateElemPosition(d.id(), getNodePosition(d));
        }
      });
    });
  }

  function removeCyHandler(ev: cytoscape.EventObjectNode) {
    _lc.removeElemById(ev.target.id());
  }

  function moveCyHandler(ev: cytoscape.EventObjectNode) {
    // console.log('moveCyHandler');
    _lc.updateElemPosition(ev.target.id(), getNodePosition(ev.target));
  }

  function updateDataOrStyleCyHandler(ev: cytoscape.EventObjectNode) {
    setTimeout(() => {
      const target = ev.target;
      const param = _params.slice(0).reverse().find(x => target.is(x.query));
      if (param) {
        _lc.addOrUpdateElem(target.id(), param, {
          position: getNodePosition(target),
          data: target.data()
        });
      } else {
        _lc.removeElemById(target.id());
      }
    }, 0);
  }

  function wrapCyHandler({cy}: cytoscape.EventObjectNode) {
    _lc.updatePanZoom({
      pan: cy.pan(),
      zoom: cy.zoom()
    });
  }

  function getNodePosition(node: any): ICytoscapeNodeHtmlPosition {
    return {
      w: node.width(),
      h: node.height(),
      x: node.position("x"),
      y: node.position("y")
    };
  }
}

export default function register(cy: any) {
  if (!cy) {
    throw new Error('Unable to register cytoscape plugin. You need to pass cytoscape as the first parameter');
  }

  function attachHtmlToNodes(params: CytoscapeNodeHtmlParams[], options?: CytoscapeContainerParams) {
    return cytoscapeNodeHtml(this, params, options);
  }

  cy('core', 'nodeHtmlLabel', attachHtmlToNodes);
  cy('core', 'attachHtmlToNodes', attachHtmlToNodes);
}

declare module 'cytoscape' {
  interface Core {
    nodeHtmlLabel(params: CytoscapeNodeHtmlParams[], options?: CytoscapeContainerParams): void
    attachHtmlToNodes(params: CytoscapeNodeHtmlParams[], options?: CytoscapeContainerParams): void
  }
}
