/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({ el: document.getElementById('paper'), width: 500, height: 300, gridSize: 1, model: graph });

var r = new joint.shapes.basic.Rect({
    position: { x: 50, y: 50 },
    size: { width: 120, height: 80 },
    attrs: { text: { text: 'My Element' } }
});
graph.addCell(r);

var inspector;

function createInspector(cellView) {

    // No need to re-render inspector if the cellView didn't change.
    if (!inspector || inspector.options.cellView !== cellView) {

        if (inspector) {
            // Clean up the old inspector if there was one.
            inspector.updateCell();
            inspector.remove();
        }

        inspector = new joint.ui.Inspector({
            cellView: cellView,
            inputs: {
                attrs: {
                    text: {
                        style: {
                            'text-decoration': { type: 'select2', group: 'text-decoration', options: ['none', 'underline', 'overline', 'line-through'] }
                        },
                        text: { type: 'my-button-set', group: 'text' }
                    }
                }
            },
            groups: {
                'text-decoration': { label: 'Text Decoration' },
                'text': { label: 'Text' }
            },
            renderFieldContent: function(options, path, value) {

                if (path === 'attrs/text/text') {

                    // data-type and data-attribute are mandatory!
                    var $buttonSet = $('<div/>').css('margin', 20);
                    var $yes = $('<button>Say YES!</button>');
                    var $no = $('<button>Say NO!</button>');
                    $buttonSet.append([$yes, $no]);

                    // When the user clicks one of the buttons, set the result to our field attribute
                    // so that we can access it later in `getFieldValue()`.
                    $yes.on('click', function() {
                        $buttonSet.data('result', 'YES');
                        inspector.updateCell();
                    });
                    $no.on('click', function() {
                        $buttonSet.data('result', 'NO');
                        inspector.updateCell();
                    });
                    return $buttonSet;
                }

                if (path === 'attrs/text/style/text-decoration') {

                    var $select = $('<select></select>').width(170).hide();
                    // select2 requires the element to be in the live DOM.
                    // Therefore, postpone the select2 initialization for after we
                    // add the Inspector container to the live DOM (see below).
                    _.defer(function() {
                        $select.show().select2({ data: options.options }).val(value || 'none').trigger('change');
                        $select.data('select2').$container.css('margin', 20);
                    });
                    return $select;
                }
            },
            getFieldValue: function(attribute, type) {

                if (type === 'my-button-set') {
                    return { value: $(attribute).data('result') };
                }
                // Note that for our select2 select, we do not need to write
                // a special value extraction code. This is because
                // Inspector will use the .val() method on the <select/> input by default.
            }
        });
        inspector.render();
        $('.inspector-container').html(inspector.el);
    }
}

paper.on('cell:pointerup', createInspector);
createInspector(r.findView(paper));
inspector.updateCell();
