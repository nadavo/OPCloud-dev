/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


joint.ui.Tooltip = joint.mvc.View.extend({

    className: 'tooltip',

    options: {
        // `left` allows you to set a selector (or DOM element) that
        // will be used as the left edge of the tooltip. This is useful when configuring a tooltip
        // that should be shown "after" some other element. Other sides are analogous.
        left: undefined,
        right: undefined,
        top: undefined,
        bottom: undefined,
        padding: 10,
        target: undefined,
        rootTarget: undefined,
        trigger: 'hover',
        viewport: {
            selector: undefined,
            padding: 0
        },
        template: '<div class="tooltip-arrow"/><div class="tooltip-arrow-mask"/><div class="tooltip-content"/>'
    },

    init: function() {

        this.eventNamespace = '.' + this.className + this.cid;

        var triggers = this.options.trigger.split(' ');

        _.bindAll(this, 'render', 'hide', 'show', 'toggle', 'isVisible', 'position');

        if (this.options.rootTarget) {

            this.$rootTarget = $(this.options.rootTarget);

            _.each(triggers, function(trigger) {

                switch (trigger) {

                    case 'click':
                        this.$rootTarget.on('click' + this.eventNamespace, this.options.target, this.toggle);
                        break;

                    case 'hover':
                        this.$rootTarget.on('mouseover' + this.eventNamespace, this.options.target, this.render);
                        this.$rootTarget.on('mouseout' + this.eventNamespace, this.options.target, this.hide);
                        this.$rootTarget.on('mousedown' + this.eventNamespace, this.options.target, this.hide);
                        break;

                    case 'focus':
                        this.$rootTarget.on('focusin' + this.eventNamespace, this.options.target, this.render);
                        this.$rootTarget.on('focusout' + this.eventNamespace, this.options.target, this.hide);
                        break;

                }

            }, this);

        } else {

            this.$target = $(this.options.target);

            _.each(triggers, function(trigger) {

                switch (trigger) {

                    case 'click':
                        this.$target.on('click' + this.eventNamespace, this.toggle);
                        break;

                    case 'hover':
                        this.$target.on('mouseover' + this.eventNamespace, this.render);
                        this.$target.on('mouseout' + this.eventNamespace, this.hide);
                        this.$target.on('mousedown' + this.eventNamespace, this.hide);
                        break;

                    case 'focus':
                        this.$target.on('focusin' + this.eventNamespace, this.render);
                        this.$target.on('focusout' + this.eventNamespace, this.hide);
                        break;

                }
            }, this);
        }

        this.$el.addClass(this.options.direction);

        this.$el.append(this.options.template);
    },

    onRemove: function() {

        // Detach events listeners
        if (this.options.rootTarget) {
            this.$rootTarget.off(this.eventNamespace);
        } else {
            this.$target.off(this.eventNamespace);
        }
    },

    // @public
    hide: function() {

        this.$el.remove();
    },

    // @public
    show: function() {

        // this.$target is undefinied if tooltip is initialized with rootTarget options
        var target = this.$target ? this.$target[0] : this.options.target;
        this.render({ target: target });
    },

    // @public
    toggle: function() {

        if (this.isVisible()) {
            this.hide();
        } else {
            this.show();
        }
    },

    // @public
    isVisible: function() {

        // Check if tooltip is in the DOM
        return document.body.contains(this.el);
    },

    render: function(evt) {

        var target;
        var isPoint = !_.isUndefined(evt.x) && !_.isUndefined(evt.y);

        if (isPoint) {

            target = evt;

        } else {

            this.$target = $(evt.target).closest(this.options.target);
            target = this.$target[0];
        }

        this.$('.tooltip-content').html(_.isFunction(this.options.content) ? this.options.content(target) : this.options.content);

        // Hide the element first so that we don't get a jumping effect during the image loading.
        this.$el.hide();
        $(document.body).append(this.$el);

        // If there is an image in the `content`, wait till it's loaded as only after that
        // we know the dimension of the tooltip.
        var $images = this.$('img');
        if ($images.length) {

            $images.on('load', _.bind(function() {
                this.position(isPoint ? target : undefined);
            }, this));

        } else {

            this.position(isPoint ? target : undefined);
        }

        this.$el.addClass('rendered');
    },

    position: function(p) {

        var bbox;

        if (p) {

            bbox = { x: p.x, y: p.y, width: 1, height: 1 };

        } else {

            bbox = joint.util.getElementBBox(this.$target[0]);
        }

        var padding = this.options.padding;

        // Show the tooltip. Do this before we ask for its dimension, otherwise they won't be defined yet.
        this.$el.show();

        var elementBBox = {
            width: this.$el.outerWidth(),
            height: this.$el.outerHeight()
        };

        // If `options.left` selector or DOM element is defined, we use its right coordinate
        // as a left coordinate for the tooltip. In other words, the `options.left` element
        // is on the left of the tooltip. This is useful when you want to tooltip to
        // appear "after" a certain element.
        if (this.options.left) {

            var $left = $(_.isFunction(this.options.left) ? this.options.left(this.$target[0]) : this.options.left);
            var leftBbox = joint.util.getElementBBox($left[0]);

            _.extend(elementBBox, {
                x: leftBbox.x + leftBbox.width + padding,
                y: bbox.y + bbox.height / 2 - elementBBox.height / 2
            });

        } else if (this.options.right) {

            var $right = $(_.isFunction(this.options.right) ? this.options.right(this.$target[0]) : this.options.right);
            var rightBbox = joint.util.getElementBBox($right[0]);

            _.extend(elementBBox, {
                x: rightBbox.x - elementBBox.width - padding,
                y: bbox.y + bbox.height / 2 - elementBBox.height / 2
            });

        } else if (this.options.top) {

            var $top = $(_.isFunction(this.options.top) ? this.options.top(this.$target[0]) : this.options.top);
            var topBbox = joint.util.getElementBBox($top[0]);

            _.extend(elementBBox, {
                x: bbox.x + bbox.width / 2 - elementBBox.width / 2,
                y: topBbox.y + topBbox.height + padding
            });

        } else if (this.options.bottom) {

            var $bottom = $(_.isFunction(this.options.bottom) ? this.options.bottom(this.$target[0]) : this.options.bottom);
            var bottomBbox = joint.util.getElementBBox($bottom[0]);

            _.extend(elementBBox, {
                x: bbox.x + bbox.width / 2 - elementBBox.width / 2,
                y: bottomBbox.y - elementBBox.height - padding
            });

        } else {

            _.extend(elementBBox, {
                x: bbox.x + bbox.width + padding,
                y: bbox.y + bbox.height / 2 - elementBBox.height / 2
            });
        }

        // Constraint position to viewport
        elementBBox = this.respectViewport(elementBBox);

        var arrowPosition = {};

        // Arrow to the middle (vertical/horizontal) of the $target
        if (this.options.left || this.options.right) {
            arrowPosition.top = bbox.y + bbox.height / 2 - elementBBox.top;
        } else if (this.options.top || this.options.bottom) {
            arrowPosition.left = bbox.x + bbox.width / 2 - elementBBox.left;
        } else {
            // As if `options.left` was set to the target element.
            arrowPosition.top = bbox.y + bbox.height / 2 - elementBBox.top;
        }

        // Move the tooltip to the right position
        this.$el.css(_.pick(elementBBox, 'top', 'left'));

        // Move the arrow
        this.$('.tooltip-arrow, .tooltip-arrow-mask').css(arrowPosition);
    },

    respectViewport: function(bbox) {

        // Helper for Tooltip coordinates.
        bbox.top = bbox.y;
        bbox.left = bbox.x;
        bbox.right = bbox.left + bbox.width;
        bbox.bottom = bbox.top + bbox.height;

        // No Selector => Get BBox of the body element.
        var viewportBBox = joint.util.getElementBBox(this.options.viewport.selector || 'html');
        var marginLeft = parseInt(this.$el.css('marginLeft'), 10);
        var marginTop = parseInt(this.$el.css('marginTop'), 10);

        // No Selector => Get browser window size.
        // note: 'html' doesn't return a full window height.
        // but returns 0 if body elements have position: absolute.
        if (!this.options.viewport.selector) {
            viewportBBox.width = $(window).width() + window.scrollX;
            viewportBBox.height = $(window).height() + window.scrollY;
        }

        // Helper for viewport coordinates
        viewportBBox.top = viewportBBox.y - marginTop;
        viewportBBox.left = viewportBBox.x - marginLeft;
        viewportBBox.right = viewportBBox.left + viewportBBox.width;
        viewportBBox.bottom = viewportBBox.top + viewportBBox.height;

        // CALCULATE NEW COORDINATES BY INSCRIBE TOOLTIP INSIDE THE VIEWPORT

        // If the tooltip overflows the viewport on the left and right sides (the left side wins).
        if (bbox.left < viewportBBox.left) {
            bbox.left = bbox.x = viewportBBox.left + this.options.viewport.padding;
        } else if (bbox.right > viewportBBox.right) {
            bbox.left = bbox.x = viewportBBox.right - this.options.viewport.padding - bbox.width;
        }

        // If the tooltip overflows the viewport on top and bottom sides (the top side wins).
        if (bbox.top < viewportBBox.top) {
            bbox.top = bbox.y = viewportBBox.top + this.options.viewport.padding;
        } else if (bbox.bottom > viewportBBox.bottom) {
            bbox.top = bbox.y = viewportBBox.bottom - this.options.viewport.padding - bbox.height;
        }

        return bbox;
    }
});
