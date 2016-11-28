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
