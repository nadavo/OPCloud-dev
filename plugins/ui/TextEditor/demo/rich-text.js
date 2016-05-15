/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// Create graph, paper and some elements.
// --------------------------------------

var defaultAnnotation = {
    attrs: {
        fill: '#FFFFFF',
        'font-size': 12,
        'font-weight': 'normal',
        'text-decoration': 'none',
        'font-style': 'normal',
        'font-family': 'Helvetica'
    }
};

var $paper = $('#paper');

var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({
    el: $paper,
    width: 1000,
    height: 900,
    gridSize: 1,
    model: graph,
    linkConnectionPoint: joint.util.shapePerimeterConnectionPoint,
    defaultLink: (new joint.dia.Link).attr({
        '.connection': { 'stroke-width': '2' },
        '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' }
    })
});

function createTextBox(x, y, text, annotations, boxAttrs) {

    var box = new joint.shapes.basic.Rect({
        position: { x: x, y: y },
        size: { width: 1, height: 1 },       // The box will be autosized anyway.
        attrs: {
            text: _.extend({
                text: text,
                lineHeight: 'auto',
                'text-anchor': 'start',
                'ref-x': 20, 'ref-y': 20, 'x-alignment': 0, 'y-alignment': .2,
                annotations: annotations
            }, defaultAnnotation.attrs),
            rect: boxAttrs
        }
    });
    graph.addCell(box);
    autosize(box);

    return box;
}

/*
createTextBox(
    390, 50,
    'This www.client.io is a testing text.\nIt has multiple styling options\nand spans multiple lines.',
    [
        { start: 5, end: 7, attrs: { 'font-size': 48, fill: '#31D0C6', 'font-weight': 'bold', 'text-decoration': 'underline' } },
        { start: 31, end: 39, attrs: { 'font-size': 24, fill: '#FE854F', 'font-style': 'italic' } },
        { start: 55, end: 59, attrs: { 'font-size': 16, fill: '#FEB663', 'text-decoration': 'underline' } }
    ],
    { fill: '#4B4A67', stroke: 'none', rx: 3, ry: 3 }
);
*/

createTextBox(
    50, 50,
    'A full-featured text editor\n\n  - rich-text editing\n - caret & selections\n  - caret & selection CSS styling\n - word & whole-text selection by double/triple-click\n - KB navigation native to the underlying OS\n - API for programmatic access\n - supports editing of scaled & rotated text\n\n',
    [
        { start: 0, end: 27, attrs: { 'font-size': 24, 'font-family': 'Pacifico,cursive', fill: '#31D0C6', 'font-weight': 'normal', 'text-decoration': 'underline' } },
        { start: 33, end: 52, attrs: { 'font-size': 24, fill: '#FE854F', 'font-style': 'italic' } },
        { start: 54, end: 59, attrs: { 'font-size': 16, fill: '#FEB663', 'text-decoration': 'underline' } },
        { start: 62, end: 73, attrs: { 'font-size': 16, fill: '#FEB663', 'text-decoration': 'underline' } },
        { start: 95, end: 106, attrs: { 'font-size': 18, 'font-family': 'Lobster,cursive', fill: '#FEB663', 'text-decoration': 'underline' } },
        { start: 110, end: 115, attrs: { 'font-size': 18, 'font-family': 'Helvetica', fill: '#FEB663', 'text-decoration': 'underline' } },
        { start: 128, end: 137, attrs: { 'font-size': 18, 'font-family': 'Helvetica', fill: '#FEB663', 'text-decoration': 'underline' } },
        { start: 164, end: 177, attrs: { 'font-size': 16, 'font-family': 'Josefin Sans,sans-serif', fill: '#FEB663', 'text-decoration': 'underline' } },
        { start: 209, end: 212, attrs: { 'font-size': 16, 'font-family': 'Josefin Sans,sans-serif', fill: '#FE854F', 'font-weight': 'bold' } },
        { start: 240, end: 300, attrs: { 'font-size': 16, 'font-family': 'Josefin Sans,sans-serif', fill: '#7C68FC', 'font-weight': 'bold' } }
    ],
    { fill: '#4B4A67', stroke: 'none', rx: 0, ry: 0 }
);

