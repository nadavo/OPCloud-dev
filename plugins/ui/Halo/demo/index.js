/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


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
    perpendicularLinks: true,
    model: graph
});

paper.on('cell:pointerup', function(cellView, evt) {

    var cell = cellView.model;
    if (cell.isLink()) return;

    var options = {
        graph: graph,
        paper: paper,
        cellView: cellView,
        rotateAngleGrid: 2,
        type: { 'basic.Rect': 'pie', 'basic.Circle': 'surrounding', 'devs.Model': 'toolbar' }[cell.get('type')],
        clone: function(cell, opt) {
            var clone = cell.clone().unset('z');
            if (opt.fork) clone.translate(cell.get('size').width + 20, 0);
            if (opt.clone) clone.translate(20, 20);
            return clone;
        }
    };

    if (cell.get('multiplePieToggleButtons')) {
        options.pieToggles = [
            { name: 'left', position: 'w' },
            { name: 'right', position: 'e' },
            { name: 'top', position: 'n' },
            { name: 'bottom', position: 's' }
        ];
    }

    var halo = window.halo = new joint.ui.Halo(options);
    halo.render();

    // Adding a custom action.
    halo.addHandle({ name: 'myaction', position: 's', icon: 'myaction.png' });
    halo.on('action:myaction:pointerdown', function(evt) {

        evt.stopPropagation();
        alert('My custom action.');
    });

    //halo.toggleState('left');

    // Example on preventing creating loose links via Halo:
    /*
    halo.on('action:link:add', function(link) {
        if (!link.get('source').id || !link.get('target').id) {
            link.remove();
        }
    });
    */
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

var multiplePieToggleButtons = new joint.shapes.basic.Rect({
    position: { x: 50, y: 180 },
    size: { width: 120, height: 80 },
    attrs: { text: { text: 'Multi Toggle' } },
    multiplePieToggleButtons: true
});
graph.addCell(multiplePieToggleButtons);
