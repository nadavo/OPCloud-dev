/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


joint.layout = joint.layout || {};

joint.layout.GridLayout = {

    layout: function(graphOrCells, opt) {

        var graph;

        if (graphOrCells instanceof joint.dia.Graph) {
            graph = graphOrCells;
        } else {
            graph = (new joint.dia.Graph()).resetCells(graphOrCells);
        }

        // This is not needed anymore.
        graphOrCells = null;

        opt = opt || {};

        var elements = graph.getElements();

        // number of columns
        var columns = opt.columns || 1;

        // shift the element horizontally by a given amount
        var dx = opt.dx || 0;

        // shift the element vertically by a given amount
        var dy = opt.dy || 0;

        // width of a column
        var columnWidth = opt.columnWidth || this._maxDim(elements, 'width') + dx;

        // height of a row
        var rowHeight = opt.rowHeight ||  this._maxDim(elements, 'height') + dy;

        // position the elements in the centre of a grid cell
        var centre = _.isUndefined(opt.centre) || opt.centre !== false;

        // resize the elements to fit a grid cell & preserves ratio
        var resizeToFit = !!opt.resizeToFit;

        var marginX = opt.marginX || 0;
        var marginY = opt.marginY || 0;

        // Wrap all graph changes into a batch.
        graph.startBatch('layout');

        // iterate the elements and position them accordingly
        _.each(elements, function(element, index) {

            var cx = 0;
            var cy = 0;
            var elementSize = element.get('size');

            if (resizeToFit) {

                var elementWidth = columnWidth - 2 * dx;
                var elementHeight = rowHeight - 2 * dy;

                var calcElHeight = elementSize.height * (elementSize.width ? elementWidth / elementSize.width : 1);
                var calcElWidth = elementSize.width * (elementSize.height ? elementHeight / elementSize.height : 1);

                if (calcElHeight > rowHeight) {

                    elementWidth = calcElWidth;
                } else {
                    elementHeight = calcElHeight;
                }

                elementSize = { width: elementWidth, height: elementHeight };
                element.set('size', elementSize);
            }

            if (centre) {
                cx = (columnWidth - elementSize.width) / 2;
                cy = (rowHeight - elementSize.height) / 2;
            }

            cx += marginX;
            cy += marginY;

            element.set('position', {
                x: (index % columns) * columnWidth + dx + cx,
                y: Math.floor(index / columns) * rowHeight + dy + cy
            });
        });

        graph.stopBatch('layout');
    },

    // find maximal dimension (width/height) in an array of the elements
    _maxDim: function(elements, dimension) {

        return _.reduce(elements, function(max, el) { return Math.max(el.get('size')[dimension], max); }, 0);
    }
};
