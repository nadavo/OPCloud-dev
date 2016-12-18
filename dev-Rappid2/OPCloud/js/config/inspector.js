/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var App = App || {};        //if App is not defined yet, define it as an empty object. (similar to #ifndef #define #endif in cpp)
App.config = App.config || {};

(function() {

    'use strict';       //Meaning code will run in a strict mode. not allowed parameter assignment will cause an error

    App.config.inspector = {

        //object parameters
        'opm.Object': {
            inputs: {
                attrs: {
                    rect: inspectorShapes.shapeDefinition,
                    text: inspectorShapes.textDefinition
                }
            },
            groups: inspectorShapes.groupsDefinition
        },
        //process parameters
        'opm.Process': {
            inputs: {
                attrs: {
                    'ellipse': inspectorShapes.shapeDefinition,
                    text: inspectorShapes.textDefinition
                }
            },
            groups: inspectorShapes.groupsDefinition
        },

        //link parameters
        'opm.Link': {
            inputs: {
                attrs: {
                    '.marker-source': {
                        type: 'select-box',
                        options: selectOptions.SourceLinkType,
                        defaultValue: {d:''},
                        group: 'marker-source',
                        label: 'Link Type',
                        index: 1,
                    },
                    '.marker-target': {
                        type: 'select-box',
                        options: selectOptions.DestLinkType,
                        group: 'marker-target',
                        label: 'Link Type',
                        index: 1,
                    }
                },
                labels: {
                    type: 'list',
                    group: 'labels',
                    label: 'Labels',
                    attrs: {
                        label: {
                            'data-tooltip': 'Set (possibly multiple) labels for the link',
                            'data-tooltip-position': 'right',
                            'data-tooltip-position-selector': '.joint-inspector'
                        }
                    },
                    item: {
                        type: 'object',
                        properties: {
                            attrs: {
                                text: {
                                    text: {
                                        type: 'text',
                                        label: 'text',
                                        defaultValue: 'label',
                                        index: 1,
                                        attrs: {
                                            label: {
                                                'data-tooltip': 'Set text of the label',
                                                'data-tooltip-position': 'right',
                                                'data-tooltip-position-selector': '.joint-inspector'
                                            }
                                        }
                                    }
                                }
                            },
                            position: {
                                type: 'select-box',
                                options: selectOptions.labelPosition,
                                defaultValue: 0.5,
                                label: 'Position',
                                index: 2,
                                attrs: {
                                    label: {
                                        'data-tooltip': 'Position the label relative to the source of the link',
                                        'data-tooltip-position': 'right',
                                        'data-tooltip-position-selector': '.joint-inspector'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            groups: {
                connection: {
                    label: 'Connection',
                    index: 1
                },
                'marker-source': {
                    label: 'Source marker',
                    index: 1
                },
                'marker-target': {
                    label: 'Target marker',
                    index: 2
                },
                labels: {
                    label: 'Labels',
                    index: 3
                }
            }
        }

    };
})();



/*
 'basic.Image': {
 inputs: {
 attrs: {
 text: {
 text: {
 type: 'content-editable',
 label: 'Text',
 group: 'text',
 index: 1
 },
 'font-size': {
 type: 'range',
 min: 5,
 max: 80,
 unit: 'px',
 label: 'Font size',
 group: 'text',
 when: { ne: { 'attrs/text/text': '' }},
 index: 2
 },
 'font-family': {
 type: 'select-box',
 options: opmStyle.inspectorFont.fontFamily,
 label: 'Font family',
 group: 'text',
 when: { ne: { 'attrs/text/text': '' }},
 index: 3
 },
 'font-weight': {
 type: 'select-box',
 options: opmStyle.inspectorFont.fontWeight,
 label: 'Font thickness',
 group: 'text',
 when: { ne: { 'attrs/text/text': '' }},
 index: 4
 },
 fill: {
 type: 'color-palette',
 options: opmStyle.inspectorFont.colorPalette,
 label: 'Fill',
 group: 'text',
 when: { ne: { 'attrs/text/text': '' }},
 index: 5
 }
 },
 image: {
 'xlink:href': {
 type: 'select-box',
 options: options.imageIcons,
 label: 'Image',
 group: 'presentation',
 index: 1
 }
 }
 }
 },
 groups: {
 presentation: {
 label: 'Presentation',
 index: 1
 },
 text: {
 label: 'Text',
 index: 2
 }
 }
 }
'.connection': {
 'stroke-width': {
 type: 'range',
 min: 0,
 max: 50,
 defaultValue: 1,
 unit: 'px',
 group: 'connection',
 label: 'stroke width',
 index: 1
 },
 'stroke': {type: 'color', group: 'connection', label: 'stroke color', index: 2},
 'stroke-dasharray': {
 type: 'select',
 options: ['0', '1', '5,5', '5,10', '10,5', '5,1', '15,10,5,10,15'],
 group: 'connection',
 label: 'stroke dasharray',
 index: 3
 }
 },*/
/*'.marker-source': {
 transform: {
 type: 'range',
 min: 1,
 max: 15,
 unit: 'x scale',
 defaultValue: 'scale(1)',
 valueRegExp: '(scale\\()(.*)(\\))',
 group: 'marker-source',
 label: 'source arrowhead size',
 index: 1
 },
 fill: {type: 'color', group: 'marker-source', label: 'source arrowhead color', index: 2}
 },*/
/*'marker-source': {
 type: 'select-box',
 options: options.linkType,
 group: 'marker-source',
 label: 'Source Link Type',
 index: 1
 },*/
/*'.marker-source': {
 d: {
 type: 'select-box',
 options: options.arrowheadType,
 group: 'marker-source',
 label: 'Source Link Type',
 index: 1
 },
 fill: {
 type: 'color-palette',
 options: options.colorPalette,
 group: 'marker-source',
 label: 'Color',
 when: { ne: { 'attrs/.marker-source/transform': 'scale(0.001)'}},
 index: 2
 }
 },*/
/*fill: {
 type: 'color-palette',
 options: options.colorPalette,
 group: 'marker-target',
 label: 'Color',
 when: { ne: { 'attrs/.marker-target/transform': 'scale(0.001)'}},
 index: 2
 },*/
/*transform: {
 type: 'range',
 min: 1,
 max: 15,
 unit: 'x scale',
 defaultValue: 'scale(1)',
 valueRegExp: '(scale\\()(.*)(\\))',
 group: 'marker-target',
 label: 'target arrowhead size',
 index: 3
 }*/
/*d: {
 type: 'select-box',
 options: options.arrowheadType,
 group: 'marker-target',
 label: 'Target Link Type',
 index: 1
 },
 fill: {
 type: 'color-palette',
 options: options.colorPalette,
 group: 'marker-target',
 label: 'Color',
 when: { ne: { 'attrs/.marker-target/transform': 'scale(0.001)'}},
 index: 2
 }
 }*/
/*},*/
/*smooth: {type: 'toggle', group: 'connection', index: 4},
 manhattan: {type: 'toggle', group: 'connection', index: 5},
 labels: {
 type: 'list',
 group: 'labels',
 attrs: {
 label: {'data-tooltip': 'Set (possibly multiple) labels for the link'},
 item: {
 type: 'object',
 properties: {
 position: {
 type: 'range',
 min: 0.1,
 max: .9,
 step: .1,
 defaultValue: .5,
 label: 'position',
 index: 2,
 attrs: {label: {'data-tooltip': 'Position the label relative to the source of the link'}}
 },
 attrs: {
 text: {
 text: {
 type: 'text',
 label: 'text',
 defaultValue: 'label',
 index: 1,
 attrs: {label: {'data-tooltip': 'Set text of the label'}}
 }
 }
 }
 }
 }
 }
 },*/
/* router: {
 name: {
 type: 'select-button-group',
 options: options.router,
 group: 'connection',
 label: 'Connection type',
 index: 1
 },
 args: {
 side: {
 type: 'select-box',
 options: options.side,
 placeholder: 'Pick a side',
 group: 'connection',
 label: 'Anchors side',
 when: { eq: { 'router/name': 'oneSide' }, otherwise: { unset: true }},
 index: 2
 }
 }
 },*/
/*connector: {
 name: {
 type: 'select-button-group',
 options: options.connector,
 group: 'connection',
 label: 'Connection style',
 index: 3
 }
 },*/