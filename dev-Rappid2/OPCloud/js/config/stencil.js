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

    App.config.stencil = {};

    App.config.stencil.groups = {
        opm: { index: 1, label: 'OPM' }
    };

    App.config.stencil.shapes = {};

    App.config.stencil.shapes.opm = [
        new joint.shapes.opm.Process,
        new joint.shapes.opm.Object
    ];
})();
