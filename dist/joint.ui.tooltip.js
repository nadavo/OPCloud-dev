/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


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
        /** @deprecated use position: 'left' instead. This value is used when 'position' is not defined. Ignored if defined on element.  */
        left: undefined,
        /** @deprecated use position: 'right' instead. This value is used when 'position' is not defined. Ignored if defined on element.  */
        right: undefined,
        /** @deprecated use position: 'top' instead. This value is used when 'position' is not defined. Ignored if defined on element. */
        top: undefined,
        /** @deprecated use position: 'bottom' instead. This value is used when 'position' is not defined. Ignored if defined on element. */
        bottom: undefined,

        /** @type {string|function(element)} */
        position: undefined,

        /** @type {string|function(element)} */
        positionSelector: undefined,

        /** @type {string|function(element)} Tooltip arrow direction, could be 'left', 'right', 'top', 'bottom' and 'auto'.
         * 'auto' sets the arrow accordingly 'position' property.
         * Arrows are disabled if 'direction' is 'undefined', 'null' or 'off'.
         * */
        direction: 'auto',

        /**
         * Minimal width of the tooltip. Tooltip width can be resized down to the `minResizedWidth`. If available space is smaller
         * than `minResizedWidth`, direction of the tooltip is changed to its opposite direction (left tooltip is swapped to right,
         * top to bottom and vice versa). `minResizedWidth:0` means no resizing, no direction swapping.
         * @type {number}
         */
        minResizedWidth: 100,

        /** @type {number|function(element)} */
        padding: 0,

        /** @type {String} */
        rootTarget: null,

        /** @type {String} */
        target: null,

        /** @type {string} */
        trigger: 'hover',

        /** @type {{selector: String, padding: number}} */
        viewport: {
            selector: null,
            padding: 0
        },

        /** @type {string} */
        dataAttributePrefix: 'tooltip',

        /** @type {string} */
        template: '<div class="tooltip-arrow"/><div class="tooltip-arrow-mask"/><div class="tooltip-content"/>'
    },

    init: function() {

        this.eventNamespace = ('.' + this.className + this.cid).replace(/ /g, '_');

        /**
         * Specific for each tooltip - merged global options with tooltip's options from html attrs.
         * @type {object}
         */
        this.settings = {};

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
                        break;

                    case 'focus':
                        this.$rootTarget.on('focusin' + this.eventNamespace, this.options.target, this.render);
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
                        break;

                    case 'focus':
                        this.$target.on('focusin' + this.eventNamespace, this.render);
                        break;

                }
            }, this);
        }

        this.$el.append(this.options.template);
    },

    /**
     * @private
     */
    onRemove: function() {

        // Detach events listeners
        if (this.options.rootTarget) {
            this.$rootTarget.off(this.eventNamespace);
        } else {
            this.$target.off(this.eventNamespace);
        }
    },

    /**
     * @public
     */
    hide: function() {

        var settings = this.settings;

        if (!settings) {
            return;
        }

        this.unbindHideActions(settings.currentTarget);

        this.$el.removeClass(settings.className);
        this.$el.remove();
    },

    /**
     * @public
     * @param {jQuery.Event=} evt
     */
    show: function(evt) {

        this.render(evt || { target: this.options.target });
    },

    /**
     * @public
     * @param {jQuery.Event=} evt
     */
    toggle: function(evt) {

        if (this.isVisible()) {
            this.hide();
        } else {
            this.show(evt);
        }
    },

    /**
     * @public
     */
    isVisible: function() {

        // Check if tooltip is in the DOM
        return document.body.contains(this.el);
    },

    /**
     * @public
     * @param {{target: string|Element}|{x:number, y:number}} evt
     */
    render: function(evt) {

        var point = !_.isUndefined(evt.x) && !_.isUndefined(evt.y) ? evt : null;
        var element = $(evt.target).closest(this.options.target)[0];

        var settings = this.settings = this.getTooltipSettings(element);
        settings.currentTarget = element;

        this.bindHideActions(element);

        var targetBBox;
        if (point) {
            targetBBox = { x: point.x, y: point.y, width: 1, height: 1 };
        } else {
            targetBBox = joint.util.getElementBBox(element);
        }

        this.$('.tooltip-content').html(settings.content);

        // Hide the element first so that we don't get a jumping effect during the image loading.
        this.$el.hide();
        this.$el.removeClass('left right top bottom');
        this.$el.addClass(settings.className);

        $(document.body).append(this.$el);

        // If there is an image in the `content`, wait till it's loaded as only after that
        // we know the dimension of the tooltip.
        var $images = this.$('img');
        if ($images.length) {

            $images.on('load', _.bind(function() {
                this.position(targetBBox);
                this.$el.addClass('rendered');
            }, this));

        } else {
            this.position(targetBBox);
            this.$el.addClass('rendered');
        }
    },

    /**
     * @param el {Element}
     * @returns {Object}
     */
    getTooltipSettings: function(el) {

        var elementDefinition = this.loadDefinitionFromElementData(el);
        return this.evaluateOptions(el, elementDefinition);
    },

    /**
     * @private
     * @param {Element} element
     */
    unbindHideActions: function(element) {

        var hideActionsNamespace = this.eventNamespace + '.remove';

        $(element).off(hideActionsNamespace);
        clearInterval(this.interval);
    },

    /**
     * @private
     * Checks if tooltip's target element is still in dom. Hides tooltip when target element is removed.
     * @param {Element} element
     */
    bindHideOnRemoveTarget: function(element) {

        clearInterval(this.interval);
        this.interval = setInterval(_.bind(function() {

            if (!$.contains(document, element)) {
                clearInterval(this.interval);
                this.hide();
            }
        }, this), 500);
    },

    /**
     * @private
     * @param {Element} element
     */
    bindHideActions: function(element) {

        var settings = this.settings;

        var $element = $(element);
        var hideActionsNamespace = this.eventNamespace + '.remove';

        this.bindHideOnRemoveTarget(element);

        _.each(this.options.trigger.split(' '), function(trigger) {

            var hideEvents = {
                'hover': ['mouseout', 'mousedown'],
                'focus': ['focusout']
            };

            var events = hideEvents[trigger] || [];
            if (settings.hideTrigger) {
                events = settings.hideTrigger.split(' ') || [];
            }

            _.each(events, function(eventName) {
                $element.on(eventName + hideActionsNamespace, this.hide);
            }, this);

        }, this);
    },

    /**
     * @private
     * get options from element data, normalize deprecated definition.
     * @param {Element} element
     * @param {Object} elementDefinition
     * @returns {Object}
     */
    evaluateOptions: function(element, elementDefinition) {

        elementDefinition = elementDefinition || {};

        var settings = _.extend({}, elementDefinition, this.options);

        _.each(settings, function(value, key) {
            var evaluated = _.isFunction(value) ? value(element) : value;
            settings[key] = _.isUndefined(evaluated) || _.isNull(evaluated) ? elementDefinition[key] : evaluated;
        });

        this.normalizePosition(settings);
        return settings;
    },

    /**
     * @private
     * @param {Element} element
     * @returns {Object}
     */
    loadDefinitionFromElementData: function(element) {

        if (!element) {
            return {};
        }

        var isIgnored = function(key) {

            return key === 'left' || key === 'bottom' || key === 'top' || key === 'right';
        };

        var data = this.getAllAttrs(element, 'data-' + this.options.dataAttributePrefix);
        var options = {};

        _.each(data, function(value, key) {

            if (key === '') {
                key = 'content';
            }

            if (!isIgnored(key)) {
                options[key] = value;
            }
        });

        return options;
    },

    /**
     * @private
     * @param {Element} element
     * @param {string} namePrefix
     * @returns {{string:*}}
     */
    getAllAttrs: function(element, namePrefix) {

        var prefix = namePrefix || '';
        var attrs = element.attributes;
        var dataAttrs = {};

        _.each(attrs, function(attr) {

            if (_.startsWith(attr.name, prefix)) {
                var name = _.camelCase(attr.name.slice(prefix.length));
                dataAttrs[name] = attr.value;
            }
        });
        return dataAttrs;
    },

    /**
     * @private
     * modifies the options, use deprecated properties if needed.
     * @param {Object} options
     */
    normalizePosition: function(options) {

        var deprecatedDefinition = options.left || options.right || options.top || options.bottom;

        if (!options.position && deprecatedDefinition) {
            if (options.left) {
                options.position = 'left';
            }
            if (options.right) {
                options.position = 'right';
            }
            if (options.top) {
                options.position = 'top';
            }
            if (options.bottom) {
                options.position = 'bottom';
            }
        }

        if (!options.positionSelector && deprecatedDefinition) {
            options.positionSelector = deprecatedDefinition;
        }
    },

    /**
     * @private
     * @param {rect} targetBBox
     */
    position: function(targetBBox) {

        var settings = this.settings;

        // Show the tooltip. Do this before we ask for its dimension, otherwise they won't be defined yet.
        this.$el.show();
        this.$el.css('width', 'auto');

        // No Selector => Get BBox of the body element.
        var viewport = this.getViewportViewBBox();

        var tooltipBBox = this.getTooltipBBox(targetBBox, viewport);

        var arrowPosition = {};

        //Arrow to the middle (vertical/horizontal) of the targetElement
        if (settings.position === 'left' || settings.position === 'right') {
            arrowPosition.top = targetBBox.y + targetBBox.height / 2 - tooltipBBox.y;
        } else if (settings.position === 'top' || settings.position === 'bottom') {
            arrowPosition.left = targetBBox.x + targetBBox.width / 2 - tooltipBBox.x;
        } else {
            //As if `options.left` was set to the target element.
            arrowPosition.top = targetBBox.y + targetBBox.height / 2 - tooltipBBox.y;
        }

        // Move the tooltip to the right position
        this.$el.css({
            left: tooltipBBox.x,
            top: tooltipBBox.y,
            width: tooltipBBox.width || 'auto'
        });

        var $arrows = this.$('.tooltip-arrow, .tooltip-arrow-mask');

        // Reset style of previous tooltip
        $arrows.removeAttr('style');
        // Move the arrow
        $arrows.css(arrowPosition);

        if (settings.direction && settings.direction !== 'off') {
            this.$el.addClass(settings.direction === 'auto' ? (settings.position || 'left') : settings.direction);
        }
    },

    getViewportViewBBox: function() {

        var settings = this.settings;

        var el = settings.viewport.selector ? $(settings.currentTarget).closest(settings.viewport.selector) : 'html';

        var viewportBBox = joint.util.getElementBBox(el);

        // No Selector => Get browser window size.
        // note: 'html' doesn't return a full window height.
        // but returns 0 if body elements have position: absolute.
        var $window = $(window);
        if (!settings.viewport.selector) {
            viewportBBox.width = $window.width() + $window.scrollLeft();
            viewportBBox.height = $window.height() + $window.scrollTop();
        }

        var viewportPadding = settings.viewport.padding || 0;
        viewportBBox.x += viewportPadding;
        viewportBBox.y += viewportPadding;
        viewportBBox.width -= 2 * viewportPadding;
        viewportBBox.height -= 2 * viewportPadding;

        return viewportBBox;
    },

    getPosition: function(positionedBBox, targetBBox, bBox, viewport) {

        var settings = this.settings;
        var type = settings.position || 'left';
        var padding = settings.padding;
        var minWidth = Math.min(settings.minResizedWidth, bBox.width + padding);

        var map = {
            left: function(manipulable) {

                var position = {
                    x: positionedBBox.x + positionedBBox.width + padding,
                    y: targetBBox.y + targetBBox.height / 2 - bBox.height / 2
                };

                if (manipulable) {

                    var availableSize = viewport.x + viewport.width - (position.x);

                    if (availableSize > minWidth && availableSize < bBox.width + padding) {
                        position.width = availableSize;
                    }

                    if (availableSize < minWidth) {
                        settings.position = 'right';
                        return this.right(false);
                    }
                }

                return position;
            },
            right: function(manipulable) {

                var position = {
                    x: positionedBBox.x - bBox.width - padding,
                    y: targetBBox.y + targetBBox.height / 2 - bBox.height / 2
                };

                if (manipulable) {

                    var availableSize = positionedBBox.x - padding - viewport.x;

                    if (availableSize > minWidth && availableSize < bBox.width + padding) {
                        position.width = availableSize;
                        position.x = viewport.x;
                    }

                    if (availableSize < minWidth) {
                        settings.position = 'left';
                        return this.left(false);
                    }
                }

                return position;

            },
            top: function(manipulable) {

                var position = {
                    x: targetBBox.x + targetBBox.width / 2 - bBox.width / 2,
                    y: positionedBBox.y + positionedBBox.height + padding
                };

                if (manipulable) {

                    var availableSize = (viewport.y + viewport.height) - (positionedBBox.y + positionedBBox.height + padding);

                    if (availableSize < bBox.height) {
                        settings.position = 'bottom';
                        return this.bottom(false);
                    }
                }

                return position;
            },
            bottom: function(manipulable) {

                var position = {
                    x: targetBBox.x + targetBBox.width / 2 - bBox.width / 2,
                    y: positionedBBox.y - bBox.height - padding
                };
                if (manipulable) {

                    var availableSize = (positionedBBox.y - padding) - viewport.y;

                    if (availableSize < bBox.height) {
                        settings.position = 'top';
                        return this.top(false);
                    }
                }

                return position;
            }
        };

        return map[type](minWidth > 0);
    },


    /**
     * @private
     * @param {rect} targetBBox
     * @param {rect} viewport
     * @returns {{width: number, height: number}}
     */
    getTooltipBBox: function(targetBBox, viewport) {

        var $element;
        var positionedBBox;
        var dimensions = this.measureTooltipElement();

        $element = $(this.settings.positionSelector);
        positionedBBox = $element[0] ? joint.util.getElementBBox($element[0]) : targetBBox;

        var bBox = this.getPosition(positionedBBox, targetBBox, dimensions, viewport);
        // If the tooltip overflows the viewport on top and bottom sides (the top side wins).
        if (bBox.y < viewport.y) {
            bBox.y = viewport.y;
        } else if (bBox.y + dimensions.height > viewport.y + viewport.height) {
            bBox.y = viewport.y + viewport.height - dimensions.height;
        }

        var bBoxWidth = bBox.width || dimensions.width;
        // If the tooltip overflows the viewport on the left and right sides (the left side wins).
        if (bBox.x < viewport.x) {
            bBox.x = viewport.x;
        } else if (bBox.x + bBoxWidth > viewport.x + viewport.width) {
            bBox.x = viewport.x + viewport.width - bBoxWidth;
        }

        return bBox;
    },

    /**
     * @private
     * @returns {{width: number, height: number}}
     */
    measureTooltipElement: function() {

        var $measure = this.$el.clone().appendTo($('body')).css({ 'left': -1000, top: -500 });

        var dimensions = {
            width: $measure.outerWidth(),
            height: $measure.outerHeight()
        };
        $measure.remove();

        return dimensions;
    }
});
