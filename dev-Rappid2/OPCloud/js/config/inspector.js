/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var App = App || {};
App.config = App.config || {};

(function() {

    'use strict';

    var options = {

        colorPalette: [
            //{ content: 'transparent', icon: 'assets/transparent-icon.png' },
            { content: '#f6f6f6' },
            { content: '#dcd7d7' },
            { content: '#8f8f8f' },
            { content: '#c6c7e2' },
            { content: '#feb663' },
            { content: '#fe854f' },
            { content: '#b75d32' },
            { content: '#31d0c6' },
            { content: '#7c68fc' },
            { content: '#61549C' },
            { content: '#6a6c8a' },
            { content: '#4b4a67' },
            { content: '#3c4260' },
            { content: '#33334e' },
            { content: '#222138' },
            { content: '#DCDCDC' },
            { content: '#006400' },
            { content: '#00008B' },
            { content: 'black' },
            { content: 'grey' },
            { content: '#f2f2f2' }
        ],

        fontWeight: [
            { value: '300', content: '<span style="font-weight: 300">Light</span>' },
            { value: 'Normal', content: '<span style="font-weight: Normal">Normal</span>' },
            { value: 'Bold', content: '<span style="font-weight: Bolder">Bold</span>' }
        ],

        fontFamily: [
            { value: 'Alegreya Sans', content: '<span style="font-family: Alegreya Sans">Alegreya Sans</span>' },
            { value: 'Averia Libre', content: '<span style="font-family: Averia Libre">Averia Libre</span>' },
            { value: 'Roboto Condensed', content: '<span style="font-family: Roboto Condensed">Roboto Condensed</span>' }
        ],

        strokeStyle: [
            { value: '0', content: 'Systemic'},
            { value: '10,5', content: 'Environmental'}
        ],

        PhysInfObj: [
            {content: 'Physical', value:'url(#dropShadowv-51979730529)'},
            {content: 'Informatical', value:'null'},
        ],

        PhysInfProc: [
            {content: 'Physical', value:'url(#dropShadowv-5-1994481503)'},
            {content: 'Informatical', value:'null'},
        ],

        side: [
            { value: 'top', content: 'Top Side' },
            { value: 'right', content: 'Right Side' },
            { value: 'bottom', content: 'Bottom Side' },
            { value: 'left', content: 'Left Side' }
        ],

        portLabelPositionRectangle: [
            { value: { name: 'top', args: { y: -12 }}, content: 'Above' },
            { value: { name: 'right', args: { y: 0 }}, content: 'On Right' },
            { value: { name: 'bottom', args: { y: 12 }}, content: 'Below' },
            { value: { name: 'left', args: { y: 0 }}, content: 'On Left' }
        ],

        portLabelPositionEllipse: [
            { value: 'radial' , content: 'Horizontal' },
            { value: 'radialOriented' , content: 'Angled' }
        ],

        imageIcons: [
            { value: 'assets/image-icon1.svg', content: '<img height="42px" src="assets/image-icon1.svg"/>' },
            { value: 'assets/image-icon2.svg', content: '<img height="80px" src="assets/image-icon2.svg"/>' },
            { value: 'assets/image-icon3.svg', content: '<img height="80px" src="assets/image-icon3.svg"/>' },
            { value: 'assets/image-icon4.svg', content: '<img height="80px" src="assets/image-icon4.svg"/>' }
        ],

        imageGender: [
            { value: 'assets/member-male.png', content: '<img height="50px" src="assets/member-male.png" style="margin: 5px 0 0 2px;"/>' },
            { value: 'assets/member-female.png', content: '<img height="50px" src="assets/member-female.png" style="margin: 5px 0 0 2px;"/>' }
        ],

        arrowheadType: [
            { value: 'M 8,33 L -12,25 L 8,17 L0,25 L 8,33 M 0,25 L 10,25', content: 'Consumption Link' },
            { value: 'M 0 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 10,0 L 25,0', content: 'Instrument Link' },
            { value: 'M 0 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 10,0 L 25,0', content: 'Agent Link' }
        ],

        SourceLinkType: [
            { value: { d:'' }, content: 'None' },
            { value: { fill: '#f2f2f2' ,d: 'M 8,33 L -12,25 L 8,17 L0,25 L 8,33 M 0,25 L 10,25','stroke-width': 2}, content: 'Consumption Link' }
        ],

        DestLinkType: [
            { value: { fill: '#f2f2f2' ,d: 'M 8,33 L -12,25 L 8,17 L0,25 L 8,33 M 0,25 L 10,25','stroke-width': 2}, content: 'Consumption Link' },
            { value: { fill: '#f2f2f2' ,d: 'M 0 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 10,0 L 25,0','stroke-width': 2}, content: 'Instrument Link' },
            { value: { fill: '#000000' ,d:'M 0 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 10,0 L 25,0','stroke-width': 2}, content: 'Agent Link' }
        ],

        strokeWidth: [
            { value: 1, content: '<div style="background:#fff;width:2px;height:30px;margin:0 14px;border-radius: 2px;"/>' },
            { value: 2, content: '<div style="background:#fff;width:4px;height:30px;margin:0 13px;border-radius: 2px;"/>' },
            { value: 4, content: '<div style="background:#fff;width:8px;height:30px;margin:0 11px;border-radius: 2px;"/>' },
            { value: 8, content: '<div style="background:#fff;width:16px;height:30px;margin:0 8px;border-radius: 2px;"/>' }
        ],

        router: [
            { value: 'normal', content: '<p style="background:#fff;width:2px;height:30px;margin:0 14px;border-radius: 2px;"/>' },
            { value: 'orthogonal', content: '<p style="width:20px;height:30px;margin:0 5px;border-bottom: 2px solid #fff;border-left: 2px solid #fff;"/>' },
            { value: 'oneSide', content: '<p style="width:20px;height:30px;margin:0 5px;border: 2px solid #fff;border-top: none;"/>' }
        ],

        connector: [
            { value: 'normal', content: '<p style="width:20px;height:20px;margin:5px;border-top:2px solid #fff;border-left:2px solid #fff;"/>' },
            { value: 'rounded', content: '<p style="width:20px;height:20px;margin:5px;border-top-left-radius:30%;border-top:2px solid #fff;border-left:2px solid #fff;"/>' },
            { value: 'smooth', content: '<p style="width:20px;height:20px;margin:5px;border-top-left-radius:100%;border-top:2px solid #fff;border-left:2px solid #fff;"/>' }
        ],

        labelPosition: [
            { value: 30, content: 'Close to source' },
            { value: 0.5, content: 'In the middle' },
            { value: -30, content: 'Close to target' },
        ]
    };

    App.config.inspector = {

        'opm.Link': {
            inputs: {
                attrs: {
                    '.marker-source': {
                            type: 'select-box',
                            options: options.SourceLinkType,
                            defaultValue: {d:''},
                            group: 'marker-source',
                            label: 'Link Type',
                            index: 1,
                    },
                    '.marker-target': {
                            type: 'select-box',
                            options: options.DestLinkType,
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
                                options: options.labelPosition,
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
                /*connection: {
                    label: 'Connection',
                    index: 1
                },*/
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
        },

        'opm.Object': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'text',
                            index: 1
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    rect: {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/rect/stroke': 'transparent' }},
                            index: 3
                        },
                        'filter': {
                            type: 'select',
                            label: 'Essence',
                            options: options.PhysInfObj,
                            group: 'presentation',
                            index: 4,
                        },
                        'stroke-dasharray': {
                            type: 'select',
                            options: options.strokeStyle,
                            label: 'Affiliation',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/rect/stroke': 'transparent' }},
                                    { ne: { 'attrs/rect/stroke-width': 0 }}
                                ]
                            },
                            index: 5
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
        },
        'opm.Process': {
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
                        /*'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },*/
                        /*'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },*/
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    'ellipse': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/circle/stroke': 'transparent' }},
                            index: 3
                        },
                        'filter': {
                            type: 'select',
                            label: 'Essence',
                            options: options.PhysInfProc,
                            group: 'presentation',
                            index: 4
                        },
                        'stroke-dasharray': {
                            type: 'select',
                            options: options.strokeStyle,
                            label: 'Affiliation',
                            group: 'presentation',
                            when: {
                                and: [
                                    {ne: {'attrs/circle/stroke': 'transparent'}},
                                    {ne: {'attrs/circle/stroke-width': 0}}
                                ]
                            },
                            index: 5
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
        },
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
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
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
        },
        'app.RectangularModel': {
            inputs: {
                attrs: {
                    '.label': {
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
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 5
                        }
                    },
                    '.body': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.body/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.body/stroke': 'transparent' }},
                                    { ne: { 'attrs/.body/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                },
                ports: {
                    groups: {
                        'in': {
                            attrs: {
                                '.port-body': {
                                    fill: {
                                        type: 'color-palette',
                                        options: options.colorPalette,
                                        label: 'Fill',
                                        when: { not: { equal: { inPorts: [] }}},
                                        group: 'inPorts',
                                        index: 1
                                    }
                                }
                            },
                            position: {
                                name: {
                                    type: 'select-box',
                                    options: options.side,
                                    label: 'Position',
                                    when: { not: { equal: { inPorts: [] }}},
                                    group: 'inPorts',
                                    index: 3
                                }
                            },
                            label: {
                                position: {
                                    type: 'select-box',
                                    options: options.portLabelPositionRectangle,
                                    label: 'Text Position',
                                    when: { not: { equal: { inPorts: [] }}},
                                    group: 'inPorts',
                                    index: 4
                                }
                            }
                        },
                        'out': {
                            attrs: {
                                '.port-body': {
                                    fill: {
                                        type: 'color-palette',
                                        options: options.colorPalette,
                                        label: 'Fill',
                                        when: { not: { equal: { outPorts: [] }}},
                                        group: 'outPorts',
                                        index: 2
                                    }
                                }
                            },
                            position: {
                                name: {
                                    type: 'select-box',
                                    options: options.side,
                                    label: 'Position',
                                    when: { not: { equal: { outPorts: [] }}},
                                    group: 'outPorts',
                                    index: 4
                                }
                            },
                            label: {
                                position: {
                                    type: 'select-box',
                                    options: options.portLabelPositionRectangle,
                                    label: 'Text Position',
                                    when: { not: { equal: { outPorts: [] }}},
                                    group: 'outPorts',
                                    index: 5
                                }
                            }
                        }
                    }
                },
                inPorts: {
                    type: 'list',
                    label: 'Ports',
                    item: {
                        type: 'text'
                    },
                    group: 'inPorts',
                    index: 0
                },
                outPorts: {
                    type: 'list',
                    label: 'Ports',
                    item: {
                        type: 'text'
                    },
                    group: 'outPorts',
                    index: 0
                }
            },
            groups: {
                inPorts: {
                    label: 'Input Ports',
                    index: 1
                },
                outPorts: {
                    label: 'Output Ports',
                    index: 2
                },
                presentation: {
                    label: 'Presentation',
                    index: 3
                },
                text: {
                    label: 'Text',
                    index: 4
                }
            }
        },
        'app.CircularModel': {
            inputs: {
                attrs: {
                    '.label': {
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
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 5
                        }
                    },
                    '.body': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.body/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.body/stroke': 'transparent' }},
                                    { ne: { 'attrs/.body/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                },
                ports: {
                    groups: {
                        'in': {
                            attrs: {
                                '.port-body': {
                                    fill: {
                                        type: 'color-palette',
                                        options: options.colorPalette,
                                        label: 'Fill',
                                        when: { not: { equal: { inPorts: [] }}},
                                        group: 'inPorts',
                                        index: 1
                                    }
                                }
                            },
                            position: {
                                args: {
                                    startAngle: {
                                        type: 'range',
                                        min: 0,
                                        max: 360,
                                        step: 1,
                                        defaultValue: 0,
                                        unit: '°',
                                        label: 'Position',
                                        when: { not: { equal: { inPorts: [] }}},
                                        group: 'inPorts',
                                        index: 3
                                    }
                                }
                            },
                            label: {
                                position: {
                                    name: {
                                        type: 'select-button-group',
                                        options: options.portLabelPositionEllipse,
                                        label: 'Text direction',
                                        when: { not: { equal: { inPorts: [] }}},
                                        group: 'inPorts',
                                        index: 4
                                    }
                                }
                            }
                        },
                        'out': {
                            attrs: {
                                '.port-body': {
                                    fill: {
                                        type: 'color-palette',
                                        options: options.colorPalette,
                                        label: 'Fill',
                                        when: { not: { equal: { outPorts: [] }}},
                                        group: 'outPorts',
                                        index: 2
                                    }
                                }
                            },
                            position: {
                                args: {
                                    startAngle: {
                                        type: 'range',
                                        min: 0,
                                        max: 360,
                                        step: 1,
                                        defaultValue: 180,
                                        unit: '°',
                                        label: 'Position',
                                        when: { not: { equal: { outPorts: [] }}},
                                        group: 'outPorts',
                                        index: 4
                                    }
                                }
                            },
                            label: {
                                position: {
                                    name: {
                                        type: 'select-button-group',
                                        options: options.portLabelPositionEllipse,
                                        label: 'Text Position',
                                        when: { not: { equal: { outPorts: [] }}},
                                        group: 'outPorts',
                                        index: 5
                                    }
                                }
                            }
                        }
                    }
                },
                inPorts: {
                    type: 'list',
                    label: 'Ports',
                    item: {
                        type: 'text'
                    },
                    group: 'inPorts',
                    index: 0
                },
                outPorts: {
                    type: 'list',
                    label: 'Ports',
                    item: {
                        type: 'text'
                    },
                    group: 'outPorts',
                    index: 0
                }
            },
            groups: {
                inPorts: {
                    label: 'Input Ports',
                    index: 1
                },
                outPorts: {
                    label: 'Output Ports',
                    index: 2
                },
                presentation: {
                    label: 'Presentation',
                    index: 3
                },
                text: {
                    label: 'Text',
                    index: 4
                }
            }
        },
        'fsa.StartState': {
            inputs: {
                attrs: {
                    circle: {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
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
                }
            }
        },
        'fsa.EndState': {
            inputs: {
                attrs: {
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    '.inner': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Inner fill',
                            group: 'presentation',
                            index: 2
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
        },
        'fsa.State': {
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
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    circle: {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/circle/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/circle/stroke': 'transparent' }},
                                    { ne: { 'attrs/circle/stroke-width': 0 }}
                                ]
                            },
                            index: 4
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
        },
        'pn.Place': {
            inputs: {
                attrs: {
                    '.label': {
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
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 5
                        }
                    },
                    '.root': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.root/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.root/stroke': 'transparent' }},
                                    { ne: { 'attrs/.root/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                },
                tokens: {
                    type: 'number',
                    min: 1,
                    max: 500,
                    group: 'data',
                    index: 1
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 2
                },
                text: {
                    label: 'Text',
                    index: 3
                },
                data: {
                    label: 'Data',
                    index: 1
                }
            }
        },
        'pn.Transition': {
            inputs: {
                attrs: {
                    '.label': {
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
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 5
                        }
                    },
                    rect: {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/rect/stroke': 'transparent' }},
                            index: 2
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/rect/stroke': 'transparent' }},
                                    { ne: { 'attrs/rect/stroke-width': 0 }}
                                ]
                            },
                            index: 3
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
        },
        'erd.Entity': {
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
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
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
        },
        'erd.WeakEntity': {
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
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'outer',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'outer',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'outer',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'outer',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    '.inner': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'inner',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'inner',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'inner',
                            when: { ne: { 'attrs/.inner/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'inner',
                            when: {
                                and: [
                                    { ne: { 'attrs/.inner/stroke': 'transparent' }},
                                    { ne: { 'attrs/.inner/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                }
            },
            groups: {
                text: {
                    label: 'Text',
                    index: 1
                },
                outer: {
                    label: 'Outer rectangle',
                    index: 2
                },
                inner: {
                    label: 'Inner rectangle',
                    index: 3
                }
            }
        },
        'erd.Relationship': {
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
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
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
        },
        'erd.IdentifyingRelationship': {
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
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'outer',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'outer',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'outer',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'outer',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    '.inner': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'inner',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'inner',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'inner',
                            when: { ne: { 'attrs/.inner/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'inner',
                            when: {
                                and: [
                                    { ne: { 'attrs/.inner/stroke': 'transparent' }},
                                    { ne: { 'attrs/.inner/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                }
            },
            groups: {
                text: {
                    label: 'Text',
                    index: 1
                },
                outer: {
                    label: 'Outer polygon',
                    index: 2
                },
                inner: {
                    label: 'Inner polygon',
                    index: 3
                }
            }
        },
        'erd.Key': {
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
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'outer',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'outer',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'outer',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'outer',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    '.inner': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'inner',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'inner',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'inner',
                            when: { ne: { 'attrs/.inner/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'inner',
                            when: {
                                and: [
                                    { ne: { 'attrs/.inner/stroke': 'transparent' }},
                                    { ne: { 'attrs/.inner/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                }
            },
            groups: {
                text: {
                    label: 'Text',
                    index: 1
                },
                outer: {
                    label: 'Outer ellipse',
                    index: 2
                },
                inner: {
                    label: 'Inner ellipse',
                    index: 3
                }
            }
        },
        'erd.Normal': {
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
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
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
        },
        'erd.Multivalued': {
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
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'outer',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'outer',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'outer',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'outer',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    '.inner': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'inner',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'inner',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'inner',
                            when: { ne: { 'attrs/.inner/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'inner',
                            when: {
                                and: [
                                    { ne: { 'attrs/.inner/stroke': 'transparent' }},
                                    { ne: { 'attrs/.inner/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                }
            },
            groups: {
                text: {
                    label: 'Text',
                    index: 1
                },
                outer: {
                    label: 'Outer ellipse',
                    index: 2
                },
                inner: {
                    label: 'Inner ellipse',
                    index: 3
                }
            }
        },
        'erd.Derived': {
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
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'outer',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'outer',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'outer',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'outer',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    '.inner': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'inner',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'inner',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'inner',
                            when: { ne: { 'attrs/.inner/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'inner',
                            when: {
                                and: [
                                    { ne: { 'attrs/.inner/stroke': 'transparent' }},
                                    { ne: { 'attrs/.inner/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                }
            },
            groups: {
                text: {
                    label: 'Text',
                    index: 1
                },
                outer: {
                    label: 'Outer ellipse',
                    index: 2
                },
                inner: {
                    label: 'Inner ellipse',
                    index: 3
                }
            }
        },
        'erd.ISA': {
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
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    polygon: {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/polygon/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/polygon/stroke': 'transparent' }},
                                    { ne: { 'attrs/polygon/stroke-width': 0 }}
                                ]
                            },
                            index: 4
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
        },
        'uml.Class': {
            inputs: {
                attrs: {
                    '.uml-class-name-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'name',
                            index: 4
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'name',
                            index: 5
                        }
                    },
                    '.uml-class-attrs-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'attributes',
                            index: 4
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'attributes',
                            index: 5
                        }
                    },
                    '.uml-class-methods-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'methods',
                            index: 4
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'methods',
                            index: 5
                        }
                    }
                },
                name: {
                    type: 'text',
                    group: 'name',
                    index: 1,
                    label: 'Class name'
                },
                attributes: {
                    type: 'list',
                    item: {
                        type: 'text'
                    },
                    group: 'attributes',
                    index: 1,
                    label: 'Attributes'
                },
                methods: {
                    type: 'list',
                    item: {
                        type: 'text'
                    },
                    group: 'methods',
                    index: 1,
                    label: 'Methods'
                }
            },
            groups: {
                name: {
                    label: 'Class name',
                    index: 1
                },
                attributes: {
                    label: 'Attributes',
                    index: 2
                },
                methods: {
                    label: 'Methods',
                    index: 3
                }
            }
        },
        'uml.Interface': {
            inputs: {
                attrs: {
                    '.uml-class-name-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'name',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'name',
                            index: 2
                        }
                    },
                    '.uml-class-attrs-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'attributes',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'attributes',
                            index: 2
                        }
                    },
                    '.uml-class-methods-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'methods',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'methods',
                            index: 2
                        }
                    }
                },
                name: {
                    type: 'text',
                    group: 'name',
                    index: 0,
                    label: 'Interface name'
                },
                attributes: {
                    type: 'list',
                    item: {
                        type: 'text'
                    },
                    group: 'attributes',
                    index: 0,
                    label: 'Attributes'
                },
                methods: {
                    type: 'list',
                    item: {
                        type: 'text'
                    },
                    group: 'methods',
                    index: 0,
                    label: 'Methods'
                }
            },
            groups: {
                name: {
                    label: 'Interface name',
                    index: 1
                },
                attributes: {
                    label: 'Attributes',
                    index: 2
                },
                methods: {
                    label: 'Methods',
                    index: 3
                }
            }
        },
        'uml.Abstract': {
            inputs: {
                attrs: {
                    '.uml-class-name-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'name',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'name',
                            index: 2
                        }
                    },
                    '.uml-class-attrs-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'attributes',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'attributes',
                            index: 2
                        }
                    },
                    '.uml-class-methods-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'methods',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'methods',
                            index: 2
                        }
                    }
                },
                name: {
                    type: 'text',
                    group: 'name',
                    index: 0,
                    label: 'Abstract class name'
                },
                attributes: {
                    type: 'list',
                    item: {
                        type: 'text'
                    },
                    group: 'attributes',
                    index: 0,
                    label: 'Attributes'
                },
                methods: {
                    type: 'list',
                    item: {
                        type: 'text'
                    },
                    group: 'methods',
                    index: 0,
                    label: 'Methods'
                }
            },
            groups: {
                name: {
                    label: 'Abstract class name',
                    index: 1
                },
                attributes: {
                    label: 'Attributes Text',
                    index: 2
                },
                methods: {
                    label: 'Methods Text',
                    index: 3
                }
            }
        },
        'uml.State': {
            inputs: {
                name: {
                    group: 'text',
                    index: 1,
                    type: 'text'
                },
                events: {
                    group: 'events',
                    index: 1,
                    type: 'list',
                    item: {
                        type: 'text'
                    }
                },
                attrs: {
                    '.uml-state-name': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'name': '' }},
                            index: 5
                        }
                    },
                    '.uml-state-body': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.uml-state-body/stroke': 'transparent' }},
                            index: 4
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.uml-state-body/stroke': 'transparent' }},
                                    { ne: { 'attrs/.uml-state-body/stroke-width': 0 }}
                                ]
                            },
                            index: 5
                        }
                    },
                    '.uml-state-separator': {
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Horizontal rule outline',
                            group: 'presentation',
                            index: 3
                        }
                    },
                    '.uml-state-events': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'events',
                            when: { ne: { 'events': 0 }},
                            index: 5
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
                    label: 'State name text',
                    index: 2
                },
                events: {
                    label: 'State events text',
                    index: 3
                }
            }
        },
        'org.Member': {
            inputs: {
                attrs: {
                    '.rank': {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'rank',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'rank',
                            when: { ne: { 'attrs/.rank/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'rank',
                            when: { ne: { 'attrs/.rank/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'rank',
                            when: { ne: { 'attrs/.rank/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'rank',
                            when: { ne: { 'attrs/.rank/text': '' }},
                            index: 5
                        }
                    },
                    '.name': {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'name',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'name',
                            when: { ne: { 'attrs/.name/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'name',
                            when: { ne: { 'attrs/.name/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'name',
                            when: { ne: { 'attrs/.name/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'name',
                            when: { ne: { 'attrs/.name/text': '' }},
                            index: 5
                        }
                    },
                    '.card': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.card/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.card/stroke': 'transparent' }},
                                    { ne: { 'attrs/.card/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    image: {
                        'xlink:href': {
                            type: 'select-button-group',
                            options: options.imageGender,
                            label: 'Gender',
                            group: 'gender',
                            index: 1
                        }
                    }
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 4
                },
                rank: {
                    label: 'Rank',
                    index: 2
                },
                name: {
                    label: 'Name',
                    index: 3
                },
                gender: {
                    label: 'Gender',
                    index: 1
                }
            }
        }
    };

})();


/*'.connection': {
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