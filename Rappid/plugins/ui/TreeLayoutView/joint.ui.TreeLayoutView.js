/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// Tree Graph Layout View.
// =======================

// An user interface for the tree layout manipulation.

joint.ui.TreeLayoutView = joint.mvc.View.extend({

    MINIMAL_PREVIEW_SIZE: 10,

    className: 'tree-layout',

    options: {

        // SVG attributes for the child and parent preview SVG elements.
        previewAttrs: {
            child: {},
            parent: { rx: 2, ry: 2 }
        },

        // Compute the bounding boxes for elements either from the DOM or based
        // on the model size.
        useModelGeometry: false,

        // clone method used when an element preview is created.
        clone: function(cell) {
            return cell.clone();
        },

        // Specify what elements can be interacted with.
        // e.g function(element) { return !element.get('disabled'); }
        canInteract: _.constant(true)
    },

    init: function() {

        _.bindAll(this, 'onPointermove', 'onPointerup');

        this.toggleDefaultInteraction(false);
        this.startListening();
        this.render();
    },

    // @public
    startListening: function() {

        var paper = this.options.paper;

        this.listenTo(paper, 'element:pointerdown', this.canInteract(this.onPointerdown));
    },

    // @public
    // Enable/Disable the default paper interactions.
    toggleDefaultInteraction: function(interactive) {

        var paper = this.options.paper;

        // New elements added to the paper will not be interactive.
        paper.options.interactive = interactive;

        // Set interactive to false to all existing elements.
        _.chain(paper.model.getElements())
            .map(paper.findViewByModel, paper)
            .each(function(view) {
                view && (view.options.interactive = interactive);
            }).value();
    },

    render: function() {

        var paper = this.options.paper;

        this.$activeBox = $('<div>')
            .addClass('tree-layout-box active hidden')
            .appendTo(this.el);

        this.draggingPaper = new joint.dia.Paper({
            model: new joint.dia.Graph,
            interactive: false,
            width: '100%',
            height: '100%'
        });

        this.$translateBox = $('<div>')
            .addClass('tree-layout-box translate hidden')
            .append(this.draggingPaper.render().el)
            .appendTo(this.el);

        this.$mask = $('<div>').addClass('tree-layout-mask');

        this.svgViewport = V(paper.viewport);
        this.svgPreviewChild = V('circle')
            .attr(this.options.previewAttrs.child || {})
            .addClass('tree-layout-preview child');
        this.svgPreviewConnection = V('path')
            .attr(this.options.previewAttrs.link || {})
            .addClass('tree-layout-preview link');
        this.svgPreviewParent = V('rect')
            .attr(this.options.previewAttrs.parent || {})
            .addClass('tree-layout-preview parent');
        this.svgPreview = V('g').addClass('tree-layout-preview-group').append([
            this.svgPreviewConnection,
            this.svgPreviewParent,
            this.svgPreviewChild
        ]);

        this.$el.appendTo(paper.el);

        return this;
    },

    toggleDropping: function(state) {

        // allows setting various cursor on the paper
        this.$mask.toggleClass('dropping-not-allowed', !state);
        // allows coloring of the translate box based on the state
        this.$translateBox.toggleClass('no-drop', !state);
    },

    canDrop: function() {

        return this.isActive() && !this.$translateBox.hasClass('no-drop');
    },

    isActive: function() {

        return !this.$translateBox.hasClass('hidden');
    },

    _startDrag: function(elements, x, y) {

        var paper = this.options.paper;

        this.$mask.appendTo(paper.el);
        this.toggleDropping(false);

        this.ctm = paper.viewport.getCTM();

        var element = _.first(elements);
        var elementView = element.findView(paper);
        var bbox = elementView.getBBox({ useModelGeometry: this.options.useModelGeometry });

        // showing box around active element
        this.updateBox(this.$translateBox, _.defaults({ x: x, y: y }, bbox));
        this.updateBox(this.$activeBox, bbox);

        this.$activeBox.removeClass('hidden');
        this.$translateBox.removeClass('hidden');

        this.prepareDraggingPaper(element);
    },

    updateBox: function($box, bbox) {

        $box.css({
            width: bbox.width,
            height: bbox.height,
            left: bbox.x,
            top: bbox.y
        });
    },

    positionTranslateBox: function(position) {

        var transformedPosition = V.transformPoint(position, this.ctm);

        this.$translateBox.css({
            left: transformedPosition.x,
            top: transformedPosition.y
        });
    },

    prepareDraggingPaper: function(draggedElement) {

        var clone = this.options.clone(draggedElement).position(0, 0);

        // Zoom the dragging paper the same way as the main paper.
        this.draggingPaper.scale(this.ctm.a, this.ctm.d);
        this.draggingPaper.model.resetCells([clone]);
    },

    _doDrag: function(elements, x, y) {

        var layout = this.model;
        var coordinates = { x: x, y: y };
        var rootLayoutArea;
        var layoutArea;

        if (this.candidate) {
            this.candidate = null;
            this.hidePreview();
        }

        this.positionTranslateBox(coordinates);

        rootLayoutArea = layout.getMinimalRootAreaByPoint(coordinates);
        if (rootLayoutArea) {
            layoutArea = rootLayoutArea.findMinimalAreaByPoint(coordinates, {
                expandBy: Math.min(layout.get('siblingGap'), layout.get('gap')) / 2
            });
        }

        if (layoutArea) {

            var direction = this.findDirection(layoutArea, coordinates);
            var siblings = layoutArea.getLayoutSiblings(direction);
            var siblingRank = siblings.getSiblingRankByPoint(coordinates);

            var isConnectionValid = _.every(elements, _.partial(this.isConnectionValid, _, siblings, siblingRank), this);
            if (isConnectionValid) {

                this.candidate = {
                    id: layoutArea.root.id,
                    direction: direction,
                    siblingRank: siblingRank + 0.5
                };

                this.updatePreview(siblings, siblingRank);
                this.showPreview();

                this.toggleDropping(true);

            } else {
                this.toggleDropping(false);
            }

        } else {

            this.toggleDropping(true);
        }
    },

    _finishDrag: function(elements, x, y) {

        this.$mask.remove().removeClass('dropping-not-allowed');

        if (this.candidate) {

            _.each(elements, _.partial(this.reconnectElement, _, this.candidate), this);
            this.candidate = null;
            this.model.layout({ ui: true });

        } else if (this.canDrop()) {

            _.each(elements, _.partial(this.translateElement, _, x, y), this);
            this.model.layout({ ui: true });
        }

        this.$activeBox.addClass('hidden');
        this.$translateBox.addClass('hidden');

        this.hidePreview();
    },

    reconnectElement: function(element, candidate) {

        var opt = {
            direction: candidate.direction,
            siblingRank: candidate.siblingRank,
            ui: true
        };

        var canReconnect = this.model.reconnectElement(element, candidate.id, opt);
        if (!canReconnect) {

            var paper = this.options.paper;
            var link = paper.getDefaultLink(element.findView(paper));

            link.set({ source: { id: candidate.id }, target: { id: element.id }});
            link.addTo(paper.model, opt);

            this.model.changeSiblingRank(element, candidate.siblingRank, opt);
            this.model.changeDirection(element, candidate.direction, opt);

            var prevDirection = this.model.getAttribute(element, 'direction');

            this.model.updateDirections(element, [prevDirection, candidate.direction], opt);
        }
    },

    translateElement: function(element, x, y) {

        var inboundLinks = this.model.graph.getConnectedLinks(element, { inbound: true });

        _.invoke(inboundLinks, 'remove');

        var elementSize = element.get('size');

        element.set('position', {
            x: x - elementSize.width / 2,
            y: y - elementSize.height / 2
        }, { ui: true });
    },

    updatePreview: function(siblings, siblingRank) {

        var parent = siblings.parentArea.root;
        var childWidth = Math.max(this.model.get('siblingGap') / 2, this.MINIMAL_PREVIEW_SIZE);
        var childSize = { width: childWidth, height: childWidth };
        var childPosition = siblings.getNeighborPointFromRank(siblingRank);
        var points = siblings.getConnectionPoints(childPosition, { ignoreSiblings: true });
        var parentPoint = siblings.getParentConnectionPoint();
        var childPoint = siblings.getChildConnectionPoint(childPosition, childSize);

        this.updateParentPreview(parent.get('position'), parent.get('size'));
        this.updateChildPreview(childPosition, childSize);
        this.updateConnectionPreview(parentPoint, childPoint, points);
    },

    showPreview: function() {

        this.svgViewport.append(this.svgPreview);
    },

    hidePreview: function() {

        this.svgPreview.remove();
    },

    updateParentPreview: function(position, size) {

        this.svgPreviewParent.attr({
            x: position.x,
            y: position.y,
            width: size.width,
            height: size.height
        });
    },

    updateChildPreview: function(position, size) {

        this.svgPreviewChild.attr({
            cx: position.x,
            cy: position.y,
            r:  size.width / 2
        });
    },

    updateConnectionPreview: function(source, target, vertices) {

        this.svgPreviewConnection.attr({
            d: joint.connectors.rounded(source, target, vertices, {})
        });
    },

    findDirection: function(layoutArea, point) {

        var type = layoutArea.root.get('layout') || layoutArea.getType() || layoutArea.direction;

        switch (type) {
            case 'LR':
                if (point.x > layoutArea.rootCX) return 'R';
                return 'L';
            case 'TB':
                if (point.y > layoutArea.rootCY) return 'B';
                return 'T';
            case 'L':
            case 'R':
            case 'T':
            case 'B':
                return type;
            default:
                // TBD
                return layoutArea.direction;
        }
    },

    // @private
    isConnectionValid: function(element, siblings, siblingRank) {

        // Banning a loop connection
        if (element.id == siblings.parentArea.root.id) return false;

        // If the element is ancestor of parent, there would be a loop after connection.
        if (this.model.graph.isSuccessor(element, siblings.parentArea.root)) return false;

        // If we have same parent, same rank direction an we changing only the siblingRank
        // we allow only changes that actually changes the order of siblings.
        var elementArea = this.model.getLayoutArea(element);
        if (elementArea.parentArea && elementArea.parentArea == siblings.parentArea && elementArea.direction == siblings.direction) {
            var rankChange = elementArea.siblingRank - siblingRank;
            if (rankChange === 0 || rankChange === 1) return false;
        }

        return true;
    },

    // Interaction
    canInteract: function(handler) {

        return _.bind(function(cellView) {
            if (this.options.canInteract(cellView)) {
                handler.apply(this, arguments);
            }
        }, this);
    },

    getEventNamespace: function() {

        return '.tree-layout-' + this.cid;
    },

    startDragging: function(elements, x, y) {

        var draggedElements = _.isArray(elements) ? elements : [elements];
        if (!_.isEmpty(draggedElements)) {
            this._registerPointerEvents();
            this._moveCounter = 0;
            this._draggedElements = draggedElements;
        }
    },

    onPointerdown: function(elementView, evt, x, y) {

        this.startDragging(elementView.model, x, y);
    },

    onPointermove: function(evt) {

        var paper = this.options.paper;
        var localPoint = paper.clientToLocalPoint({ x: evt.clientX, y: evt.clientY });

        if (this._moveCounter === paper.options.clickThreshold) {

            this._startDrag(this._draggedElements, localPoint.x, localPoint.y);

        } else if (this._moveCounter > paper.options.clickThreshold) {

            this._doDrag(this._draggedElements, localPoint.x, localPoint.y);
        }

        this._moveCounter++;
    },

    onPointerup: function(evt) {

        var paper = this.options.paper;

        if (this._moveCounter >= paper.options.clickThreshold) {

            var localPoint = paper.clientToLocalPoint({ x: evt.clientX, y: evt.clientY });

            this._finishDrag(this._draggedElements, localPoint.x, localPoint.y);
        }

        this._draggedElements = null;
        this._unregisterPointerEvents();
    },

    _registerPointerEvents: function() {

        var namespace = this.getEventNamespace();

        $(document)
            .on('mousemove' + namespace + ' touchmove' + namespace, this.onPointermove)
            .on('mouseup' + namespace + ' touchend' + namespace, this.onPointerup);
    },

    _unregisterPointerEvents: function() {

        $(document).off(this.getEventNamespace());
    }

});
