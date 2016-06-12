/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


$('#btn-open').on('click', function() {
    (new joint.ui.Popup({
        content: '<b>I am a ui.Popup</b>',
        target: this
    })).render();
});

$('#btn-open-image').on('click', function() {
    (new joint.ui.Popup({
        content: '<img width="100" style="float: left" src="./images/amsterdam1.jpg" />',
        target: this
    })).render();
});

$('#btn-open-diagram').on('click', function() {
    (new joint.ui.Popup({
        content: function(el) {

            var graph = new joint.dia.Graph;
            var paper = new joint.dia.Paper({
                width: 200,
                height: 100,
                gridSize: 1,
                model: graph
            });
            $(el).append(paper.el);
            var r1 = new joint.shapes.basic.Rect({ position: { x: 10, y: 10 }, size: { width: 50, height: 30 }, attrs: { text: { text: 'r1' }, rect: { fill: '#FE854F' } } });
            var r2 = new joint.shapes.basic.Rect({ position: { x: 90, y: 40 }, size: { width: 50, height: 30 }, attrs: { text: { text: 'r2' }, rect: { fill: '#7C68FC' } } });
            var l = new joint.dia.Link({ source: { id: r1.id }, target: { id: r2.id } });
            graph.addCells([r1, r2, l]);
            return undefined;
        },
        target: this
    })).render();
});

$('circle').on('click', function() {

    var popup = new joint.ui.Popup({
        events: {
            'click .btn-cancel': 'remove',
            'click .btn-change': function() {
                var strokeWidth = parseInt(this.$('.inp-stroke-width').val(), 10);
                var fill = this.$('.inp-fill').val();
                V(this.options.target).attr({ fill: fill, 'stroke-width': strokeWidth });
            }
        },
        content: [
            '<div>',
            'Fill: <input class="inp-fill" type="color" value="#FEB663" /> <br/><br/>',
            'Stroke width: <input class="inp-stroke-width" type="number" value="5" /> <br/><br/>',
            '<button class="btn-cancel">Cancel</button>',
            '<button class="btn-change">Change</button>',
            '</div>'
        ].join(''),
        target: this
    });

    popup.render();
});
