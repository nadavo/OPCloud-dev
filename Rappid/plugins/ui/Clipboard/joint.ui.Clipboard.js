/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// Implements Clipboard for copy-pasting elements.
// Note that the clipboard is also able to copy elements and their assocaited links from one graph
// and paste them to another.

// Usage:

//       var selection = new Backbone.Collection;
//       var graph = new joint.dia.Graph;
//       // ... now something that adds elements to the selection ...
//       var clipboard = new joint.ui.Clipboard;
//       KeyboardJS.on('ctrl + c', function() { clipboard.copyElements(selection, graph); });
//       KeyboardJS.on('ctrl + v', function() { clipboard.pasteCells(graph); });


joint.ui.Clipboard = Backbone.Collection.extend({

    // `selection` is a Backbone collection containing elements that should be copied to the clipboard.
    // Note that with these elements, also all the associated links are copied. That's why we
    // also need the `graph` parameter, to find these links.
    // This function returns the elements and links from the original graph that were copied. This is useful
    // for implements the Cut operation where the original cells should be removed from the graph.
    // if `opt.translate` object with `dx` and `dy` properties is passed, the copied elements will
    // be translated by the specified amount. This is useful for e.g. the 'cut' operation where
    // we'd like to have the pasted elements moved by an offset to see they were pasted to the paper.
    // if `opt.useLocalStorage` is `true`, the copied elements will be saved to the localStorage
    // (if present) making it possible to copy-paste elements between browser tabs or sessions.
    copyElements: function(selection, graph, opt) {

        opt = opt || {};

        var clones = graph.cloneSubgraph(selection.models, opt);

        var originals = [];
        var elements = [];
        var links = [];

        _.each(clones, function(clone, originalCellId) {
            if (clone.isLink()) {
                if (opt.translate) {
                    _.each(clone.get('vertices'), function(vertex) {
                        vertex.x += opt.translate.dx || 20;
                        vertex.y += opt.translate.dy || 20;
                    });
                }
                links.push(clone);
            } else {
                if (opt.translate) {
                    clone.translate(opt.translate.dx || 20, opt.translate.dy || 20);
                }
                elements.push(clone);
            }
            originals.push(graph.getCell(originalCellId));
        });

        this.reset(elements.concat(links));

        if (opt.useLocalStorage && window.localStorage) {

            localStorage.setItem('joint.ui.Clipboard.cells', JSON.stringify(this.toJSON()));
        }

        return originals;
    },

    // `opt.link` is attributes that will be set all links before they are added to the `graph`.
    // This is useful for e.g. setting `z: -1` for links in order to always put them to the bottom of the paper.
    pasteCells: function(graph, opt) {

        opt = opt || {};

        if (opt.useLocalStorage && this.isEmpty() && window.localStorage) {
            var tmpGraph = new joint.dia.Graph().fromJSON({
                cells: JSON.parse(localStorage.getItem('joint.ui.Clipboard.cells'))
            });
            this.reset(tmpGraph.getCells());
        }

        graph.trigger('batch:start');

        this.each(function(cell) {

            cell.unset('z');
            if ((cell instanceof joint.dia.Link) && opt.link) {

                cell.set(opt.link);
            }

            graph.addCell(cell.toJSON());
        });

        graph.trigger('batch:stop');
    },

    clear: function() {

        this.reset([]);

        if (window.localStorage) {

            localStorage.removeItem('joint.ui.Clipboard.cells');
        }
    }
});
