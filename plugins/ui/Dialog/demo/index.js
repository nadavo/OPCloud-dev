/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


$('#btn-open-yes-no').on('click', function() {

    var dialog = new joint.ui.Dialog({
        width: 400,
        title: 'Save model as',
        content: '<b>Input model name</b>',
        buttons: [
            { action: 'model', content: '<input type="text" name="model"><br>' },
        ]
    });
    dialog.on('action:model', dialog.close, dialog);
    dialog.open();
});

$('#btn-open-video').on('click', function() {

    (new joint.ui.Dialog({
        width: 440,
        title: 'Visual Programming Languages (1993)',
        content: '<iframe width="420" height="315" src="http://www.youtube.com/embed/AEkweKSdnHM" frameborder="0" allowfullscreen></iframe>'
    })).open();
});

$('#btn-open-draggable').on('click', function() {

    (new joint.ui.Dialog({
        width: 580,
        draggable: true,
        title: 'I\'m draggable',
        content: 'Drag me around by the titlebar.'
    })).open();
});

$('#btn-open-paper').on('click', function() {

    var graph = new joint.dia.Graph;
    var paper = new joint.dia.Paper({ width: 400, height: 200, model: graph, gridSize: 1 });

    (new joint.ui.Dialog({
        width: 420,
        draggable: true,
        title: 'A dialog box with a diagram',
        content: paper.$el
    })).open();

    (new joint.shapes.basic.Rect({
        id: 'a',
        position: { x: 20, y: 20 },
        size: { width: 80, height: 40 },
        attrs: { text: { text: 'A' } }
    })).addTo(graph);

    (new joint.shapes.basic.Rect({
        id: 'b',
        position: { x: 200, y: 20 },
        size: { width: 80, height: 40 },
        attrs: { text: { text: 'B' } }
    })).addTo(graph);

    (new joint.shapes.basic.Rect({
        id: 'c',
        position: { x: 200, y: 150 },
        size: { width: 80, height: 40 },
        attrs: { text: { text: 'C' } }
    })).addTo(graph);

    (new joint.dia.Link({
        source: { id: 'a' },
        target: { id: 'b' },
        attrs: { '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' } }
    })).addTo(graph);

    (new joint.dia.Link({
        source: { id: 'c' },
        target: { id: 'b' },
        attrs: { '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' } }
    })).addTo(graph);
});

$('#btn-open-position').on('click', function() {

    var dialog = new joint.ui.Dialog({
        width: 580,
        title: 'Buttons left and right',
        content: 'One button on the left, another on the right.',
        buttons: [
            { action: 'leave', content: '&lt; Leave', position: 'left' },
            { action: 'continue', content: 'Continue &gt;', position: 'right' }
        ]
    }).open();

    dialog.on('action:leave action:continue', dialog.close, dialog);
});

$('#btn-open-notitle-nobuttons').on('click', function() {

    new joint.ui.Dialog({
        width: 580,
        content: 'I have no titlebar and no buttons',
        closeButton: false
    }).open();
});

$('#btn-open-alert').on('click', function() {

    new joint.ui.Dialog({
        type: 'alert',
        width: 400,
        title: 'Alert',
        content: 'Watch out!'
    }).open();
});

$('#btn-open-nomodal').on('click', function() {

    new joint.ui.Dialog({
        type: 'success',
        width: 400,
        title: 'Not a modal dialog',
        content: 'This dialog is not modal. You can still use the UI under.',
        modal: false,
        draggable: true
    }).open();
});

// Inlined dialogs.

new joint.ui.Dialog({
    type: 'info',
    width: 400,
    title: 'Info',
    content: 'I\'m inlined in a &lt;div.&gt;',
    inlined: true
}).open('#dialogs-inlined');

new joint.ui.Dialog({
    type: 'alert',
    width: 400,
    title: 'Alert',
    content: 'I\'m inlined in a &lt;div.&gt;',
    inlined: true
}).open('#dialogs-inlined');

new joint.ui.Dialog({
    type: 'warning',
    width: 400,
    title: 'Warning',
    content: 'I\'m inlined in a &lt;div.&gt;',
    inlined: true
}).open('#dialogs-inlined');

new joint.ui.Dialog({
    type: 'success',
    width: 400,
    title: 'Success',
    content: 'I\'m inlined in a &lt;div.&gt;',
    inlined: true
}).open('#dialogs-inlined');

new joint.ui.Dialog({
    type: 'neutral',
    width: 400,
    title: 'Neutral',
    content: 'I\'m inlined in a &lt;div.&gt;',
    inlined: true
}).open('#dialogs-inlined');
