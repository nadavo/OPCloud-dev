/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var Stencil = {};

Stencil.groups = {
    opm: { index: 1, label: 'OPM' },
};

Stencil.shapes = {

    opm: [
        new joint.shapes.basic.Circle({
            type: 'OPM process',
            size: { width: 6, height: 3 },
            attrs: {
                circle: { width: 50, height: 30, stroke: '#00008B', fill: '#DCDCDC', 'stroke-width': 2 },
                text: {text: 'Process', fill: 'black', 'font-weight': 'bold'}
            }
        }),

        new joint.shapes.basic.Rect({
            type: 'OPM object',
            position: {x: 250, y: 200},
            size: { width: 100, height: 50 },
            attrs: {
                rect: {
                    fill: '#DCDCDC',
                    stroke: '#006400', 'stroke-width': 2,
                    filter: {name: 'dropShadow', args: {dx: 6, dy: 6, blur: 0, color: 'grey'}}
                },
                text: {text: 'Object', fill: 'black', 'font-weight': 'bold'}
            },

            informatical: function () {
                if (this.attrs.rect != undefined) {
                    this.attrs.rect = undefined
                }
                else {
                    this.attrs.rect = {
                        fill: '#DCDCDC',
                        stroke: '#006400', 'stroke-width': 2,
                        filter: {name: 'dropShadow', args: {dx: 6, dy: 6, blur: 0, color: 'grey'}}
                    }
                }
            }
        })
    ]
};
