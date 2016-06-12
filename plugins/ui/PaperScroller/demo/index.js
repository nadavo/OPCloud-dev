/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var graph = new joint.dia.Graph;

var $app = $('#app');

var paper = new joint.dia.Paper({

    width: 2000,
    height: 2000,
    gridSize: 20,
    model: graph
});

var paperScroller = new joint.ui.PaperScroller({
    paper: paper,
    padding: 50,
    autoResizePaper: true
});

// Initiate panning when the user grabs the blank area of the paper.
paper.on('blank:pointerdown', paperScroller.startPanning);

paperScroller.$el.css({ width: 600, height: 600 }).appendTo($app);

// Example of centering the paper.
paperScroller.center();

var r = new joint.shapes.basic.Rect({
    position: { x: 1020, y: 1020 },
    size: { width: 120, height: 80 },
    attrs: { text: { text: 'Rect' } }
});
graph.addCell(r);


var c = new joint.shapes.basic.Circle({
    position: { x: 1220, y: 1020 },
    attrs: { text: { text: 'Circle' } }
});
graph.addCell(c);
