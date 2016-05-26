/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


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


joint.ui.Stencil = joint.mvc.View.extend({

    className: 'stencil',

    events: {
        'click .group-label': 'onGroupLabelClick',
        'touchstart .group-label': 'onGroupLabelClick',
        'input .search': 'onSearch'
    },

    options: {
        width: 200,
        height: 800
    },

    init: function() {

        this.setPaper(this.options.paperScroller || this.options.paper);

        this.graphs = {};
        this.papers = {};
        this.$groups = {};

        _.bindAll(this, 'onDrag', 'onDragEnd', 'onDropEnd');

        $(document.body).on({
            'mousemove.stencil touchmove.stencil': this.onDrag,
            'mouseup.stencil touchend.stencil': this.onDragEnd
        });

        this.onSearch = _.debounce(this.onSearch, 200);
    },

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

    renderContent: function() {

        return $('<div/>').addClass('content');
    },

    renderPaperDrag: function() {

        return $('<div/>').addClass('stencil-paper-drag');
    },

    renderSearch: function() {

        return $('<input/>', { type: 'search', placeholder: 'search' }).addClass('search');
    },

    renderElementsContainer: function() {

        return $('<div/>').addClass('elements');
    },

    renderGroup: function(opt) {

        opt = opt || {};

        var $group = $('<div/>')
            .addClass('group')
            .attr('data-name', opt.name)
            .toggleClass('closed', !!opt.closed);

        var $label = $('<h3/>')
            .addClass('group-label')
            .text(opt.label || opt.name);

        var $elements = this.renderElementsContainer();

        return $group.append($label, $elements);
    },

    render: function() {

        this.$content = this.renderContent();
        this.$paperDrag = this.renderPaperDrag();

        this.$el.empty().append(this.$paperDrag, this.$content);

        if (this.options.search) {
            this.$el.addClass('searchable').prepend(this.renderSearch());
        }

        var paperOptions = {
            width: this.options.width,
            height: this.options.height,
            interactive: false
        };

        if (this.options.groups) {

            // Render as many papers as there are groups.
            var sortedGroups = _.sortBy(_.pairs(this.options.groups), function(pair) { return pair[1].index; });

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

        // `cell:pointerdown` on any of the Stencil papers triggers element dragging.
        _.each(this.papers, function(paper) {
            this.listenTo(paper, 'cell:pointerdown', this.onDragStart);
        }, this);

        return this;
    },

    // @public Populate stencil with `cells`. If `group` is passed, only the graph in the named group
    // will be populated.
    load: function(cells, group) {

        var graph = this.graphs[group || '__default__'];
        if (graph) {
            graph.resetCells(cells);
            // If height is not defined in neither the global `options.height` or local
            // `height` for this specific group, fit the paper to the content automatically.
            var paperHeight = this.options.height;
            if (group && this.options.groups[group]) {
                paperHeight = this.options.groups[group].height;
            }
            if (!paperHeight) {
                this.papers[group || '__default__'].fitToContent(1, 1, this.options.paperPadding || 10);
            }
        } else {
            throw new Error('Stencil: group ' + group + ' does not exist.');
        }
    },

    getGraph: function(group) {

        return this.graphs[group || '__default__'];
    },

    getPaper: function(group) {

        return this.papers[group || '__default__'];
    },

    onDragStart: function(cellView, evt) {

        evt.preventDefault();
        // Start the dragging batch
        // Batch might contain `add`, `change:parent`, `change:embeds` events.
        this.options.graph.trigger('batch:start', { batchName: 'stencil-drag' });

        this.$el.addClass('dragging');
        this._paperDrag.$el.addClass('dragging');
        // Move the .stencil-paper-drag element to the document body so that even though
        // the stencil is set to overflow: hidden or auto, the .stencil-paper-drag will
        // be visible.
        $(document.body).append(this._paperDrag.$el);

        this._clone = cellView.model.clone();
        this._cloneBbox = cellView.getBBox();

        // Leave some padding so that e.g. the cell shadow or thick border is visible.
        // This workaround can be removed once browsers start supporting getStrokeBBox() (http://www.w3.org/TR/SVG2/types.html#__svg__SVGGraphicsElement__getStrokeBBox).
        var padding = 5;

        // Compute the difference between the real (view) bounding box and the model bounding box position.
        // This makes sure that elements that are outside the model bounding box get accounted for too.
        var shift = g.point(this._cloneBbox.x - this._clone.get('position').x, this._cloneBbox.y - this._clone.get('position').y);

        this._clone.set('position', { x: -shift.x + padding, y: -shift.y + padding }).addTo(this._graphDrag);
        this._cloneView = this._clone.findView(this._paperDrag);
        this._clonePosition = _.clone(this._clone.position());

        this._paperDrag.setDimensions(this._cloneBbox.width + 2 * padding, this._cloneBbox.height + 2 * padding);

        // Safari uses `document.body.scrollTop` only while Firefox uses `document.documentElement.scrollTop` only.
        // Google Chrome is the winner here as it uses both.
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

        // Offset the paper so that the mouse cursor points to the center of the stencil element.
        // Also, store the original coordinates so that we know where to return if `dropAnimation` is enabled.
        this._paperDragOriginalOffset = {
            left: evt.clientX - this._cloneBbox.width / 2,
            top: evt.clientY + scrollTop - this._cloneBbox.height / 2
        };

        this._paperDrag.$el.offset(this._paperDragOriginalOffset);
    },

    onDrag: function(evt) {

        if (this._clone) {

            evt.preventDefault();
            evt = joint.util.normalizeEvent(evt);

            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            var x = evt.clientX - this._cloneBbox.width / 2;
            var y = evt.clientY + scrollTop - this._cloneBbox.height / 2;

            // Offset the paper so that the mouse cursor points to the center of the stencil element.
            this._paperDrag.$el.offset({ left: x, top: y });

            if (this.options.paper.options.embeddingMode && this._cloneView) {

                // Find the position of the clone as it would be in the paper's graph.
                var localPoint = this.options.paper.clientToLocalPoint({ x: x, y: y });
                localPoint.x += this._clonePosition.x;
                localPoint.y += this._clonePosition.y;

                // We don't want the clone view react on change:position change.
                // But we want processEmbedding to take the clone new position into account,
                // when it looks for models for which the clone can be embedded in.
                this._clone.set('position', localPoint, { silent: true });
                this._cloneView.processEmbedding({ model: this._clone, paper: this.options.paper });
            }
        }
    },

    onDragEnd: function(evt) {

        if (this._clone && this._cloneBbox) {

            evt = joint.util.normalizeEvent(evt);

            // restore the original clone position if this was changed during the
            // embedding
            this._clone.set('position', this._clonePosition, { silent: true });

            var cellClone = this._clone.clone();
            var dropped = this.drop(evt, cellClone, this._cloneBbox);

            if (!dropped) {

                // Tell the outside world that the drop was not successful.
                this.trigger('drop:invalid', evt, cellClone);
            }

            if (!dropped && this.options.dropAnimation) {

                var duration = _.isObject(this.options.dropAnimation) ? this.options.dropAnimation.duration : 150;
                var easing = _.isObject(this.options.dropAnimation) ? this.options.dropAnimation.easing : 'swing';
                this._paperDrag.$el.animate(this._paperDragOriginalOffset, duration, easing, this.onDropEnd);

            } else {

                this.onDropEnd();
            }

            if (this.options.paper.options.embeddingMode && this._cloneView) {
                this._cloneView.finalizeEmbedding({ model: cellClone, paper: this.options.paper });
            }

            // End the dragging batch
            this.options.graph.trigger('batch:stop', { batchName: 'stencil-drag' });
        }
    },

    onDropEnd: function() {

        // Move the .stencil-paper-drag from the document body back to the stencil element.
        this.$el.append(this._paperDrag.$el);

        this.$el.removeClass('dragging');
        this._paperDrag.$el.removeClass('dragging');

        this._clone.remove();
        this._clone = undefined;
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

    drop: function(evt, cell, cellViewBBox) {

        var paper = this.options.paper;
        var graph = this.options.graph;

        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;

        var p = { x: evt.clientX, y: evt.clientY };

        // Check if the cell is dropped inside the paper.
        if (this.insideValidArea(p)) {

            var pointTransformed = paper.clientToLocalPoint(p);

            var cellBBox = cell.getBBox();
            pointTransformed.x += cellBBox.x - cellViewBBox.width / 2;
            pointTransformed.y += cellBBox.y - cellViewBBox.height / 2;

            cell.set('position', {
                x: g.snapToGrid(pointTransformed.x, paper.options.gridSize),
                y: g.snapToGrid(pointTransformed.y, paper.options.gridSize)
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
            this.trigger('filter', filteredGraph, group);

            if (this.$groups[group]) {
                // add 'unmatched' class when filter matches no elements in the group
                this.$groups[group].toggleClass('unmatched', !isMatch);
            }

            paper.fitToContent(1, 1, this.options.paperPadding || 10);

            return wasMatch || isMatch;

        }, false, this);

        // When no match found we add 'not-found' class on the stencil element
        this.$el.toggleClass('not-found', !match);
    },

    onSearch: function(evt) {

        this.filter(evt.target.value, this.options.search);
    },

    onGroupLabelClick: function(evt) {

        // Prevent default action for iPad not to handle this event twice.
        evt.preventDefault();

        var $group = $(evt.target).closest('.group');
        this.toggleGroup($group.data('name'));
    },

    toggleGroup: function(name) {

        this.$('.group[data-name="' + name + '"]').toggleClass('closed');
    },

    closeGroup: function(name) {

        this.$('.group[data-name="' + name + '"]').addClass('closed');
    },

    openGroup: function(name) {

        this.$('.group[data-name="' + name + '"]').removeClass('closed');
    },

    closeGroups: function() {

        this.$('.group').addClass('closed');
    },

    openGroups: function() {

        this.$('.group').removeClass('closed');
    },

    onRemove: function() {

        _.invoke(this.papers, 'remove');
        this.papers = {};

        if (this._paperDrag) {
            this._paperDrag.remove();
            this._paperDrag = null;
        }

        $(document.body).off('.stencil', this.onDrag).off('.stencil', this.onDragEnd);
    }
});

