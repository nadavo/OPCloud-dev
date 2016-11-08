/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


joint.ui.SelectBox = joint.mvc.View.extend({

    className: 'select-box',

    events: {
        'click .select-box-selection': 'onToggle'
    },

    options: {
        options: [],    // Example: `{ content: '<b>foo</b><br/><small>bar</small>', value: 'foo', selected: true }`
        width: undefined,   // Set the width of the select box in JS. If `undefined`, it is assumed the width is set in CSS.
        openPolicy: 'auto', // Determines where the options panel will be displayed.
        // Document object only exists if the environment is a browser:
        target: typeof document !== 'undefined' ? document.body : null,
        keyboardNavigation: true,
        selected: undefined,  // selected value can either be defined directly in the options array or here as an index to it.
        selectBoxOptionsClass: undefined,
        disabled: false
    },

    init: function() {

        _.bindAll(this, 'onOutsideClick', 'onOptionSelect');

        $(document).on('click.selectBox', this.onOutsideClick);

        this.$el.data('view', this);

        if (_.isUndefined(this.options.selected)) {

            // If there is no selection at the beginning, we assume it is the first
            // option in the options array. This behaviour copies the behaviour
            // of the native `<select>` HTML element.
            this.selection = _.findWhere(this.options.options, { selected: true }) || this.options.options[0];

        } else {

            this.selection = this.options.options[this.options.selected];
        }
    },

    render: function() {

        this.$el.empty();
        this.$selection = null;

        this.renderSelection(this.selection);

        if (this.options.width) {
            this.$el.css('width', this.options.width);
        }

        if (this.options.disabled) {
            this.disable();
        }

        this.$el.append(this.$options);

        return this;
    },

    renderOptions: function() {

        this.removeOptions();

        var options = {
            selectBoxView: this,
            parentClassName: _.result(this, 'className') || null,
            extraClassName: _.result(this.options, 'selectBoxOptionsClass') || null,
            options: this.options.options
        };

        if (this.options.width) {
            options.width = this.options.width;
        }

        this.optionsView = new this.constructor.OptionsView(options);
        this.optionsView.render();
        this.listenTo(this.optionsView, 'option:select', this.onOptionSelect);
        this.listenTo(this.optionsView, 'option:hover', this.onOptionHover);
        this.listenTo(this.optionsView, 'options:mouseout', this.onOptionsMouseOut);
        this.$options = this.optionsView.$el;
        this.$optionsArrow = this.optionsView.$arrow;
        this.$target = $(this.options.target);
    },

    onOptionHover: function(option, idx) {

        this.trigger('option:hover', option, idx);
    },

    onOptionsMouseOut: function(evt) {

        this.trigger('options:mouseout', evt);
    },

    onOptionSelect: function(idx, opt) {

        this.select(idx, opt);
    },

    removeOptions: function() {

        if (this.optionsView) {
            this.stopListening(this.optionsView);
            this.optionsView.remove();
            this.optionsView = null;
        }
    },

    renderSelection: function(option) {

        if (!this.$selection) {
            this.$selection = $('<div/>', { 'class': 'select-box-selection' });
            this.$el.append(this.$selection);
        }

        this.$selection.empty();

        if (option) {

            var $option = this.constructor.OptionsView.prototype.renderOptionContent.call(undefined, option);
            this.$selection.append($option);

        } else if (this.options.placeholder) {

            var $placeholder = $('<div/>', { 'class': 'select-box-placeholder', html: this.options.placeholder });
            this.$selection.append($placeholder);
        }
    },

    onToggle: function(evt) {

        this.toggle();
    },

    onOutsideClick: function(evt) {

        // Check the clicked element is really outside our select box.
        if (!this.el.contains(evt.target) && this.$el.hasClass('opened')) {
            this.close();
        }
    },

    getSelection: function() {

        return this.selection;
    },

    getSelectionValue: function(selection) {

        selection = selection || this.selection;

        return selection && (_.isUndefined(selection.value) ? selection.content : selection.value);
    },

    getSelectionIndex: function() {

        return _.findIndex(this.options.options, this.selection);
    },

    select: function(idx, opt) {

        this.selection = this.options.options[idx];
        this.renderSelection(this.selection);
        this.trigger('option:select', this.selection, idx, opt);
        this.close();
    },

    selectByValue: function(value, opt) {

        var options = this.options.options || [];
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            if (_.isUndefined(option.value) && option.content === value) {
                return this.select(i, opt);
            } else if (!_.isUndefined(option.value) && _.isEqual(option.value, value)) {
                return this.select(i, opt);
            }
        }
    },

    isOpen: function() {

        return this.$el.hasClass('opened');
    },

    toggle: function() {

        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    },

    position: function() {

        var $selection = this.$('.select-box-selection');

        var selectionHeight = $selection.outerHeight();
        var selectionOffset = $selection.offset();
        var selectionLeft = selectionOffset.left;
        var selectionTop = selectionOffset.top;

        var optionsHeight = this.$options.outerHeight();

        var targetBBox = { left: 0, top: 0 };

        if (this.options.target !== document.body) {

            targetBBox = this.$target.offset();

            targetBBox.width = this.$target.outerWidth();
            targetBBox.height = this.$target.outerHeight();
            targetBBox.left -= this.$target.scrollLeft();
            targetBBox.top -= this.$target.scrollTop();
        } else {

            targetBBox.width = $(window).width();
            targetBBox.height = $(window).height();
        }

        var left = selectionLeft;
        var top = 'auto';
        var openPolicy = this.options.openPolicy;

        // For a selected open policy and no selection, we fallback to the
        // 'auto' open policy. This is because we don't know the position of the
        // selected option as there is no.
        if (openPolicy === 'selected' && !this.selection) {
            openPolicy = 'auto';
        }

        switch (openPolicy) {
            case 'above':
                top = selectionTop - optionsHeight;
                break;
            case 'coverAbove':
                top = selectionTop - optionsHeight + selectionHeight;
                break;
            case 'below':
                top = selectionTop + selectionHeight;
                break;
            case 'coverBelow': // default
                top = selectionTop;
                break;
            case 'selected':
                var selectedOptionPosition = this.$options.find('.selected').position();
                top = selectionTop - selectedOptionPosition.top;
                break;
            default: // 'auto'
                // It's like coverBelow but it tries to find the best spot. If the
                // select box does not fit to the screen (goes below the screen edge),
                // display it as coverAbove.

                var isOptionsOverBottomEdge = (selectionTop - this.$target.scrollTop() + optionsHeight > targetBBox.top + targetBBox.height);
                top = isOptionsOverBottomEdge ? selectionTop - optionsHeight + selectionHeight : selectionTop;

                break;
        }

        // Position relative to target element
        left -= targetBBox.left;
        top -= targetBBox.top;

        this.$options.css({ left: left, top: top });
    },

    open: function() {

        if (this.isDisabled()) return;
        this.renderOptions();
        this.$options.appendTo(this.options.target);
        this.$options.addClass('rendered');
        this.position();
        this.$el.addClass('opened');
        this.respectWindowBoundaries();
        this.alignOptionsArrow();
    },

    respectWindowBoundaries: function() {

        var overflow = this.calculateElOverflow(this.$options);
        var increment = {
            left: 0,
            top: 0
        };

        if (this.$options.outerWidth() <= this.$target.innerWidth()) {

            // Only adjust for left/right overflow if options element fits within target element.

            if (overflow.left && overflow.right) {
                // Do nothing if overflowing both the left and right.
            } else if (overflow.left) {
                increment.left = overflow.left;
            } else if (overflow.right) {
                increment.left = -overflow.right;
            }
        }

        if (this.$options.outerHeight() <= this.$target.innerHeight()) {

            // Only adjust for top/bottom overflow if options element fits within target element.

            if (overflow.top && overflow.bottom) {
                // Do nothing if overflowing both the top and bottom.
            } else if (overflow.top) {
                increment.top = overflow.top;
            } else if (overflow.bottom) {
                increment.top = -overflow.bottom;
            }
        }

        this.$options.css({
            left: '+=' + increment.left,
            top: '+=' + increment.top
        });
    },

    alignOptionsArrow: function() {

        var elBBox = this.$el[0].getBoundingClientRect();
        var optionsBBox = this.$options[0].getBoundingClientRect();
        var newLeft = elBBox.left + (elBBox.width / 2);

        newLeft -= optionsBBox.left;
        newLeft -= this.$optionsArrow.outerWidth() / 2;

        this.$optionsArrow.css({
            left: newLeft
        });
    },

    close: function() {

        this.removeOptions();
        this.$el.removeClass('opened');

        this.trigger('close');
    },

    onRemove: function() {

        this.removeOptions();
        $(document).off('.selectBox', this.onOutsideClick);
    },

    isDisabled: function() {

        return this.$el.hasClass('disabled');
    },

    enable: function() {

        this.$el.removeClass('disabled');
    },

    disable: function() {

        this.close();
        this.$el.addClass('disabled');
    },

    onSetTheme: function(oldTheme, newTheme) {

        if (this.$options) {

            if (oldTheme) {
                this.$options.removeClass(this.themeClassNamePrefix + oldTheme);
            }

            this.$options.addClass(this.themeClassNamePrefix + newTheme);
        }
    },

    /*
        Calculate the number of pixels an element is overflowing the target container.
    */
    calculateElOverflow: function(el, target) {

        if (!target) {
            target = window;
        }

        if (el instanceof jQuery) {
            el = el[0];
        }

        if (target instanceof jQuery) {
            target = target[0];
        }

        var overflow = {};
        var elBBox = el.getBoundingClientRect();
        var targetBBox;

        if (target === window) {

            // Window doesn't have getBoundingClientRect method.

            var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

            targetBBox = {
                width: windowWidth,
                height: windowHeight,
                left: 0,
                top: 0,
                right: windowWidth,
                bottom: windowHeight
            };

        } else {
            targetBBox = target.getBoundingClientRect();
        }

        _.each(['left', 'top'], function(side) {
            overflow[side] = Math.min(0, elBBox[side] - targetBBox[side]);
        });

        _.each(['right', 'bottom'], function(side) {
            overflow[side] = Math.min(0, targetBBox[side] - elBBox[side]);
        });

        _.each(overflow, function(value, key) {
            overflow[key] = Math.abs(Math.round(value));
        });

        return overflow;
    }

}, {

    // Statics

    OptionsView: joint.mvc.View.extend({

        events: {
            'mouseover .select-box-option': 'onOptionHover',
            'click .select-box-option': 'onOptionClick'
        },

        className: function() {

            var classNames = ['select-box-options'];
            var parentClassName = this.options.parentClassName;

            if (parentClassName) {
                classNames.push(parentClassName);
            }

            return classNames.join(' ');
        },

        init: function() {

            _.bindAll(this, 'onMouseout', 'onKeydown');

            $(document).on({
                'keydown.selectBoxOptions': this.onKeydown,
                'mouseleave.selectBoxOptions mouseout.selectBoxOptions': this.onMouseout
            });
        },

        render: function() {

            var extraClassName = this.options.extraClassName;
            if (extraClassName) {
                this.$el.addClass(extraClassName);
            }

            if (this.options.width) {
                this.$el.css('width', this.options.width);
            }

            _.each(this.options.options, function(option, idx) {

                var $option = this.renderOption(option, idx);

                if (this.options.selectBoxView.selection === option) {
                    $option.addClass('selected hover');
                }

                this.$el.append($option);

            }, this);

            this.$arrow = $('<div/>').addClass('select-box-options-arrow').appendTo(this.$el);

            return this;
        },

        renderOption: function(option, idx) {

            var $option = this.renderOptionContent(option);
            $option.addClass('select-box-option');
            $option.data('index', idx);
            return $option;
        },

        renderOptionContent: function(option) {

            var $option = $('<div/>', { 'class': 'select-box-option-content', html: option.content });

            if (option.icon) {
                $option.prepend($('<img/>', {
                    'class': 'select-box-option-icon',
                    src: option.icon
                }));
            }

            return $option;
        },

        select: function(idx, opt) {

            this.trigger('option:select', idx, opt);
        },

        hover: function(idx) {

            var option = this.options.options[idx];
            this.markOptionHover(idx);
            this.trigger('option:hover', option, idx);
        },

        onOptionClick: function(evt) {

            var idx = this.getOptionIndex(evt.target);
            this.select(idx, { ui: true });
        },

        onOptionHover: function(evt) {

            var idx = this.getOptionIndex(evt.target);
            this.hover(idx);
        },

        onMouseout: function(evt) {

            this.trigger('options:mouseout', evt);
        },

        onKeydown: function(evt) {

            var selectBoxView = this.options.selectBoxView;

            if (!selectBoxView.options.keyboardNavigation) return;
            if (!selectBoxView.isOpen()) return;

            var dir;

            switch (evt.which) {

                case 39:    // right
                case 40:    // down
                    dir = 1;
                    break;
                case 38:    // up
                case 37:    // left
                    dir = -1;
                    break;
                case 13:    // enter
                    var hoverIndex = this.getOptionHoverIndex();
                    // `hoverIndex === -1` means no option has been hovered yet.
                    if (hoverIndex >= 0) {
                        this.select(hoverIndex);
                    }
                    return;
                case 27:    // esc
                    return this.close();
                default:
                    return; // noop; Unsupported key.
            }

            // Prevent page scrolling.
            evt.preventDefault();

            var idx = this.getOptionHoverIndex();
            var nextIdx = idx + dir;
            var options = this.options.options;

            // Normalize and cycle if necessary.
            if (nextIdx < 0) { nextIdx = options.length - 1; }
            if (nextIdx >= options.length) { nextIdx = 0; }

            this.hover(nextIdx);
        },

        onRemove: function() {

            $(document).off('.selectBoxOptions');
        },

        markOptionHover: function(idx) {

            this.$el.find('.hover').removeClass('hover');
            $(this.$el.find('.select-box-option')[idx]).addClass('hover');
        },

        getOptionHoverIndex: function() {

            return this.$el.find('.select-box-option.hover').index();
        },

        getOptionIndex: function(el) {

            return $(el).closest('.select-box-option').data('index');
        }
    })
});