createTextBox(
    450, 80,
    'Rotated text\n\nEdit me...',
    [
        { start: 0, end: 27, attrs: { 'font-size': 24, 'font-family': 'Lobster,cursive', fill: '#FEB663', 'font-weight': 'normal', 'text-decoration': 'none' } }
    ],
    { fill: '#4B4A67', rx: 30, ry: 30, stroke: '#FE854F', 'stroke-width': 5 }
).rotate(-45);

// Setup automatic resizing of elements based on the text inside them.
// -------------------------------------------------------------------
graph.on('change:attrs', function(cell) {
    autosize(cell);
});

function autosize(element) {

    var view = paper.findViewByModel(element);
    var text = view.$('text')[0];
    // Use bounding box without transformations so that our autosizing works
    // even on e.g. rotated element.
    var bbox = V(text).bbox(true);
    // 16 = 2*8 which is the translation defined via ref-x ref-y for our rb element.
    element.resize(bbox.width + 40, bbox.height + 40);
}

// Setup the inline rich text editor.
// ----------------------------------

paper.on('cell:pointerdblclick', function(cellView, evt) {

    var editor = joint.ui.TextEditor.edit(evt.target, {
        annotateUrls: true,
        cellView: cellView,
        annotationsProperty: 'attrs/text/annotations',
        textProperty: 'attrs/text/text'
    });
    // `editor` can be undefined. This can happend if the target of the double-click
    // was not a text element. If you want to be fancy (and supress the error message printed to the console),
    // you can check that before creating the text editor above.
    // TIP: use `joint.ui.TextEditor.getTextElement(evt.target)`.
    if (editor) {
        editor.on('caret:change', updateToolbar);
        editor.on('select:changed', updateToolbar);
    }
});

paper.on('blank:pointerdown', function(evt) {

    joint.ui.TextEditor.close();
});

// Keep track of the currently selected cell so that we can set its attributes (not text attributes though) via toolbar.
var selectedCellView;

paper.on('blank:pointerclick', function(view) {
    selectedCellView = undefined;
});

// Setup `ui.Halo` and `ui.FreeTransform` plugins.
// -----------------------------------------------

paper.on('cell:pointerclick', function(view) {
    if (view.model.isLink()) return;
    var halo = new joint.ui.Halo({
        cellView: view,
        boxContent: function(cellView, boxElement) {

            var tmpl =  _.template('x: <%= x %>, y: <%= y %>, width: <%= width %>, height: <%= height %>, angle: <%= angle %>, chars: <%= chars %>');
            var bbox = cellView.model.getBBox();

            return tmpl({
                x: Math.floor(bbox.x),
                y: Math.floor(bbox.y),
                width: bbox.width,
                height: bbox.height,
                angle: Math.floor(cellView.model.get('angle') || 0),
                chars: cellView.model.prop('attrs/text/text').length
            });

        }
    });
    halo.removeHandle('rotate');
    halo.removeHandle('resize');
    halo.changeHandle('remove', { position: 'sw' });
    halo.render();
    var ft = new joint.ui.FreeTransform({ cellView: view });
    ft.render();

    selectedCellView = view;
    boxColor.selectByValue(view.model.attr('rect/fill'));
});

// Toolbar widgets.
// ----------------

$('.toolbar').append($('<div/>', { text: 'Text:', style: 'font-family: Arial; font-size: 12px' }));

