/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var graph = new joint.dia.Graph;
var $paper = $('#paper');
var paper = new joint.dia.Paper({
    el: $paper,
    width: 500,
    height: 300,
    gridSize: 1,
    perpendicularLinks: true,
    model: graph
});

$('#print-btn').click(_.bind(function() { paper.print(); }, paper));

var r = new joint.shapes.basic.Rect({
    position: { x: 50, y: 50 },
    size: { width: 120, height: 80 },
    attrs: { text: { text: 'Rect' } }
});
graph.addCell(r);

var c = new joint.shapes.basic.Circle({
    position: { x: 250, y: 50 },
    size: { width: 50, height: 50 },
    attrs: { text: { text: 'Circle' } }
});
graph.addCell(c);

var m = new joint.shapes.devs.Model({
    position: { x: 350, y: 150 },
    size: { width: 70, height: 90 },
    inPorts: ['in1', 'in2'],
    outPorts: ['out']
});
graph.addCell(m);
