/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


joint.ui.SelectButtonGroup = joint.mvc.View.extend({

    className: 'select-button-group',

    events: {
        'click .select-button-group-button': 'onSelect',
        'mouseover .select-button-group-button': 'onOptionHover',
        'mouseleave': 'onMouseOut'
    },

    options: {
        buttonWidth: undefined,
        buttonHeight: undefined,
        options: [],
        disabled: false,
        multi: false,   // Are multiple selections allowed?
        selected: undefined  // selected value can either be defined directly in the options array or here as an index to it.
    },

    init: function() {

        _.bindAll(this, 'onSelect');

        this.$el.data('view', this);

        var multi = this.options.multi;

        if (_.isUndefined(this.options.selected)) {

            this.selection = multi ? _.filter(this.options.options, { selected: true }) : _.findWhere(this.options.options, { selected: true });

        } else {

            if (multi) {

                this.selection = _.isArray(this.options.selected) ? _.filter(this.options.options, function(option, idx) {
                    return _.contains(this.options.selected, idx);
                }, this) : [this.options.options[this.options.selected]];

            } else {

                this.selection = this.options.options[this.options.selected];
            }
        }
    },

    render: function() {

        this.renderOptions(this.selection);

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

        var multi = this.options.multi;

        _.each(this.options.options, function(option, idx) {

            var isSelected = (multi ? _.contains(this.selection, option) : this.selection === option);

            var $option = this.renderOption(option, idx, isSelected);
            this.$el.append($option);

            if (isSelected) {

                $option.addClass('selected');
            }
        }, this);
    },

    removeOptions: function() {

        this.$el.empty();
    },

    renderOption: function(option, idx, isSelected) {

        var $option = this.renderOptionContent(option, isSelected);
        $option.data('index', idx);
        var buttonWidth = option.buttonWidth || this.options.buttonWidth;
        if (buttonWidth) {
            $option.css('width', buttonWidth);
        }
        var buttonHeight = option.buttonHeight || this.options.buttonHeight;
        if (buttonHeight) {
            $option.css('height', buttonHeight);
        }
        return $option;
    },

    renderOptionContent: function(option, isSelected) {

        var $option = $('<div/>', { 'class': 'select-button-group-button', html: option.content });
        if (option.icon || (isSelected && option.iconSelected)) {
            var $icon = $('<img/>', {
                'class': 'select-button-group-button-icon',
                src: isSelected && option.iconSelected ? option.iconSelected : option.icon
            });
            var iconWidth = option.iconWidth || this.options.iconWidth;
            if (iconWidth) {
                $icon.css('width', iconWidth);
            }
            var iconHeight = option.iconHeight || this.options.iconHeight;
            if (iconHeight) {
                $icon.css('height', iconHeight);
            }
            $option.prepend($icon);
        }
        // `option.attrs` allows for setting arbitrary attributes on the generated HTML.
        // This object is of the form: `<selector> : { <attributeName> : <attributeValue>, ... }`
        joint.util.setAttributesBySelector($option, option.attrs);

        return $option;
    },

    getOptionIndex: function(el) {

        return $(el).closest('.select-button-group-button').data('index');
    },

    onSelect: function(evt) {

        if (this.isDisabled()) return;
        var idx = this.getOptionIndex(evt.target);
        this.select(idx, { ui: true });
    },

    onOptionHover: function(evt) {

        if (this.isDisabled()) return;
        var idx = this.getOptionIndex(evt.target);
        this.trigger('option:hover', this.options.options[idx], idx);
    },

    onMouseOut: function(evt) {

        if (this.isDisabled()) return;
        this.trigger('mouseout', evt);
    },

    getSelection: function() {

        return this.selection;
    },

    getSelectionValue: function(selection) {

        selection = selection || this.selection;

        if (!selection) return undefined;

        if (this.options.multi) {
            return _.map(selection, function(option) {
                return _.isUndefined(option.value) ? option.content : option.value;
            });
        }
        return _.isUndefined(selection.value) ? selection.content : selection.value;
    },

    select: function(index, opt) {

        var option = this.options.options[index];
        var $option = $(this.$('.select-button-group-button')[index]);
        var multi = this.options.multi;

        if (multi) {

            $option.toggleClass('selected');
            var isSelected = $option.hasClass('selected');

            if (isSelected) {

                if (this.selection.indexOf(option) === -1) {
                    this.selection.push(option);
                }

            } else {

                this.selection = _.without(this.selection, option);
            }

            if (option.iconSelected) {

                $option.find('.select-button-group-button-icon').attr('src', isSelected ? option.iconSelected : option.icon);
            }

        } else {

            this.selection = option;
            var $prevSelected = this.$('.selected');
            var prevSelection = this.options.options[$prevSelected.index()];
            $prevSelected.removeClass('selected');
            $option.addClass('selected');

            if (prevSelection && prevSelection.iconSelected) {
                $prevSelected.find('.select-button-group-button-icon').attr('src', prevSelection.icon);
            }
            if (this.selection.iconSelected) {
                $option.find('.select-button-group-button-icon').attr('src', this.selection.iconSelected);
            }
        }

        this.trigger('option:select', this.selection, index, opt);
    },

    selectByValue: function(value, opt) {

        if (!_.isArray(value)) {
            value = [value];
        }

        var options = this.options.options || [];
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            if (_.isUndefined(option.value) && _.contains(value, option.content)) {
                this.select(i, opt);
            } else if (!_.isUndefined(option.value) && _.contains(value, option.value)) {
                this.select(i, opt);
            }
        }
    },

    deselect: function() {

        this.$('.selected').removeClass('selected');
        if (this.options.multi) {
            this.selection = [];
        } else {
            this.selection = undefined;
        }
    },

    isDisabled: function() {

        return this.$el.hasClass('disabled');
    },

    enable: function() {

        this.$el.removeClass('disabled');
    },

    disable: function() {

        this.$el.addClass('disabled');
    }

});
