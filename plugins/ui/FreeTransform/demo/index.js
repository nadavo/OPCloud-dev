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
    gridSize: 10,
    model: graph
});

paper.on('cell:pointerup', function(cellView, evt) {

    if (cellView.model instanceof joint.dia.Link) return;

    var freetransform = new joint.ui.FreeTransform({ cellView: cellView });

    freetransform.render();
});

var r = new joint.shapes.basic.Rect({
    position: { x: 200, y: 100 },
    size: { width: 50, height: 50 },
    attrs: { text: { text: 'Rect' } }
});

graph.addCell(r);
