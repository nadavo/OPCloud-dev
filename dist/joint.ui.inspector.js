/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// Inspector plugin.
// -----------------

// This plugin creates a two-way data-binding between the cell model and a generated
// HTML form with input fields of a type declaratively specified in an options object passed
// into the element inspector.

/*
USAGE:

var inspector = new joint.ui.Inspector({
    cellView: cellView,
    inputs: {
            attrs: {
                text: {
                    'font-size': { type: 'number', min: 5, max: 80, group: 'text', index: 2 },
                    'text': { type: 'textarea', group: 'text', index: 1 }
                }
            },
            position: {
                x: { type: 'number', group: 'geometry', index: 1 },
                y: { type: 'number', group: 'geometry', index: 2 }
            },
            size: {
                width: { type: 'number', min: 1, max: 500, group: 'geometry', index: 3 },
                height: { type: 'number', min: 1, max: 500, group: 'geometry', index: 4 }
            },
            mydata: {
                foo: { type: 'textarea', group: 'data' }
            }
   },
   groups: {
           text: { label: 'Text', index: 1 },
           geometry: { label: 'Geometry', index: 2, closed: true },
           data: { label: 'data', index: 3 }
   }
});

$('.inspector-container').append(inspector.render().el);
*/

(function(joint) {
    'use strict';

    joint.ui.Inspector = joint.mvc.View.extend({

        className: 'inspector',

        options: {
            cellView: undefined,    // One can pass either a cell view ...
            cell: undefined,        // ... or the cell itself.
            live: true,      // By default, we enabled live changes from the inspector inputs.
            validateInput: function(input, path, type) {
                return input.validity ? input.validity.valid : true;
            },
            renderFieldContent: undefined, // function(options, path, value) { return html }
            // Custom operators can be defined here as `function(cell, value, argument*) { return boolean; }`
            // e.g. { longerThan: function (cell, value, prop) { return value.length > cell.prop(prop); }}
            operators: {},
            multiOpenGroups: true,   // `true` if the Inspector is supposed to allow multiple open groups at the same time. Set to `false` for classical accordion.

            /**
             * Used for logic of store/restore currently opened/stored groups.
             * @params {joint.dia.Cell} model
             * @returns {string}
             * */
            stateKey: function(model) {
                return model.id;
            }
        },

        events: {
            // Custom fields need to call updateCell() explicitely
            'change [data-attribute]:not([data-custom-field])': 'onChangeInput',
            'click .group-label': 'onGroupLabelClick',
            'click .btn-list-add': 'addListItem',
            'click .btn-list-del': 'deleteListItem',
            'mousedown': 'pointerdown',
            'touchstart': 'pointerdown',
            'mouseup': 'pointerup',
            'touchend': 'pointerup',
            'focusin' : 'pointerfocusin',
            'focusout' : 'pointerfocusout'
        },

        HTMLEntities: {
            'lt': '<',
            'gt': '>',
            'amp': '&',
            'nbsp': ' ',
            'quot': '"',
            'cent': '¢',
            'pound': '£',
            'euro': '€',
            'yen': '¥',
            'copy': '©',
            'reg': '®'
        },

        init: function() {

            this.options.groups = this.options.groups || {};

            _.bindAll(this, 'stopBatchCommand', 'pointerup', 'onContentEditableBlur', 'replaceHTMLEntity');

            // Start a batch command on `mousedown` over the inspector and stop it when the mouse is
            // released anywhere in the document. This prevents setting attributes in tiny steps
            // when e.g. a value is being adjusted through a slider. This gives other parts
            // of the application a chance to treat the serveral little changes as one change.
            // Consider e.g. the CommandManager plugin.
            $(document).on('mouseup', this.stopBatchCommand);

            // List of built-in widgets (references to their views). This allows
            // us to clean up the views (call `remove()` method on them) whenever the
            // inspector need to re-render.
            this.widgets = [];

            // Flatten the `inputs` object until the level where the options object is.
            // This produces an object with this structure: { <path>: <options> }, e.g. { 'attrs/rect/fill': { type: 'color' } }
            this.flatAttributes = joint.util.flattenObject(this.options.inputs, '/', function(obj) {
                // Stop flattening when we reach an object that contains the `type` property. We assume
                // that this is our options object. @TODO This is not very robust as there could
                // possibly be another object with a property `type`. Instead, we should stop
                // just before the nested leaf object.
                return obj.type;
            });

            // `_when` object maps path to a set of conditions (either `eq` or `regex`).
            // When an input under the path changes to
            // the value that equals all the `eq` values or matches all the `regex` regular expressions,
            // the inspector rerenders itself and this time includes all the
            // inputs that met the conditions.
            this._when = {};

            // `_bound` object maps a slave path to a master path (A slave is using master's data).
            // When an input under the master path changes, the inspector rerenders the input under the
            // slave path
            this._bound = {};

            // Add the attributes path the options object as we're converting the flat object to an array
            // and so we would loose the keys otherwise.
            var attributesArray = _.map(this.flatAttributes, function(options, path) {

                if (options.when) {

                    var dependant = { expression: options.when, path: path };

                    _.each(this.extractExpressionPaths(dependant.expression), function(condPath) {
                        (this._when[condPath] || (this._when[condPath] = [])).push(dependant);
                    }, this);
                }

                // If the option type is 'select' and its options needs resolving (is defined by path)
                // we bind the select (slave) and the input under the path (master) together.
                if (options.type == 'select' && _.isString(options.options)) {
                    // slave : master
                    this._bound[path] = options.options;
                }

                options.path = path;
                return options;

            }, this);

            // Sort the flat attributes object by two criteria: group first, then index inside that group.
            // As underscore 'sortBy' is a stable sort algorithm we can sort by index first and then
            // by group again.
            this.groupedFlatAttributes = _.sortBy(_.sortBy(attributesArray, 'index'), function(options) {
                var groupOptions = this.options.groups[options.group];
                return (groupOptions && groupOptions.index) || Number.MAX_VALUE;
            }, this);

            // Cache all the attributes (inputs, lists and objects) with every change to the DOM tree.
            // Chache it by its path.
            this.on('render', function() {

                var byPath = {};

                _.each(this.$('[data-attribute]'), function(attribute) {
                    var $attribute = $(attribute);
                    var path = $attribute.attr('data-attribute');
                    byPath[path] = $attribute;
                }, this);

                this._byPath = byPath;
                this._attributeKeysInUse = this.getAttributeKeysInUse();

                // If a group fields are all hidden mark the group with 'empty' class name.
                _.each(this.$groups, function(group) {
                    var $group = $(group);
                    var isGroupEmpty = $group.find('> .field:not(.hidden)').length === 0;
                    $group.toggleClass('empty', isGroupEmpty);
                });

            }, this);

            // Listen on events on the cell.
            this.listenTo(this.getModel(), 'all', this.onCellChange, this);
        },

        getModel: function() {
            return this.options.cell || this.options.cellView.model;
        },

        onCellChange: function(eventName, cell, change, opt) {

            opt = opt || {};

            // Do not react on changes that happened inside this inspector. This would
            // cause a re-render of the same inspector triggered by an input change in this inspector.
            if (opt.inspector == this.cid) return;

            // Note that special care is taken for all the transformation attribute changes
            // (`position`, `size` and `angle`). See below for details.

            switch (eventName) {

                case 'remove':
                    // Make sure the element inspector gets removed when the cell is removed from the graph.
                    // Otherwise, a zombie cell could possibly be updated.
                    this.remove();
                    break;
                case 'change:position':
                    // Make a special case for `position` as this one is performance critical.
                    // There is no need to rerender the whole inspector but only update the position input.
                    this.updateInputPosition();
                    break;
                case 'change:size':
                    // Make a special case also for the `size` attribute for the same reasons as for `position`.
                    this.updateInputSize();
                    break;
                case 'change:angle':
                    // Make a special case also for the `angle` attribute for the same reasons as for `position`.
                    this.updateInputAngle();
                    break;
                case 'change:source':
                case 'change:target':
                case 'change:vertices':
                    // Make a special case also for the 'source' and 'target' of a link for the same reasons
                    // as for 'position'. We don't expect source or target to be configurable.
                    // That's why we do nothing here.
                    break;
                default:
                    // Re-render only on specific attributes changes. These are all events that starts with `'change:'`.
                    // Otherwise, the re-render would be called unnecessarily (consider generic `'change'` event, `'bach:start'`, ...).
                    var changeAttributeEvent = 'change:';
                    if (eventName.slice(0, changeAttributeEvent.length) === changeAttributeEvent) {
                        // re-render the inspector only if the changed atrribute is displayed by the inspector
                        var attributeKey = eventName.slice(changeAttributeEvent.length);
                        if (_.contains(this._attributeKeysInUse, attributeKey)) {
                            this.render();
                        }
                    }
                    break;
            }
        },

        render: function() {

            this.$el.empty();
            this.removeWidgets();

            var lastGroup;
            var $groups = [];
            var $group;

            _.each(this.groupedFlatAttributes, function(options) {

                if (lastGroup !== options.group) {
                    // A new group should be created.

                    var groupOptions = this.options.groups[options.group];

                    $group = this.renderGroup({
                        name: options.group,
                        label: groupOptions && groupOptions.label
                    });

                    if (groupOptions && groupOptions.closed) {
                        this.closeGroup($group, { init: true });
                    } else {
                        this.openGroup($group, { init: true });
                    }

                    $groups.push($group);
                }
                this.renderTemplate($group, options, options.path);

                lastGroup = options.group;

            }, this);

            // cache groups
            this.$groups = $groups;

            this.$el.append($groups);

            this.trigger('render');

            return this;
        },

        getAttributeKeysInUse: function() {

            // all attributes used explicitely in the `inputs` definition
            var inputsAttributeKeys =  _.map(this._byPath, function(value, path) {
                return path.substring(0, path.indexOf('/')) || path;
            });

            // all attributes that are bound by the selection `options` reference
            var boundedAttributeKeys =  _.values(this._bound);

            // all attributes that are part of the `when` expression
            var dependantAttributeKeys =  _.keys(this._when);

            return _.uniq([].concat(inputsAttributeKeys, boundedAttributeKeys, dependantAttributeKeys));
        },

        // Get the value of the attribute at `path` based on the `options.defaultValue`,
        // and `options.valueRegExp` if present.
        getCellAttributeValue: function(path, options) {

            var cell = this.getModel();
            var value = joint.util.getByPath(cell.attributes, path, '/');

            options = options || this.flatAttributes[path];
            if (!options) return value;

            if (_.isUndefined(value) && !_.isUndefined(options.defaultValue)) {
                value = options.defaultValue;
            }

            if (options.valueRegExp) {

                if (_.isUndefined(value)) {

                    throw new Error('Inspector: defaultValue must be present when valueRegExp is used.');
                }

                var valueMatch = value.match(new RegExp(options.valueRegExp));
                value = valueMatch && valueMatch[2];
            }

            return value;
        },

        resolveBindings: function(options) {

            switch (options.type) {

                case 'select': // options['options'] are transformed here to options['items']

                    var items = options.options || [];

                    // resolve items if the options are defined indirectly as a reference to a model property
                    if (_.isString(items)) {

                        items = joint.util.getByPath(this.getModel().attributes, items, '/') || [];
                    }

                    // Check if items array has incorrect format (i.e an array of strings).
                    if (!_.isObject(items[0])) {
                        // Transform each array item into the { value: [value], content: [content] } object.
                        items = _.map(items, function(item) {
                            return { value: item, content: item };
                        });
                    }

                    // export result as 'items'
                    options.items = items;

                    break;
            }
        },

        updateBindings: function(path) {

            // Find all inputs which are bound to the current input (i.e find all slaves).
            var slaves = _.reduce(this._bound, function(result, master, slave) {

                // Does the current input path starts with a master path?
                if (path.indexOf(master) == 0) result.push(slave);

                return result;

            }, []);

            if (!_.isEmpty(slaves)) {

                // Re-render all slave inputs
                _.each(slaves, function(slave) {
                    this.renderTemplate(null, this.flatAttributes[slave], slave, { replace: true });
                }, this);

                this.trigger('render');
            }
        },

        renderFieldContent: function(options, path, value) {

            var fieldHtml;

            // Give the outside world a chance to render the field.
            // It is the responsibility of the programmer to call `updateCell()` whenever the custom field changes value.
            if (_.isFunction(this.options.renderFieldContent)) {

                fieldHtml = this.options.renderFieldContent(options, path, value);
                if (fieldHtml) {
                    return $(fieldHtml).attr({
                        'data-attribute': path,
                        'data-type': options.type,
                        'data-custom-field': true
                    });
                }
            }

            var widget;
            var selectedIndex;
            var originalSelection;
            var $label;

            // Note that widgets might also have special ways of reporting changed values.
            switch (options.type) {

                case 'select-box':
                    selectedIndex = _.findIndex(options.options, function(option) {
                        if (_.isUndefined(option.value) && option.content === value) return true;
                        if (_.isEqual(option.value, value)) return true;
                        return false;
                    });
                    var selectBoxOptions = _.extend({}, _.omit(options, 'type', 'group', 'index', 'selectBoxOptionsClass'), {
                        selected: selectedIndex,
                        // add special class name on select-box options that originates from the inspector
                        selectBoxOptionsClass: _.compact([
                            joint.util.addClassNamePrefix('inspector-select-box-options'),
                            options.selectBoxOptionsClass
                        ]).join(' ')
                    });
                    widget = new joint.ui.SelectBox(selectBoxOptions);
                    widget.$el.attr({
                        'data-attribute': path,
                        'data-type': options.type
                    });
                    widget.render();
                    $label = $('<label/>', { html: options.label || path });
                    fieldHtml = $('<div/>').append($label, widget.el);

                    // In `previewMode`, cell gets updated when the user hovers
                    // over the options in the select box. However, the final
                    // value is reset only when the user selects an option.
                    if (options.previewMode) {

                        originalSelection = widget.selection;

                        widget.on('options:mouseout close', function() {
                            widget.selection = originalSelection;
                            this.processInput(widget.$el, { previewCancel: true, dry: true });
                        }, this);

                        widget.on('option:hover', function(option, index) {
                            widget.selection = option;
                            // Update the cell in `dry` run. `dry` run gives hint to the
                            // outside application that even though the model updated,
                            // we don't have to e.g. store the change into DB.
                            this.processInput(widget.$el, { dry: true });
                        }, this);

                        widget.on('option:select', function(option, index) {
                            var originalValue = _.isUndefined(originalSelection) ? undefined : widget.getSelectionValue(originalSelection);
                            var newValue = widget.getSelectionValue(option);
                            // If the original value equals the new value, run the update
                            // in `dry` mode as there is no need to tell the outside application
                            // that the model has changed (and possibly needs to be updated in e.g. a DB).
                            var dry = originalValue === newValue;
                            // `previewDone` is only used internally inside ui.Inspector
                            // to tell the `setProperty()` method that it should trigger
                            // a change event.
                            this.processInput(widget.$el, {
                                previewDone: true,
                                dry: dry,
                                originalValue: originalValue
                            });
                            originalSelection = option;
                        }, this);

                    } else {

                        widget.on('option:select', function(option, index) {
                            this.processInput(widget.$el);
                        }, this);
                    }

                    this.widgets.push(widget);
                    break;

                case 'color-palette':
                    selectedIndex = _.findIndex(options.options, function(option) {
                        if (option.value === value) return true;
                        if (_.isUndefined(option.value) && option.content === value) return true;
                        return false;
                    });
                    widget = new joint.ui.ColorPalette(_.extend({}, _.omit(options, 'type', 'group', 'index'), { selected: selectedIndex }));
                    widget.$el.attr({
                        'data-attribute': path,
                        'data-type': options.type
                    });
                    widget.render();
                    $label = $('<label/>', { html: options.label || path });
                    fieldHtml = $('<div/>').append($label, widget.el);

                    // In `previewMode`, cell gets updated when the user hovers
                    // over the options in the color palette. However, the final
                    // value is reset only when the user selects an option.
                    if (options.previewMode) {

                        originalSelection = widget.selection;

                        widget.on('options:mouseout close', function() {
                            widget.selection = originalSelection;
                            this.processInput(widget.$el, { previewCancel: true, dry: true });
                        }, this);

                        widget.on('option:hover', function(option, index) {
                            widget.selection = option;
                            this.processInput(widget.$el, { dry: true });
                        }, this);

                        widget.on('option:select', function(option, index) {
                            var originalValue = _.isUndefined(originalSelection) ? undefined : widget.getSelectionValue(originalSelection);
                            var newValue = widget.getSelectionValue(option);
                            // If the original value equals the new value, run the update
                            // in `dry` mode as there is no need to tell the outside application
                            // that the model has changed (and possibly needs to be updated in e.g. a DB).
                            var dry = originalValue === newValue;
                            // `previewDone` is only used internally inside ui.Inspector
                            // to tell the `setProperty()` method that it should trigger
                            // a change event.
                            this.processInput(widget.$el, {
                                previewDone: true,
                                dry: dry,
                                originalValue: originalValue
                            });
                            originalSelection = option;
                        }, this);

                    } else {

                        widget.on('option:select', function(option, index) {
                            this.processInput(widget.$el);
                        }, this);
                    }

                    this.widgets.push(widget);
                    break;

                case 'select-button-group':
                    if (options.multi) {
                        selectedIndex = [];
                        _.each(options.options, function(option, idx) {
                            var val1 = _.isUndefined(option.value) ? option.content : option.value;
                            var containsOption = _.find(value, function(val2) {
                                return _.isEqual(val1, val2);
                            });
                            if (containsOption) {
                                selectedIndex.push(idx);
                            }
                        });
                    } else {
                        selectedIndex = _.findIndex(options.options, function(option) {
                            if (_.isEqual(option.value, value)) return true;
                            if (_.isUndefined(option.value) && option.content === value) return true;
                            return false;
                        });
                    }
                    widget = new joint.ui.SelectButtonGroup(_.extend({}, _.omit(options, 'type', 'group', 'index'), { selected: selectedIndex }));
                    widget.$el.attr({
                        'data-attribute': path,
                        'data-type': options.type
                    });
                    widget.render();
                    $label = $('<label/>', { html: options.label || path });
                    fieldHtml = $('<div/>').append($label, widget.el);

                    // In `previewMode`, cell gets updated when the user hovers
                    // over the options in the color palette. However, the final
                    // value is reset only when the user selects an option.
                    if (options.previewMode) {

                        originalSelection = widget.selection;

                        widget.on('mouseout', function() {
                            widget.selection = originalSelection;
                            this.processInput(widget.$el, { previewCancel: true, dry: true });
                        }, this);

                        widget.on('option:hover', function(option, index) {
                            if (options.multi) {
                                widget.selection = _.uniq(widget.selection.concat([option]));
                            } else {
                                widget.selection = option;
                            }
                            this.processInput(widget.$el, { dry: true });
                        }, this);

                        widget.on('option:select', function(selection, index) {
                            var originalValue = _.isUndefined(originalSelection) ? undefined : widget.getSelectionValue(originalSelection);
                            var newValue = widget.getSelectionValue(selection);
                            // If the original value equals the new value, run the update
                            // in `dry` mode as there is no need to tell the outside application
                            // that the model has changed (and possibly needs to be updated in e.g. a DB).

                            var dry = _.isEqual(originalValue, newValue);
                            // `previewDone` is only used internally inside ui.Inspector
                            // to tell the `setProperty()` method that it should trigger
                            // a change event.
                            this.processInput(widget.$el, {
                                previewDone: true,
                                dry: dry,
                                originalValue: originalValue
                            });
                            originalSelection = selection;
                        }, this);

                    } else {

                        widget.on('option:select', function(option, index) {
                            this.processInput(widget.$el);
                        }, this);
                    }

                    this.widgets.push(widget);
                    break;

                default:
                    fieldHtml = this.renderOwnFieldContent({
                        options: options,
                        type: options.type,
                        label: options.label || path,
                        attribute: path,
                        value: value
                    });
            }

            return fieldHtml;
        },

        renderGroup: function(opt) {

            opt = opt || {};

            var $group = $('<div/>')
                .addClass('group')
                .attr('data-name', opt.name);

            var $label = $('<h3/>')
                .addClass('group-label')
                .text(opt.label || opt.name);

            return $group.append($label);
        },

        renderOwnFieldContent: function(opt) {

            var content, $input, $wrapper, $output, $units, $button, $nest, $label;

            $label = $('<label/>').text(opt.label);

            switch (opt.type) {

                case 'number':

                    $input = $('<input/>', {
                        type: 'number',
                        min: opt.options.min,
                        max: opt.options.max,
                        step: opt.options.step
                    }).val(opt.value);

                    content = [$label, $('<div/>').addClass('input-wrapper').append($input)];
                    break;

                case 'range':

                    $label.addClass('with-output');
                    $output = $('<output/>').text(opt.value);
                    $units = $('<span/>').addClass('units').text(opt.options.unit);
                    $input = $('<input/>', {
                        type: 'range',
                        name: opt.type,
                        min: opt.options.min,
                        max: opt.options.max,
                        step: opt.options.step
                    }).val(opt.value);

                    $input.on('change input', function() {
                        $output.text($input.val());
                    });

                    content = [$label, $output, $units, $input];
                    break;

                case 'textarea':

                    $input = $('<textarea/>').text(opt.value);

                    content = [$label, $('<div/>').addClass('input-wrapper').append($input)];
                    break;

                case 'content-editable':

                    // replace new lines characters with new lines tags
                    // and white spaces with non-breaking space
                    var editableContent = _.isString(opt.value)
                        ? opt.value.replace(/\n/g,'<br>').replace(/ /g, '&nbsp;')
                        : '';

                    $input = $('<div/>')
                        .prop('contenteditable', true)
                        .css('display', 'inline-block') // Chrome would use <div> instead of <p> for the new line otherwise.
                        .html(editableContent)
                        .on('blur', this.onContentEditableBlur);

                    content = [$label, $('<div/>').addClass('input-wrapper').append($input)];
                    break;

                case 'select':

                    var items = opt.options.items;
                    $input = $('<select/>');

                    if (opt.options.multiple) {
                        // multiple select allows specify via `size` number of items
                        // to be displayed in the scrollable list.
                        $input.prop({
                            size: opt.options.size || items.length,
                            multiple: true
                        });
                    }

                    var selected = function(itemValue) {

                        if (opt.options.multiple) {
                            return _.find(opt.value, function(val) {
                                return _.isEqual(itemValue, val);
                            });
                        }
                        return _.isEqual(itemValue, opt.value);

                    };

                    _.each(items, function(item) {

                        var $option = $('<option/>', { value: item.value }).text(item.content);

                        if (selected(item.value)) {
                            $option.attr('selected', 'selected');
                        }

                        $input.append($option);
                    });

                    content = [$label, $input];
                    break;

                case 'toggle':

                    $button = $('<span><i/></span>');
                    $input = $('<input/>', { type: 'checkbox' }).prop('checked', !!opt.value);
                    $wrapper = $('<div/>').addClass(opt.type);

                    content = [$label, $wrapper.append($input, $button)];
                    break;

                case 'color':

                    $input = $('<input/>', { type: 'color' }).val(opt.value);

                    content = [$label, $input];
                    break;

                case 'text':

                    $input = $('<input/>', { type: 'text' }).val(opt.value);

                    content = [$label, $('<div/>').addClass('input-wrapper').append($input)];
                    break;

                case 'object':

                    $input = $('<div/>');
                    $nest = $('<div/>').addClass('object-properties');

                    content = [$label, $input.append($nest)];
                    break;

                case 'list':

                    $button = $('<button/>').addClass('btn-list-add').text(opt.options.addButtonLabel || '+');
                    $nest = $('<div/>').addClass('list-items');
                    $input = $('<div/>');

                    content = [$label, $input.append($button, $nest)];
                    break;
            }

            if ($input) {
                $input.addClass(opt.type).attr({
                    'data-type': opt.type,
                    'data-attribute': opt.attribute
                });
            }

            // A little trick how to convert an array of jQuery elements
            // to a jQuery object.
            return $.fn.append.apply($('<div>'), content).children();
        },

        onContentEditableBlur: function(evt) {

            // Workaround for Webkit content editable focus bug
            // https://gist.github.com/shimondoodkin/1081133

            var $editableFix = $('<input/>', {
                disabled: true,
                tabIndex: -1,
                style: {
                    width: '1px',
                    height: '1px',
                    border: 'none',
                    margin: 0,
                    padding:0
                }
            }).appendTo(this.$el);

            $editableFix.focus();
            $editableFix[0].setSelectionRange(0, 0);
            $editableFix.blur().remove();

            $(evt.target).trigger('change');
        },

        replaceHTMLEntity: function(entity, code) {

            return this.HTMLEntities[code] || '';
        },

        renderObjectProperty: function(opt) {

            opt = opt || {};

            var $objectProperty = $('<div/>', {
                'data-property': opt.property,
                'class': 'object-property'
            });

            return $objectProperty;
        },

        renderListItem: function(opt) {

            opt = opt || {};

            var $button = $('<button/>').addClass('btn-list-del').text(opt.options.removeButtonLabel || '-');
            var $listItem = $('<div/>', {
                'data-index': opt.index,
                'class': 'list-item'
            });

            return $listItem.append($button);
        },

        renderFieldContainer: function(opt) {

            opt = opt || {};

            var $field = $('<div/>', {
                'data-field': opt.path,
                'class': 'field ' + opt.type + '-field'
            });

            return $field;
        },

        renderTemplate: function($el, options, path, opt) {

            $el = $el || this.$el;
            opt = opt || {};

            this.resolveBindings(options);

            // Wrap the input into a `.field` classed element so that we can easilly hide and show
            // the entire block.
            var $field = this.renderFieldContainer({ path: path, type: options.type });

            if (options.when && !this.isExpressionValid(options.when)) {
                $field.addClass('hidden');
                if (options.when.otherwise) {
                    if (options.when.otherwise.unset) this.unsetProperty(path);
                }
            }

            var value = this.getCellAttributeValue(path, options);
            var $input = this.renderFieldContent(options, path, value);

            $field.append($input);

            // `options.attrs` allows for setting arbitrary attributes on the generated HTML.
            // This object is of the form: `<selector> : { <attributeName> : <attributeValue>, ... }`
            joint.util.setAttributesBySelector($field, options.attrs);

            if (options.type === 'list') {

                _.each(value, function(itemValue, idx) {

                    var $listItem = this.renderListItem({ index: idx, options: options });

                    this.renderTemplate($listItem, options.item, path + '/' + idx);
                    $input.children('.list-items').append($listItem);

                }, this);

            } else if (options.type === 'object') {

                options.flatAttributes = joint.util.flattenObject(options.properties, '/', function(obj) {
                    // Stop flattening when we reach an object that contains the `type` property. We assume
                    // that this is our options object. @TODO This is not very robust as there could
                    // possibly be another object with a property `type`. Instead, we should stop
                    // just before the nested leaf object.
                    return obj.type;
                });

                var attributesArray = _.map(options.flatAttributes, function(options, path) {
                    options.path = path;
                    return options;
                });
                // Sort the attributes by `index` and assign the `path` to the `options` object
                // so that we can acess it later.
                attributesArray = _.sortBy(attributesArray, function(options) {

                    return options.index;
                });

                _.each(attributesArray, function(propertyOptions) {

                    var $objectProperty = this.renderObjectProperty({ property: propertyOptions.path });

                    this.renderTemplate($objectProperty, propertyOptions, path + '/' + propertyOptions.path);

                    $input.children('.object-properties').append($objectProperty);

                }, this);
            }

            if (opt.replace) {

                $el.find('[data-field="' + path + '"]').replaceWith($field);

            } else {

                $el.append($field);
            }
        },

        updateInputPosition: function() {

            var $inputX = this._byPath['position/x'];
            var $inputY = this._byPath['position/y'];

            var position = this.getModel().get('position');

            if ($inputX) {
                $inputX.val(position.x);
            }
            if ($inputY) {
                $inputY.val(position.y);
            }
        },

        updateInputSize: function() {

            var $inputWidth = this._byPath['size/width'];
            var $inputHeight = this._byPath['size/height'];

            var size = this.getModel().get('size');

            if ($inputWidth) {
                $inputWidth.val(size.width);
            }
            if ($inputHeight) {
                $inputHeight.val(size.height);
            }
        },

        updateInputAngle: function() {

            var $inputAngle = this._byPath['angle'];

            var angle = this.getModel().get('angle');

            if ($inputAngle) {
                $inputAngle.val(angle);
            }
        },

        validateInput: function(type, input, path) {

            // It is assumed custom widgets have their own validation setup.
            switch (type) {

                case 'select-box':
                case 'color-palette':
                case 'select-button-group':
                    return true;
                default:
                    return this.options.validateInput(input, path, type);
            }
        },

        onChangeInput: function(evt) {

            this.processInput($(evt.target));
        },

        processInput: function($input, opt) {

            var path = $input.attr('data-attribute');
            var type = $input.attr('data-type');

            if (!this.validateInput(type, $input[0], path)) {
                // The input value is not valid. Do nothing.
                return;
            }

            if (this.options.live) {
                this.updateCell($input, path, opt);
            }

            var rawValue = this.getFieldValue($input[0], type);
            var value = this.parse(type, rawValue, $input[0]);

            // Notify the outside world that an input has changed.
            this.trigger('change:' + path, value, $input[0], opt);
        },

        updateDependants: function(path) {

            // Go through all the inputs that are dependent on the value of the changed input.
            // Show them if the 'when' expression is evaluated to 'true'. Hide them otherwise.
            _.each(this._when[path], function(dependant) {

                var $attribute = this._byPath[dependant.path];
                var $field = $attribute.closest('.field');
                var previouslyHidden = $field.hasClass('hidden');

                var valid = this.isExpressionValid(dependant.expression);

                $field.toggleClass('hidden', !valid);

                if (dependant.expression.otherwise) {
                    // unset option - works only with 'live' inspector.
                    if (dependant.expression.otherwise.unset && this.options.live) {

                        if (!valid) {

                            // When an attribute is hidden in the inspector unset its value in the model.
                            this.unsetProperty(dependant.path);
                            this.renderTemplate(null, this.flatAttributes[dependant.path], dependant.path, { replace: true });
                            this.trigger('render');

                        } else if (previouslyHidden) {

                            // The attribute just switched from hidden to visible. We set its value
                            // to the cell again in case it was unset earlier.
                            this.updateCell($attribute, dependant.path);
                        }
                    }
                }

            }, this);
        },

        // unset a model property
        unsetProperty: function(path, opt) {

            var cell = this.getModel();
            var pathArray = path.split('/');
            var attribute = _.first(pathArray);
            var nestedAttrPath = pathArray.slice(1).join('/');

            opt = opt || {};
            opt.inspector = this.cid;
            opt['inspector_' + this.cid] = true; // kept for backwards compatibility

            if (path == 'attrs') {
                // Unsetting an attrs property requires to re-render the view. The cell.removeAttr() does
                // it for us.
                cell.removeAttr(nestedAttrPath, opt);
            } else if (path == attribute) {
                // Unsetting a primitive object. Fast path.
                cell.unset(attribute, opt);
            } else {
                // Unsetting a nested property.
                var oldAttrValue = _.merge({}, cell.get(attribute));
                var newAttrValue = joint.util.unsetByPath(oldAttrValue, nestedAttrPath, '/');
                cell.set(attribute, newAttrValue, opt);
            }
        },

        getOptions: function($attribute) {

            if ($attribute.length === 0) return undefined;

            var path = $attribute.attr('data-attribute');
            var options = this.flatAttributes[path];
            if (!options) {
                var $parentAttribute = $attribute.parent().closest('[data-attribute]');
                var parentPath = $parentAttribute.attr('data-attribute');
                options = this.getOptions($parentAttribute);
                var childPath = path.replace(parentPath + '/', '');
                var parent = options;
                options = parent.item || parent.flatAttributes[childPath];
                options.parent = parent;
            }
            return options;
        },

        updateCell: function($attr, attrPath, opt) {

            var cell = this.getModel();

            var byPath = {};

            if ($attr) {
                // We are updating only one specific attribute
                byPath[attrPath] = $attr;
            } else {
                // No parameters given. We are updating all attributes
                byPath = this._byPath;
            }

            this.startBatchCommand();

            var listsByPath = {};
            var valuesByPath = {};

            _.each(byPath, function($attribute, path) {

                if ($attribute.closest('.field').hasClass('hidden')) return;

                var type = $attribute.attr('data-type');
                var itemPath;
                var listPath;

                switch (type) {

                    case 'list':

                        // TODO: this is wrong! There could have been other properties not
                        // defined in the inspector which we delete by this! We should only remove
                        // those items that disappeared from DOM.

                        // Do not empty the list (and trigger change event) if we have at
                        // least one item in the list. It is not only desirable but necessary.
                        // An example is when an element has ports. If we emptied the list
                        // and then reconstructed it again, all the links connected to the ports
                        // will get lost as the element with ports will think the ports disappeared
                        // first.
                        listPath = this.findParentListByPath(path);
                        if (listPath) {
                            itemPath = path.substr(listPath.length + 1);
                            joint.util.setByPath(listsByPath[listPath], itemPath, [], '/');
                        } else {
                            listsByPath[path] = [];
                        }
                        break;

                    case 'object':
                        // For objects, all is handled in the actual inputs.
                        break;

                    default:

                        if (!this.validateInput(type, $attribute[0], path)) return;

                        var rawValue = this.getFieldValue($attribute[0], type);
                        var value = this.parse(type, rawValue, $attribute[0]);
                        var options = this.getOptions($attribute);

                        if (options.valueRegExp) {
                            var oldValue = joint.util.getByPath(cell.attributes, path, '/') || options.defaultValue;
                            value = oldValue.replace(new RegExp(options.valueRegExp), '$1' + value + '$3');
                        }

                        listPath = this.findParentListByPath(path);

                        // if the `listPath` doesn't exist the input is not nested in an array.
                        // if the temporary list doesn't exist we are changing the input value only
                        if (listPath && listsByPath[listPath]) {
                            itemPath = path.substr(listPath.length + 1);
                            joint.util.setByPath(listsByPath[listPath], itemPath, value, '/');
                            return;
                        }

                        valuesByPath[path] = value;
                        break;
                }

            }, this);

            // Set all the values on the model.
            _.each(valuesByPath, function(value, path) {
                this.setProperty(path, value, opt);
                this.updateBindings(path);
                this.updateDependants(path);
            }, this);

            // Set all the arrays with all its items on the model now.
            _.each(listsByPath, function(value, path) {
                this.setProperty(path, value, _.extend({ rewrite: true }, opt));
                this.updateBindings(path);
                this.updateDependants(path);
            }, this);

            this.stopBatchCommand();
        },

        // Find the first list on the given path (exclude the list determined by the path itself).
        // @return path
        findParentListByPath: function(path) {

            var pathArray = path.split('/');
            var index = 0;
            var currentPath = pathArray[index];
            var currentOptions = this.flatAttributes[currentPath];
            var currentObject;
            var currentItem;

            while ((index < pathArray.length - 1) && (!currentOptions || currentOptions.type !== 'list')) {

                if (currentOptions && currentOptions.type === 'object') {
                    currentObject = currentOptions.properties;
                }

                currentItem = pathArray[++index];
                currentPath += '/' + currentItem;

                // Object properties are not listed in flatAttributes array.
                // We keep the reference to the last object properties and
                // search inside that object only.
                if (currentObject) {
                    currentOptions = currentObject[currentItem];
                } else {
                    currentOptions = this.flatAttributes[currentPath];
                }
            }

            return currentPath !== path ? currentPath : null;
        },

        getFieldValue: function(attribute, type) {

            if (_.isFunction(this.options.getFieldValue)) {

                var fieldValue = this.options.getFieldValue(attribute, type);
                if (fieldValue) {
                    return fieldValue.value;
                }
            }

            var $attribute = $(attribute);

            switch (type) {
                case 'select-box':
                case 'color-palette':
                case 'select-button-group':
                    var view = $attribute.data('view');
                    if (!view) {
                        // jQuery empties data when an element is removed from the DOM.
                        throw new Error('ui.Inspector: can not read value of removed ' + type);
                    }
                    return view.getSelectionValue();
                case 'content-editable':
                    return $attribute.html()
                        .replace(/<br(\s*)\/*>/ig, '\n') // replace single line-breaks
                        .replace(/<[p|div]\s/ig, '\n$0') // add a line break before all div and p tags
                        .replace(/(<([^>]+)>)/ig, '')    // remove any remaining tags
                        .replace(/&(\w+);/ig, this.replaceHTMLEntity) // replace html entities with a plain text
                        .replace(/\n$/, '');             // remove the last line-break
                default:
                    return $attribute.val();
            }
        },

        setProperty: function(path, value, opt) {

            opt = opt || {};
            opt.inspector = this.cid;

            // The model doesn't have to be a JointJS cell necessarily. It could be
            // an ordinary Backbone.Model and such would have no method 'prop'.
            var prop = joint.dia.Cell.prototype.prop;
            var model = this.getModel();

            if (opt.previewDone) {
                // If we're finished with the preview mode, first set silently the model property to the value
                // before the preview mode has started. This is because we want the outside application
                // to be able to handle the end of the preview (useful when you don't want to
                // store value changes caused by preview to a DB but only want to store the
                // final value after the preview mode has finished).
                prop.call(model, path, opt.originalValue, { rewrite: true, silent: true });
            }

            if (_.isUndefined(value)) {

                // Method prop can't handle undefined values in right way.
                // The model attributes would stay untouched if try to
                // set a nested property to undefined.
                joint.dia.Cell.prototype.removeProp.call(model, path, opt);

            } else {

                prop.call(model, path, _.clone(value), opt);
            }
        },

        // Parse the input `value` based on the input `type`.
        // Override this method if you need your own specific parsing.
        parse: function(type, value, targetElement) {

            switch (type) {
                case 'number':
                case 'range':
                    value = parseFloat(value);
                    break;
                case 'toggle':
                    value = targetElement.checked;
                    break;
            }

            return value;
        },

        startBatchCommand: function() {

            if (!this.inBatch) {
                this.inBatch = true;
                this.getModel().startBatch('inspector', { cid: this.cid });
            }
        },

        stopBatchCommand: function() {

            if (this.inBatch) {
                this.getModel().stopBatch('inspector', { cid: this.cid });
                this.inBatch = false;
            }
        },

        addListItem: function(evt) {

            var $target = $(evt.target);
            var $attribute = $target.closest('[data-attribute]');
            var path = $attribute.attr('data-attribute');
            var options = this.getOptions($attribute);

            // Take the index of the last list item and increase it by one.
            var $lastListItem = $attribute.children('.list-items').children('.list-item').last();
            var lastIndex = $lastListItem.length === 0 ? -1 : parseInt($lastListItem.attr('data-index'), 10);
            var index = lastIndex + 1;

            var $listItem = this.renderListItem({ index: index, options: options });

            this.renderTemplate($listItem, options.item, path + '/' + index);

            $target.parent().children('.list-items').append($listItem);
            $listItem.find('input:first').focus();

            this.trigger('render');

            if (this.options.live) {
                this.updateCell();
            }
        },

        deleteListItem: function(evt) {

            var $listItem = $(evt.target).closest('.list-item');

            // Update indexes of all the following list items and their inputs.
            $listItem.nextAll('.list-item').each(function() {

                var index = parseInt($(this).attr('data-index'), 10);
                var newIndex = index - 1;

                // TODO: if field labels are not defined and the paths string are used
                // for labels instead, these are not rewritten.

                // Find all the nested inputs and update their path so that it contains the new index.
                $(this).find('[data-field]').each(function() {
                    $(this).attr('data-field', $(this).attr('data-field').replace('/' + index, '/' + newIndex));
                });

                // Find all the nested inputs and update their path so that it contains the new index.
                $(this).find('[data-attribute]').each(function() {
                    $(this).attr('data-attribute', $(this).attr('data-attribute').replace('/' + index, '/' + newIndex));
                });

                // Update the index of the list item itself.
                $(this).attr('data-index', newIndex);
            });

            $listItem.remove();
            this.trigger('render');

            if (this.options.live) {
                this.updateCell();
            }
        },

        pointerdown: function(evt) {
            this.startBatchCommand();
            this._$activeField = $(evt.target).closest('.field').addClass('is-in-action');
            $(document).on('mouseup.inspector touchend.inspector', this.pointerup);
        },

        pointerup: function() {
            $(document).off('.inspector', this.pointerup);
            if (this._$activeField) {
                this._$activeField.removeClass('is-in-action');
                this._$activeField = null;
            }
        },

        pointerfocusin: function(evt) {
            $(evt.target).closest('.field').addClass('is-focused');
        },

        pointerfocusout: function(evt) {
            $(evt.target).closest('.field').removeClass('is-focused');
        },

        onRemove: function() {

            this.removeWidgets();
            if (this === this.constructor.instance) {
                this.constructor.instance = null;
            }
            $(document).off('mouseup', this.stopBatchCommand);
        },

        removeWidgets: function() {

            _.invoke(this.widgets, 'remove');
            this.widgets = [];
        },

        onGroupLabelClick: function(evt) {

            // Prevent default action for iPad not to handle this event twice.
            evt.preventDefault();

            if (!this.options.multiOpenGroups) {
                this.closeGroups();
            }

            var $group = $(evt.target).closest('.group');
            this.toggleGroup($group);
        },

        toggleGroup: function(name) {

            var $group = _.isString(name) ? this.$('.group[data-name="' + name + '"]') : $(name);

            if ($group.hasClass('closed')) {
                this.openGroup($group);
            } else {
                this.closeGroup($group);
            }
        },

        closeGroup: function(name, opt) {

            opt = opt || {};
            var $group = _.isString(name) ? this.$('.group[data-name="' + name + '"]') : $(name);

            if (opt.init || !$group.hasClass('closed')) {
                $group.addClass('closed');
                this.trigger('group:close', $group.data('name'), opt);
            }
        },

        openGroup: function(name, opt) {

            opt = opt || {};
            var $group = _.isString(name) ? this.$('.group[data-name="' + name + '"]') : $(name);

            if (opt.init || $group.hasClass('closed')) {
                $group.removeClass('closed');
                this.trigger('group:open', $group.data('name'), opt);
            }
        },

        closeGroups: function() {

            _.each(this.$groups, this.closeGroup, this);
        },

        openGroups: function() {

            _.each(this.$groups, this.openGroup, this);
        },

        // Expressions

        COMPOSITE_OPERATORS: ['not', 'and', 'or', 'nor'],
        PRIMITIVE_OPERATORS: ['eq', 'ne', 'regex', 'text', 'lt', 'lte', 'gt', 'gte', 'in', 'nin', 'equal'],

        _isComposite: function(expr) {

            return _.intersection(this.COMPOSITE_OPERATORS, _.keys(expr)).length > 0;
        },

        _isPrimitive: function(expr) {

            var operators = _.keys(this.options.operators).concat(this.PRIMITIVE_OPERATORS);
            return _.intersection(operators, _.keys(expr)).length > 0;
        },

        _evalCustomPrimitive: function(name, value, args) {

            // Operator signature --> function(cell, value, argument*) {}
            return !!this.options.operators[name].apply(this, [this.getModel(), value].concat(args));
        },

        _evalPrimitive: function(expr) {

            return _.reduce(expr, function(res, condition, operator) {
                return _.reduce(condition, function(res, condValue, condPath) {

                    var val = this.getCellAttributeValue(condPath);

                    // Let's check if this is a custom operator.
                    if (_.isFunction(this.options.operators[operator])) {
                        // Note that custom operators can replace the existing primitives.
                        return this._evalCustomPrimitive(operator, val, condValue);
                    }

                    switch (operator) {
                        case 'eq':
                            return condValue == val;
                        case 'ne':
                            return condValue != val;
                        case 'regex':
                            return (new RegExp(condValue)).test(val);
                        case 'text':
                            return !condValue || (_.isString(val) && val.toLowerCase().indexOf(condValue) > -1);
                        case 'lt':
                            return val < condValue;
                        case 'lte':
                            return val <= condValue;
                        case 'gt':
                            return val > condValue;
                        case 'gte':
                            return val >= condValue;
                        case 'in':
                            return _.contains(condValue, val);
                        case 'nin':
                            return !_.contains(condValue, val);
                        case 'equal':
                            return _.isEqual(condValue, val);
                        default:
                            return res;
                    }

                }, false, this);
            }, false, this);
        },

        _evalExpression: function(expr) {

            if (this._isPrimitive(expr)) {
                return this._evalPrimitive(expr);
            }

            return _.reduce(expr, function(res, childExpr, operator) {

                if (operator == 'not') return !this._evalExpression(childExpr);

                var childExprRes = _.map(childExpr, this._evalExpression, this);

                switch (operator) {
                    case 'and':
                        return _.every(childExprRes);
                    case 'or':
                        return _.some(childExprRes);
                    case 'nor':
                        return !_.some(childExprRes);
                    default:
                        return res;
                }

            }, false, this);
        },

        _extractVariables: function(expr) {

            if (_.isArray(expr) || this._isComposite(expr)) {
                return _.reduce(expr, function(res, childExpr) {
                    return res.concat(this._extractVariables(childExpr));
                }, [], this);
            }

            return _.reduce(expr, function(res, primitive) {
                return _.keys(primitive);
            }, []);
        },

        isExpressionValid: function(expr) {
            expr = _.omit(expr, 'otherwise', 'dependencies');
            return this._evalExpression(expr);
        },

        extractExpressionPaths: function(expr) {

            // Additional dependencies can be defined. Useful when we using custom operators and
            // we want the input to be displayed/showed also if this dependency change.
            var dependencies = (expr && expr.dependencies) || [];

            // All other dependencies are already in the expression definition.
            expr = _.omit(expr, 'otherwise', 'dependencies');
            return _.uniq(this._extractVariables(expr).concat(dependencies));
        },

        /**
         * @private
         * @returns {string}
         */
        getGroupsStateKey: function() {

            if (_.isFunction(this.options.stateKey)) {
                return this.options.stateKey(this.getModel());
            }

            throw new Error('Inspector: Option stateKey must be a function');
        },

        /**
         * @public
         * store the current state of groups.
         */
        storeGroupsState: function() {

            var key = this.getGroupsStateKey();

            joint.ui.Inspector.groupStates[key] = _.map(this.$('.group.closed'), function(g) {
                return $(g).attr('data-name');
            });
        },

        /**
         * @public
         * get groups which are actually stored as closed in state. This could differ from currently rendered state.
         * @returns {Array.<string>}
         */
        getGroupsState: function() {

            return joint.ui.Inspector.groupStates[this.getGroupsStateKey()];
        },

        /**
         * @public
         * Opens/closes groups regards to the stored state.
         */
        restoreGroupsState: function() {

            var processGroups = function(isClosed, context) {
                _.each(context.options.groups, function(group, groupName) {
                    isClosed(group, groupName) ? this.closeGroup(groupName) : this.openGroup(groupName);
                }, context);
            };

            var key = this.getGroupsStateKey();

            if (joint.ui.Inspector.groupStates[key]) {
                processGroups(function(group, groupName) {
                    return _.contains(joint.ui.Inspector.groupStates[key], groupName);
                }, this);
            } else {
                processGroups(function(group) {
                    return group.closed;
                }, this);
            }
        }

    }, {

        /** @type {Object.<string, Array.<string>>} */
        groupStates: {},

        /** @type joint.ui.Inspector */
        instance: null,

        /**
         * @param {Element|string} container Element or selector
         * @param {Object} opt Inspector options
         * @returns {joint.ui.Inspector}
         */
        create: function(container, opt) {

            opt = opt || {};
            _.defaults(opt, {
                restoreGroupsState: true,
                storeGroupsState: true
            });

            var cell = opt.cell || opt.cellView.model;
            var inspector = this.instance;

            // No need to re-render inspector if the cellView didn't change.
            if (!inspector || inspector.options.cell !== cell) {

                // Is there an inspector that has not been removed yet.
                // Note that an inspector can be also removed when the underlying cell is removed.
                if (inspector && inspector.el.parentNode) {

                    if (opt.storeGroupsState) {
                        inspector.storeGroupsState();
                    }

                    // Clean up the old inspector.
                    inspector.updateCell();
                    inspector.remove();
                }

                inspector = new this(opt).render();
                this.instance = inspector;
                $(container).html(inspector.el);

                if (opt.restoreGroupsState) {
                    inspector.restoreGroupsState();
                }
            }

            return inspector;
        },

        close: function() {

            var inspector = this.instance;
            if (inspector) {
                inspector.remove();
            }
        }
    });
}(joint));
