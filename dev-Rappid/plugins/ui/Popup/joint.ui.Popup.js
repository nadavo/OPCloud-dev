/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// ui.Popup is like ui.ContextToolbar except that it can contain any HTML.
// This is useful for displaying a contextual widget that contains forms or other
// HTML. Popups also have an arrow pointing up.

// @import ui.ContextToolbar

joint.ui.Popup = joint.ui.ContextToolbar.extend({

    className: 'popup',

    eventNamespace: 'popup',

    events: {},

    renderContent: function() {

        var content = _.isFunction(this.options.content) ? this.options.content(this.el) : this.options.content;
        if (content) {
            this.$el.html(content);
        }
    }
});
