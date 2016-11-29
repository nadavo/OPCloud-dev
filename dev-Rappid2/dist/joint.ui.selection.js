/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// Selection
// =============

// `Selection` implements selecting group of elements and moving the selected elements in one go.
// Typically, the selection will be bound to the `Shift` key
// and selecting/deselecting individual elements to the `Ctrl` key.

// Example usage:

// var graph = new joint.dia.Graph;
// var paper = new joint.dia.Paper({ model: graph });
// var selectionItems = new Backbone.Collection;
// var selection = new joint.ui.Selection({ paper: paper, graph: graph, model: selectionItems });

// // Bulk selecting group of elements by creating a rectangular selection area.
// paper.on('blank:pointerdown', selection.startSelecting);

// // Selecting individual elements with click and the `Ctrl`/`Command` key.
// paper.on('cell:pointerup', function(cellView, evt) {
//      if ((evt.ctrlKey || evt.metaKey) && !(cellView.model instanceof joint.dia.Link)) {
//              selectionItems.add(cellView.model);
//      }
// });

// // Deselecting previously selected elements with click and the `Ctrl`/`Command` key.
// selection.on('selection-box:pointerdown', function(evt) {
//      if (evt.ctrlKey || evt.metaKey) {
//              var cell = selectionItems.get($(evt.target).data('model'));
//              selectionItems.reset(selectionItems.without(cell));
//              selection.destroySelectionBox(paper.findViewByModel(cell));
//      }
// });

