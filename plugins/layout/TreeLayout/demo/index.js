/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


function makeLink(parentElementLabel, childElementLabel) {

    return new joint.dia.Link({
        source: { id: parentElementLabel },
        target: { id: childElementLabel },
        attrs: { '.marker-target': { d: 'M 4 0 L 0 2 L 4 4 z' } },
        connector: { name: 'rounded' }
    });
}

function makeElement(label) {

    // Compute width/height of the rectangle based on the number
    // of lines in the label and the letter size. 0.6 * letterSize is
    // an approximation of the monospace font letter width.
    var width = label[2] ? 40 : 30;
    var height = label[2] ? 40 : 30;

    return new joint.shapes.basic.Rect({
        id: label,
        size: { width: width, height: height },
        attrs: {
            text: { text: label, 'font-size': 8, 'font-family': 'monospace' },
            rect: {
                width: width, height: height,
                rx: 5, ry: 5,
                stroke: '#555'
            }
        },
        direction: _.indexOf('LRTB', label[0]) >= 0 ? label[0] : undefined
    });
}

function buildGraphFromAdjacencyList(adjacencyList) {

    var elements = [];
    var links = [];

    _.each(adjacencyList, function(edges, parentElementLabel) {
        elements.push(makeElement(parentElementLabel));

        _.each(edges, function(childElementLabel) {
            links.push(makeLink(parentElementLabel, childElementLabel));
        });
    });

    // Links must be added after all the elements. This is because when the links
    // are added to the graph, link source/target
    // elements must be in the graph already.
    return elements.concat(links);
}

var list = {
    'Xa': ['Lb', 'Lc_', 'Ra', 'Ta', 'Ba'],
    'Lb': ['Ld'],
    'Lc_': ['Le', 'Lf'],
    'Ld': [],
    'Le': ['B0_', 'B1'],
    'Lf': [],
    'Ra': ['Rb_'],
    'Rb_': ['Bx', 'By', 'Bz'],
    'Ta': ['Tb', 'Tc'],
    'Tb': ['Rx', 'Ry'],
    'Tc': [],
    'Ba': ['T0', 'T1_'],
    'Bx': [],
    'By': [],
    'Bz': [],
    'Rx': [],
    'Ry': [],
    'B0_': [],
    'B1': [],
    'T0': [],
    'T1_': []
};

var cells = buildGraphFromAdjacencyList(list);

// Create paper and populate the graph.
// ------------------------------------

var graph = new joint.dia.Graph;
var $paper = $('#paper');
var paper = new joint.dia.Paper({
    el: $paper,
    width: 2000,
    height: 4000,
    gridSize: 1,
    model: graph,
    perpendicularLinks: true
});

graph.resetCells(cells);

var graphLayout = new joint.layout.TreeLayout({
    graph: graph,
    siblingGap: 10,
    parentGap: 10,
    firstChildGap: 10,
    direction: 'BR'
});

// root position stays the same after the layout
var root = cells[0].position(300, 400);

graphLayout.layout();
