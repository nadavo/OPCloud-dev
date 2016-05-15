/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var selectBox1 = new joint.ui.SelectBox({
    width: 150,
    options: [
    { content: 'Margin 28px' },
    { content: 'Margin 20px', selected: true },
    { content: 'Margin 16px' },
    { content: 'Margin 12px<br/><small>more lines</small>' },
    { content: 'Margin 8px' },
    { content: 'Margin 4px' },
    { content: 'Margin 2px' },
    { content: 'Margin 1px' }
    ]
});
selectBox1.on('option:hover', function(option, index) {
    console.log('option', option, 'at index', index, 'hovered');
});
selectBox1.on('option:select', function(option, index) {
    console.log('option', option, 'at index', index, 'selected');
});
$('#select-boxes').append(selectBox1.render().el);

// Icons.
var selectBox2 = new joint.ui.SelectBox({
    width: 200,
    options: [
    { icon: 'images/dialog.png', content: 'ui.Dialog', selected: true },
    { icon: 'images/navigator.png', content: 'ui.Navigator' },
    { icon: 'images/halo.png', content: 'ui.Halo' },
    { icon: 'images/inspector.png', content: 'ui.Inspector' },
    { icon: 'images/gridLayout.png', content: 'layout.GridLayout' },
    { icon: 'images/forceDirected.png', content: 'layout.ForceDirected' }
    ]
});
selectBox2.on('option:hover', function(option, index) {
    console.log('option', option, 'at index', index, 'hovered');
});
selectBox2.on('option:select', function(option, index) {
    console.log('option', option, 'at index', index, 'selected');
});
$('#select-boxes').append(selectBox2.render().el);

// openPolicy = 'coverAbove'
var selectBox3 = new joint.ui.SelectBox({
    width: 150,
    openPolicy: 'coverAbove',
    options: [
    { content: 'Prague' },
    { content: 'Amsterdam', selected: true },
    { content: 'London' },
    { content: 'Berlin' },
    { content: 'Bratislava' }
    ]
});
$('#select-boxes').append('<h5>openPolicy = coverAbove</h5>', selectBox3.render().el);

// openPolicy = 'above'
var selectBox4 = new joint.ui.SelectBox({
    width: 150,
    openPolicy: 'above',
    options: [
    { content: 'Prague' },
    { content: 'Amsterdam', selected: true },
    { content: 'London' },
    { content: 'Berlin' },
    { content: 'Bratislava' }
    ]
});
$('#select-boxes').append('<h5>openPolicy = above</h5>', selectBox4.render().el);

// openPolicy = 'below'
var selectBox5 = new joint.ui.SelectBox({
    width: 150,
    openPolicy: 'below',
    options: [
    { content: 'Prague' },
    { content: 'Amsterdam', selected: true },
    { content: 'London' },
    { content: 'Berlin' },
    { content: 'Bratislava' }
    ]
});
$('#select-boxes').append('<h5>openPolicy = below</h5>', selectBox5.render().el);

// openPolicy = 'coverBelow'
var selectBox6 = new joint.ui.SelectBox({
    width: 150,
    openPolicy: 'coverBelow',
    options: [
    { content: 'Prague' },
    { content: 'Amsterdam', selected: true },
    { content: 'London' },
    { content: 'Berlin' },
    { content: 'Bratislava' }
    ]
});
$('#select-boxes').append('<h5>openPolicy = coverBelow</h5>', selectBox6.render().el);

// openPolicy = 'selected'
var selectBox7 = new joint.ui.SelectBox({
    width: 150,
    openPolicy: 'selected',
    options: [
    { content: 'Prague' },
    { content: 'Amsterdam', selected: true },
    { content: 'London' },
    { content: 'Berlin' },
    { content: 'Bratislava' }
    ]
});
$('#select-boxes').append('<h5>openPolicy = selected</h5>', selectBox7.render().el);

// openPolicy = 'auto'
var selectBox8 = new joint.ui.SelectBox({
    width: 150,
    openPolicy: 'auto',
    options: [
    { content: 'Prague' },
    { content: 'Amsterdam', selected: true },
    { content: 'London' },
    { content: 'Berlin' },
    { content: 'Bratislava' }
    ]
});
$('#select-boxes').append('<h5>openPolicy = auto</h5>', selectBox8.render().el);

// Invalid option selected.
var selectBox9 = new joint.ui.SelectBox({
    width: 150,
    openPolicy: 'auto',
    selected: -1,
    placeholder: 'My City',
    options: [
    { content: 'Prague' },
    { content: 'Amsterdam' },
    { content: 'London' },
    { content: 'Berlin' },
    { content: 'Bratislava' }
    ]
});
//selectBox9.select(-1);
$('#select-boxes').append('<h5>Invalid option selected</h5>', selectBox9.render().el);

// Render inside a target
var selectBox10 = new joint.ui.SelectBox(_.extend({}, selectBox6.options, { target: '#target' }));
$('#target').append('<h5>inside a target element with a scrollbar</h5>', selectBox10.render().el, '<div style="height: 200px"></div>');

// disabled = true
var selectBox11 = new joint.ui.SelectBox({
    width: 150,
    disabled: true,
    options: [
    { content: 'Prague' },
    { content: 'Amsterdam' },
    { content: 'London', selected: true },
    { content: 'Berlin' },
    { content: 'Bratislava' }
    ]
});
$('#select-boxes').append('<h5>disabled = true</h5>', selectBox11.render().el);

// UI
// --

$('#btn-open').on('click', function(evt) {
    selectBox2.open();
    // Stop propagation of the envet, otherwise the click outside our selection box would close it immediately.
    evt.stopPropagation();
});
$('#btn-close').on('click', function(evt) {
    selectBox2.close();
    // Stop propagation of the envet, otherwise the click outside our selection box would close it immediately.
    evt.stopPropagation();
});
