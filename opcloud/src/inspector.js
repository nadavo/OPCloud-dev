/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var CommonInspectorInputs = {

    size: {
        width: { type: 'number', min: 1, max: 500, group: 'geometry', label: 'width', index: 1 },
        height: { type: 'number', min: 1, max: 500, group: 'geometry', label: 'height', index: 2 }
    },
    position: {
        x: { type: 'number', min: 1, max: 2000, group: 'geometry', label: 'x', index: 3 },
        y: { type: 'number', min: 1, max: 2000, group: 'geometry', label: 'y', index: 4 }
    },
    custom: { type: 'text', group: 'data', index: 1, label: 'Custom data', attrs: { 'label': { 'data-tooltip': 'An example of setting custom data via Inspector.' } } }
};

var CommonInspectorGroups = {

    text: { label: 'Text', index: 1 },
    presentation: { label: 'Presentation', index: 2 },
    geometry: { label: 'Geometry', index: 3 },
    data: { label: 'Data', index: 4 }
};

var CommonInspectorTextInputs = {
    'text': { type: 'textarea', group: 'text', index: 1 },
    'font-size': { type: 'range', min: 5, max: 80, unit: 'px', group: 'text', index: 2 },
    'font-family': { type: 'select', options: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Garamond', 'Tahoma', 'Lucida Console', 'Comic Sans MS'], group: 'text', index: 3 },
    'font-weight': { type: 'range', min: 100, max: 900, step: 100, defaultValue: 600, group: 'text', index: 4 },
    'fill': { type: 'color', group: 'text', index: 5 },
    'stroke': { type: 'color', group: 'text', index: 6, defaultValue: '#000000' },
    'stroke-width': { type: 'range', min: 0, max: 5, step: .5, defaultValue: 0, unit: 'px', group: 'text', index: 7 },
    'ref-x': { type: 'range', min: 0, max: .9, step: .1, defaultValue: .5, group: 'text', index: 8 },
    'ref-y': { type: 'range', min: 0, max: .9, step: .1, defaultValue: .5, group: 'text', index: 9 }
};

var InputDefs = {
    text: { type: 'textarea', label: 'Text' },
    'font-size': { type: 'range', min: 5, max: 80, unit: 'px', label: 'Font size' },
    'font-family': { type: 'select', options: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Garamond', 'Tahoma', 'Lucida Console', 'Comic Sans MS'], label: 'Font family' },
    'font-weight': { type: 'range', min: 100, max: 900, step: 100, defaultValue: 600, label: 'Font weight' },
    'fill': { type: 'color', label: 'Fill color' },
    'stroke': { type: 'color', defaultValue: '#000000', label: 'Stroke' },
    'stroke-width': { type: 'range', min: 0, max: 5, step: .5, defaultValue: 0, unit: 'px', label: 'Stroke width' },
    'ref-x': { type: 'range', min: 0, max: .9, step: .1, defaultValue: .5, label: 'Horizontal alignment' },
    'ref-y': { type: 'range', min: 0, max: .9, step: .1, defaultValue: .5, label: 'Vertical alignment' },
    'ref-dx': { type: 'range', min: 0, max: 50, step: 1, defaultValue: 0, label: 'Horizontal offset' },
    'ref-dy': { type: 'range', min: 0, max: 50, step: 1, defaultValue: 0, label: 'Vertical offset' },
    'dx': { type: 'range', min: 0, max: 50, step: 1, defaultValue: 0, label: 'Horizontal distance' },
    'dy': { type: 'range', min: 0, max: 50, step: 1, defaultValue: 0, label: 'Vertical distance' },
    'stroke-dasharray': { type: 'select', options:[{content: 'Systemic', value: '0'}, {content: 'Environmental', value: '10,5'}], defaultValue: '0', label: 'Systemic/Environmental' },
    rx: { type: 'range', min: 0, max: 30, defaultValue: 1, unit: 'px', label: 'X-axis radius' },
    ry: { type: 'range', min: 0, max: 30, defaultValue: 1, unit: 'px', label: 'Y-axis radius' },
    'xlink:href': { type: 'text', label: 'Image URL' }
};

function inp(defs) {
    var ret = {};
    _.each(defs, function(def, attr) {

        ret[attr] = _.extend({}, InputDefs[attr], def);
    });
    return ret;
}

var InspectorDefs = {

    'link': {

        inputs: {
            attrs: {
                '.connection': {
                    'stroke-width': { type: 'range', min: 0, max: 50, defaultValue: 1, unit: 'px', group: 'connection', label: 'stroke width', index: 1 },
                    'stroke': { type: 'color', group: 'connection', label: 'stroke color', index: 2 },
                    'stroke-dasharray': { type: 'select', options: ['0', '1', '5,5', '5,10', '10,5', '5,1', '15,10,5,10,15'], group: 'connection', label: 'stroke dasharray', index: 3 }
                },
                '.marker-source': {
                    transform: { type: 'range', min: 1, max: 15, unit: 'x scale', defaultValue: 'scale(1)', valueRegExp: '(scale\\()(.*)(\\))', group: 'marker-source', label: 'source arrowhead size', index: 1 },
                    fill: { type: 'color', group: 'marker-source', label: 'source arrowhead color', index: 2 }
                },
                '.marker-target': {
                    'd': { type: 'select', group: 'marker-target', label: 'Link Type', index: 1, options: [{content: 'Result/Consumption', value: 'M 8,33 L -12,25 L 8,17 L0,25 L 8,33 M 0,25 L 10,25'}, {content: 'Instrument', value: 'M 0 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 10,0 L 25,0'}]},
                    fill: { type: 'color', group: 'marker-target', label: 'target arrowhead color', index: 2 },
                    transform: { type: 'range', min: 1, max: 15, unit: 'x scale', defaultValue: 'scale(1)', valueRegExp: '(scale\\()(.*)(\\))', group: 'marker-target', label: 'target arrowhead size', index: 3 }
                }
            },
            smooth: { type: 'toggle', group: 'connection', index: 4 },
            manhattan: { type: 'toggle', group: 'connection', index: 5 },
            labels: {
                type: 'list',
                group: 'labels',
                attrs: {
                    label: { 'data-tooltip': 'Set (possibly multiple) labels for the link' }
                },
                item: {
                    type: 'object',
                    properties: {
                        position: { type: 'range', min: 0.1, max: .9, step: .1, defaultValue: .5, label: 'position', index: 2, attrs: { label: { 'data-tooltip': 'Position the label relative to the source of the link' } } },
                        attrs: {
                            text: {
                                text: { type: 'text', label: 'text', defaultValue: 'label', index: 1, attrs: { label: { 'data-tooltip': 'Set text of the label' } } }
                            }
                        }
                    }
                }
            }

        },
        groups: {
            labels: { label: 'Labels', index: 1 },
            'connection': { label: 'Connection', index: 2 },
            'marker-source': { label: 'Source marker', index: 3 },
            'marker-target': { label: 'Target marker', index: 4 }
        }
    },

    // OPM
    // -----

    'OPM.Object': {
    
        inputs: _.extend({
            attrs: {
                text: inp({
                    text: { group: 'text', index: 1 },
                    'font-size': { group: 'text', index: 2 },
                    'font-family': { group: 'text', index: 3 },
                    'font-weight': { group: 'text', index: 4 },
                    fill: { group: 'text', index: 5 },
                    stroke: { group: 'text', index: 6 },
                    'stroke-width': { group: 'text', index: 7 },
                    'ref-x': { group: 'text', index: 8 },
                    'ref-y': { group: 'text', index: 9 }
                }),
                rect: inp({
                    'stroke-dasharray': { group: 'presentation', index: 1 },
                    //fill: { group: 'presentation', index: 1 },
                    /*filter: {
                        color: {type: 'toggle', group: 'presentation', index: 2, label: 'Physical/Informatical', defaultValue: 'grey', valueRegExp: 'yellow'}
                    },*/
                    'dropShadow':{ 
                        group: 'presentation', index: 2, label: 'Physical/Informatical', type: 'select', options:[{content: 'Physical', value: {args: {dx: 6, dy: 6, blur: 0, color: 'grey'}}}, {content: 'Informatical', value: {args: {dx: 0, dy: 0, blur: 0, color: 'grey'}}}]
                    },
                    'stroke-width': { group: 'presentation', index: 3, min: 0, max: 30, defaultValue: 1 },
                    rx: { group: 'presentation', index: 4 },
                    ry: { group: 'presentation', index: 5 },
                })
            }
        }, CommonInspectorInputs),
        groups: CommonInspectorGroups
    },

 /*   'opm.Object': {
        inputs: {
            attrs: {
                rect: {
                    'dropShadow': {
                        color: {type: 'toggle', group: 'Type', label: 'physical', defaultValue: 'grey', valueRegExp: 'red', index: 1}
                    }
                }
            }
        },
        groups: {
            type: { label: 'Type', index: 1 }
        }
    },*/
    
    'OPM.Process': {

        inputs: _.extend({
            attrs: {
                text: inp({
                    text: { group: 'text', index: 1 },
                    'font-size': { group: 'text', index: 2 },
                    'font-family': { group: 'text', index: 3 },
                    'font-weight': { group: 'text', index: 4 },
                    fill: { group: 'text', index: 5 },
                    stroke: { group: 'text', index: 6 },
                    'stroke-width': { group: 'text', index: 7 },
                    'ref-x': { group: 'text', index: 8 },
                    'ref-y': { group: 'text', index: 9 }
                }),
                circle: inp({
                    'stroke-dasharray': { group: 'presentation', index: 1 },
                    'stroke-width': { group: 'presentation', index: 2, min: 0, max: 30, defaultValue: 1 },
                    fill: { group: 'presentation', index: 3 }
                    //'stroke-dasharray': { type: 'select', options: ['0', '1', '5,5', '5,10', '10,5', '5,1', '15,10,5,10,15'], group: 'presentation', index: 3 }
                })
            }
        }, CommonInspectorInputs),
        groups: CommonInspectorGroups
    }

   /* 'opm.Process': {
    	inputs: {},
    	groups: {}
    },
*/
   /* 'erd.ISA': {

        inputs: _.extend({
            attrs: {
                'text': inp({
                    text: { group: 'text', index: 1 },
                    'font-size': { group: 'text', index: 2 },
                    'font-family': { group: 'text', index: 3 },
                    'font-weight': { group: 'text', index: 4 },
                    fill: { group: 'text', index: 5 },
                    stroke: { group: 'text', index: 6 },
                    'stroke-width': { group: 'text', index: 7 },
                    'ref-x': { group: 'text', index: 8 },
                    'ref-y': { group: 'text', index: 9 }
                }),
                'polygon': inp({
                    fill: { group: 'presentation', index: 1 },
                    stroke: { group: 'presentation', index: 2 },
                    'stroke-width': { group: 'presentation', index: 3, min: 0, max: 30, defaultValue: 1 },
                    'stroke-dasharray': { group: 'presentation', index: 4 }
                })
            }
        }, CommonInspectorInputs),
        groups: CommonInspectorGroups
    }*/
};
