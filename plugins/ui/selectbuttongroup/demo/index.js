/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var group1 = new joint.ui.SelectButtonGroup({
    multi: true,
    selected: [1, 3],
    options: [
        { value: 'line-through', content: '<span style="text-decoration: line-through">S</span>', attrs: { '.select-button-group-button': { 'data-tooltip': 'My tooltip' } } },
        { value: 'underline', content: '<span style="text-decoration: underline">U</span>' },
        { value: 'italic', content: '<span style="font-style: italic">I</span>' },
        { value: 'bold', content: '<span style="font-weight: bold">B</span>' }
    ]
});

$('#select-button-groups').append('<h5>multi: true&nbsp;&nbsp;&nbsp;<i id="group1-selection"></i></h5>', group1.render().el);
$('#group1-selection').text(JSON.stringify(_.pluck(group1.getSelection(), 'value')));

group1.on('option:select', function(selection, index) {
    console.log('option:select', selection, index);
    $('#group1-selection').text(JSON.stringify(_.pluck(selection, 'value')));
});
group1.on('option:hover', function(option, index) {
    console.log('option:hover', option, index);
});


var group2 = new joint.ui.SelectButtonGroup({
    selected: 1,
    iconWidth: '70%',
    options: [
        { value: 'left', icon: 'images/icon-align-left.png', iconSelected: 'images/icon-align-left-selected.png' },
        { value: 'center', icon: 'images/icon-align-center.png', iconSelected: 'images/icon-align-center-selected.png' },
        { value: 'right', icon: 'images/icon-align-right.png', iconSelected: 'images/icon-align-right-selected.png' }
    ]
});

$('#select-button-groups').append('<h5>iconSelected&nbsp;&nbsp;&nbsp;<i id="group2-selection"></i></h5>', group2.render().el);
$('#group2-selection').text(group2.getSelection().value);

group2.on('option:select', function(selection, index) {
    console.log('option:select', selection, index);
    $('#group2-selection').text(selection.value);
});
group2.on('option:hover', function(option, index) {
    console.log('option:hover', option, index);
});

var group3 = new joint.ui.SelectButtonGroup({
    selected: 1,
    width: 180,
    buttonWidth: 58,
    buttonHeight: 44,
    options: [
        { value: 'rounded-rectangle', icon: 'images/rounded-rectangle.png' },
        { value: 'line', icon: 'images/line.png' },
        { value: 'none', icon: 'images/none.png' },
        { value: 'ellipse', icon: 'images/ellipse.png' },
        { value: 'cloud', icon: 'images/cloud.png' },
        { value: 'oval', icon: 'images/oval.png' },
        { value: 'rectangle', icon: 'images/rectangle.png' },
        { value: 'diamond', icon: 'images/diamond.png' }
    ]
});

$('#select-button-groups').append('<h5>multiline&nbsp;&nbsp;&nbsp;<i id="group3-selection"></i></h5>', group3.render().$el.addClass('select-thick')[0]);
$('#group3-selection').text(group3.getSelection().value);

group3.on('option:select', function(selection, index) {
    console.log('option:select', selection, index);
    $('#group3-selection').text(selection.value);
});
group3.on('option:hover', function(option, index) {
    console.log('option:hover', option, index);
});

var group4 = new joint.ui.SelectButtonGroup({
    multi: true,
    selected: [1, 3],
    options: [
        { value: 'line-through', content: '<span style="text-decoration: line-through">S</span>', attrs: { '.select-button-group-button': { 'data-tooltip': 'My tooltip' } } },
        { value: 'underline', content: '<span style="text-decoration: underline">U</span>' },
        { value: 'italic', content: '<span style="font-style: italic">I</span>' },
        { value: 'bold', content: '<span style="font-weight: bold">B</span>' }
    ],
    disabled: true
});

$('#select-button-groups').append('<h5>disabled: true&nbsp;&nbsp;&nbsp;<i id="group4-selection"></i></h5>', group4.render().el);
$('#group4-selection').text(JSON.stringify(_.pluck(group4.getSelection(), 'value')));

group4.on('option:select', function(selection, index) {
    console.log('option:select', selection, index);
    $('#group4-selection').text(JSON.stringify(_.pluck(selection, 'value')));
});
group4.on('option:hover', function(option, index) {
    console.log('option:hover', option, index);
});
