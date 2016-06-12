/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/



new joint.ui.Tooltip({
    target: '.top-tooltip',
    content: 'Top directed tooltip.',
    top: '.top-tooltip',
    direction: 'top'
});

new joint.ui.Tooltip({
    target: '.left-tooltip',
    content: 'Left directed tooltip.',
    left: '.left-tooltip',
    direction: 'left'
});

new joint.ui.Tooltip({
    target: '.right-tooltip',
    content: 'Right directed tooltip.',
    right: '.right-tooltip',
    direction: 'right'
});

new joint.ui.Tooltip({
    target: '.bottom-tooltip',
    content: 'Bottom directed tooltip.',
    bottom: '.bottom-tooltip',
    direction: 'bottom'
});


new joint.ui.Tooltip({
    target: '.click-tooltip',
    content: 'Bottom directed tooltip. Long text to see viewport (selector: null) constraint at works.',
    bottom: '.click-tooltip',
    direction: 'bottom',
    trigger: 'click'
});

new joint.ui.Tooltip({
    target: '.focus-tooltip',
    content: 'Focus bottom directed tooltip.',
    bottom: '.focus-tooltip',
    direction: 'bottom',
    trigger: 'focus'
});

var tooltip = new joint.ui.Tooltip({
    target: '.manual-tooltip',
    content: 'Manual top directed tooltip.',
    top: '.manual-tooltip',
    direction: 'top',
    trigger: 'manual'
});

tooltip.show();

new joint.ui.Tooltip({
    target: '.viewport-tooltip',
    content: 'Click tooltip in a viewport<br/>Multiline<br/><br/>For enable vertical viewport<br/>constraint',
    left: '.viewport-tooltip',
    direction: 'left',
    trigger: 'click',
    viewport: { selector: '.viewport', padding: 0 }
});

new joint.ui.Tooltip({
    target: '.viewport-tooltip-bottom',
    content: 'Click tooltip in a viewport<br/>Multiline<br/><br/>For enable vertical viewport<br/>constraint<br/>with padding',
    right: '.viewport-tooltip-bottom',
    direction: 'right',
    trigger: 'click',
    viewport: { selector: '.viewport', padding: 16 }
});

new joint.ui.Tooltip({
    className: 'tooltip animated-tooltip',
    target: '.animated-tooltip-label',
    content: 'Animated & delayed tooltip.',
    top: '.animated-tooltip-label',
    direction: 'top'
});

new joint.ui.Tooltip({
    target: '.html-tooltip',
    content: '<h4>HTML Tooltip</h4> <img src="http://jointjs.client.io/images/logos/jointjs_1.png" width="80" style="position: absolute; top: 10px; right: 10px;"/><hr/><b>JointJS</b> tooltips can contain arbitrary HTML.',
    direction: 'left',
    left: '.html-tooltip'
});
