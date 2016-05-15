/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


joint.ui.SelectBox = joint.mvc.View.extend({

    className: 'select-box',

    events: {
        'click .select-box-selection': 'onToggle',
        'click .select-box-option': 'onSelect'
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

        _.bindAll(this, 'onOutsideClick', 'onOptionHover', 'onSelect', 'onKeydown', 'onOptionsMouseOut');

        $(document).on('click.selectBox', this.onOutsideClick);

        if (this.options.keyboardNavigation) {

            $(document).on('keydown.selectBox', this.onKeydown);
        }

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

        this.$options = $('<div/>', {
            'class': [
                this.className,
                'select-box-options'
            ].join(' ')
        });
        this.$options.addClass(this.options.selectBoxOptionsClass);
        this.$options.on('click.selectBox', '.select-box-option', this.onSelect);
        this.$options.on('mouseover.selectBox', '.select-box-option', this.onOptionHover);
        this.$options.on('mouseleave.selectBox', this.onOptionsMouseOut);

        if (this.options.width) {
            this.$options.css('width', this.options.width);
        }

        _.each(this.options.options, function(option, idx) {

            var $option = this.renderOption(option, idx);
            this.$options.append($option);

            if (this.selection === option) {

                $option.addClass('selected hover');
            }
        }, this);

        this.$target = $(this.options.target);
    },

    removeOptions: function() {

        if (this.$options) this.$options.remove();
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

    renderSelection: function(option) {

        if (!this.$selection) {
            this.$selection = $('<div/>', { 'class': 'select-box-selection' });
            this.$el.append(this.$selection);
        }
        this.$selection.empty();
        if (option) {
            var $option = this.renderOptionContent(option);
            this.$selection.append($option);

        } else if (this.options.placeholder) {
            var $placeholder = $('<div/>', { 'class': 'select-box-placeholder', html: this.options.placeholder });
            this.$selection.append($placeholder);
        }
    },

    getOptionIndex: function(el) {

        return $(el).closest('.select-box-option').data('index');
    },

    onSelect: function(evt) {

        var idx = this.getOptionIndex(evt.target);
        this.select(idx, { ui: true });
    },

    onToggle: function(evt) {

        this.toggle();
    },

    markOptionHover: function(idx) {

        this.$options.find('.hover').removeClass('hover');
        $(this.$options.find('.select-box-option')[idx]).addClass('hover');
    },

    onOptionHover: function(evt) {

        var idx = this.getOptionIndex(evt.target);
        this.markOptionHover(idx);
        this.trigger('option:hover', this.options.options[idx], idx);
    },

    onOutsideClick: function(evt) {

        // Check the clicked element is really outside our select box.
        if (!this.el.contains(evt.target) && this.$el.hasClass('opened')) {
            this.close();
        }
    },

    onOptionsMouseOut: function(evt) {

        this.trigger('options:mouseout', evt);
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

    getOptionHoverIndex: function() {

        return this.$options.find('.select-box-option.hover').index();
    },

    select: function(index, opt) {

        this.selection = this.options.options[index];
        this.renderSelection(this.selection);
        this.trigger('option:select', this.selection, index, opt);
        this.close();
    },

    selectByValue: function(value, opt) {

        var options = this.options.options || [];
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            if (_.isUndefined(option.value) && option.content === value) {
                return this.select(i, opt);
            } else if (!_.isUndefined(option.value) && option.value === value) {
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
        this.position();
        this.$el.addClass('opened');
    },

    close: function() {

        this.removeOptions();
        this.$el.removeClass('opened');
        this.trigger('close');
    },

    onRemove: function() {

        this.removeOptions();
        $(document).off('.selectBox', this.onOutsideClick);
        if (this.options.keyboardNavigation) {
            $(document).off('.selectBox', this.onKeydown);
        }
    },

    onKeydown: function(evt) {

        if (this.isOpen()) {

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

            this.markOptionHover(nextIdx);
            this.trigger('option:hover', this.options.options[nextIdx], nextIdx);
        }
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
    }
});
