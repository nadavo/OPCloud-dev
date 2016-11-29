/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({
    el: document.getElementById('paper'),
    width: 500,
    height: 300,
    gridSize: 1,
    model: graph
});

var r = new joint.shapes.basic.Rect({
    position: { x: 50, y: 50 },
    size: { width: 120, height: 80 },
    attrs: { text: { text: 'Rect', 'font-family': 'Helvetica', fill: '#000000' }},
    mylist: ['foo', 'bar', 'baz'],
    nestedList: [['foo', 'bar'], ['baz']]
});
graph.addCell(r);

var c = new joint.shapes.basic.Circle({
    position: { x: 350, y: 150 },
    size: { width: 50, height: 50 },
    attrs: { text: { text: 'Circle' } }
});
graph.addCell(c);

var l = new joint.dia.Link({
    source: { id: r.id },
    target: { id: c.id },
    attrs: {
        '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z', transform: 'scale(0.001)' },       // @TODO: scale(0) fails in Firefox
        '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' }
    },
    labels: [
        { position: .5, attrs: { text: { text: 'mylabel' } } }
    ]
});
graph.addCell(l);

var m = new joint.shapes.devs.Atomic({
    position: { x: 150, y: 190 },
    size: { width: 90, height: 90 },
    inPorts: ['in1', 'in2'],
    outPorts: ['out1', 'out2'],
    attrs: {}
});
graph.addCell(m);

var l1 = new joint.dia.Link({
    source: { id: r.id },
    target: { id: m.id, port: 'in1' },
    attrs: {
        '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z', transform: 'scale(0.001)' },       // @TODO: scale(0) fails in Firefox
        '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' }
    }
});
var l2 = l1.clone();
l2.set('target', { id: m.id, port: 'in2' });
graph.addCell([l1, l2]);

var inspector;

function createInspector(cellView) {

    var inspectorDefs = InspectorDefs[cellView.model.get('type')];

    inspector = joint.ui.Inspector.create('.inspector-container', {
        cellView: cellView,
        inputs: inspectorDefs ? inspectorDefs.inputs : {},
        groups: inspectorDefs ? inspectorDefs.groups : {},
        operators: {
            longerThan: function(cell, value, prop) {
                return value.length > cell.prop(prop);
            }
        }
    });

    inspector.updateCell();
}

paper.on('cell:pointerup', function(cellView, evt) {

    createInspector(cellView);

    if (!(cellView.model instanceof joint.dia.Link)) {
        var halo = window.halo = new joint.ui.Halo({
            graph: graph,
            paper: paper,
            cellView: cellView
        });
        halo.render();
    }
});

paper.on('link:options', function(evt, cellView, x, y) {

    createInspector(cellView);
});

createInspector(m.findView(paper));
inspector.updateCell();

var cm = new joint.dia.CommandManager({ graph: graph });
$('#btn-undo').on('click', _.bind(cm.undo, cm));
$('#btn-redo').on('click', _.bind(cm.redo, cm));

graph.on('change', function(cell, opt) {
    console.log(opt);
});
