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
    gridSize: 20,
    model: graph
});

var selection = new joint.ui.Selection({
    paper: paper
});


// Initiate selecting when the user grabs the blank area of the paper.
paper.on('blank:pointerdown', selection.startSelecting);

paper.on('element:pointerup', function(cellView, evt) {
    // Select an element if CTRL/Meta key is pressed while the element is clicked.
    if ((evt.ctrlKey || evt.metaKey)) {
        selection.collection.add(cellView.model);
    }
});

selection.on('selection-box:pointerdown', function(cellView, evt) {
    // Unselect an element if the CTRL/Meta key is pressed while a selected element is clicked.
    if (evt.ctrlKey || evt.metaKey) {
        this.selection.collection.remove(cellView.model);
    }
});

// Show selected element types in the UI to showcase an easy access to the selected elements.
selection.on('reset add', function() {

    $('#selection').text(selection.pluck('type'));
});

// Add some elements to the graph.
var r = new joint.shapes.basic.Rect({
    position: { x: 50, y: 50 },
    size: { width: 120, height: 80 },
    attrs: { text: { text: 'Rect' } }
});
graph.addCell(r);


var c = new joint.shapes.basic.Circle({
    position: { x: 250, y: 80 },
    attrs: { text: { text: 'Circle' } }
});
graph.addCell(c);


selection.addHandle({ name: 'myaction', position: 's', icon: 'myaction.png' });

selection.on('action:myaction:pointerdown', function(evt) {
    evt.stopPropagation();
    alert('custom action: ' + selection.length + ' elements of types: ' + JSON.stringify(selection.pluck('type')) + '\nMoving handle to the north.');

    selection.changeHandle('myaction', { position: 'n' });
});
