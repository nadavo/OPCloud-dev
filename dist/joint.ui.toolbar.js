/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/



(function(joint, _) {

    /**
     * @typedef {{items: Array.<Object>, group: Object}} GroupedItems
     */
    joint.ui.Toolbar = joint.mvc.View.extend({

        options: {
            /*
             tools: [
                {group: 'groupName'}
             ],
             groups: {
                'name': {
                    index: number,
                    align: 'left' | 'right'
                }

             }
             references: {}
             */
        },
        align: ['left', 'right'],
        className: 'toolbar',
        defaultGroup: 'default',
        widgets: [],
        groupViews: [],

        init: function() {

            this.tools = this.options.tools || [];
            this.groups = this.options.groups || {};
        },

        /**
         * @public
         * @param {string} name
         * @returns {Array.<joint.ui.Widget>}
         */
        getWidgetByName: function(name) {

            return _.find(this.widgets, function(item) {
                return item.options.name === name;
            });
        },

        /**
         * @public
         * @returns {Array.<joint.ui.Widget>}
         */
        getWidgets: function() {

            return this.widgets;
        },

        /**
         * @private
         * @typedef {{items: Array.<Object>, group: Object}} GroupedItems
         * @returns {Array.<[string, GroupedItems]>}
         */
        groupsWithItemsPairs: function() {

            var groupedItems = {};

            _.each(this.tools, function(item) {

                var group = item.group || this.defaultGroup;
                groupedItems[group] = groupedItems[group] || { items: [], group: {} };
                groupedItems[group].items.push(item);
                groupedItems[group].group = this.groups[group] || {};

            }, this);

            return _.chain(groupedItems).pairs()
                    .sortBy(function(pair) {
                        return pair[1].group.index;
                    }).sortBy(function(pair) {
                        return pair[1].group.align || 'left';
                    }).value();
        },

        /**
         * @public
         * @returns {joint.ui.Toolbar}
         */
        render: function() {

            var sortedGroups = this.groupsWithItemsPairs();
            var firstAlignRight = false;

            _.each(sortedGroups, function(groupArray) {

                var name = groupArray[0];
                var grouped = groupArray[1];
                var $group = this.renderGroup(name, grouped);

                if (!firstAlignRight && grouped.group.align && grouped.group.align === 'right') {
                    firstAlignRight = true;
                    $group.addClass('group-first');
                }

                $group.appendTo(this.el);

            }, this);

            return this;
        },

        /**
         * @private
         * @param {string} name
         * @param {GroupedItems} grouped
         * @returns {jQuery}
         */
        renderGroup: function(name, grouped) {

            var groupView = new ToolbarGroupView({
                name: name,
                align: grouped.group.align,
                items: grouped.items,
                references: this.options.references
            });

            this.groupViews.push(groupView);

            groupView.on('all', _.bind(function() {
                this.trigger.apply(this, arguments);
            }, this));

            groupView.render();

            this.widgets = this.widgets.concat(groupView.widgets);

            return groupView.$el;
        },

        onRemove: function() {

            _.invoke(this.groupViews, 'off');
            _.invoke(this.groupViews, 'remove');
        }
    });

    var ToolbarGroupView = joint.mvc.View.extend({

        className: 'toolbar-group',

        init: function() {

            this.widgets = [];
        },

        onRender: function() {

            this.$el.attr('data-group', this.options.name);
            this.$el.addClass(this.options.align);
            this.renderItems();
        },

        renderItems: function() {

            _.each(this.options.items, function(item) {
                var widget = this.createWidget(item);
                this.$el.append(widget.$el);
            }, this);
        },

        createWidget: function(item) {

            var widget = joint.ui.Widget.create(item, this.options.references);
            widget.on('all', _.bind(function(eventName) {
                var data = Array.prototype.slice.call(arguments, 1);
                this.trigger.apply(this, [item.name + ':' + eventName].concat(data));
            }, this));
            this.widgets.push(widget);
            return widget;
        },

        onRemove: function() {

            _.invoke(this.widgets, 'off');
            _.invoke(this.widgets, 'remove');
        }
    });

}(joint, _));

