/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


function handleFileSelect(evt) {

    var files = evt.target.files;// FileList object

    var file = files[0];
    var reader = new FileReader();

    reader.onload = (function(theFile) {

        return function(e) {

            var xmlString = e.target.result;

            var cells = joint.format.gexf.toCellsArray(
                xmlString,
                function makeElement(attrs) {

                    return new joint.shapes.basic.Rect({
                        id: attrs.id,
                        size: { width: attrs.width, height: attrs.height },
                        attrs: { text: { text: attrs.label } }
                    });
                },
                function makeLink(attrs) {

                    return new joint.dia.Link({

                        source: { id: attrs.source },
                        target: { id: attrs.target }
                    });
                }
            );

            var renderTimeStart = new Date;
            graph.resetCells(cells);
            console.log('JointJS render time:', ((new Date).getTime() - renderTimeStart) + 'ms');
            console.log('JointJS number of cells:', graph.get('cells').length, '(links:', graph.getLinks().length, 'elements:', graph.getElements().length + ')');

            joint.layout.DirectedGraph.layout(graph, { setLinkVertices: true });
        };
    })(file);

    // Read in the image file as a data URL.
    reader.readAsText(file);
}

document.getElementById('gexfFile').addEventListener('change', handleFileSelect, false);

var graph = new joint.dia.Graph;
var $paper = $('#paper');
var paper = new joint.dia.Paper({
    el: $paper,
    width: 20000,
    height: 2000,
    gridSize: 1,
    model: graph,
    elementView: joint.dia.LightElementView,
    linkView: joint.dia.LightLinkView
});

V(paper.viewport).translate(50, 50);
