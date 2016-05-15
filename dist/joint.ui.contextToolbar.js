/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// A context toolbar.
// Context toolbar contains tools (usually buttons) that should be displayed below a certain target element.
// Only one context toolbar can be opened at a time. This simplifies the process and makes sure you don't have to
// keep track of opened context toolbars.

joint.ui.ContextToolbar = joint.mvc.View.extend({

    className: 'context-toolbar',

    eventNamespace: 'context-toolbar',

    events: {
        'click .tool': 'onToolPointerdown'
    },

    options: {
        padding: 20,
        autoClose: true
    },

    init: function() {

        _.bindAll(this, 'onDocumentMousedown');
    },

    render: function() {

        if (this.constructor.opened) {
            // Only one context toolbar can be opened at a time.

            this.constructor.close();
        }

        this.bind();

        if (this.options.type) {
            this.$el.attr('data-type', this.options.type);
        }

        $(this.getRoot()).append(this.$el);

        this.renderContent();

        this.position();

        this.constructor.opened = this;

        return this;
    },

    renderContent: function() {

        var $tools = $('<div/>', { 'class': 'tools' });

        if (this.options.tools) {

            _.each(this.options.tools, function(tool) {

                var $html;
                if (tool.icon) {
                    $html = $('<img/>', { src: tool.icon });
                } else {
                    $html = tool.content;
                }

                var $tool = $('<button/>', {
                    'class': 'tool',
                    html: $html,
                    'data-action': tool.action
                });

                if (tool.attrs) {
                    $tool.attr(tool.attrs);
                }

                $tools.append($tool);
            });
        }

        this.$el.append($tools);
    },

    getRoot: function() {

        return this.options.root || document.documentElement;
    },

    position: function() {

        var $target = $(this.options.target);

        var bbox = joint.util.getElementBBox(this.options.target);
        var rootBbox = joint.util.getElementBBox(this.getRoot());
        var width = this.$el.outerWidth();
        var height = this.$el.outerHeight();

        var left = bbox.x + bbox.width / 2 - width / 2;
        var top = bbox.y + bbox.height + this.options.padding;

        left -= rootBbox.x;
        top -= rootBbox.y;

        this.$el.css({ left: left, top: top });
    },

    onRemove: function() {

        this.unbind();
        this.constructor.opened = undefined;
    },

    bind: function() {

        // It is important to have the toolbar opened on `mousedown` event instead
        // of `click`. This is because we want to handle the earliest event possible.
        // Imagine you want to show the context toolbar when the user clicks an element.
        // We render the toolbar. If we were to register a handler for click,
        // the user would at some point release its mouse, this toolbar would
        // catch the click event outside of both the target and the toolbar
        // itself and would remove itself immediately.
        $(document).on('mousedown.' + this.eventNamespace, this.onDocumentMousedown);
    },

    unbind: function() {

        $(document).off('mousedown.' + this.eventNamespace, this.onDocumentMousedown);
        return this;
    },

    onToolPointerdown: function(evt) {

        var $tool = $(evt.target).closest('[data-action]');
        var action = $tool.attr('data-action');
        if (action) {

            this.trigger('action:' + action, evt);
        }
    },

    onDocumentMousedown: function(evt) {

        if (this.options.autoClose) {
            var target = this.options.target;
            if (!this.el.contains(evt.target) && !target.contains(evt.target) && target !== evt.target) {
                // Check if the user clicked outside the context toolbar and hide it if yes.
                this.constructor.close();
                this.remove();
            }
        }
    }

}, {

    opened: undefined,  // The currently opened context toolbar.

    close: function() {

        if (this.opened) {
            this.opened.remove();
            this.opened = undefined;
        }
    },

    // Call whenever the `options.target` changes its position.
    update: function() {

        if (this.opened) {
            this.opened.position();
        }
    }

});
