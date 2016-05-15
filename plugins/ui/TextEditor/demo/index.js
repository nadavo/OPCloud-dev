/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var $paper = $('#paper');

var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({
    el: $paper,
    width: 1000,
    height: 900,
    model: graph
});

var rb = new joint.shapes.basic.Rect({
    position: { x: 50, y: 50 },
    size: { width: 100, height: 40 },
    attrs: {
        text: { text: 'ab cd\nefgh\nijkl', fill: 'white', lineHeight: '1.5em', 'ref-x': 8, 'ref-y': 8, 'x-alignment': 0, 'y-alignment': 0, 'text-anchor': 'left', annotations: [
                { start: 3, end: 6, attrs: { 'font-size': '30', fill: 'red' } }
            ] },
        rect: { fill: '#0f87d2', stroke: 'none' }
    }
});
graph.addCell(rb);

var tb = new joint.shapes.basic.Text({
    position: { x: 300, y: 100 },
    size: { width: 180, height: 50 },
    attrs: { text: { text: 'Edit me!', 'font-family': 'Comic Sans MS', fill: '#e86350', stroke: 'black', 'font-size': 30 } }
});
graph.addCell(tb);

tb.resize(250, 280);

var tb2 = new joint.shapes.basic.Text({
    position: { x: 650, y: 100 },
    size: { width: 80, height: 120 },
    attrs: { text: { text: '012\n\n345', 'font-family': 'Comic Sans MS', fill: '#e86350', stroke: 'black', 'font-size': 30 } }
});
graph.addCell(tb2);

var tr = tb2.clone();
tr.translate(0, 150).rotate(45);
graph.addCell(tr);

var tcode = new joint.shapes.basic.Text({
    position: { x: 150, y: 280 },
    size: { width: 92, height: 30 },
    attrs: { text: { text: 'function add(a, b) {\n\treturn a + b;\n}', 'font-family': 'monospace', fill: '#000000', 'font-size': 10 } }
});
graph.addCell(tcode);
tcode.resize(92 * 1.5, 30 * 1.5);

var ib = new joint.shapes.basic.Image({
    position: { x: 120, y: 170 },
    size: { width: 40, height: 40 },
    attrs: {
        text: { text: 'Editable Image Label' },
        image: { 'xlink:href': 'http://jointjs.com/images/logo.png', width: 48, height: 48 }
    }
});
graph.addCell(ib);

var rh = new joint.shapes.basic.Rhombus({
    position: { x: 350, y: 250 },
    size: { width: 100, height: 100 },
    attrs: {
        path: { stroke: '#857099', 'stroke-width': 2, 'stroke-dasharray': '3,1' },
        text: { text: 'Rhombus', 'font-size': 15 }
    }
});
graph.addCell(rh);


// Enable auto-sizing of the rectangle element.
// --------------------------------------------

function autosize(element) {

    var view = paper.findViewByModel(element);
    var text = view.$('text')[0];
    // Use bounding box without transformations so that our autosizing works
    // even on e.g. rotated element.
    var bbox = V(text).bbox(true);
    // 16 = 2*8 which is the translation defined via ref-x ref-y for our rb element.
    element.resize(bbox.width + 16, bbox.height + 16);
}

autosize(rb);
rb.on('change:attrs', function() {
    autosize(this);
});

// Enable text editing.
// --------------------

// Replace `editMultiline` with `editSingleline` to disable multi-line text editing.
paper.on('cell:pointerdblclick', editMultiline);
paper.on('blank:pointerdown', joint.ui.TextEditor.close, joint.ui.TextEditor);

function editMultiline(cellView, evt) {
    joint.ui.TextEditor.edit(evt.target, {
        cellView: cellView,
        textProperty: cellView.model.isLink() ? 'labels/0/attrs/text/text' : 'attrs/text/text'
    });
}

function editSingleline(cellView, evt) {
    joint.ui.TextEditor.edit(evt.target, {
        cellView: cellView,
        update: false   // Disable automatic update of the cellView. Instead, do it manually by reacting on text:change event.
    }).on('text:change', function(newText, oldText, annotations) {
        var textProperty = cellView.model.isLink() ? 'labels/0/attrs/text/text' : 'attrs/text/text';
        var isNewline = newText.indexOf('\n') !== -1;
        if (isNewline) {
            // Remove the newline character.
            newText = newText.replace(/\n/, '');
            // Remember the caret position so that we can set it back after we reset the textarea.value.
            var selectionStart = this.ed.getSelectionStart();
            // Remove the newline character also from the textarea.
            this.ed.textarea.value = this.ed.textarea.value.replace(/\n/, '');
            // Manually set the new text on the cell text property.
            cellView.model.prop(textProperty, newText);
            // Set the caret one position to the left to compensate for the removed newline character.
            this.ed.setCaret(selectionStart - 1);
        } else {
            // No newline character added, simply update the cell text property to reflect the new text from the UI.
            cellView.model.prop(textProperty, newText);
        }
    });
}

// An example on using ui.TextEditor on normal SVG text elements (outside JointJS views).
// Also, the following example shows ui.TextEditor used on a text along a path!

var along = 'M 100 200 C 200 100 300 0 400 100 C 500 200 600 300 700 200 C 800 100 900 100 900 100';
//var along = 'M 0 100 Q 30 10 100 0';

var text = V('text', { 'font-size': 40 });
text.translate(100, 450);
V(paper.viewport).append(text);
//text.text('This is a text along a path.', { textPath: along });
text.text('This is a text along a path.', { textPath: { d: along, startOffset: 80 }, span: { start: 10, end: 20, attrs: { fill: 'orange' } } });

text.node.addEventListener('dblclick', function(evt) {
    joint.ui.TextEditor.edit(text.node);
    joint.ui.TextEditor.ed.on('text:change', function(newText, prevText, annotations, selectionBeforeInput, selectionAfterInput) {
        text.text(newText, { textPath: along });
    });
}, false);

var regularText = V('text', { 'font-size': 12 });
regularText.translate(300, 400);
V(paper.viewport).append(regularText);
regularText.text('This is a regular text\nnot along a path.');

regularText.node.addEventListener('dblclick', function(evt) {
    joint.ui.TextEditor.edit(regularText.node);
    joint.ui.TextEditor.ed.on('text:change', function(newText, prevText, annotations, selectionBeforeInput, selectionAfterInput) {
        regularText.text(newText);
    });
}, false);
