/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


new joint.ui.Tooltip({
    rootTarget: '.tooltip-group',
    target: '[data-tooltip]',
    direction: 'auto',
    padding: function(el) {
        var elData = el.dataset || $(el).data();

        if (elData['tooltipPadding']) {
            return parseInt(elData['tooltipPadding'], 10);
        }
        return 10;
    }
});

new joint.ui.Tooltip({
    rootTarget: '.tooltip-group-prefix',
    dataAttributePrefix: 'custom',
    target: '[data-custom]',
    padding: 10,

    /**
     * This can override html definition of tooltip text. 'null' or 'undefined' as callback's results are ignored,
     * joint.ui.Tooltip tries to get particular option from data attributes of html element, if this fails, it uses default.
     * @param {HTMLElement} el
     * @returns {*}
     */
    content: function(el) {

        var elData = el.dataset || $(el).data();
        var extraText = elData['other'];

        return extraText ? elData['custom'] + ' ' + extraText : null;
    }
});

new joint.ui.Tooltip({
    rootTarget: '.viewport-tooltips',
    target: '[data-tooltip]',
    viewport: { selector: '.viewport' },
    content: '<h4>HTML Tooltip</h4> <img src="http://jointjs.client.io/images/logos/jointjs_1.png" width="80" style="position: absolute; top: 10px; right: 10px;"/><hr/><b>JointJS</b> tooltips can contain arbitrary HTML.'
});

new joint.ui.Tooltip({
    padding: 10,
    minResizedWidth: 150,
    rootTarget: '.boundaries',
    target: '[data-tooltip-position]',
    viewport: { selector: 'table', padding: 4 },
    content: '<h4>HTML Tooltip</h4> <img src="http://jointjs.client.io/images/logos/jointjs_1.png" width="80" style="position: absolute; top: 10px; right: 10px;"/><hr/><b>JointJS</b> tooltips can contain arbitrary HTML.'
});

new joint.ui.Tooltip({
    rootTarget: '.focus-tooltip',
    target: '[data-tooltip]',
    trigger: 'focus'
});

new joint.ui.Tooltip({
    rootTarget: '.click-tooltip',
    target: '[data-tooltip]',
    trigger: 'click'
});
