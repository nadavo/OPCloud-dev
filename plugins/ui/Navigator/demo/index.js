/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var graph = new joint.dia.Graph;

var paper = new joint.dia.Paper({
    width: 500,
    height: 300,
    gridSize: 1,
    perpendicularLinks: true,
    model: graph
});

var paperScroller = new joint.ui.PaperScroller({
    paper: paper,
    autoResizePaper: true,
    padding: 50
});
paper.on('blank:pointerdown', paperScroller.startPanning);
paperScroller.$el.css({ width: 500, height: 300 }).appendTo('#paper');
paperScroller.center();

$('#zoom-in').on('click', function() {
    paperScroller.zoom(0.2, { max: 2 });
});
$('#zoom-out').on('click', function() {
    paperScroller.zoom(-0.2, { min: 0.2 });
});

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

// Navigator plugin initalization
var nav = new joint.ui.Navigator({
    paperScroller: paperScroller,
    width: 300,
    height: 200,
    padding: 10,
    zoomOptions: { max: 2, min: 0.2 }
});
nav.$el.appendTo('#navigator');
nav.render();
