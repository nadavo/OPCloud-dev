/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// Inspired by dagre-D3 demo "Clusters"

var graph = new joint.dia.Graph;
var $paper = $('#paper');
var paper = new joint.dia.Paper({
    el: $paper,
    width: 800,
    height: 600,
    gridSize: 20,
    model: graph
});

function makeLink(el1, el2) {
    var l = new joint.dia.Link({ source: { id: el1.id }, target: { id: el2.id }});
    return l;
}

function makeElement(attrs) {
    var el = new joint.shapes.basic.Rect({ size: { width: 20, height: 20 }});
    el.attr(attrs);
    return el;
}

var topGroup = makeElement({ text: { text: 'TopGroup', 'ref-y': 15 }});
var bottomGroup = makeElement({ text: { text: 'Bottom Group', 'ref-y': 15 }});
var group = makeElement({ text: { text: 'Group', 'ref-y': 15 }});

var ea = makeElement({ text: { text: 'a' }, rect: { fill: 'yellow' }});
var eb = makeElement({ text: { text: 'b' }, rect: { fill: 'yellow' }});
var ec = makeElement({ text: { text: 'c' }, rect: { fill: 'yellow' }});
var ed = makeElement({ text: { text: 'd' }, rect: { fill: 'yellow' }});
var ee = makeElement({ text: { text: 'e' }, rect: { fill: 'yellow' }});
var ef = makeElement({ text: { text: 'f' }, rect: { fill: 'yellow' }});
var eg = makeElement({ text: { text: 'g' }, rect: { fill: 'yellow' }});
var eh = makeElement({ text: { text: 'h' }, rect: { fill: 'yellow' }});

var lab = makeLink(ea, eb);
var lbc = makeLink(eb, ec);
var lbd = makeLink(eb, ed);
var lbe = makeLink(eb, ee);
var lbf = makeLink(eb, ef);
var lbg = makeLink(eb, eg);
var lhg = makeLink(eh, eg);

group.embed(topGroup).embed(bottomGroup);
topGroup.embed(eb).embed(eh);
bottomGroup.embed(ec).embed(ed).embed(ee).embed(ef);

graph.addCell([group, topGroup, bottomGroup, ea, eb, ec, ed, ed, ee, ef, eg, eh, lab, lbc, lbd, lbe, lbf, lbg, lhg]);

joint.layout.DirectedGraph.layout(graph, {
    setLinkVertices: false,
    rankDir: 'TB',
    marginX: 200,
    marginY: 100,
    clusterPadding: { top: 30, left: 10, right: 10, bottom: 10 }
});
