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
    width: 800,
    height: 600,
    gridSize: 1,
    perpendicularLinks: true,
    model: graph,
    defaultLink: new joint.dia.Link({
        markup: [
            '<path class="connection" stroke="black" d="M 0 0 0 0"/>',
            '<path class="marker-source" fill="black" stroke="black" d="M 0 0 0 0"/>',
            '<path class="marker-target" fill="black" stroke="black" d="M 0 0 0 0"/>',
            '<path class="connection-wrap" d="M 0 0 0 0"/>',
            '<g class="marker-vertices"/>',
            '<g class="marker-arrowheads"/>'
        ].join(''),
        attrs: {
            '.marker-target': { fill: 'black', d: 'M 10 0 L 0 5 L 10 10 z' }
        }
    }),
    interactive: {
        vertexAdd: false
    }
});

/**
 * @param {joint.dia.LinkView|joint.dia.ElementView} cellView
 * @param {Object} evt
 * @param {Object=} coordinates
 */
var createHalo = function(cellView, evt, coordinates) {

    var cell = cellView.model;

    var options = {
        theme: 'modern',
        cellView: cellView,
        bbox: coordinates,
        rotateAngleGrid: 2,
        type: {
            'basic.Rect': 'pie',
            'basic.Circle': 'surrounding',
            'devs.Model': 'toolbar',
            'link': 'toolbar'
        }[cell.get('type')],
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
        if (cell.isLink()) {
            cellView.addVertex(coordinates);
        } else {
            evt.stopPropagation();
            alert('My custom action.');
        }
    });
};

paper.on('element:pointerdown', function(cellView, evt) {
    createHalo(cellView, evt);
});

paper.on('link:pointerdown', function(linkView, evt) {
    joint.ui.Halo.clear(linkView.paper);
    // display no halo if user drags either source or target.
    var vel = V(evt.target);
    var coordinates = {
        x: evt.offsetX,
        y: evt.offsetY,
        width: 20,
        height: 20
    };
    if (!vel.hasClass('marker-arrowhead') && !vel.findParentByClass('marker-vertices', linkView.el)) {
        createHalo(linkView, evt, coordinates);
    }
});

var r = new joint.shapes.basic.Rect({
    position: { x: 50, y: 50 },
    size: { width: 120, height: 80 },
    attrs: { text: { text: 'Rect' } }
});
graph.addCell(r);

var c = new joint.shapes.basic.Circle({
    position: { x: 500, y: 70 },
    size: { width: 50, height: 50 },
    attrs: { text: { text: 'Circle' } }
});
graph.addCell(c);

var m = new joint.shapes.devs.Model({
    position: { x: 500, y: 250 },
    size: { width: 70, height: 90 },
    inPorts: ['in1', 'in2'],
    outPorts: ['out']
});
graph.addCell(m);

var multiplePieToggleButtons = new joint.shapes.basic.Rect({
    position: { x: 50, y: 250 },
    size: { width: 120, height: 80 },
    attrs: { text: { text: 'Multi Toggle' } },
    multiplePieToggleButtons: true
});
graph.addCell(multiplePieToggleButtons);

paper.getDefaultLink().set({
    source: { id: r.id },
    target: { id: m.id, port: 'in1' }
}).addTo(graph);

paper.getDefaultLink().set({
    source: { id: multiplePieToggleButtons },
    target: { id: m.id, port: 'in2' }
}).addTo(graph);