joint.ui.Selection = joint.mvc.View.extend({

    options: {
        paper: undefined,
        graph: undefined,
        boxContent: function(boxElement) {
            return joint.util.template('<%= length %> elements selected.')({
                length: this.model.length
            });
        },
        handles: [{
            name: 'remove',
            position: 'nw',
            events: {
                pointerdown: 'removeElements'
            }
        }, {
            name: 'rotate',
            position: 'sw',
            events: {
                pointerdown: 'startRotating',
                pointermove: 'doRotate',
                pointerup: 'stopBatch'
            }
        }, {
            name: 'resize',
            position: 'se',
            events: {
                pointerdown: 'startResizing',
                pointermove: 'doResize',
                pointerup: 'stopBatch'
            }
        }],
        useModelGeometry: false,
        strictSelection: false,
        rotateAngleGrid: 15,
        allowTranslate: true
    },

    className: 'selection',

    events: {
        'mousedown .selection-box': 'onSelectionBoxPointerDown',
        'touchstart .selection-box': 'onSelectionBoxPointerDown',
        'mousedown .handle': 'onHandlePointerDown',
        'touchstart .handle': 'onHandlePointerDown'
    },

    /**
     * @private
     */
    init: function() {

        // For backwards compatibility:
        if (this.options.model) {
            this.options.collection = this.options.model;
        }

        var collection = this.collection = this.options.collection || this.collection || new Backbone.Collection;

        if (!collection.comparator) {
            // Make sure the elements are always sorted from the parents to their childs.
            // That is necessary for translating selected elements.
            collection.comparator = this.constructor.depthComparator;
            collection.sort();
        }

        // For backwards compatibility:
        this.model = collection;

        if (this.options.paper) {
            // Allow selection to be initialized with a paper only.
            _.defaults(this.options, { graph: this.options.paper.model });
        } else {
            throw new Error('Selection: paper required');
        }

        _.bindAll(this, 'startSelecting', 'stopSelecting', 'adjustSelection', 'pointerup');

        $(document.body).on('mousemove.selection touchmove.selection', this.adjustSelection);
        $(document).on('mouseup.selection touchend.selection', this.pointerup);

        var paper = this.options.paper;
        var graph = this.options.graph;

        this.listenTo(graph, 'reset', this.cancelSelection);
        this.listenTo(paper, 'scale translate', this.updateSelectionBoxes);
        this.listenTo(graph, 'remove change', function(cell, opt) {
            // Do not react on changes that happened inside the selection.
            if (opt.selection !== this.cid)  {
                this.updateSelectionBoxes();
            }
        });

        this.listenTo(collection, 'remove', this.onRemoveElement);
        this.listenTo(collection, 'reset', this.onResetElements);
        this.listenTo(collection, 'add', this.onAddElement);

        paper.$el.append(this.$el);

        // A counter of existing boxes. We don't want to update selection boxes on
        // each graph change when no selection boxes exist.
        this._boxCount = 0;

        this.$selectionWrapper = this.createSelectionWrapper();

        // Add handles.
        this.handles = [];
        _.each(this.options.handles, this.addHandle, this);
    },

    /**
     * @private
     */
    cancelSelection: function() {

        this.model.reset([], { ui: true });
    },

    /**
     * @public
     * @param {object} opt
     * @returns {joint.ui.Selection}
     */
    addHandle: function(opt) {

        this.handles.push(opt);

        var $handle = $('<div/>', {
            'class': 'handle ' + (opt.position || '') + ' ' + (opt.name || ''),
            'data-action': opt.name
        });
        if (opt.icon) {
            $handle.css('background-image', 'url(' + opt.icon + ')');
        }
        $handle.html(opt.content || '');
        this.$selectionWrapper.append($handle);

        _.each(opt.events, function(method, event) {

            if (_.isString(method)) {
                this.on('action:' + opt.name + ':' + event, this[method], this);
            } else {
                // Otherwise, it must be a function.
                this.on('action:' + opt.name + ':' + event, method);
            }

        }, this);

        return this;
    },

    /**
     * @public
     * @param {jQuery.Event} evt
     */
    stopSelecting: function(evt) {

        switch (this._action) {

            case 'selecting':

                var offset = this.$el.offset();
                var width = this.$el.width();
                var height = this.$el.height();
                var paper = this.options.paper;

                // Convert offset coordinates to the local point of the <svg> root element viewport.
                var localPoint = V(paper.viewport).toLocalPoint(offset.left, offset.top);

                // Take page scroll into consideration.
                localPoint.x -= window.pageXOffset;
                localPoint.y -= window.pageYOffset;

                // Convert width and height to take current viewport scale into account
                var paperScale = V(paper.viewport).scale();
                width /= paperScale.sx;
                height /= paperScale.sy;

                var selectedArea = g.rect(localPoint.x, localPoint.y, width, height);
                var elementViews = this.getElementsInSelectedArea(selectedArea);

                var filter = this.options.filter;
                if (_.isArray(filter)) {

                    elementViews = _.reject(elementViews, function(view) {
                        return _.contains(filter, view.model) || _.contains(filter, view.model.get('type'));
                    });

                } else if (_.isFunction(filter)) {

                    elementViews = _.reject(elementViews, function(view) {
                        return filter(view.model);
                    });
                }

                this.model.reset(_.pluck(elementViews, 'model'), { ui: true });

                break;

            case 'translating':

                this.options.graph.stopBatch('selection-translate');
                this.notify('selection-box:pointerup', evt);
                // Everything else is done during the translation.
                break;

            default:
                // Hide selection if the user clicked somehwere else in the document.
                if (!this._action) {
                    this.cancelSelection();
                }
                break;
        }

        this._action = null;
    },

    /**
     * @public
     * @param {string} name
     * @returns {joint.ui.Selection}
     */
    removeHandle: function(name) {

        var handleIdx = _.findIndex(this.handles, { name: name });
        var handle = this.handles[handleIdx];
        if (handle) {

            _.each(handle.events, function(method, event) {
                this.off('action:' + name + ':' + event);
            }, this);

            this.$('.handle.' + name).remove();

            this.handles.splice(handleIdx, 1);
        }

        return this;
    },

    /**
     * @public
     * @param {jQuery.Event} evt
     */
    startSelecting: function(evt) {

        evt = joint.util.normalizeEvent(evt);

        this.cancelSelection();

        var paperElement = this.options.paper.el;
        var offsetX, offsetY;

        if (evt.offsetX != null && evt.offsetY != null && $.contains(paperElement, evt.target)) {

            offsetX = evt.offsetX;
            offsetY = evt.offsetY;

        } else {

            // We do not use `evt.offsetX` and `evt.offsetY` event properties when the event target
            // is not inside the the paper element or properties are not defined (FF).

            var paperOffset = $(paperElement).offset();
            var paperScrollLeft = paperElement.scrollLeft;
            var paperScrollTop = paperElement.scrollTop;

            offsetX = evt.clientX - paperOffset.left + window.pageXOffset + paperScrollLeft;
            offsetY = evt.clientY - paperOffset.top + window.pageYOffset + paperScrollTop;
        }

        this.$el.css({ width: 1, height: 1, left: offsetX, top: offsetY });
        this.showLasso();

        this._action = 'selecting';
        this._clientX = evt.clientX;
        this._clientY = evt.clientY;
        this._offsetX = offsetX;
        this._offsetY = offsetY;
    },

    /**
     * @param {string} name
     * @param {Object} opt
     * @returns {joint.ui.Selection}
     */
    changeHandle: function(name, opt) {

        var handle = _.findWhere(this.handles, { name: name });
        if (handle) {

            this.removeHandle(name);
            this.addHandle(_.merge({ name: name }, handle, opt));
        }

        return this;
    },

    /**
     * @private
     * @param {jQuery.Event} evt
     */
    onSelectionBoxPointerDown: function(evt) {

        evt.stopPropagation();
        evt = joint.util.normalizeEvent(evt);

        // Start translating selected elements.
        if (this.options.allowTranslate) {
            this.startTranslatingSelection(evt);
        }

        this._activeElementView = this.getCellView(evt.target);
        this.notify('selection-box:pointerdown', evt);
    },

    /**
     * @private
     * @param {jQuery.Event} evt
     */
    startTranslatingSelection: function(evt) {

        this._action = 'translating';

        this.options.graph.startBatch('selection-translate');

        var snappedClientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });
        this._snappedClientX = snappedClientCoords.x;
        this._snappedClientY = snappedClientCoords.y;
    },

    /**
     * @private
     * @param {jQuery.Event} evt
     */
    adjustSelection: function(evt) {

        evt = joint.util.normalizeEvent(evt);

        var dx;
        var dy;

        switch (this._action) {

            case 'selecting':

                dx = evt.clientX - this._clientX;
                dy = evt.clientY - this._clientY;

                var left = parseInt(this.$el.css('left'), 10);
                var top = parseInt(this.$el.css('top'), 10);

                this.$el.css({
                    left: dx < 0 ? this._offsetX + dx : left,
                    top: dy < 0 ? this._offsetY + dy : top,
                    width: Math.abs(dx),
                    height: Math.abs(dy)
                });
                break;

            case 'translating':

                var snappedClientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });
                var snappedClientX = snappedClientCoords.x;
                var snappedClientY = snappedClientCoords.y;

                dx = snappedClientX - this._snappedClientX;
                dy = snappedClientY - this._snappedClientY;

                if (dx || dy) {

                    this.translateSelectedElements(dx, dy);

                    if (!this.boxesUpdated) {

                        var paperScale = V(this.options.paper.viewport).scale();

                        // Translate each of the `selection-box` amd `selection-wrapper`.
                        this.$el.children('.selection-box').add(this.$selectionWrapper)
                            .css({
                                left: '+=' + (dx * paperScale.sx),
                                top: '+=' + (dy * paperScale.sy)
                            });

                    } else if (this.model.length > 1) {

                        // If there is more than one cell in the selection, we need to update
                        // the selection boxes again. e.g when the first element went over the
                        // edge of the paper, a translate event was triggered, which updated the selection
                        // boxes. After that all remaining elements were translated but the selection
                        // boxes stayed unchanged.
                        this.updateSelectionBoxes();
                    }

                    this._snappedClientX = snappedClientX;
                    this._snappedClientY = snappedClientY;
                }
                this.notify('selection-box:pointermove', evt);
                break;

            default:
                if (this._action) {
                    this.pointermove(evt);
                }
                break;
        }

        this.boxesUpdated = false;
    },

    translateSelectedElements: function(dx, dy) {

        // This hash of flags makes sure we're not adjusting vertices of one link twice.
        // This could happen as one link can be an inbound link of one element in the selection
        // and outbound link of another at the same time.
        var processedCells = {};

        this.model.each(function(element) {

            // TODO: snap to grid.
            if (processedCells[element.id]) return;

            // Make sure that selection won't update itself when not necessary
            var opt = { selection: this.cid };

            // Translate the element itself.
            element.translate(dx, dy, opt);

            _.each(element.getEmbeddedCells({ deep: true }), function(embed) {
                processedCells[embed.id] = true;
            });

            // Translate link vertices as well.
            var connectedLinks = this.options.graph.getConnectedLinks(element);

            _.each(connectedLinks, function(link) {

                if (processedCells[link.id]) return;

                link.translate(dx, dy, opt);

                processedCells[link.id] = true;
            });

        }, this);
    },

    /**
     * @private
     * @param {string} eventName
     * @param {jQuery.Event} event
     */
    notify: function(eventName, event) {

        var args = Array.prototype.slice.call(arguments, 1);
        this.trigger.apply(this, [eventName, this._activeElementView].concat(args));
    },

    /**
     * @private
     * @param {g.rect} selectedArea
     * @returns {Object.<string, joint.dia.Element>}
     */
    getElementsInSelectedArea: function(selectedArea) {

        var paper = this.options.paper;

        var filterOpt = {
            strict: this.options.strictSelection
        };

        if (this.options.useModelGeometry) {
            var models = paper.model.findModelsInArea(selectedArea, filterOpt);
            return _.filter(_.map(models, paper.findViewByModel, paper));
        }

        return paper.findViewsInArea(selectedArea, filterOpt);
    },

    /**
     * @private
     * @param {jQuery.Event} evt
     */
    pointerup: function(evt) {

        if (!this._action) return;

        this.triggerAction(this._action, 'pointerup', evt);
        this.stopSelecting(evt);

        this._activeElementView = null;
        this._action = null;
    },

    /**
     * @private
     * @param {joint.dia.Element} element
     */
    destroySelectionBox: function(element) {

        this.$('[data-model="' + element.get('id') + '"]').remove();

        if (this.$el.children('.selection-box').length === 0) {
            this.hide();
        }

        this._boxCount = Math.max(0, this._boxCount - 1);
    },

    /**
     * @private
     */
    hide: function() {
        this.$el.removeClass('lasso selected');
    },

    /**
     * @private
     */
    showSelected: function() {
        this.$el.addClass('selected');
    },

    /**
     * @private
     */
    showLasso: function() {
        this.$el.addClass('lasso');
    },

    /**
     * @private
     */
    destroyAllSelectionBoxes: function() {

        this.hide();
        this.$el.children('.selection-box').remove();
        this._boxCount = 0;
    },

    /**
     * @private
     * @param {joint.dia.Element} element
     */
    createSelectionBox: function(element) {

        var elementView = element.findView(this.options.paper);
        if (elementView) {
            var viewBBox = elementView.getBBox({ useModelGeometry: this.options.useModelGeometry });
            $('<div/>')
                .addClass('selection-box')
                .attr('data-model', element.get('id'))
                .css({ left: viewBBox.x, top: viewBBox.y, width: viewBBox.width, height: viewBBox.height })
                .appendTo(this.el);
            this.showSelected();
            this._boxCount++;
        }
    },

    /**
     * @private
     * @returns {jQuery}
     */
    createSelectionWrapper: function() {

        var $selectionWrapper = $('<div/>', { 'class': 'selection-wrapper' });
        var $box = $('<div/>', { 'class': 'box' });
        $selectionWrapper.append($box);
        $selectionWrapper.attr('data-selection-length', this.model.length);
        this.$el.prepend($selectionWrapper);
        return $selectionWrapper;
    },

    /**
     * @private
     */
    updateSelectionWrapper: function() {

        // Find the position and dimension of the rectangle wrapping
        // all the element views.
        var origin = { x: Infinity, y: Infinity };
        var corner = { x: 0, y: 0 };

        this.model.each(function(cell) {

            var view = this.options.paper.findViewByModel(cell);
            if (view) {
                var bbox = view.getBBox({ useModelGeometry: this.options.useModelGeometry });
                origin.x = Math.min(origin.x, bbox.x);
                origin.y = Math.min(origin.y, bbox.y);
                corner.x = Math.max(corner.x, bbox.x + bbox.width);
                corner.y = Math.max(corner.y, bbox.y + bbox.height);
            }
        }, this);

        this.$selectionWrapper.css({
            left: origin.x,
            top: origin.y,
            width: (corner.x - origin.x),
            height: (corner.y - origin.y)
        }).attr('data-selection-length', this.model.length);

        if (_.isFunction(this.options.boxContent)) {

            var $box = this.$('.box');
            var content = this.options.boxContent.call(this, $box[0]);

            // don't append empty content. (the content might had been created inside boxContent()
            if (content) {
                $box.html(content);
            }
        }
    },

    /**
     * @private
     */
    updateSelectionBoxes: function() {

        if (!this._boxCount) return;

        this.hide();

        _.each(this.$el.children('.selection-box'), function(element) {

            var removedId = $(element).remove().attr('data-model');

            // try to find an element with the same id in the selection collection and
            // find the view for this model.
            var removedModel = this.model.get(removedId);

            if (removedModel) {
                // The view doesn't need to exist on the paper anymore as we use this method
                // as a handler for element removal.
                this.createSelectionBox(removedModel);
            }

        }, this);

        this.updateSelectionWrapper();

        // When an user drags selection boxes over the edge of the paper and the paper gets resized,
        // we update the selection boxes here (giving them exact position) and we do not want
        // the selection boxes to be shifted again based on the mousemove.
        // See adjustSelection() method.
        this.boxesUpdated = true;
    },

    /**
     * @private
     */
    onRemove: function() {

        $(document.body).off('.selection', this.adjustSelection);
        $(document).off('.selection', this.pointerup);
    },

    /**
     * @private
     * @param {jQuery.Event} evt
     */
    onHandlePointerDown: function(evt) {

        this._action = $(evt.target).closest('.handle').attr('data-action');
        if (this._action) {

            evt.preventDefault();
            evt.stopPropagation();
            evt = joint.util.normalizeEvent(evt);

            this._clientX = evt.clientX;
            this._clientY = evt.clientY;
            this._startClientX = this._clientX;
            this._startClientY = this._clientY;

            this.triggerAction(this._action, 'pointerdown', evt);
        }
    },

    /**
     * @private
     * @param {HTMLElement} element
     * @returns {joint.dia.Element}
     */
    getCellView: function(element) {

        var cell = this.model.get(element.getAttribute('data-model'));
        return cell && cell.findView(this.options.paper);
    },

    /**
     * @private
     * @param {jQuery.Event} evt
     */
    pointermove: function(evt) {

        if (!this._action) return;

        var clientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });
        var oldClientCoords = this.options.paper.snapToGrid({ x: this._clientX, y: this._clientY });

        var dx = clientCoords.x - oldClientCoords.x;
        var dy = clientCoords.y - oldClientCoords.y;

        this.triggerAction(this._action, 'pointermove', evt, dx, dy, evt.clientX - this._startClientX, evt.clientY - this._startClientY);

        this._clientX = evt.clientX;
        this._clientY = evt.clientY;
    },

    /**
     * Trigger an action on the Selection object. `evt` is a DOM event
     * @private
     * @param {string} action
     * @param {string} eventName abstracted JointJS event name (pointerdown, pointermove, pointerup).
     * @param {jQuery.Event} evt
     */
    triggerAction: function(action, eventName, evt) {

        var args = Array.prototype.slice.call(arguments, 2);
        args.unshift('action:' + action + ':' + eventName);
        this.trigger.apply(this, args);
    },

    // Handle actions.

    /**
     * @private
     * @param {joint.dia.Element} element
     */
    onRemoveElement: function(element) {

        this.destroySelectionBox(element);
        this.updateSelectionWrapper();
    },

    /**
     * @private
     * @param {Backbone.Collection.<joint.dia.Cell>} elements
     */
    onResetElements: function(elements) {

        this.destroyAllSelectionBoxes();

        elements.each(this.createSelectionBox, this);

        this.updateSelectionWrapper();
    },

    /**
     * @private
     * @param {joint.dia.Element} element
     */
    onAddElement: function(element) {

        this.createSelectionBox(element);
        this.updateSelectionWrapper();
    },

    /**
     * @private
     * @param {jQuery.Event} evt
     */
    removeElements: function(evt) {

        // Store cells before `cancelSelection()` resets the selection collection.
        var cells = this.collection.toArray();
        this.cancelSelection();
        this.options.graph.removeCells(cells, { selection: this.cid });
    },

    /**
     * @private
     * @param {jQuery.Event} evt
     */
    startRotating: function(evt) {

        this.options.graph.trigger('batch:start');

        var center = this.options.graph.getBBox(this.model.models).center();
        var clientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });
        var initialAngles = _.transform(this.model.toArray(), function(res, element) {
            res[element.id] = g.normalizeAngle(element.get('angle') || 0);
        });

        this._rotation = {
            center: center,
            clientAngle: g.point(clientCoords).theta(center),
            initialAngles: initialAngles
        };
    },

    /**
     * @private
     * @param {jQuery.Event} evt
     */
    startResizing: function(evt) {

        var paper = this.options.paper;
        var graph = this.options.graph;
        var grid = paper.options.gridSize;
        var elements = this.model.toArray();

        var selectionBBox = graph.getBBox(elements);
        var elBBoxes = _.invoke(elements, 'getBBox');
        var minElWidth = _.min(elBBoxes, 'width').width;
        var minElHeight = _.min(elBBoxes, 'height').height;

        this._resize = {
            cells: graph.getSubgraph(elements),
            bbox: selectionBBox,
            minWidth: grid * selectionBBox.width / minElWidth,
            minHeight: grid * selectionBBox.height / minElHeight
        };

        graph.trigger('batch:start');
    },

    /**
     * @param {jQuery.Event} evt
     * @param {number} dx
     * @param {number} dy
     */
    doResize: function(evt, dx, dy) {

        var opt = this._resize;
        var bbox = opt.bbox;
        var prevWidth = bbox.width;
        var prevHeight = bbox.height;
        var width = Math.max(prevWidth + dx, opt.minWidth);
        var height = Math.max(prevHeight + dy, opt.minHeight);

        if (Math.abs(prevWidth - width) > 1e-3 || Math.abs(prevHeight - height) > 1e-3) {

            this.options.graph.resizeCells(width, height, opt.cells, {
                selection: this.cid
            });

            // update selection bbox
            bbox.width = width;
            bbox.height = height;

            this.updateSelectionBoxes();
        }
    },

    /**
     * @private
     * @param {jQuery.Event} evt
     */
    doRotate: function(evt) {

        var rotation = this._rotation;

        // Calculate an angle between the line starting at mouse coordinates, ending at the centre
        // of rotation and y-axis and deduct the angle from the start of rotation.
        var angleGrid = this.options.rotateAngleGrid;
        var clientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });
        var theta = rotation.clientAngle - g.point(clientCoords).theta(rotation.center);

        if (Math.abs(theta) > 1e-3) {

            this.model.each(function(element) {
                var newAngle = g.snapToGrid(rotation.initialAngles[element.id] + theta, angleGrid);
                element.rotate(newAngle, true, rotation.center, { selection: this.cid });
            }, this);

            this.updateSelectionBoxes();
        }
    },

    /**
     * @private
     */
    stopBatch: function() {

        this.options.graph.trigger('batch:stop');
    },

    /**
     * @private
     * Return the current action of the Selection.
     * This can be one of:
     * 'translating' | 'selecting' or any custom action.
     * This is especially useful if you want to prevent from something happening
     * while the selection is taking place (e.g. in the 'selecting' state and you are
     * handling the mouseover event).
     * @returns {string}
     */
    getAction: function() {

        return this._action;
    }
}, {

    depthComparator: function(element) {
        // Where depth is a number of ancestors.
        return element.getAncestors().length;
    }
});

// An alias for backwards compatibility
joint.ui.SelectionView = joint.ui.Selection;
