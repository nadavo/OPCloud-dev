/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var Stencil = {};

Stencil.groups = {
    main: { index: 1, label: 'OPM' },
};

Stencil.shapes = {

    main: [
        new joint.shapes.opm.ISProc,
        new joint.shapes.erd.ISA({ attrs: { text: { text: 'ISA' } } }),
        new joint.shapes.opm.StateFinal,
        new joint.shapes.opm.PSObj
    ]
};