(function(joint, _) {

    joint.ui.Widget = joint.mvc.View.extend({

        className: 'widget',
        /** @type {Array.<string>} List of mandatory references, widget cannot be created if any of the reference from list
         * is not defined in options */
        references: [],

        constructor: function(options, refs) {

            this.availableReferences = refs || {};
            joint.mvc.View.prototype.constructor.call(this, options);
        },
        /**
         * @private
         * Apply attributes data onto widget elements.
         * @param {Object.<string, Object>} attrs
         * @returns {jQuery}
         */
        updateAttrs: function(attrs) {

            joint.util.setAttributesBySelector(this.$el, attrs);
        },

        /**
         * @protected
         * Override in specific widget.
         */
        bindEvents: function() {

        },

        /**
         * @private
         */
        validateReferences: function() {
            var refs = this.references || [];
            var ret = [];

            _.each(refs, function(ref) {

                if (_.isUndefined(this.availableReferences[ref])) {
                    ret.push(ref);
                }

            }, this);

            return ret;
        },

        /**
         * @protected
         * @param {string} name
         * @returns {*}
         */
        getReference: function(name) {
            return this.availableReferences[name];
        },

        /**
         * @protected
         * @returns {Array.<*>}
         */
        getReferences: function() {
            return this.availableReferences;
        }

    }, {
        /**
         * @param {Object} opt
         * @param {Object?} refs references
         * @returns {joint.ui.Widget}
         */
        create: function(opt, refs) {

            var type = _.camelCase(_.isString(opt) ? opt : opt.type);

            if (!_.isFunction(joint.ui.widgets[type])) {
                throw new Error('Widget: unable to find widget: "' + type + '"');
            }

            var widget = new joint.ui.widgets[type](opt, refs);

            var invalidRefs = widget.validateReferences(refs);
            if (invalidRefs.length > 0) {
                throw new Error('Widget: "' + type + '" missing dependency: ' + invalidRefs.join(', '));
            }

            widget.render();
            widget.updateAttrs(opt.attrs);
            widget.bindEvents();
            widget.$el.attr('data-type', type);

            if (opt.name) {
                widget.$el.attr('data-name', opt.name);
            }

            return widget;
        }
    });

    joint.ui.widgets = {

        checkbox: joint.ui.Widget.extend({

            tagName: 'label',
            events: {
                'change .input': 'onChange',
                'mousedown': 'pointerdown',
                'touchstart': 'pointerdown',
                'mouseup': 'pointerup',
                'touchend': 'pointerup'
            },

            init: function() {
                _.bindAll(this, 'pointerup');
            },

            render: function() {

                var opt = this.options;

                var $label = $('<span/>').text(opt.label || '');
                this.$input = $('<input/>', { type: 'checkbox', 'class': 'input' }).prop('checked', !!opt.value);
                this.$span = $('<span/>');

                this.$el.append([$label, this.$input, this.$span]);

                return this;
            },

            onChange: function(evt) {
                this.trigger('change', !!evt.target.checked, evt);
            },

            pointerdown: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.$el.addClass('is-in-action');
                this.trigger('pointerdown', evt);
                $(document).on('mouseup.checkbox touchend.checkbox', this.pointerup);
            },

            pointerup: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                $(document).off('mouseup.checkbox touchend.checkbox');
                this.trigger('pointerdown', evt);
                this.$el.removeClass('is-in-action');
            }
        }),

        toggle: joint.ui.Widget.extend({

            tagName: 'label',
            events: {
                'change .toggle': 'onChange',
                'mousedown': 'pointerdown',
                'touchstart': 'pointerdown',
                'mouseup': 'pointerup',
                'touchend': 'pointerup'
            },

            init: function() {
                _.bindAll(this, 'pointerup');
            },

            render: function() {

                var opt = this.options;

                var $label = $('<span/>').text(opt.label || '');
                var $button = $('<span><i/></span>');
                var $input = $('<input/>', { type: 'checkbox', class: 'toggle' }).prop('checked', !!opt.value);
                var $wrapper = $('<div/>').addClass(opt.type);

                this.$el.append([$label, $wrapper.append($input, $button)]);

                return this;
            },

            onChange: function(evt) {
                this.trigger('change', !!evt.target.checked, evt);
            },

            pointerdown: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.$el.addClass('is-in-action');
                this.trigger('pointerdown', evt);
                $(document).on('mouseup.toggle touchend.toggle', this.pointerup);
            },

            pointerup: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                $(document).off('mouseup.toggle touchend.toggle');
                this.$el.removeClass('is-in-action');
                this.trigger('pointerup', evt);
            }
        }),

        separator: joint.ui.Widget.extend({

            render: function() {

                if (this.options.width) {
                    this.$el.css({ width: this.options.width });
                }

                return this;
            }
        }),

        label: joint.ui.Widget.extend({

            tagName: 'label',

            render: function() {

                this.$el.text(this.options.text);

                return this;
            }
        }),

        range: joint.ui.Widget.extend({

            events: {
                'change .input': 'onChange',
                'input .input': 'onChange'
            },

            render: function() {

                var opt = this.options;
                var $units;

                this.$output = $('<output/>').text(opt.value);
                $units = $('<span/>').addClass('units').text(opt.unit);
                this.$input = $('<input/>', {
                    type: 'range',
                    name: opt.type,
                    min: opt.min,
                    max: opt.max,
                    step: opt.step,
                    'class': 'input'
                }).val(opt.value);

                this.$el.append([this.$input, this.$output, $units]);

                return this;
            },

            onChange: function(evt) {

                var value = parseInt(this.$input.val(), 10);
                if (value === this.currentValue) {
                    return ;
                }

                this.currentValue = value;
                this.$output.text(value);
                this.trigger('change', value, evt);
            },

            setValue: function(value) {
                this.$input.val(value);
                this.$input.trigger('change');
            }
        }),

        selectBox: joint.ui.Widget.extend({

            render: function() {

                var selectBoxOptions = _.omit(this.options, 'type', 'group', 'index');

                this.selectBox = new joint.ui.SelectBox(selectBoxOptions);
                this.selectBox.render().$el.appendTo(this.el);

                return this;
            },

            bindEvents: function() {
                this.selectBox.on('all', this.trigger, this);
            }
        }),

        button: joint.ui.Widget.extend({

            events: {
                'mousedown': 'pointerdown',
                'touchstart': 'pointerdown',
                'click': 'pointerclick',
                'touchend': 'pointerclick'
            },
            tagName: 'button',

            render: function() {

                var opt = this.options;

                this.$el.text(opt.text);

                return this;
            },

            pointerclick: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.trigger('pointerclick', evt);
            },

            pointerdown: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.trigger('pointerdown', evt);
            }
        }),

        inputText: joint.ui.Widget.extend({

            events: {
                'mousedown': 'pointerdown',
                'touchstart': 'pointerdown',
                'mouseup': 'pointerup',
                'touchend': 'pointerup',
                'click': 'pointerclick',
                'focusin' : 'pointerfocusin',
                'focusout' : 'pointerfocusout'
            },
            tagName: 'div',

            render: function() {

                var opt = this.options;

                this.$label = $('<label/>').text(opt.label);
                this.$input = $('<div/>').addClass('input-wrapper').append( $('<input/>', {
                    type: 'text',
                    'class': 'input'
                }).val(opt.value) );

                this.$el.append([this.$label, this.$input]);

                return this;
            },

            pointerclick: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.trigger('pointerclick', evt);
            },

            pointerdown: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.trigger('pointerdown', evt);
            },

            pointerup: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.trigger('pointerup', evt);
            },

            pointerfocusin: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.$el.addClass('is-focused');
                this.trigger('pointerfocusin', evt);
            },

            pointerfocusout: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.$el.removeClass('is-focused');
                this.trigger('pointerfocusout', evt);
            }
        }),

        inputNumber: joint.ui.Widget.extend({

            events: {
                'mousedown': 'pointerdown',
                'touchstart': 'pointerdown',
                'mouseup': 'pointerup',
                'touchend': 'pointerup',
                'click': 'pointerclick',
                'focusin' : 'pointerfocusin',
                'focusout' : 'pointerfocusout'
            },
            tagName: 'div',

            render: function() {

                var opt = this.options;

                this.$label = $('<label/>').text(opt.label);
                this.$input = $('<div/>').addClass('input-wrapper').append( $('<input/>', {
                    type: 'number',
                    'class': 'number',
                    max: opt.max,
                    min: opt.min
                }).val(opt.value) );

                this.$el.append([this.$label, this.$input]);

                return this;
            },

            pointerclick: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.trigger('pointerclick', evt);
            },

            pointerdown: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.trigger('pointerdown', evt);
            },

            pointerup: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.trigger('pointerup', evt);
            },

            pointerfocusin: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.$el.addClass('is-focused');
                this.trigger('pointerfocusin', evt);
            },

            pointerfocusout: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.$el.removeClass('is-focused');
                this.trigger('pointerfocusout', evt);
            }
        }),

        textarea: joint.ui.Widget.extend({

            events: {
                'mousedown': 'pointerdown',
                'touchstart': 'pointerdown',
                'mouseup': 'pointerup',
                'touchend': 'pointerup',
                'click': 'pointerclick',
                'focusin' : 'pointerfocusin',
                'focusout' : 'pointerfocusout'
            },
            tagName: 'div',

            render: function() {

                var opt = this.options;

                this.$label = $('<label/>').text(opt.label);
                this.$input = $('<div/>').addClass('input-wrapper').append( $('<textarea/>', {
                    'class': 'textarea'
                }).text(opt.value) );

                this.$el.append([this.$label, this.$input]);

                return this;
            },

            pointerclick: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.trigger('pointerclick', evt);
            },

            pointerdown: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.trigger('pointerdown', evt);
            },

            pointerup: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.trigger('pointerup', evt);
            },

            pointerfocusin: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.$el.addClass('is-focused');
                this.trigger('pointerfocusin', evt);
            },

            pointerfocusout: function(evt) {
                evt = joint.util.normalizeEvent(evt);
                this.$el.removeClass('is-focused');
                this.trigger('pointerfocusout', evt);
            }
        }),

        selectButtonGroup: joint.ui.Widget.extend({

            render: function() {

                var selectButtonGroupOptions = _.omit(this.options, 'type', 'group', 'index');

                this.selectButtonGroup = new joint.ui.SelectButtonGroup(selectButtonGroupOptions);
                this.selectButtonGroup.render().$el.appendTo(this.el);

                return this;
            },

            bindEvents: function() {
                this.selectButtonGroup.on('all', this.trigger, this);
            }
        })
    };

    joint.ui.widgets.zoomIn = joint.ui.widgets.button.extend({

        references: ['paperScroller'],
        options: {
            min: 0.2,
            max: 5,
            step: 0.2
        },

        pointerdown: function(evt) {

            var opt = this.options;

            this.getReferences().paperScroller.zoom(opt.step, { max: opt.max, grid: opt.step });
            joint.ui.widgets.button.prototype.pointerdown.call(this, evt);
        }
    });

    joint.ui.widgets.zoomOut = joint.ui.widgets.button.extend({

        references: ['paperScroller'],
        options: {
            min: 0.2,
            max: 5,
            step: 0.2
        },

        pointerdown: function(evt) {

            var opt = this.options;

            this.getReferences().paperScroller.zoom(-opt.step, { min: opt.min, grid: opt.step });
            joint.ui.widgets.button.prototype.pointerdown.call(this, evt);
        }
    });

    joint.ui.widgets.zoomToFit = joint.ui.widgets.button.extend({

        references: ['paperScroller'],
        options: {
            min: 0.2,
            max: 5,
            step: 0.2
        },

        pointerdown: function(evt) {

            var opt = this.options;

            this.getReferences().paperScroller.zoomToFit({
                padding: 20,
                scaleGrid: opt.step,
                minScale: opt.min,
                maxScale: opt.max
            });
            joint.ui.widgets.button.prototype.pointerdown.call(this, evt);
        }
    });

    joint.ui.widgets.zoomSlider = joint.ui.widgets.range.extend({

        references: ['paperScroller'],
        options: {
            min: 20,
            max: 500,
            step: 20,
            value: 100,
            unit: ' %'
        },

        bindEvents: function() {

            this.on('change', function(value) {
                this.getReferences().paperScroller.zoom(value / 100, { absolute: true, grid: this.options.step / 100 });
            }, this);

            this.getReferences().paperScroller.options.paper.on('scale', function(value) {
                this.setValue(Math.floor(value * 100));
            }, this);
        }
    });

    joint.ui.widgets.undo = joint.ui.widgets.button.extend({

        references: ['commandManager'],

        pointerclick: function() {
            this.getReferences().commandManager.undo();
        }
    });

    joint.ui.widgets.redo = joint.ui.widgets.button.extend({

        references: ['commandManager'],

        pointerclick: function() {
            this.getReferences().commandManager.redo();
        }
    });

}(joint, _));
