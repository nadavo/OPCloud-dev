/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// JointJS Stencil ui plugin.
// --------------------------

// USAGE:
// var graph = new joint.dia.Graph;
// var paper = new joint.dia.Paper({
//    el: $('#paper'),
//    width: 500,
//    height: 300,
//    gridSize: 20,
//    perpendicularLinks: true,
//    model: graph
// });
//
// var stencil = new joint.ui.Stencil({ graph: graph, paper: paper });
// $('#stencil-holder').append(stencil.render().el);


(function(joint, _) {

    var layoutDefaults = {

        options: function() {
            return {
                columnWidth: this.options.width / 2 - 10,
                columns: 2,
                rowHeight: 80,
                resizeToFit: true,
                dy: 10,
                dx: 10
            };
        },

        /**
         * @param {joint.dia.Graph} graph
         * @param {Object} group Group
         */
        layoutGroup: function(graph, group) {

            var opts = this.options.layout;
            group = group || {};

            if (!joint.layout.GridLayout) {
                throw new Error('joint.ui.Stencil: joint.layout.GridLayout is not available.');
            }

            joint.layout.GridLayout.layout(graph, _.extend({}, opts, group.layout));
        }
    };

    joint.ui.Stencil = joint.mvc.View.extend({
        className: 'stencil',
        events: {
            'click .btn-expand': 'openGroups',
            'click .btn-collapse': 'closeGroups',
            'click .groups-toggle .group-label': 'openGroups',
            'click .group-label': 'onGroupLabelClick',
            'touchstart .group-label': 'onGroupLabelClick',
            'input .search': 'onSearch',
            'focusin .search' : 'pointerFocusIn',
            'focusout .search' : 'pointerFocusOut'
        },
        options: {
            width: 200,
            height: 800,
            label: 'Stencil',
            groups: null,
            groupsToggleButtons: false,
            dropAnimation: false,
            search: null,
            layout: null,
            // An instance of Snapline plugin which should display
            // snaplines while dragging an element from the stencil
            snaplines: null,
            // When set to `true` clone views are automatically
            // scaled based on the current paper transformations.
            // Note: this option is ignored when `snaplines` provided.
            scaleClones: false,
            /**
             * @param {joint.dia.Cell} cell
             * @returns {joint.dia.Cell}
             */
            dragStartClone: function(cell) {

                return cell.clone();
            },

            /**
             * @param {joint.dia.Cell} cell
             * @returns {joint.dia.Cell}
             */
            dragEndClone: function(cell) {

                return cell.clone();
            },
            /** @type {function|null} */
            layoutGroup: null
        },

        init: function() {

            this.setPaper(this.options.paperScroller || this.options.paper);

            /** @type {Object.<string, joint.dia.Graph>} */
            this.graphs = {};
            /** @type {Object.<string, joint.dia.Paper>} */
            this.papers = {};
            /** @type {Object.<string, jQuery>} */
            this.$groups = {};

            _.bindAll(this, 'onDrag', 'onDragEnd', 'onDropEnd');

            $(document.body).on('mousemove.stencil touchmove.stencil', this.onDrag);
            $(window).on('mouseup.stencil touchend.stencil', this.onDragEnd);

            this.onSearch = _.debounce(this.onSearch, 200);

            this.initializeLayout();
        },

        /**
         * @private
         */
        initializeLayout: function() {

            var layout = this.options.layout;

            if (layout) {

                if (_.isFunction(layout)) {
                    this.layoutGroup = layout;
                } else {
                    this.layoutGroup = _.bind(layoutDefaults.layoutGroup, this);
                    this.options.layout = _.isObject(layout) ? layout : {};
                    _.defaults(this.options.layout, layoutDefaults.options.call(this));
                }
            }
        },

        /**
         * @public
         * @param {joint.dia.Paper | joint.ui.PaperScroller} paper
         */
        setPaper: function(paper) {

            var options = this.options;

            if (paper instanceof joint.dia.Paper) {

                // Allow Stencil to be initialized with a paper only.
                options.paperScroller = null;
                options.paper = paper;
                options.graph = paper.model;

            } else if (typeof joint.ui.PaperScroller === 'function' && paper instanceof joint.ui.PaperScroller) {

                // Paper is a PaperScroller
                options.paperScroller = paper;
                options.paper = paper.options.paper;
                options.graph = paper.options.paper.model;

            } else {

                throw new Error('Stencil: paper required');
            }
        },

        /**
         * @private
         * @returns {jQuery}
         */
        renderContent: function() {

            return $('<div/>').addClass('content');
        },

        /**
         * @private
         * @returns {jQuery}
         */
        renderPaperDrag: function() {

            return $('<div/>').addClass('stencil-paper-drag');
        },

        /**
         * @private
         * @returns {jQuery}
         */
        renderSearch: function() {

            return $('<div/>').addClass('search-wrap').append($('<input/>', { type: 'search', placeholder: 'search' }).addClass('search'));
        },

        /**
         * @private
         * @returns {Array.<jQuery>}
         */
        renderToggleAll: function() {

            return [
                $('<div/>').addClass('groups-toggle')
                    .append($('<label/>').addClass('group-label').html(this.options.label))
                    .append($('<button/>', { text: '+' }).addClass('btn btn-expand'))
                    .append($('<button/>', { text: '-' }).addClass('btn btn-collapse'))
            ];
        },

        /**
         * @private
         * @returns {jQuery}
         */
        renderElementsContainer: function() {

            return $('<div/>').addClass('elements');
        },

        /**
         * @private
         * @param {Object} opt
         * @returns {jQuery}
         */
        renderGroup: function(opt) {

            opt = opt || {};

            var $group = $('<div/>')
                .addClass('group')
                .attr('data-name', opt.name)
                .toggleClass('closed', !!opt.closed);

            var $label = $('<h3/>')
                .addClass('group-label')
                .html(opt.label || opt.name);

            var $elements = this.renderElementsContainer();

            return $group.append($label, $elements);
        },

        /**
         * @public
         * @returns {joint.ui.Stencil}
         */
        render: function() {

            this.$content = this.renderContent();
            this.$paperDrag = this.renderPaperDrag();

            this.$el.empty().append(this.$paperDrag, this.$content);

            if (this.options.search) {
                this.$el.addClass('searchable').prepend(this.renderSearch());
            }

            if (this.options.groupsToggleButtons) {
                this.$el.addClass('collapsible').prepend(this.renderToggleAll());
            }

            var paperOptions = {
                width: this.options.width,
                height: this.options.height,
                interactive: false
            };

            if (this.options.groups) {

                // Render as many papers as there are groups.
                var sortedGroups = _.sortBy(_.pairs(this.options.groups), function(pair) {
                    return pair[1].index;
                });

                _.each(sortedGroups, function(groupArray) {

                    var name = groupArray[0];
                    var group = groupArray[1];

                    var $group = this.$groups[name] = this.renderGroup({
                        name: name,
                        label: group.label,
                        closed: group.closed
                    }).appendTo(this.$content);

                    var graph = new joint.dia.Graph;
                    var paper = new joint.dia.Paper(_.extend({}, paperOptions, {
                        el: $group.find('.elements'),
                        model: graph,
                        width: group.width || paperOptions.width,
                        height: group.height || paperOptions.height
                    }));

                    this.graphs[name] = graph;
                    this.papers[name] = paper;

                }, this);

            } else {

                // Groups are not used. Render just one paper for the whole stencil.
                var $elements = this.renderElementsContainer().appendTo(this.$content);

                var graph = new joint.dia.Graph;
                var paper = new joint.dia.Paper(_.extend(paperOptions, {
                    el: $elements,
                    model: graph
                }));

                // `this.graphs` object contains only one graph in this case that we store under the key `'__default__'`.
                this.graphs['__default__'] = graph;
                this.papers['__default__'] = paper;
            }

            // Create graph and paper objects for the, temporary, dragging phase.
            // Elements travel the following way when the user drags an element from the stencil and drops
            // it into the main, associated, paper: `[One of the Stencil graphs] -> [_graphDrag] -> [this.options.graph]`.
            this._graphDrag = new joint.dia.Graph;
            this._paperDrag = new joint.dia.Paper({

                el: this.$paperDrag,
                width: 1,
                height: 1,
                model: this._graphDrag
            });

            this.startListening();

            return this;
        },

        startListening: function() {

            this.stopListening();

            // `cell:pointerdown` on any of the Stencil papers triggers element dragging.
            _.each(this.papers, _.bind(this.listenTo, this, _, 'cell:pointerdown', this.onDragStart));
        },

        /**
         * @public
         * @param {Array.<joint.dia.Element>|Object.<string, Array.<joint.dia.Element>>} cells Array of cells or hash-map
         * of cells where key is group name.
         * @param {string=} group
         */
        load: function(cells, group) {

            if (_.isArray(cells)) {

                this.loadGroup(cells, group);

            } else if (_.isObject(cells)) {

                _.each(this.options.groups, function(group, name) {
                    if (cells[name]) {
                        this.loadGroup(cells[name], name);
                    }
                }, this);
            }
        },

        /**
         * @public
         * Populate stencil with `cells`. If `group` is passed, only the graph in the named group
         * will be populated
         * @param {Array.<joint.dia.Element>} cells
         * @param {string=} group Mandatory in 'group' mode  - 'options.groups' property is defined
         */
        loadGroup: function(cells, group) {

            var graph = this.getGraph(group);

            graph.resetCells(cells);
            // If height is not defined in neither the global `options.height` or local
            // `height` for this specific group, fit the paper to the content automatically.
            var paperHeight = this.options.height;

            if (group) {
                paperHeight = this.getGroup(group).height;
            }

            if (this.isLayoutEnabled()) {
                this.layoutGroup(graph, this.getGroup(group));
            }

            if (!paperHeight) {
                this.getPaper(group).fitToContent({
                    gridWidth: 1,
                    gridHeight: 1,
                    padding: this.options.paperPadding || 10
                });
            }
        },

        /**
         * @private
         * @returns {boolean}
         */
        isLayoutEnabled: function() {

            return !!(this.options.layout);
        },

        /**
         * @public
         * @param {string=} group
         * @returns {joint.dia.Graph}
         */
        getGraph: function(group) {

            var graph =  this.graphs[group || '__default__'];
            if (!graph) {
                throw new Error('Stencil: group ' + group + ' does not exist.');
            }

            return graph;
        },

        /**
         * @public
         * @param {string} group
         * @returns {joint.dia.Paper}
         */
        getPaper: function(group) {

            return this.papers[group || '__default__'];
        },

        preparePaperForDragging: function(cellView, clientX, clientY) {

            var paperDrag = this._paperDrag;
            var graphDrag = this._graphDrag;

            // Move the .stencil-paper-drag element to the document body so that even though
            // the stencil is set to overflow: hidden or auto, the .stencil-paper-drag will
            // be visible.
            paperDrag.$el.addClass('dragging').appendTo(document.body);

            var clone = this.options.dragStartClone(cellView.model).position(0,0);
            var cloneBBox = clone.getBBox();

            // Leave some padding so that e.g. the cell shadow or thick border is visible.
            // This workaround can be removed once browsers start supporting getStrokeBBox() (http://www.w3.org/TR/SVG2/types.html#__svg__SVGGraphicsElement__getStrokeBBox).
            var padding = 5;

            var snaplines = this.options.snaplines;
            if (snaplines) {
                padding += snaplines.options.distance;
            }

            if (snaplines || this.options.scaleClones) {
                // Scaling the paper drag, so the clone view match the
                // size of the resulting size as would be placed in the paper.
                var paperScale = V(this.options.paper.viewport).scale();
                paperDrag.scale(paperScale.sx, paperScale.sy);
                padding *= Math.max(paperScale.sx, paperScale.sy);
            } else {
                // restore scale
                paperDrag.scale(1, 1);
            }

            clone.position(0, 0).addTo(graphDrag);

            var cloneView = clone.findView(paperDrag);

            // Do not automatically update the cell view while dragging.
            cloneView.stopListening();

            paperDrag.fitToContent({ padding: padding, allowNewOrigin: 'any' });

            // Distance from the original cellView center and its origin
            var cellViewBBox = cellView.getBBox();
            var cellBBox = cellView.model.getBBox();
            this._cellViewDeltaOrigin = {
                x: cellBBox.x - cellViewBBox.x - cellViewBBox.width / 2,
                y: cellBBox.y - cellViewBBox.y - cellViewBBox.height / 2
            };

            this._clone = clone;
            this._cloneBBox = cloneBBox;
            this._cloneView = cloneView;
            this._cloneViewBBox = cloneView.getBBox();
            this._paperDragInitialOffset = this.setPaperDragOffset(clientX, clientY);
            this._paperDragPadding = padding;
        },

        setPaperDragOffset: function(clientX, clientY) {

            // Safari uses `document.body.scrollTop` only while Firefox uses `document.documentElement.scrollTop` only.
            // Google Chrome is the winner here as it uses both.
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

            // Offset the paper so that the mouse cursor points to the center of the stencil element.
            // Also, store the original coordinates so that we know where to return if `dropAnimation` is enabled.
            var cloneViewBBox = this._cloneViewBBox;
            var paperDragPadding = this._paperDragPadding;
            var paperDragOffset = {
                left: clientX - cloneViewBBox.width / 2 - paperDragPadding,
                top: clientY - cloneViewBBox.height / 2 + scrollTop - paperDragPadding
            };

            this._paperDrag.$el.offset(paperDragOffset);

            return paperDragOffset;
        },

        setCloneLocalPosition: function(clientX, clientY) {

            var localPosition = this.options.paper.clientToLocalPoint({ x: clientX, y: clientY });

            localPosition.x -= this._cloneBBox.width / 2;
            localPosition.y -= this._cloneBBox.height / 2;

            // We don't want the clone view react on change:position change.
            // But we want processEmbedding to take the clone new position into account,
            // when it looks for models for which the clone can be embedded in.
            this._clone.set('position', localPosition);

            return localPosition;
        },

        onDragStart: function(cellView, evt) {

            evt.preventDefault();
            // Start the dragging batch
            // Batch might contain `add`, `change:parent`, `change:embeds` events.
            this.options.graph.startBatch('stencil-drag');

            this.$el.addClass('dragging');
            this.preparePaperForDragging(cellView, evt.clientX, evt.clientY);

            var localPoint = this.setCloneLocalPosition(evt.clientX, evt.clientY);
            var cloneView = this._cloneView;

            // snaplines
            var snaplines = this.options.snaplines;
            if (snaplines) {

                snaplines.captureCursorOffset(this._cloneView, evt, localPoint.x, localPoint.y);

                cloneView.listenTo(this._clone, 'change:position', _.bind(this.onCloneSnapped, this));
            }
        },

        onCloneSnapped: function(clone, position, opt) {

            // Snapline plugin adds `snapped` flag when changing element's position
            if (opt.snapped) {
                var cloneBBox = this._cloneBBox;
                // Set the position of the element to it's original drag paper position
                // and add the snapped offset. This is required by the view `translate` method,
                // which updates the element view position based on the model values.
                clone.position(cloneBBox.x + opt.tx, cloneBBox.y + opt.ty, { silent: true });
                this._cloneView.translate();
                // Restore the element's local position
                clone.set('position', position, { silent: true });

                this._cloneSnapOffset = { x: opt.tx, y: opt.ty };

            } else {

                this._cloneSnapOffset = null;
            }
        },

        onDrag: function(evt) {

            var cloneView = this._cloneView;
            if (cloneView) {

                evt.preventDefault();
                evt = joint.util.normalizeEvent(evt);

                var clientX = evt.clientX;
                var clientY = evt.clientY;

                this.setPaperDragOffset(clientX, clientY);

                var localPoint = this.setCloneLocalPosition(clientX, clientY);

                var embedding = this.options.paper.options.embeddingMode;
                var snaplines = this.options.snaplines;
                var insideValidArea = (embedding || snaplines) && this.insideValidArea({ x: clientX, y: clientY });

                if (embedding) {
                    if (insideValidArea) {
                        cloneView.processEmbedding({ paper: this.options.paper });
                    } else {
                        cloneView.clearEmbedding();
                    }
                }

                if (snaplines) {
                    if (insideValidArea) {
                        snaplines.snapWhileMoving(cloneView, evt, localPoint.x, localPoint.y);
                    } else {
                        snaplines.hide();
                    }
                }
            }
        },

        onDragEnd: function(evt) {

            var clone = this._clone;
            if (clone) {

                evt = joint.util.normalizeEvent(evt);

                var cloneView = this._cloneView;
                var cloneBBox = this._cloneBBox;
                var snapOffset = this._cloneSnapOffset;

                var x = cloneBBox.x;
                var y = cloneBBox.y;
                // add the element offset caused by the snaplines
                if (snapOffset) {
                    x += snapOffset.x;
                    y += snapOffset.y;
                }

                // Restore the original clone position if this was changed during the embedding.
                clone.position(x, y, { silent: true });

                var cellClone = this.options.dragEndClone(clone);
                var dropped = this.drop(evt, cellClone);

                if (!dropped) {

                    this.onDropInvalid(evt, cellClone);

                } else {

                    this.onDropEnd();
                }

                // embedding
                if (this.options.paper.options.embeddingMode && cloneView) {
                    cloneView.finalizeEmbedding({ model: cellClone, paper: this.options.paper });
                }

                // snaplines
                // it's hide on document mouseup by the plugin itself

                // End the dragging batch.
                this.options.graph.stopBatch('stencil-drag');
            }
        },

        onDropEnd: function() {

            // Move the .stencil-paper-drag from the document body back to the stencil element.
            this.$el.append(this._paperDrag.$el);

            this.$el.removeClass('dragging');
            this._paperDrag.$el.removeClass('dragging');

            this._clone.remove();
            this._clone = null;
            this._cloneView = null;
            this._cloneSnapOffset = null;
        },

        onDropInvalid: function(evt, cellClone) {

            if (this._clone) {

                evt = joint.util.normalizeEvent(evt);

                cellClone = cellClone || this.options.dragEndClone(this._clone);

                // Tell the outside world that the drop was not successful.
                this.trigger('drop:invalid', evt, cellClone);

                var dropAnimation = this.options.dropAnimation;
                if (dropAnimation) {

                    var duration = _.isObject(dropAnimation) ? dropAnimation.duration : 150;
                    var easing = _.isObject(dropAnimation) ? dropAnimation.easing : 'swing';
                    this._paperDrag.$el.animate(this._paperDragInitialOffset, duration, easing, this.onDropEnd);

                } else {

                    this.onDropEnd();
                }
            }
        },

        // Return `true` if the point `p` falls into the valid area for dropping.
        insideValidArea: function(p) {

            var paper = this.options.paper;
            var paperScroller = this.options.paperScroller;

            var stencilArea = this.getDropArea(this.$el);
            var validArea;

            if (!paperScroller) {

                // No paper scroller used. Use entire paper area.
                validArea = this.getDropArea(paper.$el);

            } else if (paperScroller.options.autoResizePaper) {

                // Paper scroller used with auto-resize enabled.
                // We can use the entire paperScroller area for drop.
                validArea = this.getDropArea(paperScroller.$el);

            } else {

                // Paper scroller used with auto-resize disabled.
                // The element can be dropped only into the visible part of the paper.
                var scrollerArea = this.getDropArea(paperScroller.$el);
                var paperArea = this.getDropArea(paper.$el);

                validArea = paperArea.intersect(scrollerArea);
            }

            // Check if the cell is dropped inside the paper but not inside the stencil.
            // Check for the stencil is here because the paper can go "below" the stencil
            // if the paper is larger than the ui.PaperScroller area.
            if (validArea && validArea.containsPoint(p) && !stencilArea.containsPoint(p)) return true;

            return false;
        },

        getDropArea: function($el) {

            var position = $el.offset();
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;

            return g.rect({
                x: position.left + parseInt($el.css('border-left-width'), 10) - scrollLeft,
                y: position.top + parseInt($el.css('border-top-width'), 10) - scrollTop,
                width: $el.innerWidth(),
                height: $el.innerHeight()
            });
        },

        drop: function(evt, cell) {

            var paper = this.options.paper;
            var graph = this.options.graph;
            var p = { x: evt.clientX, y: evt.clientY };

            // Check if the cell is dropped inside the paper.
            if (this.insideValidArea(p)) {

                var pointTransformed = paper.clientToLocalPoint(p);
                var cellBBox = cell.getBBox();

                pointTransformed.x += cellBBox.x + this._cellViewDeltaOrigin.x;
                pointTransformed.y += cellBBox.y + this._cellViewDeltaOrigin.y;

                // Do not snap to grid if the element was previously snapped to certain position.
                var gridSize = (this._cloneSnapOffset) ? 1 : paper.options.gridSize;

                cell.set('position', {
                    x: g.snapToGrid(pointTransformed.x, gridSize),
                    y: g.snapToGrid(pointTransformed.y, gridSize)
                });

                // `z` level will be set automatically in the `this.graph.addCell()` method.
                // We don't want the cell to have the same `z` level as it had in the temporary paper.
                cell.unset('z');

                graph.addCell(cell, { stencil: this.cid });
                return true;
            }

            return false;
        },

        filter: function(keyword, cellAttributesMap) {

            // a searching mode when the keyword consists of lowercase only
            // e.g 'keyword' matches 'Keyword' but not other way round
            var lowerCaseOnly = keyword.toLowerCase() == keyword;

            // We go through each paper.model, filter its cells and watch whether we found a match
            // yet or not.
            var match = _.reduce(this.papers, function(wasMatch, paper, group) {

                // an array of cells that matches a search criteria
                var matchedCells = paper.model.get('cells').filter(function(cell) {

                    var cellView = paper.findViewByModel(cell);

                    // check whether the currect cell matches a search criteria
                    var cellMatch = !keyword || _.some(cellAttributesMap, function(paths, type) {

                        if (type != '*' && cell.get('type') != type) {
                            // type is not universal and doesn't match the current cell
                            return false;
                        }

                        // find out if any of specific cell attributes matches a search criteria
                        var attributeMatch = _.some(paths, function(path) {

                            var value = joint.util.getByPath(cell.attributes, path, '/');

                            if (_.isUndefined(value) || _.isNull(value)) {
                                // if value undefined than current attribute doesn't match
                                return false;
                            }

                            // convert values to string first (e.g value could be a number)
                            value = value.toString();

                            if (lowerCaseOnly) {
                                value = value.toLowerCase();
                            }

                            return value.indexOf(keyword) >= 0;
                        });

                        return attributeMatch;
                    });

                    // each element that does not match a search has 'unmatched' css class
                    V(cellView.el).toggleClass('unmatched', !cellMatch);

                    return cellMatch;

                }, this);

                var isMatch = !_.isEmpty(matchedCells);

                // create a graph contains only filtered elements.
                var filteredGraph = (new joint.dia.Graph).resetCells(matchedCells);

                // let the outside world know that the group was filtered
                this.trigger('filter', filteredGraph, group, keyword);

                if (this.isLayoutEnabled()) {
                    this.layoutGroup(filteredGraph, this.getGroup(group));
                }

                if (this.$groups[group]) {
                    // add 'unmatched' class when filter matches no elements in the group
                    this.$groups[group].toggleClass('unmatched', !isMatch);
                }

                paper.fitToContent({
                    gridWidth: 1,
                    gridHeight: 1,
                    padding: this.options.paperPadding || 10
                });

                return wasMatch || isMatch;

            }, false, this);

            // When no match found we add 'not-found' class on the stencil element
            this.$el.toggleClass('not-found', !match);
        },

        /**
         * @private
         * @param {string} name
         * @returns {Object}
         */
        getGroup: function(name) {

            return this.options.groups && this.options.groups[name] || {};
        },

        /**
         * @private
         * @param {jQuery.Event} evt
         */
        onSearch: function(evt) {

            this.filter(evt.target.value, this.options.search);
        },

        /**
         * @private
         */
        pointerFocusIn: function() {
            this.$el.addClass('is-focused');
        },

        /**
         * @private
         */
        pointerFocusOut: function() {
            this.$el.removeClass('is-focused');
        },

        /**
         * @private
         * @param {jQuery.Event} evt
         */
        onGroupLabelClick: function(evt) {

            // Prevent default action for iPad not to handle this event twice.
            evt.preventDefault();

            var $group = $(evt.target).closest('.group');
            this.toggleGroup($group.data('name'));
        },

        /**
         * @public
         * @param {string} name
         */
        toggleGroup: function(name) {

            this.$('.group[data-name="' + name + '"]').toggleClass('closed');
        },

        /**
         * @public
         * @param {string} name
         */
        closeGroup: function(name) {

            this.$('.group[data-name="' + name + '"]').addClass('closed');
        },

        /**
         * @public
         * @param {string} name
         */
        openGroup: function(name) {

            this.$('.group[data-name="' + name + '"]').removeClass('closed');
        },

        /**
         * @public
         * @param {string} name
         */
        isGroupOpen: function(name) {

            return !this.$('.group[data-name="' + name + '"]').hasClass('closed');
        },

        /**
         * @public
         */
        closeGroups: function() {

            this.$('.group').addClass('closed');
        },

        /**
         * @public
         */
        openGroups: function() {

            this.$('.group').removeClass('closed');
        },

        /**
         * @private
         */
        onRemove: function() {

            _.invoke(this.papers, 'remove');
            this.papers = {};

            if (this._paperDrag) {
                this._paperDrag.remove();
                this._paperDrag = null;
            }

            $(document.body)
                .off('.stencil', this.onDrag)
                .off('.stencil', this.onDragEnd);
            $(window)
                .off('.stencil', this.onDragEnd);
        }
    });

}(joint, _));
