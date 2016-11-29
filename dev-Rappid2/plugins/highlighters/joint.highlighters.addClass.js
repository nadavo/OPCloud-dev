/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


joint.highlighters.addClass = {

    className: joint.util.addClassNamePrefix('highlighted'),

    /**
     * @param {joint.dia.CellView} cellView
     * @param {Element} magnetEl
     * @param {object=} opt
     */
    highlight: function(cellView, magnetEl, opt) {

        var options = opt || {};
        var className = options.className || this.className;
        V(magnetEl).addClass(className);
    },

    /**
     * @param {joint.dia.CellView} cellView
     * @param {Element} magnetEl
     * @param {object=} opt
     */
    unhighlight: function(cellView, magnetEl, opt) {

        var options = opt || {};
        var className = options.className || this.className;
        V(magnetEl).removeClass(className);
    }
};
