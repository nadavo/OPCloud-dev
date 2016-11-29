/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var f = new joint.ui.SVGFilterBuilder(svgFilterBuilderData);
f.render().$el.appendTo(document.body);
f.onRender();
joint.setTheme('modern');

f.setSvgFilter($('#filter'));
f.setSvgSource('<text style="font-size: 140px;fill:#33334e">Client IO!</text>');

f.paperScroller.zoomToFit({ padding: 50 });
f.filterPreview.paperScroller.zoomToFit({ padding: 50 });
f.originalPreview.paperScroller.zoomToFit({ padding: 50 });