var textColor = new joint.ui.ColorPalette({
    options: [
    { content: '#FFFFFF' },    { content: '#000000' },
    { content: 'transparent', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAABrCAYAAACffRcyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABPxJREFUeNrsnc9rU1kUx+/LS2LTBtI4VMiqjYjiQgQ3IoIUuhvGUmYzUBgV8SdWLS7sooLgxm0XgjKg0P+gMDC7ggjDzGwGOt1psS2WBptioiYVmrbxnviiSc17eaPvvdzz7vcLlyTk5vVyPtzzzv3mtDWq1arYrVwuNyAfxuUYkaNfQEFoWY4ZOaYymczS7jeNRlASUC9NlOMs4tZRTdNGkcCKX4GyID2V4yjipITm5Bisw4oAkrIiFk8tNp9AWekOkNSENVVLfaurq1Q4LCImSisbtao7R5mmWTQMYxPx8l6yRohvb2/3tpk2HrVKcFtA6XT6WSwWKyOk/qlSqfQUCoVTDsBGIk7nJEAKRhRjirXDlP6I024CpGBhUczt3rcFhXtS8HKKeQTh4aHot35Q3vyObW1tpdvNSyQSi8lk8iWu1yFQtGg59rWbJyuZNVzv+4XUx0QABVCa68+/0mJi8oj4/Y99Xlwuioj6BOn8lSHx4UOs9vr0j2vYUYrJ/G++6zOkRKIihn9aQepTzV14viB6Lo5lP0N68mhWnDxRACjFIP1w9YYwNjZMryEBlNeQSmVR7e7e9hoSib44rLasMqLRtb6+vlm7D5ZKpf3ycNfj4qCY2tnZ2dM2t5tmSY4NbtejexKlO9pJBOndbw/ym4cPtd0ArRyMfD4/ZHeo/uaqz61N4vTDGxWPx9dSqdQ8q+tRdXfhGhUOtXRnPH44u3nwwDE/HAykPi9KcB/uSQDFEBJAMYEEUEwgAdT3OA4BQgIoBRwHgGLiOAAUE8fBrXzvmaATPR0W3TgEdPhU5Xo1x+Hy9WbHQR5m5QnZk/XJOa8DAeW2h0A3x8Ht+pD6GJfgAMUcEkDZQSLdmfhbFUgAZQfp9q1/xK+jKyotUXtQTY5DHdLYlZeqrVNrUE2Og8KQtAbV5DgoDklbUI2OAwdIJO16Jhp7HOh1eXLizcbPw1tBrw89E24dB2snSUjZTqwPPRP/pwRXPN3pB4o5JD1AhQBS+EGFBFKoQXFxHLQGxclx0BYUN8dBS1CR9yWRuneflePgVqHpmTCKb83kxWvZyOJSV4PjkJUn0KwK62txgNawZyKfj4vRc0Pi1UpXpx0H9EzYRzAuRn4hSL1hS3fhAaUJJN6gNILEF5RmkFiCoupON0jsQNE5KXnmQlY3SKxAEaS9V2+K+jlJJ0hsQNUhxV4sCB0h1VK+6j0TNcdBprtdjkPgPQ7omQiZ46Bfz4SGJTg/UIDEABQgMQAFSOqD0tVxYAVKZ8eBDSjdHQcWoOA4uFfHeia49Tjo2TMRYschPD0TKMEZgAIkBqAAiQEoQFIfFBwHBqDgODAABceBASg4Dj7cQrzumQhrj0O4eibgODDomUAJzuAeBUhMQF0aOw5IHECVy3FA8lfe/HvXu5P/1h4V+husANVKAMTXmYAACqnPD9EJ3M3hzm0PgW7XCwyU29/6wPWQ+nCPghQAVa1W4whPsHKKuS0oeUPsrVQqPQhfMKJYU8ydQC3bvVkoFE4BVjCQKNYOU5ap6puR46bdrlpfXx82TbNoGMYmQupPunPaSZZm6BveAflkESFTWtlIJpNZkk+mEQtlNU2M6sXEuBxziIlymrPYfKr6JLGifBgELOUgDVpsvpTnDbCQBhVId42QSIasOr6alcvlBqwtNyJHP+IWiJatCnzKqhua1BIUpJ4+CjAAVnYzLhKE5pcAAAAASUVORK5CYII=' },
    { content: '#31D0C6' },    { content: '#7C68FC' },
    { content: '#FE854F' },    { content: '#FEB663' },
    { content: '#222138' },    { content: '#33334E' },
    { content: '#4B4A67' },    { content: '#3c4260' },
    { content: '#6A6C8A' },    { content: '#C6C7E2' },
    { content: '#f6f6f6' }
    ],
    placeholder: 'N/A'
});
$('.toolbar').append(textColor.render().el);
textColor.on('option:select', function(option, index, opt) {
    if (opt && opt.ui) {
        setCurrentAnnotation();
        // Return focus to the text editor after the user has selected a color.
        joint.ui.TextEditor.setCaret({ silent: true });
    }
});

var textStyle = new joint.ui.SelectButtonGroup({
    multi: true,
    selected: [],
    options: [
        { value: 'underline', content: '<span style="text-decoration: underline">U</span>' },
        { value: 'italic', content: '<span style="font-style: italic">I</span>' },
        { value: 'bold', content: '<span style="font-weight: bold">B</span>' }
    ]
});
$('.toolbar').append(textStyle.render().el);
textStyle.on('option:select', function(selection, index, opt) {
    if (opt && opt.ui) {
        setCurrentAnnotation();
        joint.ui.TextEditor.setCaret({ silent: true });
    }
});

var fontSize = new joint.ui.SelectBox({
    width: 150,
    options: [
    { content: '10px' }, { content: '12px', selected: true },
    { content: '14px' }, { content: '16px' },
    { content: '18px' }, { content: '24px' },
    { content: '36px' }, { content: '48px' },
    { content: '72px' }
    ],
    placeholder: 'N/A'
});
$('.toolbar').append(fontSize.render().el);
fontSize.on('option:select', function(option, index, opt) {
    if (opt && opt.ui) {
        setCurrentAnnotation();
        joint.ui.TextEditor.setCaret({ silent: true });
    }
});

var fontFamily = new joint.ui.SelectBox({
    width: 150,
    options: [
        { value: 'Helvetica', content: '<span style="font-family:Helvetica">Helvetica</span>' },
        { value: 'Lobster,cursive', content: '<span style="font-family:Lobster,cursive">Lobster</span>' },
        { value: 'Pacifico,cursive', content: '<span style="font-family:Paicifico,cursive">Pacifico</span>' },
        { value: 'Josefin Sans,sans-serif', content: '<span style="font-family: Josefin Sans,sans-serif">Josefin Sans</span>' }
    ],
    placeholder: 'N/A'
});
$('.toolbar').append(fontFamily.render().el);
fontFamily.on('option:select', function(option, index, opt) {
    if (opt && opt.ui) {
        setCurrentAnnotation();
        joint.ui.TextEditor.setCaret({ silent: true });
    }
});

var boxColor = new joint.ui.ColorPalette({
    options: [
    { content: '#FFFFFF' },    { content: '#000000' },
    { content: 'transparent', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAABrCAYAAACffRcyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABPxJREFUeNrsnc9rU1kUx+/LS2LTBtI4VMiqjYjiQgQ3IoIUuhvGUmYzUBgV8SdWLS7sooLgxm0XgjKg0P+gMDC7ggjDzGwGOt1psS2WBptioiYVmrbxnviiSc17eaPvvdzz7vcLlyTk5vVyPtzzzv3mtDWq1arYrVwuNyAfxuUYkaNfQEFoWY4ZOaYymczS7jeNRlASUC9NlOMs4tZRTdNGkcCKX4GyID2V4yjipITm5Bisw4oAkrIiFk8tNp9AWekOkNSENVVLfaurq1Q4LCImSisbtao7R5mmWTQMYxPx8l6yRohvb2/3tpk2HrVKcFtA6XT6WSwWKyOk/qlSqfQUCoVTDsBGIk7nJEAKRhRjirXDlP6I024CpGBhUczt3rcFhXtS8HKKeQTh4aHot35Q3vyObW1tpdvNSyQSi8lk8iWu1yFQtGg59rWbJyuZNVzv+4XUx0QABVCa68+/0mJi8oj4/Y99Xlwuioj6BOn8lSHx4UOs9vr0j2vYUYrJ/G++6zOkRKIihn9aQepTzV14viB6Lo5lP0N68mhWnDxRACjFIP1w9YYwNjZMryEBlNeQSmVR7e7e9hoSib44rLasMqLRtb6+vlm7D5ZKpf3ycNfj4qCY2tnZ2dM2t5tmSY4NbtejexKlO9pJBOndbw/ym4cPtd0ArRyMfD4/ZHeo/uaqz61N4vTDGxWPx9dSqdQ8q+tRdXfhGhUOtXRnPH44u3nwwDE/HAykPi9KcB/uSQDFEBJAMYEEUEwgAdT3OA4BQgIoBRwHgGLiOAAUE8fBrXzvmaATPR0W3TgEdPhU5Xo1x+Hy9WbHQR5m5QnZk/XJOa8DAeW2h0A3x8Ht+pD6GJfgAMUcEkDZQSLdmfhbFUgAZQfp9q1/xK+jKyotUXtQTY5DHdLYlZeqrVNrUE2Og8KQtAbV5DgoDklbUI2OAwdIJO16Jhp7HOh1eXLizcbPw1tBrw89E24dB2snSUjZTqwPPRP/pwRXPN3pB4o5JD1AhQBS+EGFBFKoQXFxHLQGxclx0BYUN8dBS1CR9yWRuneflePgVqHpmTCKb83kxWvZyOJSV4PjkJUn0KwK62txgNawZyKfj4vRc0Pi1UpXpx0H9EzYRzAuRn4hSL1hS3fhAaUJJN6gNILEF5RmkFiCoupON0jsQNE5KXnmQlY3SKxAEaS9V2+K+jlJJ0hsQNUhxV4sCB0h1VK+6j0TNcdBprtdjkPgPQ7omQiZ46Bfz4SGJTg/UIDEABQgMQAFSOqD0tVxYAVKZ8eBDSjdHQcWoOA4uFfHeia49Tjo2TMRYschPD0TKMEZgAIkBqAAiQEoQFIfFBwHBqDgODAABceBASg4Dj7cQrzumQhrj0O4eibgODDomUAJzuAeBUhMQF0aOw5IHECVy3FA8lfe/HvXu5P/1h4V+husANVKAMTXmYAACqnPD9EJ3M3hzm0PgW7XCwyU29/6wPWQ+nCPghQAVa1W4whPsHKKuS0oeUPsrVQqPQhfMKJYU8ydQC3bvVkoFE4BVjCQKNYOU5ap6puR46bdrlpfXx82TbNoGMYmQupPunPaSZZm6BveAflkESFTWtlIJpNZkk+mEQtlNU2M6sXEuBxziIlymrPYfKr6JLGifBgELOUgDVpsvpTnDbCQBhVId42QSIasOr6alcvlBqwtNyJHP+IWiJatCnzKqhua1BIUpJ4+CjAAVnYzLhKE5pcAAAAASUVORK5CYII=' },
    { content: '#31D0C6' },    { content: '#7C68FC' },
    { content: '#FE854F' },    { content: '#FEB663' },
    { content: '#222138' },    { content: '#33334E' },
    { content: '#4B4A67' },    { content: '#3c4260' },
    { content: '#6A6C8A' },    { content: '#C6C7E2' },
    { content: '#f6f6f6' }
    ]
});
$('.toolbar').append($('<div/>', { text: 'Box:', style: 'font-family: Arial; font-size: 12px' }));
$('.toolbar').append(boxColor.render().el);
boxColor.on('option:select', function(option, index, opt) {
    if (opt && opt.ui) {
        if (selectedCellView) {
            selectedCellView.model.attr('rect/fill', option.content);
        }
    }
});


// Gather attributes from the toolbar and instruct the text editor to use
// the current toolbar text settings for the very next insert operation.
function setCurrentAnnotation() {

    var _textStyle = textStyle.getSelectionValue();
    var _textColor = textColor.getSelectionValue();
    var _fontSize = fontSize.getSelectionValue();
    var _fontFamily = fontFamily.getSelectionValue();

    var attrs = _.clone(defaultAnnotation.attrs);

    if (_.isUndefined(_fontSize)) {
        delete attrs['font-size'];
    } else {
        attrs['font-size'] = parseInt(_fontSize, 10);
    }
    if (_.isUndefined(_fontFamily)) {
        delete attrs['font-family'];
    } else {
        attrs['font-family'] = _fontFamily;
    }
    if (_.isUndefined(_textColor)) {
        delete attrs['fill'];
    } else {
        attrs['fill'] = _textColor;
    }

    if (_.contains(_textStyle, 'bold')) {
        attrs['font-weight'] = 'bold';
    } else if (textStyle.fontWeightUndefined) {
        delete attrs['font-weight'];
    }
    if (_.contains(_textStyle, 'italic')) {
        attrs['font-style'] = 'italic';
    } else if (textStyle.fontStyleUndefined) {
        delete attrs['font-style'];
    }
    if (_.contains(_textStyle, 'underline')) {
        attrs['text-decoration'] = 'underline';
    } else if (textStyle.textDecorationUndefined) {
        delete attrs['text-decoration'];
    }

    //textStyle.fontWeightUndefined = false;
    //textStyle.fontStyleUndefined = false;
    //textStyle.textDecorationUndefined = false;

    // If some text is selected and the user changes an attribute via the toolbar,
    // apply this change on the selected text.
    // Otherwise, set the current annotation so that the very next insert
    // will use it for the inserted text.
    var selectionLength = joint.ui.TextEditor.getSelectionLength();
    var range = joint.ui.TextEditor.getSelectionRange();

    if (selectionLength > 0) {
        var newAnnotation = {
            start: range.start,
            end: range.end,
            attrs: attrs
        };
        var annotations = joint.ui.TextEditor.getAnnotations() || [];
        joint.ui.TextEditor.applyAnnotations(annotations.concat(newAnnotation));
    } else {
        joint.ui.TextEditor.setCurrentAnnotation(attrs);
    }
}

// Update the widgets in the toolbar based on the text annotation under the cursor
// or in the current selection if there is one.
function updateToolbar() {

    var attrs = joint.ui.TextEditor.getSelectionAttrs([defaultAnnotation].concat(joint.ui.TextEditor.findAnnotationsInSelection()));

    if (attrs.fill) {
        textColor.selectByValue(attrs.fill);
    } else {
        textColor.select(-1);
    }
    if (attrs['font-size']) {
        fontSize.selectByValue(attrs['font-size'] + 'px');
    } else {
        fontSize.select(-1);
    }
    if (attrs['font-family']) {
        fontFamily.selectByValue(attrs['font-family']);
    } else {
        fontFamily.select(-1);
    }
    textStyle.deselect();
    if (_.isUndefined(attrs['font-weight'])) {
        textStyle.fontWeightUndefined = true;
    }
    if (_.isUndefined(attrs['text-decoration'])) {
        textStyle.textDecorationUndefined = true;
    }
    if (_.isUndefined(attrs['font-style'])) {
        textStyle.fontStyleUndefined = true;

    } else {
        if (attrs['font-weight'] === 'bold') textStyle.selectByValue('bold');
        if (attrs['text-decoration'] === 'underline') textStyle.selectByValue('underline');
        if (attrs['font-style'] === 'italic') textStyle.selectByValue('italic');
    }
}
